const db = require('../config/db');
const supabase = require('../config/supabase');
const path = require('path');
const { randomUUID } = require('crypto');

exports.addPurchase = async (req, res) => {
  try {
    console.log('🔹 Incoming request:', req.body);
    
    const file = req.file;
    const { medicine_name, purchase_city, purchase_price, purchase_date } = req.body;

    // Validate required fields
    if (!file || !medicine_name || !purchase_city || !purchase_price || !purchase_date) {
      console.warn('⚠️ Missing required fields or file');
      return res.status(400).json({ error: 'Missing required fields or file' });
    }

    console.log('📁 Uploading file to Supabase storage...');
    
    // Generate unique filename
    const filename = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Supabase Storage Upload Error:', uploadError.message || uploadError);
      return res.status(500).json({ error: 'Error uploading file to Supabase' });
    }

    // Get public image URL
    const { data: publicUrlData, error: urlError } = supabase
      .storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(filename);

    if (urlError || !publicUrlData?.publicUrl) {
      console.error('❌ Error getting public URL from Supabase:', urlError);
      return res.status(500).json({ error: 'Could not generate public URL for uploaded image' });
    }

    const receipt_image_url = publicUrlData.publicUrl;
    console.log('✅ Uploaded image URL:', receipt_image_url);

    // Insert into PostgreSQL database
    console.log('🟢 Inserting data into PostgreSQL...');
    await db.query(
      `INSERT INTO medicine_purchases (medicine_name, purchase_city, purchase_price, purchase_date, receipt_image_url)
       VALUES ($1, $2, $3, $4, $5)`,
      [medicine_name, purchase_city, purchase_price, purchase_date, receipt_image_url]
    );

    console.log('✅ Purchase saved to database');
    res.status(201).json({
      message: '✅ Purchase saved successfully',
      image_url: receipt_image_url,
    });

  } catch (error) {
    console.error('🔥 Full error object:', error);
    res.status(500).json({
      error: 'Database or upload error',
      details: error.message || error,
    });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    console.log('📥 Fetching all purchases...');
    const { rows } = await db.query(`SELECT * FROM medicine_purchases ORDER BY created_at DESC`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching purchases:', error.message || error);
    res.status(500).json({ error: 'Error fetching purchases' });
  }
};
