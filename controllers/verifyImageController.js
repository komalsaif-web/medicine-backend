const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const JimpImport = require('jimp'); // Fix for newer Jimp versions
const Jimp = JimpImport.default || JimpImport;
const PNG = require('pngjs').PNG;
const { createClient } = require('@supabase/supabase-js');
const Tesseract = require('tesseract.js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://kzhbzvkfpjftklzcydze.supabase.co',
  process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aGJ6dmtmcGpmdGtsemN5ZHplIiwicm9sZSI6InNlcnZpY6Vfcm9sZSIsImlhdCI6MTc0OTAzODM0MiwiZXhwIjoyMDY0NjE0MzQyfQ.2BkpY_vf1B6KiJ8X1ykQZVaS6qsdHjjHuB0NuRCy5d4'
);

// Load pixelmatch dynamically
const loadPixelmatch = async () => {
  const { default: pixelmatch } = await import('pixelmatch');
  return pixelmatch;
};

// Primary OCR using ocr.space
const ocrFromFile = async (filePath) => {
  try {
    const formData = new FormData();
    formData.append('apikey', 'K84923390588957');
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('file', fs.createReadStream(filePath));

    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response.data.ParsedResults?.[0]?.ParsedText || 'N/A';
  } catch (err) {
    console.error('ocr.space failed:', err.message);
    return null;
  }
};

// Fallback OCR using Tesseract.js
const ocrWithTesseract = async (filePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: (m) => console.log('Tesseract:', m),
    });
    return text || 'N/A';
  } catch (err) {
    console.error('Tesseract OCR failed:', err.message);
    return 'N/A';
  }
};

// Download reference image from Supabase
const getReferenceImage = async (name, side) => {
  const extensions = ['jpg', 'jpeg', 'png'];
  for (const ext of extensions) {
    const filename = `${name}-${side}.${ext}`;
    const { data, error } = await supabase.storage.from('medicine-sideimages').download(filename);
    if (data && !error) return { buffer: Buffer.from(await data.arrayBuffer()), filename };
  }
  return null;
};

// Compare images using pixelmatch
const compareImages = async (userPath, refBuffer) => {
  const pixelmatch = await loadPixelmatch();
  const userImage = await Jimp.read(userPath);
  const refImage = await Jimp.read(refBuffer);

  userImage.resize(300, 300);
  refImage.resize(300, 300);

  const userPNG = PNG.sync.read(await userImage.getBufferAsync(Jimp.MIME_PNG));
  const refPNG = PNG.sync.read(await refImage.getBufferAsync(Jimp.MIME_PNG));

  const { width, height } = userPNG;
  const diff = new PNG({ width, height });

  const numDiffPixels = pixelmatch(userPNG.data, refPNG.data, diff.data, width, height, { threshold: 0.1 });
  const totalPixels = width * height;
  const similarity = ((totalPixels - numDiffPixels) / totalPixels) * 100;

  return similarity.toFixed(2);
};

// Check blur by pixel variance
const isBlurry = async (imagePath) => {
  const image = await Jimp.read(imagePath);
  image.resize(300, 300).greyscale();

  let mean = 0;
  let total = 0;

  for (let y = 1; y < image.bitmap.height - 1; y++) {
    for (let x = 1; x < image.bitmap.width - 1; x++) {
      const pixel = image.getPixelColor(x, y);
      const value = Jimp.intToRGBA(pixel).r;
      mean += value;
      total++;
    }
  }

  mean /= total;

  let variance = 0;
  for (let y = 1; y < image.bitmap.height - 1; y++) {
    for (let x = 1; x < image.bitmap.width - 1; x++) {
      const pixel = image.getPixelColor(x, y);
      const value = Jimp.intToRGBA(pixel).r;
      variance += (value - mean) ** 2;
    }
  }

  variance /= total;
  return variance < 100;
};

// Main controller
exports.verifyMedicineImage = async (req, res) => {
  const imagePath = req.file?.path;

  if (req.path === '/favicon.ico' || req.path === '/favicon.png') {
    return res.status(404).send('Favicon not found');
  }

  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const side = req.body.side?.toLowerCase();
    const name = req.body.name?.toLowerCase();
    if (!name || !side) return res.status(400).json({ error: 'Medicine name and side are required' });

    const reference = await getReferenceImage(name, side);
    if (!reference) return res.status(404).json({ error: 'Reference image not found' });

    const similarity = await compareImages(imagePath, reference.buffer);
    const isFake = similarity < 70;
    const blurry = await isBlurry(imagePath);

    // Try primary OCR, fall back to Tesseract
    let extractedText = await ocrFromFile(imagePath);
    if (extractedText === null) {
      console.log('Falling back to Tesseract OCR');
      extractedText = await ocrWithTesseract(imagePath);
    }
    console.log(`OCR Result: ${extractedText}`);

    // Clean up uploaded file
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    return res.json({
      success: true,
      verdict: isFake ? 'Fake' : 'Authentic',
      blurry,
      referenceImageUrl: `https://kzhbzvkfpjftklzcydze.supabase.co/storage/v1/object/public/medicine-sideimages/${reference.filename}`
    });
  } catch (err) {
    if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    console.error('Error in verifyMedicineImage:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};