const express = require('express');
const router = express.Router();
const { products } = require('../controllers');

router.post('/', products.createProduct);
router.get('/', products.getProducts);
router.get('/:id', products.getProductById);
router.put('/:id', products.updateProduct);
router.delete('/:id', products.deleteProduct);

module.exports = router;
