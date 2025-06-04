const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

const imgDir = path.join(__dirname, 'images-db');

async function seedImageNames() {
  try {
    // Create medicine_image_name table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS medicine_image_name (
        id SERIAL PRIMARY KEY,
        image_name VARCHAR(255) UNIQUE
      );
    `;

    console.log('🔧 Creating medicine_image_name table if not exists...');
    await pool.query(createTableSQL);

    // Read image files
    const files = await fs.promises.readdir(imgDir);

    // Insert image names if not already there
    for (const file of files) {
      const checkQuery = 'SELECT COUNT(*) FROM medicine_image_name WHERE image_name = $1';
      const result = await pool.query(checkQuery, [file]);

      if (parseInt(result.rows[0].count) === 0) {
        const insertQuery = 'INSERT INTO medicine_image_name (image_name) VALUES ($1)';
        await pool.query(insertQuery, [file]);
        console.log('✅ Inserted image name:', file);
      } else {
        console.log('⚠️ Image name already exists:', file);
      }
    }

    console.log('\n🎉 All image names seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding image names:', err);
  } finally {
    await pool.end();
    process.exit();
  }
}

seedImageNames();
