const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");

// Import your models
const Inventory = require("../scripts/model/Inventory");
const Product = require("../scripts/model/Product");
const SaleItem = require("../scripts/model/SaleItem");
const Category = require("../scripts/model/Category");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/posbackend", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Predefined ObjectID for Unit of Measure
const unitOfMeasureId = new mongoose.Types.ObjectId("671523e921bca0c6f2b7e88f");

// Function to retrieve category mapping from DB
async function getCategoryMap() {
  const categories = await Category.find({});
  const categoryMap = {};
  categories.forEach((category) => {
    categoryMap[category.categoryName.toLowerCase()] = category._id;
  });
  return categoryMap;
}

// Function to generate random inventory quantity between two values
function getRandomQuantity(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to parse date from CSV (format: MM/DD/YYYY)
function parseDate(dateString) {
  //   console.log(dateString);
  const [year, month, day] = dateString.split("-");
  console.log(year, month, day);
  return new Date(year, month - 1, day); // JavaScript Date object (month is 0-indexed)
}

// Function to parse and insert data
async function importData() {
  const results = [];
  const categoryMap = await getCategoryMap();
  console.log(categoryMap);

  fs.createReadStream("sales.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        for (const row of results) {
          // Extract relevant data from each row
          const productName = row["Product Name"];
          const productCategoryName = row["Product Category"].toLowerCase();
          const quantitySold = parseInt(row["Quantity"], 10);
          const pricePerUnit = parseFloat(row["Unit"]);
          const totalPrice = parseFloat(row["Total Amount"]);
          const saleDate = parseDate(row["Date"]); // Parse date from the CSV
          //   console.log("hi", saleDate);
          // Get the ObjectID for the product category
          const productCategory = new mongoose.Types.ObjectId(
            categoryMap[productCategoryName] || "67152b7645fa67320def101f"
          );

          // Skip if category is not found
          if (!productCategory) {
            console.log(
              `Category not found for product: ${productName}. Skipping.`
            );
            continue;
          }

          // Check if product exists or create a new one
          let product = await Product.findOne({ productName });
          if (!product) {
            product = new Product({
              productName,
              productCategory, // Set to the mapped ObjectID
              unitOfMeasure: unitOfMeasureId, // Set to predefined ObjectID
              productImage: "default_image_path.jpg",
              productPrice: pricePerUnit,
            });
            await product.save();
          }

          // Check if inventory exists or create a new one
          let inventory = await Inventory.findOne({ product: product._id });
          if (!inventory) {
            // Initialize with a random quantity between 50 and 200
            inventory = new Inventory({
              product: product._id,
              quantityInStock: getRandomQuantity(50, 200), // Set random initial stock
            });
            await inventory.save();
          }

          // Add SaleItem entry with date from the CSV
          const saleItem = new SaleItem({
            product: product._id,
            quantitySold,
            pricePerUnit,
            totalPrice,
            saleDate: saleDate, // Set sale date from CSV
          });
          await saleItem.save();
        }

        console.log("Data import successful!");
      } catch (err) {
        console.error("Error importing data:", err);
      } finally {
        mongoose.connection.close();
      }
    });
}

importData();
