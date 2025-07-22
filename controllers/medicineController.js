const supabase = require('../config/supabaseClient');

exports.createProduct = async (req, res) => {
  try {
    const {
      product_name,
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
      user_id, // received from frontend
    } = req.body;

    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Upload image to Supabase Storage
    const fileName = `${Date.now()}_${file.originalname}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medicine-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image' });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('medicine-images')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // Insert into database
    const { data: insertData, error: insertError } = await supabase
      .from('medicine_products')
      .insert([
        {
          product_name,
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
          image_url: imageUrl,
          user_id, // integer
        },
      ])
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to save product' });
    }

    return res.status(201).json({
      message: 'Product created successfully',
      data: insertData[0],
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('medicine_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('medicine_products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('medicine_products')
      .update(req.body)
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete product by ID
exports.deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('medicine_products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete all products (use with caution)
exports.deleteAllProducts = async (req, res) => {
  try {
    const { error } = await supabase
      .from('medicine_products')
      .delete()
      .neq('id', 0); // deletes all

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'All products deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
