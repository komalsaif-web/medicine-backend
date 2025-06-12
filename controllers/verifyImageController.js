const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const Jimp = require('jimp');
const PNG = require('pngjs').PNG;
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://kzhbzvkfpjftklzcydze.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6aGJ6dmtmcGpmdGtsemN5ZHplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAzODM0MiwiZXhwIjoyMDY0NjE0MzQyfQ.2BkpY_vf1B6KiJ8X1ykQZVaS6qsdHjjHuB0NuRCy5d4'
);

// Helper function to load pixelmatch dynamically
const loadPixelmatch = async () => {
  const { default: pixelmatch } = await import('pixelmatch');
  return pixelmatch;
};

// OCR processing function
const ocrFromFile = async (filePath) => {
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

  return response.data;
};

// Fetch reference image from Supabase
const getReferenceImage = async (name, side) => {
  const extensions = ['jpg', 'jpeg', 'png'];
  for (const ext of extensions) {
    const filename = `${name}-${side}.${ext}`;
    const { data, error } = await supabase.storage.from('medicine-sideimages').download(filename);
    if (data && !error) return { buffer: Buffer.from(await data.arrayBuffer()), filename };
  }
  return null;
};

// Compare user and reference images
const compareImages = async (userPath, refBuffer) => {
  const pixelmatch = await loadPixelmatch(); // Load pixelmatch dynamically
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

// Check if image is blurry
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
  mean = mean / total;

  let variance = 0;
  for (let y = 1; y < image.bitmap.height - 1; y++) {
    for (let x = 1; x < image.bitmap.width - 1; x++) {
      const pixel = image.getPixelColor(x, y);
      const value = Jimp.intToRGBA(pixel).r;
      variance += (value - mean) ** 2;
    }
  }

  variance = variance / total;
  return variance < 100; // Lower variance indicates a blurry image
};

// Main controller function
exports.verifyMedicineImage = async (req, res) => {
  const imagePath = req.file?.path;

  // Handle favicon requests
  if (req.path === '/favicon.ico' || req.path === '/favicon.png') {
    return res.status(404).send('Favicon not found');
  }

  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const side = req.body.side?.toLowerCase();
    const name = req.body.name?.toLowerCase();
    if (!name || !side) return res.status(400).json({ error: 'Medicine name and side are required' });

    const reference = await getReferenceImage(name, side);
    if (!reference) throw new Error('Reference image not found in Supabase');

    const similarity = await compareImages(imagePath, reference.buffer);
    const isFake = similarity < 70;
    const blurry = await isBlurry(imagePath);

    const ocrResult = await ocrFromFile(imagePath);
    const extractedText = ocrResult.ParsedResults?.[0]?.ParsedText || 'N/A';

    // Clean up uploaded file
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    return res.json({
      success: true,
      similarity: `${similarity}%`,
      isFake,
      blurry,
      extractedText,
      referenceImage: reference.filename,
    });
  } catch (err) {
    // Clean up uploaded file on error
    if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    console.error('Error in verifyMedicineImage:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};