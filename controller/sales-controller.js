const SaleItem = require("../model/SaleItem");

const getSales = async (req, res) => {
  // Extract 'from' and 'to' from query parameters
  const { from, to } = req.query;

  // Validate if the 'from' and 'to' parameters are provided
  if (!from || !to) {
    return res
      .status(400)
      .json({ message: "Please provide 'from' and 'to' dates." });
  }

  try {
    // Convert 'from' and 'to' to JavaScript Date objects
    const start = new Date(from);
    const end = new Date(to);

    // Ensure 'start' and 'end' are valid Date objects
    if (isNaN(start) || isNaN(end)) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use 'YYYY-MM-DD'." });
    }

    // Fetch sales data within the specified date range
    const salesData = await SaleItem.find({
      saleDate: { $gte: start, $lte: end },
    });

    // If no sales data is found
    if (!salesData || salesData.length === 0) {
      return res
        .status(404)
        .json({ message: "No sales data found in the specified range." });
    }

    // Return the sales data
    return res
      .status(200)
      .json(salesData.map((sale) => sale.toObject({ getters: true })));
  } catch (err) {
    return res.status(500).json({
      message: "Server error. Could not retrieve sales data.",
      error: err.message,
    });
  }
};

const getDayWiseSales = async (req, res) => {
  const { from, to } = req.query;

  // Validate if 'from' and 'to' parameters are provided
  if (!from || !to) {
    return res
      .status(400)
      .json({ message: "Please provide 'from' and 'to' dates." });
  }

  try {
    // Convert 'from' and 'to' to JavaScript Date objects
    const start = new Date(from);
    const end = new Date(to);

    // Ensure 'start' and 'end' are valid Date objects
    if (isNaN(start) || isNaN(end)) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use 'YYYY-MM-DD'." });
    }

    // Aggregate sales data by day within the specified date range
    const salesData = await SaleItem.aggregate([
      {
        $match: {
          saleDate: { $gte: start, $lte: end }, // Filter sales within date range
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } }, // Group by day
          totalSales: { $sum: "$totalPrice" }, // Sum total sales for the day
          totalQuantity: { $sum: "$quantitySold" }, // Sum total quantity sold
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date in ascending order
      },
    ]);

    // If no sales data is found
    if (!salesData || salesData.length === 0) {
      return res
        .status(404)
        .json({ message: "No sales data found in the specified range." });
    }

    // Return the aggregated sales data
    return res.status(200).json(salesData);
  } catch (err) {
    return res.status(500).json({
      message: "Server error. Could not retrieve sales data.",
      error: err.message,
    });
  }
};

exports.getSales = getSales;
exports.getDayWiseSales = getDayWiseSales;
