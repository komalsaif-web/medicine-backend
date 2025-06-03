const Medicine = require('../models/medicine');

exports.getAllMedicines = (req, res) => {
  Medicine.findAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getMedicineByBarcode = (req, res) => {
  const barcode = req.params.barcode;
  Medicine.findByBarcode(barcode, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Medicine not found' });
    res.json(results[0]);
  });
};

exports.createMedicine = (req, res) => {
  const medicine = req.body;
  if (!medicine.barcode || !medicine.name) {
    return res.status(400).json({ error: 'Barcode and Name are required' });
  }
  Medicine.create(medicine, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Medicine added', id: results.insertId });
  });
};

exports.updateMedicine = (req, res) => {
  const barcode = req.params.barcode;
  const medicine = req.body;
  Medicine.updateByBarcode(barcode, medicine, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine updated' });
  });
};

exports.deleteMedicine = (req, res) => {
  const barcode = req.params.barcode;
  Medicine.deleteByBarcode(barcode, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine deleted' });
  });
};
