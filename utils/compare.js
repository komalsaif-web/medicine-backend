const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const connection = require('../config/db');

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

async function compareImages(img1Path, img2Path) {
    const img1 = await loadPNG(img1Path);
    const img2 = await loadPNG(img2Path);

    if (img1.width !== img2.width || img1.height !== img2.height) {
        return 0;  // Different sizes, can't compare properly
    }

    const diff = new PNG({width: img1.width, height: img1.height});
    const diffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, {threshold: 0.1});
    
    const totalPixels = img1.width * img1.height;
    const similarity = ((totalPixels - diffPixels) / totalPixels) * 100;  // % similarity

    return similarity;
}

async function compareWithDatabase(userImagePath) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM medicines', async (err, rows) => {
            if (err) return reject(err);

            let bestMatch = null;
            let bestScore = 0;

            for (let medicine of rows) {
                // Your stored images must be PNG in `images-db` folder named as barcode.png
                const storedImgPath = path.join(__dirname, '..', 'images-db', `${medicine.barcode}.png`);

                if (!fs.existsSync(storedImgPath)) continue;

                try {
                    const similarity = await compareImages(userImagePath, storedImgPath);
                    if (similarity > bestScore) {
                        bestScore = similarity;
                        bestMatch = {
                            barcode: medicine.barcode,
                            name: medicine.name,
                            similarity: bestScore.toFixed(2),
                            isFake: bestScore < 70
                        };
                    }
                } catch (e) {
                    console.error(`Error comparing images for ${medicine.barcode}:`, e);
                    continue;
                }
            }

            resolve(bestMatch);
        });
    });
}
module.exports = compareWithDatabase;
