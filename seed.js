const path = require('path');
const fs = require('fs');
const connection = require('./config/db'); 

const medicines = [
  {
    barcode: '501735350089',
    name: 'Paracetamol',
    price: 10.5,
    fakeOrReal: 'real',
    mg: '500mg',
    purpose: 'Pain relief',
    additionalInformation: 'Take after food',
  },
  {
    barcode: '5290665007802',
    name: 'Ibuprofen',
    price: 15,
    fakeOrReal: 'real',
    mg: '400mg',
    purpose: 'Anti-inflammatory',
    additionalInformation: 'Do not take on empty stomach',
  },
   {
    "barcode": "9310130846838",
    "name": "Voltaren Emulgel",
    "price": "250.00",
    "fakeOrReal": "real",
    "mg": "1%",
    "purpose": "Anti-inflammatory for muscle and joint pain",
    "additionalInformation": "Apply on affected area. Do not use on broken skin."
  },
  {
    "barcode": "0745125627151",
    "name": "Adol 500mg",
    "price": "90.00",
    "fakeOrReal": "real",
    "mg": "500mg",
    "purpose": "Pain relief and fever reducer",
    "additionalInformation": "Do not exceed 4 doses in 24 hours."
  },
  {
    "barcode": "745760195039",
    "name": "Zyrtec 10mg",
    "price": "180.00",
    "fakeOrReal": "real",
    "mg": "10mg",
    "purpose": "Allergy relief",
    "additionalInformation": "May cause drowsiness. Take once daily."
  },
  {
    "barcode": "300450204431",
    "name": "Nexium 40mg",
    "price": "400.00",
    "fakeOrReal": "real",
    "mg": "40mg",
    "purpose": "Treats acid reflux and stomach ulcers",
    "additionalInformation": "Take before meals. Do not crush or chew tablet."
  },
  {
    "barcode": "00186504031",
    "name": "Lipitor 20mg",
    "price": "350.00",
    "fakeOrReal": "real",
    "mg": "20mg",
    "purpose": "Lowers cholesterol",
    "additionalInformation": "Avoid grapefruit. Monitor liver function regularly."
  },
  {
    "barcode": "00070015623",
    "name": "Glucophage XR 500mg",
    "price": "220.00",
    "fakeOrReal": "real",
    "mg": "500mg",
    "purpose": "Controls blood sugar in type 2 diabetes",
    "additionalInformation": "Take with evening meal. Do not crush tablet."
  },
  {
    "barcode": "0087-6063",
    "name": "Neurobion Forte",
    "price": "150.00",
    "fakeOrReal": "real",
    "mg": "NA",
    "purpose": "Vitamin B complex supplement",
    "additionalInformation": "Take one tablet daily after food."
  },
  {
    "barcode": "014457117174",
    "name": "Desloxan 5mg",
    "price": "190.00",
    "fakeOrReal": "real",
    "mg": "5mg",
    "purpose": "Antihistamine for allergy treatment",
    "additionalInformation": "Non-drowsy formula. Take once daily."
  }
];

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/gi, '').replace(/\s+/g, '');
}

async function seedMedicines() {
  try {
    console.log(' Deleting old data...');
    await new Promise((resolve, reject) => {
      connection.query('DELETE FROM medicines', (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    console.log(' Inserting seed data...');
    for (const med of medicines) {
      const filename = sanitizeFilename(med.name) + '.png';
      const imagePath = path.join(__dirname, './images-db', filename);
      const image = fs.existsSync(imagePath) ? `/images/${filename}` : null;

      const sql = `INSERT INTO medicines 
        (barcode, name, price, fakeOrReal, mg, purpose, additionalInformation, image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      await new Promise((resolve, reject) => {
        connection.query(sql, [
          med.barcode,
          med.name,
          med.price,
          med.fakeOrReal || 'real',
          med.mg,
          med.purpose,
          med.additionalInformation,
          image,
        ], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
    }

    console.log(' Seed data inserted successfully.');
  } catch (err) {
    console.error(' Error inserting seed data:', err);
  } finally {
    process.exit();
  }
}

seedMedicines();