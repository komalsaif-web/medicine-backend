const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const axios = require('axios');
const tmp = require('tmp');
const { createClient } = require('@supabase/supabase-js');
const connection = require('../config/db');

// Supabase credentials
const supabaseUrl = 'https://kzhbzvkfpjftklzcydze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // 🔐 Make sure this stays safe
const supabase = createClient(supabaseUrl, supabaseKey);

// Load PNG image
function loadPNG(filePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(new PNG())
      .on('parsed', function () {
        resolve(this);
      })
      .on('error', reject);
  });
}

// Compare two images
async function compareImages(img1Path, img2Path) {
  const img1 = await loadPNG(img1Path);
  const img2 = await loadPNG(img2Path);

  if (img1.width !== img2.width || img1.height !== img2.height) {
    return 0; // Different dimensions
  }

  const diff = new PNG({ width: img1.width, height: img1.height });
  const diffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.1 });

  const totalPixels = img1.width * img1.height;
  const similarity = ((totalPixels - diffPixels) / totalPixels) * 100;

  return similarity;
}

// ✅ Corrected public URL function (removed 'uploads/')
function getSupabaseImageUrl(fileName) {
  const { data, error } = supabase.storage
    .from('medicine-images')
    .getPublicUrl(fileName);

  if (error || !data.publicUrl) {
    console.error('❌ Supabase public URL error:', error);
    return null;
  }

  return data.publicUrl;
}

// Download image from URL
async function downloadImageToTemp(url) {
  const response = await axios({ url, responseType: 'arraybuffer' });
  const tempFile = tmp.fileSync({ postfix: '.png' });
  fs.writeFileSync(tempFile.name, response.data);
  return tempFile.name;
}

// 🔍 Compare user image with database images
async function compareWithDatabase(userImagePath) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM medicines', async (err, rows) => {
      if (err) return reject(err);

      let bestMatch = null;
      let bestScore = 0;

      for (let medicine of rows) {
        const fileName = `${medicine.barcode}.png`;
        const publicUrl = getSupabaseImageUrl(fileName);

        if (!publicUrl) {
          console.warn(`⚠️ Skipping ${fileName} (no public URL)`);
          continue;
        }

        try {
          console.log(`🔄 Comparing with ${fileName}`);
          const tempStoredImgPath = await downloadImageToTemp(publicUrl);
          const similarity = await compareImages(userImagePath, tempStoredImgPath);

          console.log(`📊 Similarity with ${medicine.name}: ${similarity.toFixed(2)}%`);

          if (similarity > bestScore) {
            bestScore = similarity;
            bestMatch = {
              barcode: medicine.barcode,
              name: medicine.name,
              similarity: bestScore.toFixed(2),
              isFake: bestScore < 70
            };
          }

          fs.unlinkSync(tempStoredImgPath); // Cleanup
        } catch (e) {
          console.error(`❌ Error comparing with ${medicine.barcode}:`, e);
          continue;
        }
      }

      resolve(bestMatch);
    });
  });
}

module.exports = compareWithDatabase;
