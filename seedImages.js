const fs = require('fs');
const path = require('path');
const connection = require('./config/db');

const imgDir = path.join(__dirname, 'images-db');

async function seedImageNames() {
  try {
    // Step 1: Create the table if not exists
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS medicine_image_name (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_name VARCHAR(255) UNIQUE
      );
    `;

    console.log('🔧 Creating table if not exists...');
    await new Promise((resolve, reject) => {
      connection.query(createTableSQL, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Step 2: Read images directory
    const files = await new Promise((resolve, reject) => {
      fs.readdir(imgDir, (err, files) => {
        if (err) return reject(err);
        resolve(files);
      });
    });

    // Step 3: Insert unique image names
    for (const file of files) {
      const checkQuery = 'SELECT COUNT(*) as count FROM medicine_image_name WHERE image_name = ?';
      const exists = await new Promise((resolve, reject) => {
        connection.query(checkQuery, [file], (err, results) => {
          if (err) return reject(err);
          resolve(results[0].count > 0);
        });
      });

      if (!exists) {
        const insertQuery = 'INSERT INTO medicine_image_name (image_name) VALUES (?)';
        await new Promise((resolve, reject) => {
          connection.query(insertQuery, [file], (err) => {
            if (err) return reject(err);
            console.log('✅ Inserted:', file);
            resolve();
          });
        });
      } else {
        console.log('⚠️ Already exists:', file);
      }
    }

    console.log('\n🎉 All image names seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding image names:', err);
  } finally {
    connection.end(); // Cleanly close the DB connection
    process.exit();
  }
}

seedImageNames();
