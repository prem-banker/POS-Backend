const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Inventory = Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantityInStock: { type: Number, required: true },
  lastRestocked: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Inventory", Inventory);
