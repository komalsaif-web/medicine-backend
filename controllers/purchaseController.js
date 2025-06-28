const db = require('../config/db');
const path = require('path');
const { randomUUID } = require('crypto');

// ➕ Add new purchase with image saved in DB (not in Supabase Storage)
exports.addPurchase = async (req, res) => {
  try {
    console.log('🔹 Incoming fields:', req.body);
    console.log('🖼️ File info:', req.file?.originalname, req.file?.mimetype, req.file?.size);

    const file = req.file;
    const { medicine_name, purchase_city, purchase_price, purchase_date } = req.body;

    if (!file || !medicine_name || !purchase_city || !purchase_price || !purchase_date) {
      console.warn('⚠️ Missing fields. Received:', {
        medicine_name, purchase_city, purchase_price, purchase_date, file: !!file
      });
      return res.status(400).json({ error: 'Missing required fields or file' });
    }

    // 🔐 Save image binary data directly in DB (as bytea)
    const result = await db.query(
      `INSERT INTO medicine_purchases 
        (medicine_name, purchase_city, purchase_price, purchase_date, receipt_image_data)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        medicine_name,
        purchase_city,
        purchase_price,
        purchase_date,
        file.buffer, // image binary
      ]
    );

    console.log('✅ Purchase saved in DB:', result.rows[0]);

    res.status(201).json({
      message: '✅ Purchase saved successfully with image in DB',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('🔥 Error in addPurchase:', error);
    res.status(500).json({
      error: 'Database error',
      details: error.message || error,
    });
  }
};

// 📥 Get all purchases (image will be in binary buffer)
exports.getPurchases = async (req, res) => {
  try {
    console.log('📥 Fetching all purchases...');
    const { rows } = await db.query(
      `SELECT id, medicine_name, purchase_city, purchase_price, purchase_date, 
              encode(receipt_image_data, 'base64') AS image_base64 
       FROM medicine_purchases 
       ORDER BY created_at DESC`
    );

    // You can now use `image_base64` on frontend like: <img src="data:image/jpeg;base64,..." />
    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching purchases:', error.message || error);
    res.status(500).json({ error: 'Error fetching purchases' });
  }
};
