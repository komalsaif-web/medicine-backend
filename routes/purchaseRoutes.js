const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const multer = require('multer');

// Store file in memory
const upload = multer({ storage: multer.memoryStorage() });

// ➕ Add purchase with image
router.post('/purchase/add', upload.single('receipt_image'), purchaseController.addPurchase);

// 📥 All purchases
router.get('/purchase/all', purchaseController.getPurchases);

// 📥 Purchases for a specific user
router.get('/purchase/:userId', purchaseController.getPurchasesByUser);

module.exports = router;
