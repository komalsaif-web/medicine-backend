const connection = require('../config/db');

// Updated table with `purpose` and `additionalInformation`
const createTableQuery = `
CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barcode VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  fakeOrReal ENUM('fake', 'real') NOT NULL DEFAULT 'real',
  mg VARCHAR(50),
  purpose TEXT,
  additionalInformation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

// Table creation
connection.query(createTableQuery, (err) => {
  if (err) console.error('Table creation error: ', err);
  else console.log('Medicines table ready.');
});

module.exports = {
  create: (medicine, callback) => {
    const sql = `INSERT INTO medicines (barcode, name, price, fakeOrReal, mg, purpose, additionalInformation) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    connection.query(sql, [
      medicine.barcode,
      medicine.name,
      medicine.price,
      medicine.fakeOrReal || 'real',
      medicine.mg,
      medicine.purpose,
      medicine.additionalInformation
    ], callback);
  },

  findByBarcode: (barcode, callback) => {
    connection.query('SELECT * FROM medicines WHERE barcode = ?', [barcode], callback);
  },

  findAll: (callback) => {
    connection.query('SELECT * FROM medicines', callback);
  },

  updateByBarcode: (barcode, medicine, callback) => {
    const sql = `UPDATE medicines SET name = ?, price = ?, fakeOrReal = ?, mg = ?, purpose = ?, additionalInformation = ? WHERE barcode = ?`;
    connection.query(sql, [
      medicine.name,
      medicine.price,
      medicine.fakeOrReal,
      medicine.mg,
      medicine.purpose,
      medicine.additionalInformation,
      barcode
    ], callback);
  },

  deleteByBarcode: (barcode, callback) => {
    connection.query('DELETE FROM medicines WHERE barcode = ?', [barcode], callback);
  }
};
