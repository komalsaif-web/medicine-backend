const db = require('../config/db');

// 🔍 Get all medicines
exports.findAll = (callback) => {
  db.query('SELECT * FROM medicines', callback);
};

// 🔍 Get medicine by barcode
exports.findByBarcode = (barcode, callback) => {
  db.query('SELECT * FROM medicines WHERE barcode = $1', [barcode], callback);
};

// ➕ Add new medicine
exports.create = (medicine, callback) => {
  const { barcode, name, description, manufacturer, price } = medicine;
  db.query(
    'INSERT INTO medicines (barcode, name, description, manufacturer, price) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [barcode, name, description || '', manufacturer || '', price || 0],
    callback
  );
};

// ✏️ Update medicine by barcode
exports.updateByBarcode = (barcode, medicine, callback) => {
  const { name, description, manufacturer, price } = medicine;
  db.query(
    'UPDATE medicines SET name = $1, description = $2, manufacturer = $3, price = $4 WHERE barcode = $5',
    [name, description || '', manufacturer || '', price || 0, barcode],
    callback
  );
};

// ❌ Delete medicine by barcode
exports.deleteByBarcode = (barcode, callback) => {
  db.query('DELETE FROM medicines WHERE barcode = $1', [barcode], callback);
};
