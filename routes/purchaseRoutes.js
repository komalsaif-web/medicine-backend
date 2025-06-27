const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const multer = require('multer');

// Store files in memory buffer to send to Supabase directly
const upload = multer({ storage: multer.memoryStorage() });

// ➕ Route to add new purchase with image
router.post('/add', upload.single('receipt_image'), purchaseController.addPurchase);

// 📦 Route to fetch all saved purchases
router.get('/all', purchaseController.getPurchases);

module.exports = router;
