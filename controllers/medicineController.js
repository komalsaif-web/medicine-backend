// controllers/medicineController.js
const pool = require('../config/db');
const supabase = require('../config/supabaseClient');

// Controller to create a new medicine product
exports.createProduct = async (req, res) => {
  try {
    // Form data mein product details aur image file expect kar rahe hain.
    const { product_name, price, language, brand, stock, variant, category, description, specifications, is_dangerous, buyer_promotion_image, video_url, shipping_details, seller_id } = req.body;
    const file = req.file;  // multer se file aayegi

    // Define a unique file path/name for Supabase Storage
    const filePath = `medicine/${Date.now()}_${file.originalname}`;

    // Upload image file to Supabase Storage bucket 'medicine-images'
    const { data, error } = await supabase.storage
      .from('medicine-images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });
      
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Get public URL for the uploaded image
    const { publicURL } = supabase.storage
      .from('medicine-images')
      .getPublicUrl(filePath);

    // Insert new product into PostgreSQL database including image URL
    const result = await pool.query(
      `INSERT INTO medicine_products (
        seller_id, product_name, language, brand, price, stock, variant,
        category, description, specifications, is_dangerous, image_url,
        buyer_promotion_image, video_url, shipping_details
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        seller_id,
        product_name,
        language,
        brand,
        price,
        stock,
        variant,           // JSON data expected
        category,
        description,
        specifications,    // JSON data expected
        is_dangerous,
        publicURL,         // URL from Supabase Storage
        buyer_promotion_image,
        video_url,
        shipping_details   // JSON data expected
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
