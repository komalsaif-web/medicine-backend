const db = require('../config/db');

exports.addPurchase = async (req, res) => {
  const { medicine_name, purchase_city, purchase_price, purchase_date, receipt_image_url } = req.body;

  if (!medicine_name || !purchase_city || !purchase_price || !purchase_date || !receipt_image_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.query(
      `INSERT INTO medicine_purchases (medicine_name, purchase_city, purchase_price, purchase_date, receipt_image_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [medicine_name, purchase_city, purchase_price, purchase_date, receipt_image_url]
    );
    res.status(201).json({ message: 'Purchase saved successfully' });
  } catch (error) {
    console.error('Error saving purchase:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM medicine_purchases ORDER BY created_at DESC`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching purchases' });
  }
};
 