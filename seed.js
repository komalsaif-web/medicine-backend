const path = require('path');
const fs = require('fs');
const pool = require('./config/db'); 

const medicines = [
  {
  barcode: '041167351017',
  name: 'Xyzal',
  price: 38.50,
  fakeOrReal: 'real',
  mg: '5mg',
  purpose: 'Relief of allergy symptoms such as sneezing, runny nose, itchy eyes, and hives.',
  additionalInformation: 'Commonly used for seasonal and perennial allergies.'
},
{
  barcode: '03582910081043',
  name: 'Rhinathiol Syrup',
  price: 32.00,
  fakeOrReal: 'real',
  mg: '2g/100mL (Adults)',
  purpose: 'Reduces the viscosity of mucus and helps clear airways.',
  additionalInformation: 'Available in different formulations for adults and children.'
},
{
  barcode: '0004080185',
  name: 'TamiFlu',
  price: 185.00,
  fakeOrReal: 'real',
  mg: '75mg',
  purpose: 'Treats and prevents influenza (flu) virus in adults and children.',
  additionalInformation: 'Prescription medication. Should be started within 48 hours of flu symptom onset.'
},
{
  barcode: 'not found',
  name: 'Sinarest Tablets',
  price: 18.00,
  fakeOrReal: 'real',
  mg: 'Paracetamol 500mg, Phenylephrine HCl 10mg, Chlorpheniramine Maleate 2mg, Caffeine 30mg',
  purpose: 'Provides relief from common cold symptoms including headache, fever, body aches, nasal congestion, and sneezing.',
  additionalInformation: 'Multi-symptom cold relief.'
},
{
  barcode: '774016738676',
  name: 'Corizalia',
  price: 143.99,
  fakeOrReal: 'real',
  mg: 'Homeopathic',
  purpose: 'Alleviates cold symptoms like runny nose, sneezing, and nasal congestion.',
  additionalInformation: 'Often used in children for cold relief.'
},
{
  barcode: '300450449054',
  name: 'Tylenol Extra Strength',
  price: 28.00,
  fakeOrReal: 'real',
  mg: '500mg',
  purpose: 'Effective for pain relief (headaches, muscle aches, backache, etc.). Reduces fever.',
  additionalInformation: 'Acetaminophen-based pain reliever.'
},
{
  barcode: '0030573018021',
  name: 'Advil Cold and Sinus',
  price: 15.00,
  fakeOrReal: 'real',
  mg: 'Ibuprofen 200mg, Pseudoephedrine HCl 30mg',
  purpose: 'Temporarily relieves headache, fever, sinus pressure, nasal congestion, minor body aches & pains associated with the common cold or flu.',
  additionalInformation: 'Combines a pain reliever/fever reducer with a decongestant.'
},
{
  barcode: 'not found',
  name: 'Rhinol',
  price: 17.50,
  fakeOrReal: 'real',
  mg: 'Paracetamol 500mg, Pseudoephedrine HCl 30mg',
  purpose: 'Relieves nasal congestion, headache, and fever.',
  additionalInformation: 'Provides relief for common cold symptoms.'
},
{
  barcode: '6008581000130',
  name: 'Mucopect Syrup',
  price: 28.00,
  fakeOrReal: 'real',
  mg: 'Ambroxol Hydrochloride 30mg/5mL',
  purpose: 'Thins and loosens phlegm, making it easier to cough up.',
  additionalInformation: 'A mucolytic agent for productive cough.'
},
{
  barcode: 'not found',
  name: 'Paracetamol Effervescent',
  price: 21.00,
  fakeOrReal: 'real',
  mg: '500mg',
  purpose: 'Fast relief from pain and fever.',
  additionalInformation: 'Dissolves quickly in water.'
},
{
  barcode: '894321000722',
  name: 'Nasaline Irrigation Kit',
  price: 95.00,
  fakeOrReal: 'real',
  mg: 'Sodium Chloride (for preparing solution)',
  purpose: 'Provides a controlled way to irrigate nasal passages to clear congestion, allergens, and irritants.',
  additionalInformation: 'Reusable system for nasal rinsing.'
},
{
  barcode: '6001137101589',
  name: 'Salinase Nasal Drops',
  price: 19.00,
  fakeOrReal: 'real',
  mg: '0.65% Sodium Chloride',
  purpose: 'Moisturizes dry nasal passages and helps loosen mucus.',
  additionalInformation: 'Gentle enough for infants and young children.'
},
{
  barcode: '9351791000900',
  name: 'Bisolvon Syrup',
  price: 33.00,
  fakeOrReal: 'real',
  mg: 'Bromhexine Hydrochloride 8mg/5mL',
  purpose: 'Helps to loosen and thin mucus in the respiratory tract, making it easier to cough up.',
  additionalInformation: 'Used for productive coughs.'
},
{
  barcode: '4660153652271',
  name: 'Ambroxol Tablets',
  price: 15.00,
  fakeOrReal: 'real',
  mg: '30mg',
  purpose: 'Facilitates the removal of phlegm and eases cough.',
  additionalInformation: 'A mucolytic often used for various respiratory conditions with thick mucus.'
},
{
  barcode: '404884600008',
  name: 'Mucosolvan Syrup',
  price: 41.50,
  fakeOrReal: 'real',
  mg: 'Ambroxol Hydrochloride 30mg/5mL',
  purpose: 'Loosens phlegm, clears airways, and protects against new mucus.',
  additionalInformation: 'A well-known mucolytic for wet cough.'
},
{
  barcode: '8717056280448',
  name: 'Fluimucil',
  price: 16.00,
  fakeOrReal: 'real',
  mg: '600mg (N-acetylcysteine)',
  purpose: 'Breaks down thick and sticky mucus, aiding its removal from the respiratory tract.',
  additionalInformation: 'Often in effervescent tablet form for dissolving in water.'
},
{
  barcode: '6005894000352',
  name: 'ACC Effervescent',
  price: 22.00,
  fakeOrReal: 'real',
  mg: '200mg (N-acetylcysteine)',
  purpose: 'Liquefies viscous mucus in the respiratory tract, facilitating expectoration.',
  additionalInformation: 'Used for productive cough with thick mucus.'
},
{
  barcode: 'not found',
  name: 'Rhinathiol Carbocisteine',
  price: 35.00,
  fakeOrReal: 'real',
  mg: 'Carbocisteine 5g/100mL',
  purpose: 'Reduces the viscosity of phlegm and facilitates its expectoration.',
  additionalInformation: 'Mucoregulator for respiratory disorders.'
},
{
  barcode: 'not found',
  name: 'Hexoral Spray',
  price: 42.00,
  fakeOrReal: 'real',
  mg: 'Hexetidine 0.2%',
  purpose: 'Antiseptic for the mouth and throat, helps to relieve sore throat and mild oral infections.',
  additionalInformation: 'Topical antiseptic spray.'
},
{
  barcode: '9300655122548',
  name: 'Betadine Gargle',
  price: 50.50,
  fakeOrReal: 'real',
  mg: 'Povidone-Iodine 1%',
  purpose: 'Antiseptic mouthwash and gargle for the treatment of acute infections of the mouth and throat.',
  additionalInformation: 'Kills a wide range of germs including bacteria, viruses, and fungi.'
},
{
  barcode: 'not found',
  name: 'ColdFree',
  price: 40.00,
  fakeOrReal: 'real',
  mg: 'Varies (natural blend)',
  purpose: 'Aids in cold relief and immunity strengthening. Reduces severity of common cold symptoms.',
  additionalInformation: 'Often a natural or herbal cold remedy.'
},
{
  barcode: 'not found',
  name: 'GripGuard',
  price: 28.00,
  fakeOrReal: 'real',
  mg: 'Paracetamol 500mg, Phenylephrine HCl 10mg',
  purpose: 'Relieves fever, headache, and nasal congestion associated with colds and flu.',
  additionalInformation: 'Common cold and flu symptom relief.'
},
{
  barcode: '300430630132',
  name: 'Theraflu',
  price: 38.00,
  fakeOrReal: 'real',
  mg: 'Paracetamol 650mg, Phenylephrine HCl 10mg, Pheniramine Maleate 20mg',
  purpose: 'Provides powerful relief from severe cold and flu symptoms including headache, body ache, sore throat, nasal congestion, and cough.',
  additionalInformation: 'Often available in hot liquid powder form for soothing relief.'
},
{
  barcode: 'not found',
  name: 'Rhinex Tablets',
  price: 18.00,
  fakeOrReal: 'real',
  mg: 'Paracetamol 500mg, Pseudoephedrine HCl 30mg',
  purpose: 'Relieves nasal congestion, headache, and fever associated with colds.',
  additionalInformation: 'Common cold remedy.'
},
{
  barcode: '9556061300010',
  name: 'Dequadin Lozenges',
  price: 25.00,
  fakeOrReal: 'real',
  mg: 'Dequalinium Chloride 0.25mg',
  purpose: 'For relief of sore throat and mouth infections.',
  additionalInformation: 'Antiseptic lozenges that work directly in the area of infection.'
},
{
  barcode: 'not found',
  name: 'Tylenol Cold',
  price: 30.00,
  fakeOrReal: 'real',
  mg: 'Paracetamol 325mg, Phenylephrine HCl 5mg, Dextromethorphan HBr 10mg',
  purpose: 'Relieves cold symptoms including headache, fever, sore throat, nasal congestion, and cough.',
  additionalInformation: 'Multi-symptom cold relief from the Tylenol brand.'
},
{
  barcode: '5013444000017',
  name: 'NeoMercazole',
  price: 60.00,
  fakeOrReal: 'real',
  mg: 'Carbimazole 5mg or 10mg',
  purpose: 'Used to treat hyperthyroidism (overactive thyroid gland).',
  additionalInformation: 'Prescription medication.'
},
{
  barcode: '8901148000578',
  name: 'Coriminic Drops',
  price: 20.00,
  fakeOrReal: 'real',
  mg: 'Phenylephrine HCl 2.5mg/mL, Chlorpheniramine Maleate 1mg/mL',
  purpose: 'Provides relief from cold symptoms like runny nose, sneezing, and nasal congestion in infants and young children.',
  additionalInformation: 'Pediatric cold drops.'
},
{
  barcode: '8901004000002',
  name: 'Allercet',
  price: 28.00,
  fakeOrReal: 'real',
  mg: 'Cetirizine 10mg',
  purpose: 'Relieves symptoms of allergic rhinitis (hay fever) and chronic urticaria (hives).',
  additionalInformation: 'A commonly used antihistamine.'
},
{
  barcode: '8901004000305',
  name: 'Sinarest Junior',
  price: 25.00,
  fakeOrReal: 'real',
  mg: 'Paracetamol 125mg/5mL, Phenylephrine HCl 2.5mg/5mL, Chlorpheniramine Maleate 0.5mg/5mL',
  purpose: 'Provides relief from cold symptoms for younger children, including fever, body ache, and nasal congestion.',
  additionalInformation: 'Specifically formulated for pediatric use.'
},
{
  barcode: '9300631018261',
  name: 'Disprin Direct',
  price: 15.00,
  fakeOrReal: 'real',
  mg: 'Aspirin 300mg',
  purpose: 'Fast relief from headaches, mild to moderate pain, and fever.',
  additionalInformation: 'Dissolvable or chewable aspirin for quick action.'
},
{
  barcode: 'not found',
  name: 'Viroflu Tablets',
  price: 32.00,
  fakeOrReal: 'real',
  mg: 'Paracetamol 500mg, Pseudoephedrine HCl 30mg, Cetirizine 5mg',
  purpose: 'Relieves symptoms of cold and flu, including fever, body aches, nasal congestion, and allergy symptoms.',
  additionalInformation: 'A broad‑spectrum cold and flu medication.'
},
{
  barcode: '4013054000306',
  name: 'Arinac Tablets',
  price: 25.00,
  fakeOrReal: 'real',
  mg: 'Ibuprofen 200mg, Pseudoephedrine HCl 30mg',
  purpose: 'Relief of pain, fever, and nasal congestion associated with colds and flu.',
  additionalInformation: 'Combines an NSAID with a decongestant.'
},
{
  barcode: 'not found',
  name: 'Zinaderm Cream',
  price: 45.00,
  fakeOrReal: 'real',
  mg: 'Zinc Oxide (typically 10%+)',
  purpose: 'Soothes and protects irritated skin. Used for diaper rash, minor skin irritations, and chafing.',
  additionalInformation: 'Barrier cream for skin protection.'
},
{
  barcode: '8901234567901',
  name: 'Flutop Capsules',
  price: 12.00,
  fakeOrReal: 'real',
  mg: 'Paracetamol 500mg, Phenylephrine 5mg, Dextromethorphan 10mg, Guaifenesin 200mg',
  purpose: 'Provides relief from a wide range of cold and flu symptoms including cough, congestion, fever, and body aches.',
  additionalInformation: 'An all-in-one cold and flu medication.'
},
{
  barcode: '8901234567902',
  name: 'Tylenol Cold Max',
  price: 45.00,
  fakeOrReal: 'real',
  mg: 'Acetaminophen 500mg, Phenylephrine 10mg, Dextromethorphan 20mg, Guaifenesin 200mg',
  purpose: 'Maximum strength relief for severe cold and flu symptoms. Targets pain, fever, cough, and congestion.',
  additionalInformation: 'Offers comprehensive relief for strong cold symptoms.'
},
{
  barcode: '8901234567903',
  name: 'Phenergan',
  price: 28.00,
  fakeOrReal: 'real',
  mg: 'Promethazine 5mg/5ml',
  purpose: 'Antihistamine used to relieve allergy symptoms. Can also be used as a sedative and for nausea.',
  additionalInformation: 'Known to cause drowsiness.'
},
{
  barcode: '8901234567904',
  name: 'Ambrodil Syrup',
  price: 10.00,
  fakeOrReal: 'real',
  mg: 'Ambroxol 30mg/5ml',
  purpose: 'Mucolytic, helps to thin and clear mucus. Used for productive cough associated with respiratory conditions.',
  additionalInformation: 'A common expectorant, similar to Mucosolvan.'
},
{
  barcode: '8712172401234',
  name: 'Arcoxia',
  price: 120.00,
  fakeOrReal: 'real',
  mg: 'Etoricoxib 90mg',
  purpose: 'Relief of pain and inflammation in osteoarthritis, rheumatoid arthritis, and other musculoskeletal conditions.',
  additionalInformation: 'NSAID (Non-Steroidal Anti-Inflammatory Drug)'
},
{
  barcode: '8901574100015',
  name: 'Enapril',
  price: 25.00,
  fakeOrReal: 'real',
  mg: 'Enalapril Maleate 5mg',
  purpose: 'Treatment of high blood pressure (hypertension) and heart failure.',
  additionalInformation: 'ACE inhibitor. Requires prescription.'
},
{
  barcode: '5000477001230',
  name: 'Avamys Nasal Spray',
  price: 80.00,
  fakeOrReal: 'real',
  mg: 'Fluticasone Furoate 27.5mcg/spray',
  purpose: 'Treatment of seasonal and perennial allergic rhinitis symptoms (sneezing, runny nose, itchy nose, nasal congestion).',
  additionalInformation: 'Corticosteroid nasal spray'
},
{
  barcode: '0404693821011',
  name: 'Xarelto',
  price: 150.00,
  fakeOrReal: 'real',
  mg: 'Rivaroxaban 10mg',
  purpose: 'Prevention and treatment of blood clots (e.g., DVT, pulmonary embolism).',
  additionalInformation: 'Anticoagulant. Requires prescription.'
},
{
  barcode: '5014602801237',
  name: 'Emla Cream',
  price: 50.00,
  fakeOrReal: 'real',
  mg: 'Lidocaine 2.5%, Prilocaine 2.5%',
  purpose: 'Topical anesthetic for numbing skin before procedures (e.g., injections, minor surgeries).',
  additionalInformation: 'Apply under occlusive dressing for effect.'
},
{
  barcode: '8032542060015',
  name: 'Rhinoclenil Nasal Spray',
  price: 60.00,
  fakeOrReal: 'real',
  mg: 'Beclomethasone Dipropionate 100mcg/spray',
  purpose: 'Treatment of allergic rhinitis and nasal polyps.',
  additionalInformation: 'Corticosteroid nasal spray'
},
{
  barcode: '8906042102235',
  name: 'Esitalopram',
  price: 70.00,
  fakeOrReal: 'real',
  mg: 'Escitalopram 10mg',
  purpose: 'Treatment of depression and anxiety disorders.',
  additionalInformation: 'SSRI antidepressant. Requires prescription.'
},
{
  barcode: '5000456178903',
  name: 'Nasofan Nasal Spray',
  price: 75.00,
  fakeOrReal: 'real',
  mg: 'Fluticasone Propionate 50mcg/spray',
  purpose: 'Prevention and treatment of allergic rhinitis symptoms.',
  additionalInformation: 'Corticosteroid nasal spray'
},
{
  barcode: '0000212401222',
  name: 'Emgality Injection',
  price: 2500.00,
  fakeOrReal: 'real',
  mg: 'Galcanezumab 120mg/ml (pre-filled syringe)',
  purpose: 'Prevention of migraine headaches in adults.',
  additionalInformation: 'CGRP inhibitor. Requires prescription.'
},
{
  barcode: '0026123098765',
  name: 'Revlimid',
  price: 20000.00,
  fakeOrReal: 'real',
  mg: 'Lenalidomide 10mg',
  purpose: 'Treatment of multiple myeloma and myelodysplastic syndromes.',
  additionalInformation: 'Immunomodulatory drug. Highly specialized. Requires prescription.'
},
{
  barcode: '8999988110013',
  name: 'Relpax',
  price: 180.00,
  fakeOrReal: 'real',
  mg: 'Eletriptan 40mg',
  purpose: 'Acute treatment of migraine headaches.',
  additionalInformation: 'Triptan. Requires prescription.'
},
{
  barcode: '8999988110020',
  name: 'Micardis',
  price: 110.00,
  fakeOrReal: 'real',
  mg: 'Telmisartan 80mg',
  purpose: 'Treatment of high blood pressure (hypertension).',
  additionalInformation: 'ARB (Angiotensin Receptor Blocker). Requires prescription.'
},
{
  barcode: '8999988110037',
  name: 'Uralyt U',
  price: 90.00,
  fakeOrReal: 'real',
  mg: 'Potassium Sodium Hydrogen Citrate 2.4g per sachet',
  purpose: 'Prevention and treatment of kidney stones (urinary calculi) by alkalinizing urine.',
  additionalInformation: 'Granules for oral solution.'
},
{
  barcode: '8999988110044',
  name: 'Olmetec',
  price: 80.00,
  fakeOrReal: 'real',
  mg: 'Olmesartan Medoxomil 20mg',
  purpose: 'Treatment of high blood pressure (hypertension).',
  additionalInformation: 'ARB (Angiotensin Receptor Blocker). Requires prescription.'
},
{
  barcode: '8999988110051',
  name: 'Vesicare',
  price: 150.00,
  fakeOrReal: 'real',
  mg: 'Solifenacin Succinate 5mg',
  purpose: 'Treatment of symptoms of overactive bladder.',
  additionalInformation: 'Antimuscarinic. Requires prescription.'
},
{
  barcode: '8999988110068',
  name: 'Entocort EC',
  price: 300.00,
  fakeOrReal: 'real',
  mg: 'Budesonide 3mg (Extended Release Capsule)',
  purpose: "Treatment of Crohn's disease affecting the ileum and/or ascending colon.",
  additionalInformation: 'Corticosteroid. Requires prescription.'
},
{
  barcode: '8999988110075',
  name: 'Alfuzosin',
  price: 70.00,
  fakeOrReal: 'real',
  mg: 'Alfuzosin Hydrochloride 10mg (Extended Release)',
  purpose: 'Treatment of symptoms of benign prostatic hyperplasia (BPH).',
  additionalInformation: 'Alpha-blocker. Requires prescription.'
},
{
  barcode: '8999988110082',
  name: 'Propecia',
  price: 250.00,
  fakeOrReal: 'real',
  mg: 'Finasteride 1mg',
  purpose: 'Treatment of male pattern hair loss (androgenetic alopecia).',
  additionalInformation: '5-alpha-reductase inhibitor. Requires prescription.'
},
{
  barcode: '8999988110099',
  name: 'Azopt Eye Drops',
  price: 90.00,
  fakeOrReal: 'real',
  mg: 'Brinzolamide 1%',
  purpose: 'Treatment of elevated intraocular pressure in open-angle glaucoma or ocular hypertension.',
  additionalInformation: 'Carbonic anhydrase inhibitor. Requires prescription.'
},
{
  barcode: '8999988110105',
  name: 'Nasonex Nasal Spray',
  price: 95.00,
  fakeOrReal: 'real',
  mg: 'Mometasone Furoate 50mcg/spray',
  purpose: 'Treatment of allergic rhinitis and nasal polyps.',
  additionalInformation: 'Corticosteroid nasal spray.'
},
];
async function seedMedicines() {
  try {
    console.log('💾 Inserting new medicines (existing data will remain)...');

    for (const med of medicines) {
      const sql = `
        INSERT INTO medicines 
          (barcode, name, price, fakeOrReal, mg, purpose, additionalInformation) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (barcode) DO NOTHING
      `;

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
      console.log('✅ Inserted (or skipped if exists):', med.name);
    }

    console.log('🎉 Seeding completed without deleting existing data!');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await pool.end();
    process.exit();
  }
}

seedMedicines();
