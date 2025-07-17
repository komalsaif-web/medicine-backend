const db = require('../config/db');

// POST /rating
exports.submitRating = async (req, res) => {
  const { user_id, rating } = req.body;

  if (!user_id || !rating) {
    return res.status(400).json({ error: 'User ID and rating are required' });
  }

  try {
    await db.query(
      'INSERT INTO ratings (user_id, rating) VALUES ($1, $2)',
      [user_id, rating]
    );
    res.status(201).json({ message: 'Rating submitted successfully' });
  } catch (err) {
    console.error('❌ Error saving rating:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /rating/:id
exports.getUserRating = async (req, res) => {
  const userId = req.params.id;

  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    const result = await db.query(
      'SELECT id, rating, created_at FROM ratings WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json({ ratings: result.rows });
  } catch (err) {
    console.error('❌ Error fetching rating:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// ✅ GET /rating — Get all ratings (admin use or analysis)
exports.getAllRatings = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, user_id, rating, created_at FROM ratings ORDER BY created_at DESC'
    );
    res.status(200).json({ ratings: result.rows });
  } catch (err) {
    console.error('❌ Error fetching all ratings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
