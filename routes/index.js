const express = require("express");
const router = express.Router();
const product = require("./product");

router.use("/products", product);

module.exports = router;
