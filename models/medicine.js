const pool = require('../config/db');

// Create enum type for fakeOrReal if not exists
const createTypeQuery = `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fake_or_real_enum') THEN
    CREATE TYPE fake_or_real_enum AS ENUM ('fake', 'real');
  END IF;
END
$$;
`;

// Create medicines table without image column
const createTableQuery = `
CREATE TABLE IF NOT EXISTS medicines (
  id SERIAL PRIMARY KEY,
  barcode VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  fakeOrReal fake_or_real_enum NOT NULL DEFAULT 'real',
  mg VARCHAR(255),
  purpose TEXT,
  additionalInformation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Drop image column if it exists
const dropImageColumnQuery = `
ALTER TABLE medicines DROP COLUMN IF EXISTS image;
`;

// Run table and type creation on startup
(async () => {
  try {
    await pool.query(createTypeQuery);
    await pool.query(createTableQuery);
    await pool.query(dropImageColumnQuery);
    console.log('Medicines table ready (image column removed if existed).');
  } catch (err) {
    console.error('Table creation error:', err);
  }
})();

module.exports = {
  create: (medicine, callback) => {
    const sql = `
      INSERT INTO medicines (barcode, name, price, fakeOrReal, mg, purpose, additionalInformation)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;
    pool.query(sql, [
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
    const sql = `SELECT * FROM medicines WHERE barcode = $1`;
    pool.query(sql, [barcode], callback);
  },

  findAll: (callback) => {
    pool.query('SELECT * FROM medicines', callback);
  },

  updateByBarcode: (barcode, medicine, callback) => {
    const sql = `
      UPDATE medicines 
      SET name = $1, price = $2, fakeOrReal = $3, mg = $4, purpose = $5, additionalInformation = $6
      WHERE barcode = $7
    `;
    pool.query(sql, [
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
    const sql = `DELETE FROM medicines WHERE barcode = $1`;
    pool.query(sql, [barcode], callback);
  }
};
