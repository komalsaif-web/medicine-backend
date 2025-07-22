// controllers/medicineController.js
const pool = require('../config/mysql'); // Make sure this is a MySQL pool
const supabase = require('../config/supabaseClient');

// Create product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      genericName,
      brand,
      dosage,
      category,
      formula,
      form,
      packaging,
      description,
      manufacturer,
      batchNumber,
      manufacturingDate,
      expiryDate,
      price,
    } = req.body;

    const file = req.file;
    const filePath = `medicine/${Date.now()}_${file.originalname}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medicine-images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { data: urlData } = supabase.storage
      .from('medicine-images')
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    const sql = `
      INSERT INTO medicine_products (
        name, generic_name, brand, dosage, category,
        formula, form, packaging, description, manufacturer,
        batch_number, manufacturing_date, expiry_date,
        image_url, price
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name, genericName, brand, dosage, category,
      formula, form, packaging, description, manufacturer,
      batchNumber, manufacturingDate, expiryDate,
      imageUrl, price
    ];

    await pool.execute(sql, values);

    res.status(201).json({ message: 'Medicine product created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medicine_products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM medicine_products WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE medicine_products SET ${setClause} WHERE id = ?`;

    await pool.execute(sql, [...values, id]);

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete product
exports.deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM medicine_products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete all products
exports.deleteAllProducts = async (req, res) => {
  try {
    await pool.execute('DELETE FROM medicine_products');
    res.json({ message: 'All products deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
