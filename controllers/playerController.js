// controllers/playerController.js
const axios = require('axios');
require('dotenv').config();

exports.getPlayerProfile = async (req, res) => {
  const { name } = req.params;

  const prompt = `
You are a football stats expert. For the player "${name}", give the full profile in this exact JSON format:
{
  "name": "",
  "team": "",
  "country": "",
  "image": "direct image URL",
  "jersey_number": 0,
  "position": "",
  "total_appearances": 0,
  "total_goals": 0,
  "total_assists": 0,
  "yellow_cards": 0,
  "red_cards": 0,
  "pass_accuracy": "0%",
  "major_trophies": [
    {"title": "", "count": 0}
  ],
  "season_2025_stats": {
    "matches": 0,
    "yellow_cards": 0,
    "pass_accuracy": "0%"
  }
}
Return only JSON with real stats for season 2024–25.`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiReply = response.data.choices[0].message.content;
    const jsonStart = aiReply.indexOf('{');
    const jsonData = JSON.parse(aiReply.slice(jsonStart));

    res.json(jsonData);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch player data' });
  }
};
