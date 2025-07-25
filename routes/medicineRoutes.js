const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // in-memory buffer
const productController = require('../controllers/medicineController');

router.post('/products', upload.single('image'), productController.createProduct);
router.get('/products/user/:user_id', productController.getProductsByUserId);
router.get('/products', productController.getAllProducts);
router.put('/products/:id', productController.updateProductById);
router.delete('/products/:id', productController.deleteProductById);

module.exports = router;
