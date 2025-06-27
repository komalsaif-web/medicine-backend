const db = require('../config/db');
const supabase = require('../config/supabase');
const path = require('path');
const { randomUUID } = require('crypto');

// ➕ Add new purchase
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

    const filename = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;
    console.log('📁 Generated filename:', filename);

    // Upload to Supabase Storage
    const { data: uploadedData, error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError.message || uploadError);
      return res.status(500).json({
        error: 'Error uploading file to Supabase',
        details: uploadError.message || uploadError,
      });
    }

    console.log('✅ File uploaded:', uploadedData);

    // Get public URL
    const { data: publicUrlData, error: urlError } = supabase
      .storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(filename);

    if (urlError || !publicUrlData?.publicUrl) {
      console.error('❌ Public URL generation error:', urlError);
      return res.status(500).json({ error: 'Could not generate public URL for image' });
    }

    const receipt_image_url = publicUrlData.publicUrl;
    console.log('🌐 Public image URL:', receipt_image_url);

    // Insert into DB
    const result = await db.query(
      `INSERT INTO medicine_purchases (medicine_name, purchase_city, purchase_price, purchase_date, receipt_image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [medicine_name, purchase_city, purchase_price, purchase_date, receipt_image_url]
    );

    console.log('📦 DB insert result:', result.rows[0]);

    res.status(201).json({
      message: '✅ Purchase saved successfully',
      image_url: receipt_image_url,
    });

  } catch (error) {
    console.error('🔥 Catch block error:', error);
    res.status(500).json({
      error: 'Database or upload error',
      details: error.message || error,
    });
  }
};

// 📥 Get all purchases
exports.getPurchases = async (req, res) => {
  try {
    console.log('📥 Fetching all purchases...');
    const { rows } = await db.query(
      `SELECT * FROM medicine_purchases ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching purchases:', error.message || error);
    res.status(500).json({ error: 'Error fetching purchases' });
  }
};
