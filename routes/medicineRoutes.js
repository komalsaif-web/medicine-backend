const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/', medicineController.getAllMedicines);
router.get('/:barcode', medicineController.getMedicineByBarcode);
router.post('/', medicineController.createMedicine);
router.put('/:barcode', medicineController.updateMedicine);
router.delete('/:barcode', medicineController.deleteMedicine);

module.exports = router;
