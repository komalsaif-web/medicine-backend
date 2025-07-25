const pool = require('../config/db');
const supabase = require('../config/supabaseClient');

// ✅ Create product (by logged-in user)
exports.createProduct = async (req, res) => {
  try {
    const {
      name, generic_name, brand, dosage, category, formula, form,
      packaging, description, manufacturer, batch_number,
      manufacturing_date, expiry_date, price, user_id
    } = req.body;

    const file = req.file;
    const filePath = `medicine/${Date.now()}_${file.originalname}`;

    // Upload image to Supabase
    const { error: uploadError } = await supabase.storage
      .from('medicine-images')
      .upload(filePath, file.buffer, { contentType: file.mimetype });

    if (uploadError) return res.status(500).json({ error: uploadError.message });

    // Get public URL
    const { data: urlData } = supabase.storage.from('medicine-images').getPublicUrl(filePath);
    const image_url = urlData.publicUrl;

    const result = await pool.query(
      `INSERT INTO medicine_products (
        name, generic_name, brand, dosage, category, formula, form,
        packaging, description, manufacturer, batch_number,
        manufacturing_date, expiry_date, image_url, price, user_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING *`,
      [
        name, generic_name, brand, dosage, category, formula, form,
        packaging, description, manufacturer, batch_number,
        manufacturing_date, expiry_date, image_url, price, user_id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all products of a specific user
exports.getProductsByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM medicine_products WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all products (admin/public use)
exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medicine_products ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update one product of logged-in user
exports.updateProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const fields = Object.keys(req.body).filter(k => k !== 'user_id');
    const values = fields.map(k => req.body[k]);

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No data to update' });
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const query = `UPDATE medicine_products SET ${setClause} WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2} RETURNING *`;

    const result = await pool.query(query, [...values, id, user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete one product of logged-in user
exports.deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    const result = await pool.query(
      'DELETE FROM medicine_products WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
