const Inventory = require("../model/Inventory");
const Product = require("../model/Product");

const getInventory = async (req, res) => {
  let inventory;
  try {
    // Find all inventory items and populate related product details
    inventory = await Inventory.find().populate("product").limit(20);
  } catch (err) {
    return res.status(404).json({ message: "No inventory data found" });
  }

  if (!inventory || inventory.length === 0) {
    return res.status(404).json({ message: "No inventory data available" });
  }

  const inventoryData = inventory.map((inv) => ({
    product: inv.product.toObject({ getters: true }),
    lastRestocked: inv.lastRestocked,
    stockSize: inv.quantityInStock,
  }));

  return res.status(200).json(inventoryData);
};

// Export the function
exports.getInventory = getInventory;
