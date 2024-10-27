const express = require("express");
const { getSales, getDayWiseSales } = require("../controller/sales-controller");

const router = express.Router();

router.get("/sales", getSales);
router.get("/sales/daywise", getDayWiseSales);

module.exports = router;
