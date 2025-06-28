// models/userModel.js
const db = require('../config/db');

const createUser = async (email, phone, password) => {
  const result = await db.query(
    'INSERT INTO users (email, phone, password) VALUES ($1, $2, $3) RETURNING id, email, phone',
    [email, phone, password]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
};
