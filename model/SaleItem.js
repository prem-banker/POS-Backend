const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SaleItem = Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantitySold: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number, required: true }, // quantitySold * pricePerUnit
  saleDate: { type: Date, required: true }, // Date of sale
});

module.exports = mongoose.model("SaleItem", SaleItem);
