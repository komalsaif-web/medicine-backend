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

    // Upload image to Supabase Storage
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

    // Insert into Supabase DB (PostgreSQL)
    const { error: insertError } = await supabase
      .from('medicine_products')
      .insert([
        {
          name,
          generic_name: genericName,
          brand,
          dosage,
          category,
          formula,
          form,
          packaging,
          description,
          manufacturer,
          batch_number: batchNumber,
          manufacturing_date: manufacturingDate,
          expiry_date: expiryDate,
          image_url: imageUrl,
          price,
        }
      ]);

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    res.status(201).json({ message: 'Medicine product created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Delete all products
exports.deleteAllProducts = async (req, res) => {
  try {
    const { error } = await supabase
      .from('medicine_products')
      .delete()
      .neq('id', 0); // deletes all (use with caution)

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'All products deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
