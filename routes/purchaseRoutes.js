const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/add', upload.single('receipt_image'), purchaseController.addPurchase);
router.get('/all', purchaseController.getPurchases);

module.exports = router;
