// routes/medicineRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/medicineController');
const multer = require('multer');

// Use multer for file upload; by default, it stores file in memory
const upload = multer();

// Create a new medicine product with image upload
router.post('/medicine-products', upload.single('image'), controller.createProduct);

// Get all products
router.get('/medicine-products', controller.getAllProducts);

// Get product by ID
router.get('/medicine-products/:id', controller.getProductById);

// Update product by ID (update fields through JSON body)
router.put('/medicine-products/:id', controller.updateProduct);

// Delete product by ID
router.delete('/medicine-products/:id', controller.deleteProductById);

// Delete all products
router.delete('/medicine-products', controller.deleteAllProducts);

module.exports = router;
