const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const JimpImport = require('jimp');
const Jimp = JimpImport.default || JimpImport;
const PNG = require('pngjs').PNG;
const { createClient } = require('@supabase/supabase-js');
const Tesseract = require('tesseract.js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://kzhbzvkfpjftklzcydze.supabase.co',
  process.env.SUPABASE_KEY || 'your_supabase_service_role_key_here'
);

// Dynamically load pixelmatch
const loadPixelmatch = async () => {
  const { default: pixelmatch } = await import('pixelmatch');
  return pixelmatch;
};

// OCR via OCR.Space
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
    console.error('OCR.Space failed:', err.message);
    return null;
  }
};

// OCR fallback using Tesseract
const ocrWithTesseract = async (filePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    return text || 'N/A';
  } catch (err) {
    console.error('Tesseract failed:', err.message);
    return 'N/A';
  }
};

// Retrieve reference image buffer from Supabase by name and side
const getReferenceImage = async (name, side) => {
  const extensions = ['jpg', 'jpeg', 'png'];
  for (const ext of extensions) {
    const filename = `${name}-${side}.${ext}`;
    const { data, error } = await supabase.storage.from('medicine-sideimages').download(filename);
    if (data && !error) {
      return {
        buffer: Buffer.from(await data.arrayBuffer()),
        filename
      };
    }
  }
  return null;
};

// Image similarity using pixelmatch
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
  return ((totalPixels - numDiffPixels) / totalPixels * 100).toFixed(2);
};

// Blur detection
const isBlurry = async (imagePath) => {
  const image = await Jimp.read(imagePath);
  image.resize(300, 300).greyscale();

  let sum = 0, total = 0;
  for (let y = 1; y < image.bitmap.height - 1; y++) {
    for (let x = 1; x < image.bitmap.width - 1; x++) {
      const { r } = Jimp.intToRGBA(image.getPixelColor(x, y));
      sum += r;
      total++;
    }
  }

  const mean = sum / total;
  let variance = 0;

  for (let y = 1; y < image.bitmap.height - 1; y++) {
    for (let x = 1; x < image.bitmap.width - 1; x++) {
      const { r } = Jimp.intToRGBA(image.getPixelColor(x, y));
      variance += (r - mean) ** 2;
    }
  }

  variance /= total;
  return variance < 100;
};

// Controller
exports.verifyMedicineImage = async (req, res) => {
  const imagePath = req.file?.path;

  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  const side = req.body.side?.toLowerCase();
  const name = req.body.name?.toLowerCase();

  if (!name || !side) {
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    return res.status(400).json({ error: 'Both medicine name and side are required' });
  }

  try {
    const reference = await getReferenceImage(name, side);
    if (!reference) {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      return res.status(404).json({ error: 'Reference image not found' });
    }

    const similarity = await compareImages(imagePath, reference.buffer);
    const isFake = similarity < 70;
    const blurry = await isBlurry(imagePath);

    let extractedText = await ocrFromFile(imagePath);
    if (!extractedText || extractedText === 'N/A') {
      console.log('Fallback to Tesseract');
      extractedText = await ocrWithTesseract(imagePath);
    }

    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    return res.json({
      success: true,
      verdict: isFake ? 'Fake' : 'Authentic',
      blurry,
      similarity: similarity + '%',
      filename: reference.filename,  // Only returning filename, not full URL
      extractedText,
    });
  } catch (err) {
    console.error('Verification error:', err);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    return res.status(500).json({ success: false, message: err.message });
  }
};
