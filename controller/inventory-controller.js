const Inventory = require("../model/Inventory");
const Product = require("../model/Product");

const getInventory = async (req, res) => {
  let inventory;
  try {
    // Find all inventory items and populate related product and category details
    inventory = await Inventory.find()
      .populate({
        path: "product",
        populate: {
          path: "productCategory", // Populate productCategory within product
          model: "Category",
        },
      })
      .limit(20);
  } catch (err) {
    return res.status(404).json({ message: "No inventory data found" });
  }

  if (!inventory || inventory.length === 0) {
    return res.status(404).json({ message: "No inventory data available" });
  }

  // Map inventory data to include category name and other details
  const inventoryData = inventory.map((inv) => ({
    product: {
      id: inv.product._id,
      productName: inv.product.productName,
      productCategory: inv.product.productCategory
        ? inv.product.productCategory.categoryName // Include category name if available
        : "Unknown Category",
      unitOfMeasure: inv.product.unitOfMeasure,
      productImage: inv.product.productImage,
      productPrice: inv.product.productPrice,
    },
    lastRestocked: inv.lastRestocked,
    stockSize: inv.quantityInStock,
  }));

  return res.status(200).json(inventoryData);
};

// Export the function
exports.getInventory = getInventory;
