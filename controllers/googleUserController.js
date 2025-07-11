const pool = require('../config/db');

// 🔹 Save Google user to Supabase (without UID)
const saveGoogleUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (name, email, is_verified) VALUES ($1, $2, true)',
        [name, email]
      );
    }

    return res.status(200).json({ message: 'User saved successfully' });
  } catch (error) {
    console.error('Google User Save Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 🔹 Get Google user by ID (without UID)
const getGoogleUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get User by ID Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  saveGoogleUser,
  getGoogleUserById
};
