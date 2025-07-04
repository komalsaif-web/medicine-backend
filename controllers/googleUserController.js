const pool = require('../config/db');

// 🔹 Controller to save Google user to Supabase
const saveGoogleUser = async (req, res) => {
  try {
    const { name, email, uid } = req.body;

    if (!name || !email || !uid) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (existing.rows.length === 0) {
      // Insert new Google user into Supabase
      await pool.query(
        'INSERT INTO users (name, email, uid, is_verified) VALUES ($1, $2, $3, true)',
        [name, email, uid]
      );
    }

    return res.status(200).json({ message: 'User saved successfully' });
  } catch (error) {
    console.error('Google User Save Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  saveGoogleUser
};
