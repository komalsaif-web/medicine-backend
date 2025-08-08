const express = require('express');
const router = express.Router();
const scanInfoController = require('../controllers/scanInfoController');

router.post('/upload-scan-info', scanInfoController.uploadScanInfo);
router.get('/get-all-scan-info', scanInfoController.getAllScanInfo);
router.get('/get-by-company/:company', scanInfoController.getByCompany);
router.get('/get-by-company-authentic-scan/:company', scanInfoController.getCompanyAuthenticScans);
router.get('/get-by-company-fake-scan/:company', scanInfoController.getCompanyFakeScans);

module.exports = router;
