const mongoose = require("mongoose");
const Inventory = require("../model/Inventory");
const Product = require("../model/Product");

const deleteUnmatchedInventories = async () => {
  try {
    // Connect to your MongoDB database
    await mongoose.connect("mongodb://localhost:27017/posbackend", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Find all inventory entries where the product reference doesn't exist
    const unmatchedInventories = await Inventory.find().populate("product");

    // Filter inventories where the product is null (indicates no corresponding product)
    const toDelete = unmatchedInventories.filter((inv) => !inv.product);
    console.log(toDelete.length);
    if (toDelete.length === 0) {
      console.log("No unmatched inventory records found.");
    } else {
      // Delete all unmatched inventory entries
      const idsToDelete = toDelete.map((inv) => inv._id);

      await Inventory.deleteMany({ _id: { $in: idsToDelete } });

      console.log(`${idsToDelete.length} unmatched inventory records deleted.`);
    }

    // Close the connection
    await mongoose.connection.close();
  } catch (err) {
    console.error("Error deleting unmatched inventories:", err);
  }
};

// Run the script
deleteUnmatchedInventories();
