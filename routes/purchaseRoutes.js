const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const multer = require('multer');

// Store file in memory (for storing into DB as buffer)
const upload = multer({ storage: multer.memoryStorage() });

// ➕ Route to add purchase with image (stored in DB)
router.post('/add', upload.single('receipt_image'), purchaseController.addPurchase);

// 📦 Route to fetch all purchases (with image_base64)
router.get('/all', purchaseController.getPurchases);

module.exports = router;
