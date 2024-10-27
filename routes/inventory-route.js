const express = require("express");
const { getInventory } = require("../controller/inventory-controller");

const router = express.Router();

router.get("/", getInventory);

module.exports = router;
