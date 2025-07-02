const db = require('../config/db');

exports.submitFeedback = async (req, res) => {
  const { feeling, thoughts, email, user_id } = req.body;

  if (!user_id) return res.status(400).json({ error: 'User ID is required' });
  if (!feeling || !thoughts) {
    return res.status(400).json({ error: 'Feeling and thoughts are required' });
  }

  try {
    await db.query(
      'INSERT INTO feedback (user_id, feeling, thoughts, email) VALUES ($1, $2, $3, $4)',
      [user_id, feeling, thoughts, email || null]
    );
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error('❌ Error saving feedback:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ GET Feedback by user ID from URL param (e.g. /feedback/5)
exports.getFeedback = async (req, res) => {
  const userId = req.params.id;

  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  try {
    const result = await db.query(
      'SELECT id, feeling, thoughts, email, created_at FROM feedback WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json({ feedback: result.rows });
  } catch (err) {
    console.error('❌ Error fetching feedback:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
