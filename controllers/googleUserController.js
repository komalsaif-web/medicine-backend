const pool = require('../config/db');

// 🔹 Login or Register Google User
const loginGoogleUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Missing name or email' });
    }

    // 🔍 Check if user already exists
    const existing = await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email]);

    // ✅ If exists → login
    if (existing.rows.length > 0) {
      return res.status(200).json({
        message: 'Login successful',
        user: existing.rows[0]
      });
    }

    // 🆕 Else create new user (register)
    const insert = await pool.query(
      'INSERT INTO users (name, email, is_verified) VALUES ($1, $2, true) RETURNING id, name, email',
      [name, email]
    );

    return res.status(201).json({
      message: 'User registered and logged in successfully',
      user: insert.rows[0]
    });

  } catch (error) {
    console.error('Google Login Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 🔹 Get Google User by ID
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
  loginGoogleUser,
  getGoogleUserById
};
