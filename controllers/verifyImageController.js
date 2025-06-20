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

// Fuzzy matching to find medicine name from bucket filenames
const findMedicineNameFromText = async (extractedText) => {
  try {
    // List all files in the medicine-sideimages bucket
    const { data: files, error } = await supabase.storage.from('medicine-sideimages').list();

    if (error) throw error;

    // Extract medicine names from filenames (format: <medicineName>-<side>.<extension>)
    const medicineNames = new Set();
    for (const file of files) {
      const match = file.name.match(/^([^-]+)-/); // Capture medicine name before the first hyphen
      if (match) {
        medicineNames.add(match[1].toLowerCase());
      }
    }

    const text = extractedText.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ');
    const words = text.split(/\s+/).filter(w => w.length > 3);

    for (const word of words) {
      for (const medName of medicineNames) {
        if (word === medName || medName.includes(word) || word.includes(medName)) {
          return medName;
        }
      }
    }

    return null;
  } catch (err) {
    console.error('Medicine name search failed:', err.message);
    return null;
  }
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
  let name = req.body.name?.toLowerCase();

  if (!side) {
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    return res.status(400).json({ error: 'Side is required' });
  }

  if (side !== 'front' && !name) {
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    return res.status(400).json({ error: 'Medicine name is required for left, right, or back side' });
  }

  try {
    let rawText = await ocrFromFile(imagePath);
    if (!rawText || rawText === 'N/A') {
      console.log('Fallback to Tesseract for name extraction');
      rawText = await ocrWithTesseract(imagePath);
    }

    rawText = rawText?.replace(/\r?\n/g, ' ').trim();
    let extractedText = null;

    if (side === 'front') {
      if (rawText && rawText !== 'N/A') {
        name = await findMedicineNameFromText(rawText);
        extractedText = name;
        if (!name) {
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
          return res.status(404).json({
            error: 'No matching medicine name found in extracted text',
            extractedText: rawText
          });
        }
      } else {
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        return res.status(400).json({
          error: 'Failed to extract text for medicine name',
          extractedText: rawText || 'N/A'
        });
      }
    } else {
      // For non-front sides, try to extract medicine name anyway for UI
      extractedText = await findMedicineNameFromText(rawText);
    }

    const reference = await getReferenceImage(name, side);
    if (!reference) {
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      return res.status(404).json({ error: 'Reference image not found' });
    }

    const similarity = await compareImages(imagePath, reference.buffer);
    const isFake = similarity < 70;
    const blurry = await isBlurry(imagePath);

    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    return res.json({
      success: true,
      verdict: isFake ? 'Fake' : 'Authentic',
      blurry,
      similarity: similarity + '%',
      filename: reference.filename,
      extractedText: extractedText || 'N/A',
      medicineName: name,
    });
  } catch (err) {
    console.error('Verification error:', err);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    return res.status(500).json({ error: err.message });
  }
};