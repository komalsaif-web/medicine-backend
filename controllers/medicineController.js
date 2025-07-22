const pool = require('../config/db');
const supabase = require('../config/supabaseClient');

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      generic_name,
      brand,
      dosage,
      category,
      formula,
      form,
      packaging,
      description,
      manufacturer,
      batch_number,
      manufacturing_date,
      expiry_date,
      price,
      user_id // ✅ Make sure this is coming from req.body
    } = req.body;

    const file = req.file;

    // ✅ Step 1: Upload image to Supabase Storage
    const filePath = `medicine/${Date.now()}_${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medicine-images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    // ✅ Step 2: Get public image URL
    const { data: urlData } = supabase.storage
      .from('medicine-images')
      .getPublicUrl(filePath);
    const image_url = urlData.publicUrl;

    // ✅ Step 3: Insert into medicine_products table
    const result = await pool.query(
      `INSERT INTO medicine_products (
        name,
        generic_name,
        brand,
        dosage,
        category,
        formula,
        form,
        packaging,
        description,
        manufacturer,
        batch_number,
        manufacturing_date,
        expiry_date,
        image_url,
        price,
        user_id
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16
      ) RETURNING *`,
      [
        name,
        generic_name,
        brand,
        dosage,
        category,
        formula,
        form,
        packaging,
        description,
        manufacturer,
        batch_number,
        manufacturing_date,
        expiry_date,
        image_url,
        price,
        user_id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controller to get all medicine products
exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medicine_products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controller to get a product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM medicine_products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controller to update a product by ID
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    // Build dynamic SET clause for UPDATE query
    const setClause = fields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const query = `UPDATE medicine_products SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controller to delete a product by ID
exports.deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM medicine_products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controller to delete all products
exports.deleteAllProducts = async (req, res) => {
  try {
    await pool.query('DELETE FROM medicine_products');
    res.json({ message: 'All products deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
