const fs = require('fs');
const path = require('path');
const connection = require('./config/db');

const imgDir = path.join(__dirname, 'images-db');

connection.connect(err => {
  if (err) {
    console.error('DB connection error:', err);
    return;
  }
  console.log('Connected to DB');

  fs.readdir(imgDir, (err, files) => {
    if (err) {
      console.error('Error reading images directory:', err);
      return;
    }

    files.forEach(file => {
      const imageName = file; // e.g., 'panadol.png'

      // Check if already exists to avoid duplicates
      const checkQuery = 'SELECT COUNT(*) as count FROM medicine_image_name WHERE image_name = ?';
      connection.query(checkQuery, [imageName], (err, results) => {
        if (err) {
          console.error('Error checking existing record:', err);
          return;
        }

        if (results[0].count === 0) {
          // Insert image name in DB
          const insertQuery = 'INSERT INTO medicine_image_name (image_name) VALUES (?)';
          connection.query(insertQuery, [imageName], (err) => {
            if (err) {
              console.error('Insert error for:', imageName, err);
            } else {
              console.log('Inserted:', imageName);
            }
          });
        } else {
          console.log('Already exists:', imageName);
        }
      });
    });
  });
});