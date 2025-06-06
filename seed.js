const pool = require('./config/db');

const medicines = [
  {
    barcode: '5017353500809',
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
    barcode: '9310130846838',
    name: 'Voltaren Emulgel',
    price: 250.00,
    fakeOrReal: 'real',
    mg: '1%',
    purpose: 'Anti-inflammatory for muscle and joint pain',
    additionalInformation: 'Apply on affected area. Do not use on broken skin.',
  },
  {
    barcode: '0745125627151',
    name: 'Adol 500mg',
    price: 90.00,
    fakeOrReal: 'real',
    mg: '500mg',
    purpose: 'Pain relief and fever reducer',
    additionalInformation: 'Do not exceed 4 doses in 24 hours.',
  },
  {
    barcode: '745760195039',
    name: 'Zyrtec 10mg',
    price: 180.00,
    fakeOrReal: 'real',
    mg: '10mg',
    purpose: 'Allergy relief',
    additionalInformation: 'May cause drowsiness. Take once daily.',
  },
  {
    barcode: '300450204431',
    name: 'Nexium 40mg',
    price: 400.00,
    fakeOrReal: 'real',
    mg: '40mg',
    purpose: 'Treats acid reflux and stomach ulcers',
    additionalInformation: 'Take before meals. Do not crush or chew tablet.',
  },
  {
    barcode: '00186504031',
    name: 'Lipitor 20mg',
    price: 350.00,
    fakeOrReal: 'real',
    mg: '20mg',
    purpose: 'Lowers cholesterol',
    additionalInformation: 'Avoid grapefruit. Monitor liver function regularly.',
  },
  {
    barcode: '00070015623',
    name: 'Glucophage XR 500mg',
    price: 220.00,
    fakeOrReal: 'real',
    mg: '500mg',
    purpose: 'Controls blood sugar in type 2 diabetes',
    additionalInformation: 'Take with evening meal. Do not crush tablet.',
  },
  {
    barcode: '0087-6063',
    name: 'Neurobion Forte',
    price: 150.00,
    fakeOrReal: 'real',
    mg: 'NA',
    purpose: 'Vitamin B complex supplement',
    additionalInformation: 'Take one tablet daily after food.',
  },
  {
    barcode: '014457117174',
    name: 'Desloxan 5mg',
    price: 190.00,
    fakeOrReal: 'real',
    mg: '5mg',
    purpose: 'Antihistamine for allergy treatment',
    additionalInformation: 'Non-drowsy formula. Take once daily.',
  }
];

async function seedMedicines() {
  try {
    console.log('🗑️ Deleting existing data from medicines table...');
    await pool.query('DELETE FROM medicines');

    console.log('💾 Inserting new medicines...');

    for (const med of medicines) {
      const sql = `INSERT INTO medicines 
        (barcode, name, price, fakeOrReal, mg, purpose, additionalInformation) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`;

      const values = [
        med.barcode,
        med.name,
        med.price,
        med.fakeOrReal || 'real',
        med.mg,
        med.purpose,
        med.additionalInformation,
      ];

      await pool.query(sql, values);
      console.log('✅ Inserted:', med.name);
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await pool.end();
    process.exit();
  }
}

seedMedicines();
