const db = require('../config/db');

// ➕ Add new purchase with image and user_id
exports.addPurchase = async (req, res) => {
  try {
    const file = req.file;
    const {
      user_id,
      medicine_name,
      purchase_city,
      purchase_price,
      purchase_date
    } = req.body;

    if (!file || !medicine_name || !purchase_city || !purchase_price || !purchase_date || !user_id) {
      return res.status(400).json({ error: 'All fields including user_id are required' });
    }

    const result = await db.query(
      `INSERT INTO medicine_purchases 
        (user_id, medicine_name, purchase_city, purchase_price, purchase_date, receipt_image_data)
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        user_id,
        medicine_name,
        purchase_city,
        purchase_price,
        purchase_date,
        file.buffer
      ]
    );

    res.status(201).json({
      message: '✅ Purchase saved successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('🔥 Error in addPurchase:', error);
    res.status(500).json({
      error: 'Database error',
      details: error.message
    });
  }
};

// 📥 Get all purchases
exports.getPurchases = async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, user_id, medicine_name, purchase_city, purchase_price, purchase_date, 
              encode(receipt_image_data, 'base64') AS image_base64 
       FROM medicine_purchases 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching purchases:', error.message);
    res.status(500).json({ error: 'Error fetching purchases' });
  }
};

// 📥 Get purchases by user ID
exports.getPurchasesByUser = async (req, res) => {
  const { userId } = req.params;

  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    const { rows } = await db.query(
      `SELECT id, medicine_name, purchase_city, purchase_price, purchase_date, 
              encode(receipt_image_data, 'base64') AS image_base64 
       FROM medicine_purchases 
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching user purchases:', error.message);
    res.status(500).json({ error: 'Failed to fetch user purchases' });
  }
};
