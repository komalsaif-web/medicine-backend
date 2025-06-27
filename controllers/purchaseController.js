const db = require('../config/db');
const supabase = require('../config/supabase');
const path = require('path');
const { randomUUID } = require('crypto');

exports.addPurchase = async (req, res) => {
  try {
    const file = req.file;
    const { medicine_name, purchase_city, purchase_price, purchase_date } = req.body;

    if (!file || !medicine_name || !purchase_city || !purchase_price || !purchase_date) {
      return res.status(400).json({ error: 'Missing required fields or file' });
    }

    // Upload image to Supabase Storage
    const filename = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;
    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(filename);

    const receipt_image_url = publicUrlData.publicUrl;

    // Insert into DB
    await db.query(
      `INSERT INTO medicine_purchases (medicine_name, purchase_city, purchase_price, purchase_date, receipt_image_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [medicine_name, purchase_city, purchase_price, purchase_date, receipt_image_url]
    );

    res.status(201).json({ message: '✅ Purchase saved successfully', image_url: receipt_image_url });

  } catch (error) {
    console.error('❌ Error saving purchase:', error.message);
    res.status(500).json({ error: 'Database or upload error' });
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
