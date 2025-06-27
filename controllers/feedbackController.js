const db = require('../config/db');

exports.submitFeedback = async (req, res) => {
  const { feeling, thoughts, email } = req.body;

  if (!feeling || !thoughts) {
    return res.status(400).json({ error: 'Feeling and thoughts are required' });
  }

  try {
    await db.query(
      'INSERT INTO feedback (feeling, thoughts, email) VALUES ($1, $2, $3)',
      [feeling, thoughts, email || null]
    );
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error('❌ Error saving feedback:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
