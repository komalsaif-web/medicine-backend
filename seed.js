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
    barcode: '771313250009',
    name: 'Apo-Gabapentin',
    price: 70,
    fakeOrReal: 'real',
    mg: '300',
    purpose: 'Treatment of neuropathic pain and as an adjunctive therapy for partial seizures.',
    additionalInformation: 'Contains Gabapentin. Prescription required. Potency refers to mg per capsule/tablet.'
  },
  {
    barcode: '7898029550148',
    name: 'Arcalion',
    price: 80,
    fakeOrReal: 'real',
    mg: '200',
    purpose: 'To alleviate symptoms of asthenia (physical and mental fatigue), often associated with depression or recovery from illness.',
    additionalInformation: 'Contains Sulbutiamine, a derivative of Thiamine (Vitamin B1). Potency refers to mg per tablet.'
  },
  {
    barcode: '4030571004493',
    name: 'Artelac Splash',
    price: 55,
    fakeOrReal: 'real',
    mg: '0.24',
    purpose: 'Lubricating eye drops for immediate and long-lasting relief from dry eyes.',
    additionalInformation: 'Contains Hyaluronic acid. Potency refers to percentage.'
  },
  {
    barcode: '3282770204667',
    name: 'Avene Cicalfate',
    price: 85,
    fakeOrReal: 'real',
    mg: '40ml',
    purpose: 'To soothe, purify, and promote recovery of irritated and damaged skin.',
    additionalInformation: 'A restorative cream/lotion containing Copper Sulfate, Zinc Sulfate, and Avène Thermal Spring Water. Potency varies for components, not typically expressed in mg.'
  },
  {
    barcode: '3401542327308',
    name: 'Babyfen',
    price: 30,
    fakeOrReal: 'real',
    mg: '20ml',
    purpose: 'To relieve symptoms of colic, gas, and abdominal discomfort in infants.',
    additionalInformation: 'Often contains natural extracts like Fennel, Chamomile, or Dill oil. Potency is not typically expressed in mg.'
  },
  {
    barcode: '54868-4325-0',
    name: 'Bactroban Nasal',
    price: 80,
    fakeOrReal: 'real',
    mg: '2',
    purpose: 'To eliminate nasal carriage of Staphylococcus aureus (including MRSA) to reduce the risk of infection.',
    additionalInformation: 'Contains Mupirocin, an antibiotic. Applied intranasally. Potency refers to percentage.'
  },
  {
    barcode: '501261626212',
    name: 'Becodefence',
    price: 60,
    fakeOrReal: 'real',
    mg: '120 sprays',
    purpose: 'To reduce allergic reactions and symptoms of hay fever by forming a protective barrier against allergens.',
    additionalInformation: 'A nasal spray that often contains cellulose powder or other barrier-forming agents. It\'s a medical device, not a drug with mg potency.'
  },
  {
    barcode: '4008500109380',
    name: 'Bepanthen Derma',
    price: 45,
    fakeOrReal: 'real',
    mg: '5',
    purpose: 'To soothe, protect, and regenerate dry, irritated, or sensitive skin.',
    additionalInformation: 'Contains Dexpanthenol (Pro-Vitamin B5). Available as cream or lotion. Potency refers to percentage.'
  },
  {
    barcode: 'C28H37N3O3',
    name: 'Bilastine',
    price: 60,
    fakeOrReal: 'real',
    mg: '20',
    purpose: 'To relieve symptoms of allergic rhinitis (hay fever) and urticaria (hives).',
    additionalInformation: 'A non-drowsy antihistamine. Prescription required. Potency refers to mg per tablet.'
  },
  {
    barcode: '6001159111368',
    name: 'Bio-Oil',
    price: 65,
    fakeOrReal: 'real',
    mg: '125ml',
    purpose: 'To improve the appearance of scars, stretch marks, and uneven skin tone.',
    additionalInformation: 'A skincare oil. Potency is not applicable in mg; usually sold by volume (e.g., 60ml, 125ml).'
  },
  {
    barcode: '602359460155',
    name: 'BioGaia Protectis Drops',
    price: 110,
    fakeOrReal: 'real',
    mg: '10ml',
    purpose: 'Probiotic drops to support gut health and alleviate colic in infants.',
    additionalInformation: 'Contains Lactobacillus reuteri DSM 17938. Potency is measured in CFUs (Colony Forming Units) per dose, not mg.'
  },
  {
    barcode: '615750834354',
    name: 'Biovital',
    price: 50,
    fakeOrReal: 'real',
    mg: '1000ml',
    purpose: 'Multivitamin and mineral supplement to support overall vitality, reduce fatigue, and boost immunity.',
    additionalInformation: 'Often available as a tonic or capsules; specific composition varies. Potency not typically expressed in mg.'
  },
  {
    barcode: '3662042001987',
    name: 'Blephagel',
    price: 90,
    fakeOrReal: 'real',
    mg: '20 wipes',
    purpose: 'For daily hygiene of eyelids and eyelashes, especially for sensitive skin prone to blepharitis.',
    additionalInformation: 'A sterile gel. Potency is not applicable in mg; usually sold by volume (e.g., 30g).'
  },
  {
    barcode: '8713184182555',
    name: 'Bravecto',
    price: 200,
    fakeOrReal: 'real',
    mg: '250',
    purpose: 'Veterinary medicine for the treatment of flea and tick infestations in dogs and cats.',
    additionalInformation: 'Contains Fluralaner. Dosage (mg) varies significantly by animal weight. Price given is approximate for a common single dose. Prescription required.'
  },
  {
    barcode: '6001605004848',
    name: 'Caltrate Plus',
    price: 60,
    fakeOrReal: 'real',
    mg: '600',
    purpose: 'Calcium and Vitamin D supplement, with additional minerals, for strong bones and joint health.',
    additionalInformation: 'Contains Calcium Carbonate and Vitamin D3, plus minerals like Magnesium, Zinc, Copper, Manganese. Potency refers to elemental calcium mg per tablet.'
  },
  {
    barcode: '5010605990264',
    name: 'Canesten Cream',
    price: 30,
    fakeOrReal: 'real',
    mg: '1',
    purpose: 'Treatment of fungal skin infections like athlete\'s foot, ringworm, and yeast infections.',
    additionalInformation: 'Contains Clotrimazole. Potency refers to percentage.'
  },
  {
    barcode: '7612917711100',
    name: 'Carmol',
    price: 45,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Herbal-based liquid for relief of muscle and joint pain, headache, and cold symptoms.',
    additionalInformation: 'Contains various essential oils like menthol, camphor, and eucalyptus. Potency is not expressed in mg; usually sold by volume (e.g., 80ml).'
  },
  {
    barcode: '5011091007293',
    name: 'Ciproxin',
    price: 70,
    fakeOrReal: 'real',
    mg: '500',
    purpose: 'To treat a wide range of bacterial infections, including urinary tract infections, respiratory infections, and skin infections.',
    additionalInformation: 'Contains Ciprofloxacin, a fluoroquinolone antibiotic. Prescription required. Potency refers to mg per tablet.'
  },
  {
    barcode: '4084500755919',
    name: 'Clearblue Pregnancy Test',
    price: 60,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'To detect pregnancy by measuring the presence of the hCG hormone in urine.',
    additionalInformation: 'A diagnostic device, not a medicine. Not applicable for mg potency.'
  },
  {
    barcode: '8000036000000',
    name: 'Clenil Modulite',
    price: 150,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'To manage and prevent symptoms of asthma and chronic obstructive pulmonary disease (COPD).',
    additionalInformation: 'Contains Beclometasone Dipropionate, an inhaled corticosteroid. Potency is measured in micrograms (mcg) per actuation, not mg.'
  },
  {
    barcode: '3665517000109',
    name: 'Clexane',
    price: 250,
    fakeOrReal: 'real',
    mg: '40',
    purpose: 'Prevention and treatment of blood clots (deep vein thrombosis and pulmonary embolism).',
    additionalInformation: 'Contains Enoxaparin Sodium, a low molecular weight heparin. Administered via subcutaneous injection. Prescription required. Potency refers to mg per pre-filled syringe.'
  },
  {
    barcode: '9403338000571',
    name: 'Maxigesic PE Cold Flu',
    price: 35,
    fakeOrReal: 'real',
    mg: '500/5',
    purpose: 'For the relief of cold and flu symptoms including headache, fever, body aches, and nasal congestion.',
    additionalInformation: 'Contains Paracetamol (Acetaminophen) and Phenylephrine. Potency refers to Paracetamol/Phenylephrine mg per tablet.'
  },
  {
    barcode: '8718951234567',
    name: 'Colgate Duraphat',
    price: 50,
    fakeOrReal: 'real',
    mg: '5000',
    purpose: 'High-fluoride toothpaste for the prevention of dental caries (tooth decay), especially for those at high risk.',
    additionalInformation: 'Contains Sodium Fluoride. Potency refers to ppm (parts per million) of fluoride. Prescription may be required in some regions.'
  },
  {
    barcode: '9421023600104',
    name: 'Comvita Manuka Honey',
    price: 180,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Dietary supplement for general wellness, digestive health, and topical use for minor wounds.',
    additionalInformation: 'A specific type of honey from New Zealand. Potency is measured by UMF (Unique Manuka Factor) or MGO (Methylglyoxal) ratings, not mg. Price varies significantly by rating and size.'
  },
  {
    barcode: '3606000537482',
    name: 'CeraVe Hydrocortisone Anti-Itch Cream',
    price: 60,
    fakeOrReal: 'real',
    mg: '1',
    purpose: 'To temporarily relieve itching associated with minor skin irritations, inflammation, and rashes.',
    additionalInformation: 'Contains Hydrocortisone, a corticosteroid. Potency refers to percentage.'
  },
  {
    barcode: '3594451000049',
    name: 'Daflon',
    price: 90,
    fakeOrReal: 'real',
    mg: '500',
    purpose: 'To treat symptoms related to chronic venous insufficiency (e.g., heavy legs, pain, nocturnal cramps) and acute hemorrhoidal attacks.',
    additionalInformation: 'Contains Diosmin and Hesperidin (micronized purified flavonoid fraction). Potency refers to total flavonoids mg per tablet.'
  },
  {
    barcode: '5400951600010',
    name: 'Daktarin Powder',
    price: 25,
    fakeOrReal: 'real',
    mg: '2',
    purpose: 'To treat fungal skin infections like athlete\'s foot and jock itch, and to prevent recurrence.',
    additionalInformation: 'Contains Miconazole Nitrate. Potency refers to percentage.'
  },
  {
    barcode: '4008500130636',
    name: 'DulcoSoft Duo',
    price: 60,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'To provide relief from occasional constipation and to soften hard stools.',
    additionalInformation: 'Contains Macrogol (Polyethylene Glycol) for stool softening and a bowel stimulant (often Bisacodyl). Potency varies for each component.'
  },
  {
    barcode: '5350020106200',
    name: 'Dymista',
    price: 130,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'For the relief of symptoms of seasonal and perennial allergic rhinitis, including nasal congestion, sneezing, and runny nose.',
    additionalInformation: 'Nasal spray containing Azelastine Hydrochloride (antihistamine) and Fluticasone Propionate (corticosteroid). Potency is measured in micrograms (mcg) per spray for each component.'
  },
  {
    barcode: '6432100084318',
    name: 'Easyhaler Budesonide',
    price: 180,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'For the maintenance treatment of asthma and chronic obstructive pulmonary disease (COPD).',
    additionalInformation: 'Dry powder inhaler containing Budesonide, an inhaled corticosteroid. Potency is measured in micrograms (mcg) per actuation, not mg.'
  },
  {
    barcode: '072140026720',
    name: 'Eucerin Eczema Relief Cream',
    price: 75,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'To relieve dry, itchy, and irritated skin due to eczema and to provide long-lasting moisture.',
    additionalInformation: 'Often contains Colloidal Oatmeal. Potency is not applicable in mg for this type of cream.'
  },
  {
    barcode: '8435133600000',
    name: 'Eklira Genuair',
    price: 220,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'For the maintenance bronchodilator treatment to relieve symptoms in adult patients with chronic obstructive pulmonary disease (COPD).',
    additionalInformation: 'Dry powder inhaler containing Aclidinium Bromide, a long-acting muscarinic antagonist (LAMA). Potency is measured in micrograms (mcg) per actuation, not mg.'
  },
  {
    barcode: '5011082000002',
    name: 'Electral',
    price: 15,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'To replenish fluids and electrolytes lost due to dehydration caused by diarrhea, vomiting, or excessive sweating.',
    additionalInformation: 'An Oral Rehydration Salt (ORS) solution. Potency is measured by electrolyte content per sachet, not mg.'
  },
  {
    barcode: '00002130799',
    name: 'Emgality',
    price: 3500,
    fakeOrReal: 'real',
    mg: '120',
    purpose: 'For the preventive treatment of migraine in adults and for cluster headache.',
    additionalInformation: 'Contains Galcanezumab, a monoclonal antibody. Administered via subcutaneous injection. Prescription required. Potency refers to mg per pre-filled syringe.'
  },
  {
    barcode: '00002476501',
    name: 'Enbrel',
    price: 6000,
    fakeOrReal: 'real',
    mg: '50',
    purpose: 'Treatment of various autoimmune conditions such as rheumatoid arthritis, psoriatic arthritis, and psoriasis.',
    additionalInformation: 'Contains Etanercept, a TNF alpha inhibitor. Administered via subcutaneous injection. Prescription required. Potency refers to mg per pre-filled syringe.'
  },
  {
    barcode: '00078065030',
    name: 'Entresto',
    price: 450,
    fakeOrReal: 'real',
    mg: '24/26',
    purpose: 'For the treatment of chronic heart failure with reduced ejection fraction.',
    additionalInformation: 'A combination of Sacubitril and Valsartan. Prescription required. Potency refers to Sacubitril/Valsartan mg per tablet.'
  },
  {
    barcode: '3401542327094',
    name: 'Epiduo gel',
    price: 120,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Topical treatment for acne vulgaris, reducing inflammation and comedones.',
    additionalInformation: 'Contains Adapalene (a retinoid) and Benzoyl Peroxide (an antimicrobial/keratolytic). Potency refers to percentages of active ingredients, not a single mg.'
  },
  {
    barcode: '072140003004',
    name: 'Eucerin Aquaphor',
    price: 70,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Multi-purpose ointment for dry, cracked, and irritated skin, helping to heal and protect.',
    additionalInformation: 'A skin protectant and emollient. Potency is not applicable in mg; usually sold by volume/weight.'
  },
  {
    barcode: '7613421000007',
    name: 'Exelon Patch',
    price: 350,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Treatment of mild to moderate dementia of the Alzheimer\'s type and Parkinson\'s disease dementia.',
    additionalInformation: 'Contains Rivastigmine. Potency is expressed as mg released per 24 hours (e.g., 4.6 mg/24hr or 9.5 mg/24hr), not a single mg per patch.'
  },
  {
    barcode: '7613426000009',
    name: 'Exjade',
    price: 1800,
    fakeOrReal: 'real',
    mg: '125',
    purpose: 'For the treatment of chronic iron overload due to frequent blood transfusions (e.g., in thalassemia).',
    additionalInformation: 'Contains Deferasirox. Prescription required. Potency refers to mg per dispersible tablet or film-coated tablet.'
  },
  {
    barcode: '8999909700021',
    name: 'Eye Mo',
    price: 20,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'For symptomatic relief of minor eye irritations and redness.',
    additionalInformation: 'Contains ingredients like Tetrahydrozoline HCl (decongestant) or Zinc Sulfate (astringent). Potency is expressed as a percentage, not mg.'
  },
  {
    barcode: '4008617173167',
    name: 'Faktu',
    price: 50,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Treatment of hemorrhoids and anal fissures, relieving pain, itching, and inflammation.',
    additionalInformation: 'Available as ointment or suppositories. Contains Policresulen (astringent) and Cinchocaine HCl (local anesthetic). Potency for each active ingredient is in percentages or specific mg per dose.'
  },
  {
    barcode: '7613421000007',
    name: 'Fenistil Gel',
    price: 35,
    fakeOrReal: 'real',
    mg: '1',
    purpose: 'To relieve itching associated with skin reactions such as insect bites, hives, and mild sunburn.',
    additionalInformation: 'Contains Dimetindene Maleate, an antihistamine. Potency refers to percentage.'
  },
  {
    barcode: '5021265243160',
    name: 'Feroglobin B12',
    price: 45,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Iron and vitamin B complex supplement for red blood cell formation, energy, and to combat fatigue.',
    additionalInformation: 'Contains elemental iron, Vitamin B12, Folic Acid, and other nutrients. Potency is specific for each nutrient, not a single mg for the product.'
  },
  {
    barcode: '4019338040003',
    name: 'Hexalgin',
    price: 40,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'For severe pain relief, especially post-operative or chronic pain.',
    additionalInformation: 'Often contains Metamizole (Dipyrone). Prescription may be required. Potency is in mg per tablet/injection, often 500mg or 1g.'
  },
  {
    barcode: '00002888601',
    name: 'Humalog KwikPen',
    price: 200,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'To manage blood sugar levels in people with diabetes mellitus.',
    additionalInformation: 'Pre-filled pen containing Insulin Lispro (a rapid-acting insulin analog). Potency is measured in units (e.g., 100 units/ml), not mg.'
  },
  {
    barcode: '300431011019',
    name: 'Hydrocortisone Cream 1%',
    price: 25,
    fakeOrReal: 'real',
    mg: '1',
    purpose: 'To relieve itching, redness, and swelling caused by various skin conditions like eczema, dermatitis, and insect bites.',
    additionalInformation: 'A topical corticosteroid. Potency refers to percentage.'
  },
  {
    barcode: '5021265243160',
    name: 'Immunace',
    price: 60,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Multivitamin and mineral supplement formulated to support the immune system.',
    additionalInformation: 'Contains various vitamins (e.g., Vitamin C, D, E) and minerals (e.g., Zinc, Selenium). Potency is specific for each nutrient, not a single mg for the product.'
  },
  {
    barcode: '7613421000007',
    name: 'Intestiflora',
    price: 80,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Probiotic supplement to restore and maintain healthy gut flora, aiding digestion and immune function.',
    additionalInformation: 'Contains various strains of beneficial bacteria. Potency is measured in CFUs (Colony Forming Units), not mg.'
  },
  {
    barcode: '5011082000002',
    name: 'Lamisil Spray',
    price: 55,
    fakeOrReal: 'real',
    mg: '1',
    purpose: 'Treatment of fungal skin infections like athlete\'s foot and jock itch.',
    additionalInformation: 'Contains Terbinafine Hydrochloride, an antifungal agent. Potency refers to percentage.'
  },
  {
    barcode: '3838957500000',
    name: 'Linex Forte',
    price: 70,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Probiotic supplement to restore and maintain healthy gut flora, used for digestive issues and during/after antibiotic use.',
    additionalInformation: 'Contains Lactobacillus acidophilus and Bifidobacterium longum. Potency is measured in CFUs (Colony Forming Units), not mg.'
  },
  {
    barcode: '8710537040407',
    name: 'Locoid Cream',
    price: 45,
    fakeOrReal: 'real',
    mg: '0.1',
    purpose: 'Topical treatment for various inflammatory and itchy skin conditions like eczema and dermatitis.',
    additionalInformation: 'Contains Hydrocortisone Butyrate, a moderate-potency corticosteroid. Potency refers to percentage.'
  },
  {
    barcode: '5010605000000',
    name: 'Loratadine Syrup',
    price: 25,
    fakeOrReal: 'real',
    mg: '1',
    purpose: 'To relieve symptoms of seasonal and perennial allergies, such as sneezing, runny nose, and itchy eyes.',
    additionalInformation: 'A non-drowsy antihistamine. Potency refers to mg per ml (typically 1mg/ml or 5mg/5ml).'
  },
  {
    barcode: '3665517000109',
    name: 'Maalox Plus Suspension',
    price: 35,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'For the relief of heartburn, indigestion, and acid reflux, also helps with bloating and gas.',
    additionalInformation: 'Contains Aluminum Hydroxide, Magnesium Hydroxide (antacids) and Simethicone (anti-flatulent). Potency is for each active ingredient, not a single mg for the product.'
  },
  {
    barcode: '3665517000109',
    name: 'Maxidex Eye Drops',
    price: 80,
    fakeOrReal: 'real',
    mg: '0.1',
    purpose: 'To treat inflammation of the eye (e.g., conjunctivitis, uveitis) caused by allergies, injury, or surgery.',
    additionalInformation: 'Contains Dexamethasone, a corticosteroid. Prescription required. Potency refers to percentage.'
  },
  {
    barcode: '6939947910007',
    name: 'Mebo Scar Ointment',
    price: 75,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'To reduce and improve the appearance of scars, promoting skin healing and regeneration.',
    additionalInformation: 'Herbal-based ointment containing ingredients like sesame oil, beeswax, and botanical extracts. Potency not applicable in mg.'
  },
  {
    barcode: '5021265243160',
    name: 'Menopace',
    price: 80,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Dietary supplement formulated to support women during and after menopause, addressing symptoms like hot flashes and fatigue.',
    additionalInformation: 'Contains various vitamins, minerals, and plant extracts (e.g., Soy Isoflavones). Potency is specific for each nutrient, not a single mg for the product.'
  },
  {
    barcode: '5010605990264',
    name: 'Mentholatum Deep Heat',
    price: 35,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'For temporary relief of muscular aches, pains, strains, and stiffness.',
    additionalInformation: 'Topical rub containing active ingredients like Methyl Salicylate, Menthol, Eucalyptus oil. Potency refers to percentages, not mg.'
  },
  {
    barcode: '4987060000000',
    name: 'Meptin Swinghaler',
    price: 180,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'For the relief of bronchospasm in bronchial asthma, chronic bronchitis, and emphysema.',
    additionalInformation: 'Inhaler containing Procaterol Hydrochloride, a beta-agonist. Potency is measured in micrograms (mcg) per actuation, not mg.'
  },
  {
    barcode: '5411603001831',
    name: 'Miconazole Cream',
    price: 30,
    fakeOrReal: 'real',
    mg: '2',
    purpose: 'Topical treatment for fungal skin infections like athlete\'s foot, ringworm, and yeast infections.',
    additionalInformation: 'Contains Miconazole Nitrate. Potency refers to percentage.'
  },
  {
    barcode: '00006000070',
    name: 'Moduretic',
    price: 40,
    fakeOrReal: 'real',
    mg: '5/50',
    purpose: 'Diuretic medication used to treat high blood pressure (hypertension) and edema (fluid retention).',
    additionalInformation: 'A combination of Amiloride Hydrochloride and Hydrochlorothiazide. Prescription required. Potency refers to Amiloride/Hydrochlorothiazide mg per tablet.'
  },
  {
    barcode: '5011091079368',
    name: 'Momate Cream',
    price: 55,
    fakeOrReal: 'real',
    mg: '0.1',
    purpose: 'Topical corticosteroid used to treat inflammatory and itchy skin conditions like eczema and psoriasis.',
    additionalInformation: 'Contains Mometasone Furoate. Potency refers to percentage.'
  },
  {
    barcode: '8000036000000',
    name: 'Monuril',
    price: 120,
    fakeOrReal: 'real',
    mg: '3',
    purpose: 'Single-dose antibiotic treatment for uncomplicated urinary tract infections (UTIs) in women.',
    additionalInformation: 'Contains Fosfomycin Trometamol. Prescription required. Potency refers to grams (g) of Fosfomycin, so converting to mg for this context. Often sold as 3g sachet.'
  },
  {
    barcode: '4019338040003',
    name: 'Mucopront',
    price: 25,
    fakeOrReal: 'real',
    mg: '375',
    purpose: 'Mucolytic agent used to thin and loosen mucus in respiratory conditions like bronchitis and sinusitis.',
    additionalInformation: 'Contains Carbocisteine. Potency refers to mg per capsule or per 5ml syrup.'
  },
  {
    barcode: '8713170068523',
    name: 'Multi-Gyn Actigel',
    price: 80,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'To relieve discomforts like itching, irritation, odor, and discharge associated with bacterial vaginosis.',
    additionalInformation: 'A natural, bioactive gel based on a patented 2QR-complex. Potency is not applicable in mg.'
  },
  {
    barcode: '041167603208',
    name: 'selsun blue',
    price: 15,
    fakeOrReal: 'real',
    mg: '1% selenium sulfide',
    purpose: 'Dandruff shampoo',
    additionalInformation: 'Shake well before use'
  },
  {
    barcode: '5000198205756',
    name: 'sensodyne toothpaste',
    price: 14.3,
    fakeOrReal: 'real',
    mg: '100 g',
    purpose: 'Tooth sensitivity relief',
    additionalInformation: 'Use twice daily'
  },
  {
    barcode: '305970100614',
    name: 'spiriva respimat',
    price: 15.8,
    fakeOrReal: 'real',
    mg: '2.5 mcg/actuation',
    purpose: 'Maintenance bronchodilator (COPD/asthma)',
    additionalInformation: 'Two inhalations once daily'
  },
  {
    barcode: '305970100614',
    name: 'spiriva respimat',
    price: 85.00,
    fakeOrReal: 'real',
    mg: '2.5 mcg/actuation',
    purpose: 'Maintenance bronchodilator (COPD/asthma)',
    additionalInformation: 'Two inhalations once daily; rinse mouth after use'
  },
  {
    barcode: '5000167001426',
    name: 'strepsils warm honey & lemon',
    price: 36.00,
    fakeOrReal: 'real',
    mg: 'lozenges',
    purpose: 'Sore throat relief',
    additionalInformation: '1 lozenge every 2–3 hours, max 12/day'
  },
  {
    barcode: '042037103637',
    name: 'tagamet',
    price: 67.00,
    fakeOrReal: 'real',
    mg: '200mg',
    purpose: 'GERD / ulcer treatment',
    additionalInformation: 'Take 1 tablet before meals or bedtime. Max 2 weeks unless directed'
  },
  {
    barcode: '6922032172088',
    name: 'Ticagrelor (Brilinta)',
    price: 120.00,
    fakeOrReal: 'real',
    mg: '90mg',
    purpose: 'Blood thinner',
    additionalInformation: 'Antiplatelet for heart conditions'
  },
  {
    barcode: '5017007014746',
    name: 'Tixylix Cough Syrup',
    price: 8.50,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Dry cough',
    additionalInformation: 'Pholcodine-based (UK formulation)'
  },
  {
    barcode: '00310031031312',
    name: 'Tobradex Eye Ointment',
    price: 25.00,
    fakeOrReal: 'real',
    mg: '0.3%/0.1%',
    purpose: 'Eye infection',
    additionalInformation: 'Tobramycin + Dexamethasone combo'
  },
  {
    barcode: '00003010123210',
    name: 'Tofacitinib (Xeljanz)',
    price: 450.00,
    fakeOrReal: 'real',
    mg: '5mg',
    purpose: 'Rheumatoid arthritis',
    additionalInformation: 'JAK inhibitor (prescription-only)'
  },
  {
    barcode: '00074000001115',
    name: 'Topamax (Topiramate)',
    price: 65.00,
    fakeOrReal: 'real',
    mg: '100mg',
    purpose: 'Epilepsy/Migraine',
    additionalInformation: 'Anticonvulsant'
  },
  {
    barcode: '00088502120552',
    name: 'Tradjenta (Linagliptin)',
    price: 95.00,
    fakeOrReal: 'real',
    mg: '5mg',
    purpose: 'Type 2 Diabetes',
    additionalInformation: 'DPP-4 inhibitor'
  },
  {
    barcode: '4005800009838',
    name: 'Travocort Cream',
    price: 22.00,
    fakeOrReal: 'real',
    mg: '1%/1%',
    purpose: 'Fungal skin infections',
    additionalInformation: 'Isoconazole + Diflucortolone'
  },
  {
    barcode: '00310088730555',
    name: 'Trelegy Ellipta',
    price: 280.00,
    fakeOrReal: 'real',
    mg: '92/55/22mcg',
    purpose: 'COPD/Asthma',
    additionalInformation: 'Fluticasone/Umeclidinium/Vilanterol'
  },
  {
    barcode: '00037000341410',
    name: 'Triamcinolone Cream',
    price: 12.00,
    fakeOrReal: 'real',
    mg: '0.1%',
    purpose: 'Eczema/Psoriasis',
    additionalInformation: 'Steroid cream'
  },
  {
    barcode: '00000375771234',
    name: 'Truvada',
    price: 1500.00,
    fakeOrReal: 'real',
    mg: '200/300mg',
    purpose: 'HIV PrEP',
    additionalInformation: 'Emtricitabine/Tenofovir (Gilead)'
  },
  {
    barcode: '3004501235709',
    name: 'Tums Antacid',
    price: 5.00,
    fakeOrReal: 'real',
    mg: '750mg',
    purpose: 'Heartburn relief',
    additionalInformation: 'Calcium carbonate chewable'
  },
  {
    barcode: '3400930825324',
    name: 'Urgo',
    price: 12.00,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Wound care',
    additionalInformation: 'Brand of medical dressings (not oral medication)'
  },
  {
    barcode: '3700066603010',
    name: 'Vagisil',
    price: 8.50,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Feminine itch relief',
    additionalInformation: 'Topical cream for external use'
  },
  {
    barcode: '00310031031312',
    name: 'Valaciclovir (Valtrex)',
    price: 75.00,
    fakeOrReal: 'real',
    mg: '500mg',
    purpose: 'Herpes treatment',
    additionalInformation: 'Antiviral for HSV-1/HSV-2'
  },
  {
    barcode: '00088502120552',
    name: 'Valganciclovir (Valcyte)',
    price: 350.00,
    fakeOrReal: 'real',
    mg: '450mg',
    purpose: 'CMV infection',
    additionalInformation: 'Used in transplant patients'
  },
  {
    barcode: '3700066603027',
    name: 'Vicks BabyRub',
    price: 5.50,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Baby congestion relief',
    additionalInformation: 'Camphor-free topical ointment'
  },
  {
    barcode: '00378400442010',
    name: 'Vectical Ointment',
    price: 320.00,
    fakeOrReal: 'real',
    mg: '3mcg/g',
    purpose: 'Psoriasis',
    additionalInformation: 'Calcitriol analog (vitamin D derivative)'
  },
  {
    barcode: '3400930825331',
    name: 'Venoruton',
    price: 18.00,
    fakeOrReal: 'real',
    mg: '500mg',
    purpose: 'Venous insufficiency',
    additionalInformation: 'Rutoside-based circulation support'
  },
  {
    barcode: '00310031031313',
    name: 'Verapamil SR',
    price: 25.00,
    fakeOrReal: 'real',
    mg: '240mg',
    purpose: 'Hypertension',
    additionalInformation: 'Calcium channel blocker (sustained-release)'
  },
  {
    barcode: '00088502120553',
    name: 'Verquvo',
    price: 850.00,
    fakeOrReal: 'real',
    mg: '10mg',
    purpose: 'Heart failure',
    additionalInformation: 'Vericiguat (soluble guanylate cyclase stimulator)'
  },
  {
    barcode: '00378400442011',
    name: 'Versacloz',
    price: 1200.00,
    fakeOrReal: 'real',
    mg: '100mg',
    purpose: 'Schizophrenia',
    additionalInformation: 'Clozapine oral suspension (requires monitoring)'
  },
  {
    barcode: '3700066603034',
    name: 'Vicks Sinex',
    price: 7.50,
    fakeOrReal: 'real',
    mg: '0.05%',
    purpose: 'Nasal congestion',
    additionalInformation: 'Oxymetazoline hydrochloride spray'
  },
  {
    barcode: '00088502120554',
    name: 'Vidaza',
    price: 2800.00,
    fakeOrReal: 'real',
    mg: '100mg',
    purpose: 'Myelodysplastic syndromes',
    additionalInformation: 'Azacitidine (chemotherapy injectable)'
  },
  {
    barcode: '00310031031314',
    name: 'Vigamox',
    price: 65.00,
    fakeOrReal: 'real',
    mg: '0.5%',
    purpose: 'Bacterial conjunctivitis',
    additionalInformation: 'Moxifloxacin ophthalmic solution'
  },
  {
    barcode: '6922032172089',
    name: 'Vildagliptin (Galvus)',
    price: 55.00,
    fakeOrReal: 'real',
    mg: '50mg',
    purpose: 'Type 2 Diabetes',
    additionalInformation: 'DPP-4 inhibitor'
  },
  {
    barcode: '00000375771235',
    name: 'Viread',
    price: 950.00,
    fakeOrReal: 'real',
    mg: '300mg',
    purpose: 'HIV/HBV treatment',
    additionalInformation: 'Tenofovir disoproxil (Gilead Sciences)'
  },
  {
    barcode: '100000000000',
    name: 'vitamin b complex',
    price: 0,
    fakeOrReal: 'real',
    mg: 'various',
    purpose: 'Vitamin B supplementation',
    additionalInformation: 'Take one tablet daily with food'
  },
  {
    barcode: '100000000001',
    name: 'vitiligo creams',
    price: 0,
    fakeOrReal: 'real',
    mg: 'various',
    purpose: 'Skin repigmentation',
    additionalInformation: 'Apply as prescribed; may include corticosteroids or calcineurin inhibitors'
  },
  {
    barcode: '100000000002',
    name: 'voltaren forte',
    price: 380.00,
    fakeOrReal: 'real',
    mg: '2.32%',
    purpose: 'Topical anti-inflammatory gel for joint/muscle pain',
    additionalInformation: 'Apply 2–4 g to affected area 2–4 times daily'
  },
  {
    barcode: '100000000003',
    name: 'wartec',
    price: 0,
    fakeOrReal: 'real',
    mg: 'cream 5%',
    purpose: 'Treatment for warts (contains podophyllotoxin)',
    additionalInformation: 'Apply twice daily for 3 days, then break for 4 days; repeat 3 cycles'
  },
  {
    barcode: '100000000004',
    name: 'weleda baby calendula cream',
    price: 0,
    fakeOrReal: 'real',
    mg: 'various',
    purpose: 'Baby skincare and protection',
    additionalInformation: 'Apply after bath or as needed to diaper areas'
  },
  {
    barcode: '100000000005',
    name: 'wellkid',
    price: 0,
    fakeOrReal: 'real',
    mg: 'various',
    purpose: 'Children’s multivitamin supplement',
    additionalInformation: 'Take as per age/weight instructions on packaging'
  },
  {
    barcode: '100000000006',
    name: 'xylometazoline nasal spray',
    price: 0,
    fakeOrReal: 'real',
    mg: '0.05%/0.1%',
    purpose: 'Nasal decongestant',
    additionalInformation: '2–3 sprays/nostril every 8–10 hrs; do not use >7 days'
  },
  {
    barcode: '100000000007',
    name: 'xyrem',
    price: 0,
    fakeOrReal: 'real',
    mg: 'sodium oxybate 500 mg/ml',
    purpose: 'Narcolepsy treatment (daytime sleepiness/cataplexy)',
    additionalInformation: 'Take nightly in two doses; prescription required'
  },
  {
    barcode: '100000000008',
    name: 'zaditen',
    price: 0,
    fakeOrReal: 'real',
    mg: '1mg/ml drops',
    purpose: 'Allergic conjunctivitis relief (ketotifen)',
    additionalInformation: 'Instill 1 drop in each eye twice daily'
  },
  {
    barcode: '100000000009',
    name: 'zantac syrup',
    price: 0,
    fakeOrReal: 'real',
    mg: '150 mg/15 ml',
    purpose: 'Heartburn and acid reflux relief',
    additionalInformation: '15 ml 2× daily; reduce dose for children'
  },
  {
    barcode: '100000000010',
    name: 'zego',
    price: 0,
    fakeOrReal: 'real',
    mg: 'various',
    purpose: 'Not identified—check packaging',
    additionalInformation: 'Product details vary—refer to label'
  },
  {
    barcode: '100000000011',
    name: 'zemplar',
    price: 0,
    fakeOrReal: 'real',
    mg: '1 mcg/mcg',
    purpose: 'Paricalcitol – calcium regulation in CKD',
    additionalInformation: 'Take with food; monitor calcium and phosphate levels'
  },
  {
    barcode: '100000000012',
    name: 'zenalol',
    price: 0,
    fakeOrReal: 'real',
    mg: '25mg',
    purpose: 'Beta‑blocker (blood pressure / arrhythmia)',
    additionalInformation: 'Take once daily; monitor pulse and BP'
  },
  {
    barcode: '100000000013',
    name: 'zestril',
    price: 0,
    fakeOrReal: 'real',
    mg: '10mg',
    purpose: 'Lisinopril – hypertension and heart failure',
    additionalInformation: 'Take once daily; monitor blood pressure'
  },
  {
    barcode: '100000000014',
    name: 'ziac',
    price: 0,
    fakeOrReal: 'real',
    mg: '5mg/12.5mg',
    purpose: 'Bisoprolol + hydrochlorothiazide – hypertension',
    additionalInformation: 'Take once daily in morning; monitor BP'
  },
  {
    barcode: '100000000015',
    name: 'zithromax suspension',
    price: 374.27,
    fakeOrReal: 'real',
    mg: '200mg/5ml',
    purpose: 'Azithromycin – antibiotic for infections',
    additionalInformation: '200mg/5 ml suspension for 3–5 days as prescribed'
  },
  {
    barcode: '100000000016',
    name: 'zoloft',
    price: 805.05,
    fakeOrReal: 'real',
    mg: '50mg',
    purpose: 'Sertraline – antidepressant',
    additionalInformation: 'Take once daily; can be taken with food'
  },
  {
    barcode: 'Zyloric',
    name: 'zyloprim',
    price: 26.00,
    fakeOrReal: 'real',
    mg: '100mg',
    purpose: 'Allopurinol – gout prevention',
    additionalInformation: 'Take after meals; dosage per doctor’s advice'
  },
  {
    barcode: '100000000017',
    name: 'zyrtec-d',
    price: 39.50,
    fakeOrReal: 'real',
    mg: 'cetirizine 10mg + pseudoephedrine 120mg',
    purpose: 'Allergy relief with decongestant',
    additionalInformation: 'One tablet every 12 hours; max use 7 days'
  },
  {
    barcode: '100000000018',
    name: 'zyvox',
    price: 5692.50,
    fakeOrReal: 'real',
    mg: 'Linezolid 600mg',
    purpose: 'Antibiotic for resistant infections',
    additionalInformation: 'Take twice daily for prescribed duration'
  },
  {
    barcode: '100000000019',
    name: 'zostavax',
    price: 865.50,
    fakeOrReal: 'real',
    mg: 'Live attenuated shingles vaccine',
    purpose: 'Shingles prevention',
    additionalInformation: 'Administered once; prescription required'
  },
  {
    barcode: '100000000020',
    name: 'zydis',
    price: 546.00,
    fakeOrReal: 'real',
    mg: 'Olanzapine ODT 5mg',
    purpose: 'Antipsychotic (Zyprexa Zydis)',
    additionalInformation: 'One wafer daily, dissolves on tongue'
  },
  {
    barcode: '100000000021',
    name: 'zykadia',
    price: 33690.50,
    fakeOrReal: 'real',
    mg: '150mg',
    purpose: 'Cancer treatment (ALK-positive NSCLC)',
    additionalInformation: 'Take daily; prescription required'
  },
  {
    barcode: '100000000022',
    name: 'a.vogel echinaforce',
    price: 162.99,
    fakeOrReal: 'real',
    mg: '50ml drops',
    purpose: 'Immune support herbal supplement',
    additionalInformation: 'Take 20 drops 3× daily at first signs of cold'
  },
  {
    barcode: '100000000023',
    name: 'aclasta',
    price: 2331.50,
    fakeOrReal: 'real',
    mg: 'Zoledronic acid 5mg/100ml',
    purpose: 'IV infusion for osteoporosis',
    additionalInformation: 'Given once yearly via infusion'
  },
  {
    barcode: '100000000024',
    name: 'actonel plus',
    price: 0,
    fakeOrReal: 'real',
    mg: 'risedronate + calcium/vit D',
    purpose: 'Osteoporosis treatment',
    additionalInformation: 'Take weekly per prescribing instructions'
  },
  {
    barcode: '100000000025',
    name: 'adcortyl',
    price: 0,
    fakeOrReal: 'real',
    mg: 'Hydrocortisone acetate',
    purpose: 'Topical corticosteroid',
    additionalInformation: 'Apply to affected area twice daily'
  },
  {
    barcode: '100000000026',
    name: 'adrenaline',
    price: 0,
    fakeOrReal: 'real',
    mg: '1mg/ml auto-injector',
    purpose: 'Emergency treatment of anaphylaxis',
    additionalInformation: 'Inject into outer thigh; repeat per protocol'
  },
  {
    barcode: '100000000027',
    name: 'advantan',
    price: 18.00,
    fakeOrReal: 'real',
    mg: '0.1% cream',
    purpose: 'Topical corticosteroid for dermatitis',
    additionalInformation: 'Apply once daily to affected skin'
  },
  {
    barcode: '100000000028',
    name: 'afrin puresea',
    price: 0,
    fakeOrReal: 'real',
    mg: '0.05% nasal spray',
    purpose: 'Nasal decongestant',
    additionalInformation: '2–3 sprays per nostril up to 3 days'
  },
  {
    barcode: '100000000029',
    name: 'agarol',
    price: 0,
    fakeOrReal: 'real',
    mg: 'glycerol suppository',
    purpose: 'Constipation relief',
    additionalInformation: 'Insert rectally at bedtime if needed'
  },
  {
    barcode: '100000000030',
    name: 'akineton',
    price: 0,
    fakeOrReal: 'real',
    mg: '2mg',
    purpose: 'Anticholinergic for Parkinson’s',
    additionalInformation: 'Take as prescribed by neurologist'
  },
  {
    barcode: '100000000031',
    name: 'aldomet',
    price: 0,
    fakeOrReal: 'real',
    mg: '250mg',
    purpose: 'Methyldopa – hypertension treatment',
    additionalInformation: 'Take 1–2 times daily; monitor blood pressure'
  },
  {
    barcode: '100000000032',
    name: 'algesal',
    price: 0,
    fakeOrReal: 'real',
    mg: 'diclofenac topical 1%',
    purpose: 'Muscle/joint pain relief gel',
    additionalInformation: 'Apply thin layer to affected area 3× daily'
  },
  {
    barcode: 'Zyloric',
    name: 'allopurinol',
    price: 26.00,
    fakeOrReal: 'real',
    mg: '100mg',
    purpose: 'Gout prevention',
    additionalInformation: 'Take once daily after meals'
  },
  {
    barcode: '100000000033',
    name: 'aloevera gel',
    price: 0,
    fakeOrReal: 'real',
    mg: 'various',
    purpose: 'Moisturizer/skin soothing',
    additionalInformation: 'Apply topically to dry or irritated skin'
  },
  {
    barcode: '100000000034',
    name: 'alpha-d3',
    price: 0,
    fakeOrReal: 'real',
    mg: 'Vitamin D3 supplement',
    purpose: 'Bone health support',
    additionalInformation: 'Take one capsule daily with food'
  },
  {
    barcode: '100000000035',
    name: 'altom',
    price: 0,
    fakeOrReal: 'real',
    mg: 'magnesium supplement',
    purpose: 'Magnesium deficiency',
    additionalInformation: 'Take once daily as directed'
  },
  {
    barcode: '100000000036',
    name: 'alveo',
    price: 0,
    fakeOrReal: 'real',
    mg: 'various',
    purpose: 'Herbal immune support supplement',
    additionalInformation: 'Follow label dosing instructions'
  },
  {
    barcode: '6281024003014',
    name: 'Amantadine (Symmetrel)',
    price: 85.00,
    fakeOrReal: 'real',
    mg: '100mg',
    purpose: 'Parkinson\'s/Influenza A',
    additionalInformation: 'Dopaminergic agent'
  },
  {
    barcode: '6226009111257',
    name: 'Amaryl M',
    price: 120.00,
    fakeOrReal: 'real',
    mg: '2mg/500mg',
    purpose: 'Type 2 Diabetes',
    additionalInformation: 'Glimepiride + Metformin combo'
  },
  {
    barcode: '6291100157893',
    name: 'Ambroxol Syrup (Mucosolvan)',
    price: 22.50,
    fakeOrReal: 'real',
    mg: '30mg/5ml',
    purpose: 'Cough expectorant',
    additionalInformation: '120ml bottle'
  },
  {
    barcode: '4548736008691',
    name: 'Amikacin Injectable',
    price: 45.00,
    fakeOrReal: 'real',
    mg: '500mg/vial',
    purpose: 'Severe bacterial infections',
    additionalInformation: 'Requires prescription + hospital admin'
  },
  {
    barcode: '6291100157909',
    name: 'Amino Acids (Aminoven)',
    price: 65.00,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Nutritional support',
    additionalInformation: 'IV infusion solution'
  },
  {
    barcode: '5000159401135',
    name: 'Anbesol',
    price: 15.00,
    fakeOrReal: 'real',
    mg: '20mg/g',
    purpose: 'Oral pain relief',
    additionalInformation: 'Benzocaine topical gel'
  },
  {
    barcode: '4005800012348',
    name: 'Androcur (Cyproterone)',
    price: 95.00,
    fakeOrReal: 'real',
    mg: '50mg',
    purpose: 'Prostate cancer/Hirsutism',
    additionalInformation: 'Anti-androgen'
  },
  {
    barcode: '4005800012349',
    name: 'Antistax',
    price: 55.00,
    fakeOrReal: 'real',
    mg: 'N/A',
    purpose: 'Chronic venous insufficiency',
    additionalInformation: 'Red vine leaf extract'
  },
  {
    barcode: '6226009111258',
    name: 'Apresoline (Hydralazine)',
    price: 40.00,
    fakeOrReal: 'real',
    mg: '25mg',
    purpose: 'Hypertension',
    additionalInformation: 'Vasodilator'
  },
  {
    barcode: '6226009111259',
    name: 'Aprovel (Irbesartan)',
    price: 110.00,
    fakeOrReal: 'real',
    mg: '300mg',
    purpose: 'Hypertension',
    additionalInformation: 'ARB class'
  },
  {
    barcode: '6226009111260',
    name: 'Aricept (Donepezil)',
    price: 180.00,
    fakeOrReal: 'real',
    mg: '10mg',
    purpose: 'Alzheimer\'s',
    additionalInformation: 'Cholinesterase inhibitor'
  },
  {
    barcode: '5054567301717',
    name: 'Avamys Nasal Spray',
    price: 42.00,
    fakeOrReal: 'real',
    mg: '27.5mcg/spray',
    purpose: 'Allergic rhinitis',
    additionalInformation: 'Fluticasone furoate'
  },
  {
    barcode: '4548736008692',
    name: 'Avastin (Bevacizumab)',
    price: 3200.00,
    fakeOrReal: 'real',
    mg: '100mg/4ml',
    purpose: 'Cancer/Age-related macular degeneration',
    additionalInformation: 'IV/injectable (hospital use)'
  },
  {
    barcode: '5054567301718',
    name: 'Azarga Eye Drops',
    price: 88.00,
    fakeOrReal: 'real',
    mg: '5mg/ml + 10mg/ml',
    purpose: 'Glaucoma',
    additionalInformation: 'Brinzolamide + Timolol combo'
  },
  {
    barcode: '520-00862',
    name: 'bupivacaine (injectable)',
    price: 194.50,
    fakeOrReal: 'real',
    mg: '2.5 mg/ml, 20 ml vial',
    purpose: 'Local anesthesia',
    additionalInformation: 'Used for epidural, nerve block; administered by healthcare professional'
  },
  {
    barcode: '100000000037',
    name: 'calcichew',
    price: 36.00,
    fakeOrReal: 'real',
    mg: '500 mg calcium + D3',
    purpose: 'Calcium supplement',
    additionalInformation: 'Chew one tablet daily with food'
  },
  {
    barcode: '100000000038',
    name: 'calmurid',
    price: 15.00,
    fakeOrReal: 'real',
    mg: 'magnesium/calcium formulation',
    purpose: 'Magnesium + calcium supplement',
    additionalInformation: 'Take one effervescent tablet daily'
  },
  {
    barcode: '100000000039',
    name: 'canesten external cream',
    price: 16.00,
    fakeOrReal: 'real',
    mg: '1% clotrimazole, 20 g tube',
    purpose: 'Antifungal skin infections',
    additionalInformation: 'Apply thin layer 2–3× daily to affected area'
  },
  {
    barcode: '100000000040',
    name: 'carbomer eye gel',
    price: 26.50,
    fakeOrReal: 'real',
    mg: '1% carmellose sodium, single-dose amps',
    purpose: 'Dry eye lubrication',
    additionalInformation: 'Use one ampule per eye as needed'
  },
  {
    barcode: '100000000041',
    name: 'cardace',
    price: 45.00,
    fakeOrReal: 'real',
    mg: '2.5 mg ramipril',
    purpose: 'ACE inhibitor – hypertension/heart failure',
    additionalInformation: 'Take one tablet daily, with or without food'
  },
  {
    barcode: '100000000042',
    name: 'cardioprin',
    price: 18.00,
    fakeOrReal: 'real',
    mg: '75 mg aspirin',
    purpose: 'Antiplatelet – prevent cardiovascular events',
    additionalInformation: 'Take one tablet daily with food'
  },
  {
    barcode: '100000000043',
    name: 'carmellose eye drops',
    price: 26.50,
    fakeOrReal: 'real',
    mg: '1% carmellose sodium',
    purpose: 'Treatment for dry eyes',
    additionalInformation: 'Instill 1–2 drops in each eye as needed'
  },
  {
    barcode: '100000000044',
    name: 'cefazolin (injectable)',
    price: 125.00,
    fakeOrReal: 'real',
    mg: '1 g powder for injection',
    purpose: 'Antibiotic – surgical prophylaxis',
    additionalInformation: 'Administered by healthcare professional'
  },
  {
    barcode: '100000000045',
    name: 'celadrin',
    price: 120.00,
    fakeOrReal: 'real',
    mg: '1200 mg capsules',
    purpose: 'Joint support supplement',
    additionalInformation: 'Take one capsule daily with food'
  },
  {
    barcode: '100000000046',
    name: 'celluvisc',
    price: 26.50,
    fakeOrReal: 'real',
    mg: '1% carmellose sodium, 30 single-use amps',
    purpose: 'Dry eye lubrication',
    additionalInformation: 'Use one ampule per eye as needed'
  },
  {
    barcode: '100000000047',
    name: 'centella asiatica cream',
    price: 40.00,
    fakeOrReal: 'real',
    mg: '5%',
    purpose: 'Skin healing and scar treatment',
    additionalInformation: 'Apply thin layer 2–3× daily to affected skin'
  },
  {
    barcode: '100000000048',
    name: 'cephalexin (generic)',
    price: 24.00,
    fakeOrReal: 'real',
    mg: '500 mg capsules, 10’s blister',
    purpose: 'Antibiotic – bacterial infections',
    additionalInformation: 'Take one capsule every 6 hrs for 7–10 days'
  },
  {
    barcode: '100000000049',
    name: 'cerebrolysin',
    price: 350.00,
    fakeOrReal: 'real',
    mg: '10 ml vial',
    purpose: 'Neurotrophic agent (stroke/dementia)',
    additionalInformation: 'Administered by healthcare professional via injection'
  },
  {
    barcode: '100000000050',
    name: 'ciprovet',
    price: 45.00,
    fakeOrReal: 'real',
    mg: 'ciprofloxacin animal use',
    purpose: 'Veterinary antibiotic',
    additionalInformation: 'Use as directed by veterinarian'
  },
  {
    barcode: '100000000051',
    name: 'ciproxin hc',
    price: 28.00,
    fakeOrReal: 'real',
    mg: 'hydrocortisone + ciprofloxacin drops',
    purpose: 'Eardrop for ear infections',
    additionalInformation: 'Instill 3–4 drops 3× daily after cleaning ear'
  },
  {
    barcode: '100000000052',
    name: 'clarinase repetabs',
    price: 28.00,
    fakeOrReal: 'real',
    mg: 'loratadine + pseudoephedrine',
    purpose: 'Allergy relief + decongestion',
    additionalInformation: 'Take one tablet every 12 hrs'
  },
  {
    barcode: '100000000053',
    name: 'clear eyes',
    price: 19.00,
    fakeOrReal: 'real',
    mg: 'lubricant eye drops',
    purpose: 'Redness relief / lubrication',
    additionalInformation: 'Instill 2–3 drops per eye as needed'
  },
  {
    barcode: '100000000054',
    name: 'clindamycin topical solution',
    price: 38.00,
    fakeOrReal: 'real',
    mg: '1%',
    purpose: 'Topical antibiotic for acne',
    additionalInformation: 'Apply thin layer to affected area twice daily'
  },
  {
    barcode: '100000000055',
    name: 'clomifene',
    price: 22.50,
    fakeOrReal: 'real',
    mg: '50 mg tab',
    purpose: 'Ovulation induction',
    additionalInformation: 'Take one tablet daily for 5 days as prescribed'
  },
  {
    barcode: '100000000056',
    name: 'clotrimazole vaginal cream',
    price: 32.00,
    fakeOrReal: 'real',
    mg: '2% cream',
    purpose: 'Antifungal treatment',
    additionalInformation: 'Apply intravaginally once daily for 3–7 days'
  },
  {
    barcode: '100000000057',
    name: 'codeine phosphate',
    price: 56.00,
    fakeOrReal: 'real',
    mg: '15 mg/5 ml syrup',
    purpose: 'Cough suppressant/pain relief',
    additionalInformation: 'Prescription-only; take as directed'
  },
  {
    barcode: '100000000058',
    name: 'colchicum dispert',
    price: 68.00,
    fakeOrReal: 'real',
    mg: '500 µg tablets',
    purpose: 'Gout prophylaxis',
    additionalInformation: 'One tablet once daily; adjust per doctor’s advice'
  },
  {
    barcode: '100000000059',
    name: 'cold sore cream',
    price: 29.00,
    fakeOrReal: 'real',
    mg: '5% acyclovir cream',
    purpose: 'Cold sore treatment',
    additionalInformation: 'Apply 5 times daily at first sign of outbreak'
  },
  {
    barcode: '100000000060',
    name: 'comfeel',
    price: 14.00,
    fakeOrReal: 'real',
    mg: 'various sizes hydrocolloid dressing',
    purpose: 'Wound care bandage',
    additionalInformation: 'Apply over clean dry wound, change every 3–5 days'
  },
  {
    barcode: '100000000061',
    name: 'complan',
    price: 25.00,
    fakeOrReal: 'real',
    mg: '4 x 400 g powder',
    purpose: 'Nutritional supplement',
    additionalInformation: 'Mix with milk/water and drink 1–3 times daily'
  },
  {
    barcode: '100000000062',
    name: 'comtrex',
    price: 48.00,
    fakeOrReal: 'real',
    mg: 'sachet',
    purpose: 'Cold & flu symptom relief',
    additionalInformation: 'Dissolve 1 sachet in hot water every 4–6 hrs'
  },
  {
    barcode: '100000000063',
    name: 'concor',
    price: 21.00,
    fakeOrReal: 'real',
    mg: '5 mg bisoprolol',
    purpose: 'Hypertension / heart failure',
    additionalInformation: 'One tablet daily in morning'
  },
  {
    barcode: '100000000064',
    name: 'copper iud',
    price: 285.00,
    fakeOrReal: 'real',
    mg: 'IUD device',
    purpose: 'Long‑term contraception',
    additionalInformation: 'Inserted by healthcare professional; lasts 5–10 years'
  },
  {
    barcode: '100000000065',
    name: 'coracten',
    price: 48.00,
    fakeOrReal: 'real',
    mg: 'verapamil SR 240 mg',
    purpose: 'Angina / hypertension',
    additionalInformation: 'One sustained-release tablet daily'
  },
  {
    barcode: '100000000066',
    name: 'cordarone',
    price: 110.00,
    fakeOrReal: 'real',
    mg: '200 mg tablets',
    purpose: 'Anti-arrhythmic',
    additionalInformation: 'Typically taken once daily; ECG monitoring advised'
  },
  {
    barcode: '100000000067',
    name: 'cortisone cream',
    price: 26.00,
    fakeOrReal: 'real',
    mg: '1% hydrocortisone',
    purpose: 'Anti-inflammatory topical',
    additionalInformation: 'Apply thin layer 1–2× daily to inflamed skin'
  },
  {
    barcode: '100000000068',
    name: 'cosentyx',
    price: 11014.00,
    fakeOrReal: 'real',
    mg: '150 mg/ml pen',
    purpose: 'Psoriasis / spondyloarthritis biologic injection',
    additionalInformation: 'Inject 150mg monthly after loading doses'
  },
  {
    barcode: '100000000069',
    name: 'cozaar forte',
    price: 65.00,
    fakeOrReal: 'real',
    mg: '50/12.5 mg losartan + HCTZ',
    purpose: 'Hypertension',
    additionalInformation: 'One tablet daily'
  },
  {
    barcode: '100000000070',
    name: 'creon',
    price: 175.00,
    fakeOrReal: 'real',
    mg: '25,000 IU capsules',
    purpose: 'Pancreatic enzyme replacement',
    additionalInformation: 'Take with meals/with every meal/snack'
  },
  {
    barcode: '100000000071',
    name: 'curasept',
    price: 47.00,
    fakeOrReal: 'real',
    mg: '0.20% chlorhexidine mouthwash',
    purpose: 'Gum care / plaque control',
    additionalInformation: 'Use 10 ml rinse for 30s twice daily for 2 weeks'
  },
  {
    barcode: '100000000072',
    name: 'cyklokapron',
    price: 135.00,
    fakeOrReal: 'real',
    mg: '1000 mg/ml injection',
    purpose: 'Antifibrinolytic—bleeding control',
    additionalInformation: 'Administered IV by healthcare professional'
  },
  {
    "barcode": "8901122334455",
    "name": "Diltiazem SR",
    "price": 240.00,
     fakeOrReal: 'real',
    "mg": "Varies by dosage form (e.g., 60mg, 90mg, 120mg, 180mg, 240mg, 300mg)",
    "purpose": "Used to treat high blood pressure (hypertension), angina (chest pain), and certain heart rhythm disorders (arrhythmias). SR indicates sustained-release.",
    "additionalInformation": "Calcium channel blocker. Prescription required. Dosage and formulation (e.g., tablet, capsule) vary."
  },
  {
    "barcode": "8902233445566",
    "name": "Diphenhydramine (generic syrup)",
    "price": 160.00,
     fakeOrReal: 'real',
    "mg": "Typically 12.5 mg/5 mL or 25 mg/5 mL",
    "purpose": "An antihistamine used to relieve symptoms of allergy, hay fever, and the common cold (like rash, itching, watery eyes, runny nose, cough, and sneezing). Also used to treat insomnia and motion sickness.",
    "additionalInformation": "Causes drowsiness. Available over-the-counter (OTC) in many formulations. Dosage varies by age and indication."
  },
  {
    "barcode": "8903344556677",
    "name": "Diprogenta",
    "price": 100,
     fakeOrReal: 'real',
    "mg": "Active ingredients typically Betamethasone dipropionate and Gentamicin sulfate (concentrations vary)",
    "purpose": "A combination topical corticosteroid and antibiotic used to treat inflammatory skin conditions (like eczema, dermatitis, psoriasis) that are also infected or likely to become infected by bacteria.",
    "additionalInformation": "Topical cream or ointment. Prescription required. Not for long-term use due to corticosteroid component."
  },
  {
    "barcode": "8904455667788",
    "name": "Diprospan (injectable)",
    "price": 200,
     fakeOrReal: 'real',
    "mg": "Typically 5 mg/mL betamethasone dipropionate and 2 mg/mL betamethasone sodium phosphate (total 7 mg/mL betamethasone)",
    "purpose": "A corticosteroid injection used to treat a variety of inflammatory and autoimmune conditions, such as severe allergies, asthma, arthritis, and certain skin conditions.",
    "additionalInformation": "Contains betamethasone. Administered by a healthcare professional. Prescription required. Long-acting injectable."
  },
  {
    "barcode": "8905566778899",
    "name": "Disprin",
    "price": 150,
     fakeOrReal: 'real',
    "mg": "Typically 300 mg or 500 mg (aspirin)",
    "purpose": "A brand of soluble aspirin, used as an analgesic (pain reliever), antipyretic (fever reducer), and anti-inflammatory drug. Also used as an antiplatelet agent at lower doses to prevent blood clots.",
    "additionalInformation": "Contains aspirin (acetylsalicylic acid). Available over-the-counter (OTC). Should be dissolved in water before consumption. Not suitable for children under 16 with viral infections due to Reye's syndrome risk."
  },
  {
    "barcode": "8906677889900",
    "name": "Docetaxel",
    "price": 150,
     fakeOrReal: 'real',
    "mg": "Varies by formulation (e.g., 20mg, 80mg, 120mg per vial)",
    "purpose": "A chemotherapy drug (taxane) used to treat various types of cancer, including breast cancer, non-small cell lung cancer, prostate cancer, stomach cancer, and head and neck cancer.",
    "additionalInformation": "Administered intravenously by a healthcare professional. Has significant side effects. Prescription required. Oncologic drug."
  },
  {
    "barcode": "8907788990011",
    "name": "Domperidone Suspension",
    "price": 800,
     fakeOrReal: 'real',
    "mg": "Typically 1 mg/mL",
    "purpose": "An antiemetic and prokinetic agent used to treat nausea and vomiting, and sometimes to relieve symptoms of stomach discomfort like bloating and fullness.",
    "additionalInformation": "Oral suspension. Prescription required in some regions, OTC in others. Not for long-term use. Can have cardiac side effects."
  },
  {
    "barcode": "8908899001122",
    "name": "Dopamine (injectable)",
    "price": 300,
     fakeOrReal: 'real',
    "mg": "Typically 40 mg/mL or 80 mg/mL in concentrate for infusion",
    "purpose": "A sympathomimetic agent used in emergency situations to treat low blood pressure (hypotension), low cardiac output, and poor perfusion of organs, often associated with shock.",
    "additionalInformation": "Administered intravenously by a healthcare professional in a hospital setting. Potent drug with significant cardiovascular effects. Prescription required."
  },
  {
    "barcode": "8909900112233",
    "name": "Doxazosin",
    "price": 250,
     fakeOrReal: 'real',
    "mg": "Typically 1mg, 2mg, 4mg, 8mg",
    "purpose": "An alpha-blocker used to treat high blood pressure (hypertension) and to improve urine flow in men with benign prostatic hyperplasia (BPH).",
    "additionalInformation": "Oral tablet. Prescription required. Can cause orthostatic hypotension (dizziness upon standing), especially with the first dose."
  },
  {
    "barcode": "8910011223344",
    "name": "Doxycycline (generic)",
    "price": 300,
     fakeOrReal: 'real',
    "mg": "Typically 50mg, 100mg",
    "purpose": "A broad-spectrum tetracycline antibiotic used to treat various bacterial infections, including respiratory tract infections, urinary tract infections, skin infections, and certain sexually transmitted infections. Also used to treat acne and prevent malaria.",
    "additionalInformation": "Oral capsule or tablet. Prescription required. Should be taken with food to reduce stomach upset and with plenty of water to prevent esophageal irritation. Can cause photosensitivity (increased sensitivity to sunlight)."
  },
  {
    "barcode": "8911122334455",
    "name": "Duoderm",
    "price": 200,
     fakeOrReal: 'real',
    "mg": "N/A (dressing material)",
    "purpose": "A brand of hydrocolloid dressings used for wound management, creating a moist environment that promotes healing and protects the wound.",
    "additionalInformation": "Available in various sizes and types (e.g., extra thin, CGF). Used for partial and full thickness wounds. Not a medication, but a medical device."
  },
  {
    "barcode": "8912233445566",
    "name": "Duphalyte (veterinary, but sometimes used)",
    "price": 100,
     fakeOrReal: 'real',
    "mg": "Contains various amino acids, vitamins, and electrolytes (concentrations vary)",
    "purpose": "A veterinary oral or injectable solution used to provide rehydration, electrolytes, amino acids, and vitamins to animals, especially during periods of stress, illness, or recovery. (Human use is off-label and not recommended without explicit medical supervision).",
    "additionalInformation": "Intended for animal use only. Administration route varies (oral, injectable). Not approved for human use and carries risks if used inappropriately."
  },
  {
    "barcode": "8913344556677",
    "name": "Duratears",
    "price": 600,
     fakeOrReal: 'real',
    "mg": "N/A (lubricating ophthalmic ointment/solution)",
    "purpose": "An ophthalmic lubricant (eye drops or ointment) used to relieve dry eyes, burning, and irritation caused by environmental factors or certain medical conditions.",
    "additionalInformation": "Available over-the-counter (OTC). Ointment form provides longer-lasting relief but can cause temporary blurred vision. Different formulations exist."
  },
  {
    "barcode": "8914455667788",
    "name": "Ear Wax Remover (various brands)",
    "price": 240,
     fakeOrReal: 'real',
    "mg": "Active ingredients vary (e.g., Carbamide peroxide, docusate sodium, mineral oil)",
    "purpose": "Used to soften and loosen earwax, facilitating its removal and relieving symptoms like hearing loss, discomfort, or fullness in the ear.",
    "additionalInformation": "Available over-the-counter (OTC). Follow instructions carefully. Consult a doctor if pain, discharge, or severe hearing loss occurs. Not for use with perforated eardrum."
  },
  {
    "barcode": "8915566778899",
    "name": "Ecoderm",
    "price": 200,
     fakeOrReal: 'real',
    "mg": "Active ingredients vary by specific Ecoderm product (often contains emollients, sometimes mild corticosteroids)",
    "purpose": "Generally refers to topical creams or lotions used to moisturize and protect the skin, often for dry, sensitive, or irritated skin conditions like eczema or dermatitis. Some formulations may contain active medications.",
    "additionalInformation": "Brand name may encompass various formulations. May be OTC or prescription depending on active ingredients. Check specific product for exact composition and purpose."
  },
  {
    "barcode": "8916677889900",
    "name": "Efacare",
    "price": 12,
     fakeOrReal: 'real',
    "mg": "N/A (often a brand of essential fatty acid supplements)",
    "purpose": "Typically a dietary supplement containing essential fatty acids (EFAs), often Omega-3 and Omega-6, used to support overall health, skin health, and inflammatory conditions.",
    "additionalInformation": "Available over-the-counter (OTC) as a supplement. Not a pharmaceutical drug in the same sense as the others. Dosages of fatty acids will vary by product."
  },
  {
    "barcode": "8917788990011",
    "name": "Emla Patch",
    "price": 250,
     fakeOrReal: 'real',
    "mg": "2.5% lidocaine and 2.5% prilocaine (total 5% lidocaine-prilocaine)",
    "purpose": "A topical anesthetic patch used to numb the skin before minor painful procedures such as needle insertions (e.g., blood draws, vaccinations), laser treatment, or skin surgeries.",
    "additionalInformation": "Contains lidocaine and prilocaine. Available over-the-counter (OTC) or with a prescription, depending on region. Apply to intact skin for a specified duration before the procedure. Not for use on broken skin or mucous membranes."
  },
  {
    "barcode": "8901234567890",
    "name": "Enoxaparin (generic)",
    "price": 25,
     fakeOrReal: 'real',
    "mg": "Commonly available in pre-filled syringes: 30mg, 40mg, 60mg, 80mg, 100mg, 120mg, 150mg (dose is often body weight-based)",
    "purpose": "A low molecular weight heparin (LMWH) used to prevent and treat deep vein thrombosis (DVT) and pulmonary embolism (PE), and to prevent complications in certain types of heart attacks and unstable angina.",
    "additionalInformation": "Administered by subcutaneous injection. Prescription required. Requires careful dosing, especially in patients with kidney impairment. Often used in hospital settings or for home administration after proper training."
  },
  {
    "barcode": "8902456789012",
    "name": "Entocort",
    "price": 100,
      fakeOrReal: 'real',
    "mg": "Typically 3mg, 6mg, 9mg (capsules); also available in other forms like oral suspension",
    "purpose": "A brand name for Budesonide, a corticosteroid primarily used to treat inflammatory bowel diseases like Crohn's disease (involving the ileum and/or ascending colon) and ulcerative colitis, as well as eosinophilic esophagitis.",
    "additionalInformation": "Available as delayed-release capsules or extended-release tablets. Designed to have a local effect in the gut, reducing systemic side effects common with other corticosteroids. Prescription required."
  },
  {
    "barcode": "8901987654321",
    "name": "Envarsus XR",
    "price": 500,
      fakeOrReal: 'real',
    "mg": "Extended-release tablets: 0.75 mg, 1 mg, 4 mg",
    "purpose": "An extended-release formulation of tacrolimus, an immunosuppressant medication used to prevent organ rejection in transplant patients (e.g., kidney, liver transplants).",
    "additionalInformation": "Prescription required. Taken once daily. Requires therapeutic drug monitoring (blood tests) to ensure appropriate levels and minimize side effects. Not interchangeable with other tacrolimus formulations (e.g., immediate-release). Can cause significant side effects."
  },
  {
    "barcode": "8903345678901",
    "name": "Ephedrine (nasal drops)",
    "price": 50,
      fakeOrReal: 'real',
    "mg": "Concentrations vary (e.g., 0.5% or 1% solution)",
    "purpose": "A decongestant used for temporary relief of nasal congestion due to colds, allergies, sinusitis, or hay fever. It works by narrowing blood vessels in the nose.",
    "additionalInformation": "Available over-the-counter (OTC) in many regions. Use for short periods only (typically 3-5 days) to avoid rebound congestion (rhinitis medicamentosa). May not be suitable for individuals with certain medical conditions like high blood pressure or heart disease."
  },
  {
    "barcode": "8904567890123",
    "name": "Epiclor",
    "price": 1000,
      fakeOrReal: 'real',
    "mg": "Varies by specific formulation",
    "purpose": "The name 'Epiclor' is not a universally recognized pharmaceutical drug; it could refer to a specific brand or product, possibly a disinfectant or a topical preparation. If it's related to 'EpiCor™', that's a postbiotic ingredient used in dietary supplements for immune support.",
    "additionalInformation": "Please provide more context or clarification for 'Epiclor' as it's not a standard drug name. If it refers to EpiCor™ as a supplement, it would contain fermented yeast product for immune health, not a pharmaceutical."
  },
  {
    "barcode": "8905678901234",
    "name": "Ergocalciferol",
    "price": 56.00,
      fakeOrReal: 'real',
    "mg": "Typically expressed in International Units (IU); 1 mg = 40,000 IU. Common strengths include 50,000 IU capsules or solution (e.g., 8000 IU/mL).",
    "purpose": "Vitamin D2. Used to treat or prevent vitamin D deficiency, hypoparathyroidism, and certain types of rickets (e.g., vitamin D-resistant rickets, familial hypophosphatemia).",
    "additionalInformation": "Oral capsule or solution. Available as both prescription and OTC, depending on the dosage. Dosage varies widely based on the condition being treated and the severity of deficiency. Requires monitoring of calcium and vitamin D levels."
  },
  {
    "barcode": "8906789012345",
    "name": "Erythromycin Ointment (eye)",
    "price": 500.00,
      fakeOrReal: 'real',
    "mg": "Typically 0.5% (5 mg/g)",
    "purpose": "A macrolide antibiotic ointment used to treat bacterial eye infections (e.g., conjunctivitis, blepharitis) and to prevent certain eye infections in newborns (ophthalmia neonatorum).",
    "additionalInformation": "Topical ophthalmic application. Prescription required. Can cause temporary blurred vision after application. Finish the full course of treatment even if symptoms improve to prevent resistance."
  },
  {
    "barcode": "8907890123456",
    "name": "Etap",
    "price": 20.00,
      fakeOrReal: 'real',
    "mg": "N/A - 'Etap' is not a standard pharmaceutical drug name. It might be a brand name for a specific product, or perhaps a typo.",
    "purpose": "Please provide more context or clarification for 'Etap'. It is not a recognized generic drug name in common pharmaceutical databases. If it is 'Etapiam', it is a brand name for Ethambutol.",
    "additionalInformation": "Without further context, it's impossible to provide accurate information for 'Etap'. It's possible it's a regional brand or a specific formulation I'm not familiar with, or a non-medicinal product."
  },
  {
    "barcode": "8908901234567",
    "name": "Ethambutol",
    "price": 250.00,
      fakeOrReal: 'real',
    "mg": "Typically 100mg, 400mg, 500mg tablets (dosage is weight-based, e.g., 15-25mg/kg)",
    "purpose": "An antitubercular medication used in combination with other drugs to treat active tuberculosis (TB). It works by stopping the growth of TB bacteria.",
    "additionalInformation": "Oral tablet. Prescription required. Must be used with other anti-TB drugs to prevent resistance. A significant side effect is optic neuritis (vision problems, including color blindness and decreased visual acuity), so regular eye exams are crucial during treatment. Can also cause joint pain, nausea, and vomiting."
  },
  {
    "barcode": "80725-243-30",
    "name": "Aciphex",
    "price": 95,
    "fakeOrReal": "real",
    "mg": "20mg Rabeprazole Sodium",
    "purpose": "Used to treat gastroesophageal reflux disease (GERD), duodenal ulcers, and to eradicate H. pylori bacteria.",
    "additionalInformation": "It's a proton pump inhibitor (PPI) that reduces stomach acid. Should be swallowed whole."
  },
  {
    "barcode": "M-30327",
    "name": "Acitretin",
    "price": 180,
    "fakeOrReal": "real",
    "mg": "25mg",
    "purpose": "An oral retinoid used to treat severe psoriasis and other skin disorders.",
    "additionalInformation": "Must not be used during pregnancy due to high risk of birth defects. Alcohol consumption should be avoided."
  },
  {
    "barcode": "3838989638009",
    "name": "Aclexa",
    "price": 70,
    "fakeOrReal": "real",
    "mg": "200mg",
    "purpose": "A nonsteroidal anti-inflammatory drug (NSAID) used to relieve symptoms of arthritis, such as inflammation, swelling, stiffness, and joint pain.",
    "additionalInformation": "It is a COX-2 inhibitor, which may have a lower risk of stomach side effects compared to other NSAIDs."
  },
  {
    "barcode": "8850150910015",
    "name": "Acne-Aid",
    "price": 25,
    "fakeOrReal": "real",
    "mg": "N/A (Medicated Bar)",
    "purpose": "A medicated soap bar for acne-prone and oily skin to help cleanse the skin and reduce pimples.",
    "additionalInformation": "Contains a balanced blend of a gentle degreasing agent and an effective cleanser. It is non-perfumed."
  },
  {
  "barcode": "8904298106814",
  "name": "Bromfenac Eye Drops",
  "price": 15.99,
  "fakeOrReal": "real",
  "mg": "0.09% (0.9 mg/mL)",
  "purpose": "Nonsteroidal anti-inflammatory drug (NSAID) for post-cataract surgery pain and inflammation",
  "additionalInformation":  "Use twice daily, avoid contact lenses during treatment",
},
{
  "barcode": "60081644002797",
  "name": "Bronkaid",
  "price": 12.99,
  "fakeOrReal": "real",
  "mg": "Ephedrine Sulfate 25mg, Guaifenesin 400mg",
  "purpose": "Temporary relief of mild asthma symptoms such as wheezing, tightness of chest, and shortness of breath.",
  "additionalInformation": "Bronkaid is an over-the-counter bronchodilator and expectorant. It helps loosen mucus and makes breathing easier. Should be used as directed and not as a replacement for prescription asthma medications."
},
{
  "barcode": "07891010245146",
  "name": "Budecort Aqua",
  "price": 8.49,
  "fakeOrReal": "real",
  "mg": "Budesonide 100mcg",
  "purpose": "Relief and prevention of nasal symptoms like congestion, sneezing, and runny nose caused by allergies (allergic rhinitis).",
  "additionalInformation": "Budecort Aqua is a corticosteroid nasal spray that reduces inflammation in the nasal passages. It is prescription-only and should be used regularly for best results."
},
{
  "barcode": "00487970101",
  "name": "Budesonide Inhalation Suspension",
  "price": 10.75,
  "fakeOrReal": "real",
  "mg": "Budesonide 0.5mg/2ml",
  "purpose": "Treatment and prevention of asthma symptoms such as wheezing and shortness of breath, especially in children.",
  "additionalInformation": "Budesonide Inhalation Suspension is a corticosteroid used via nebulizer to reduce inflammation in the airways. It is typically prescribed for long-term asthma control and should be used consistently for best results."
},
{
  "barcode": "45963-0142-90",
  "name": "Bupropion XL",
  "price": 9.99,
  "fakeOrReal": "real",
  "mg": "Bupropion Hydrochloride Extended-Release 150mg",
  "purpose": "Used to treat major depressive disorder (MDD) and to support smoking cessation efforts.",
  "additionalInformation": "Bupropion XL is an extended-release antidepressant that affects the neurotransmitters dopamine and norepinephrine. It is prescription-only and should not be used with other forms of bupropion. May take several weeks to see full effects."
},
{
  "barcode": "2801217602012",
  "name": "Burinex",
  "price": 6.80,
  "fakeOrReal": "real",
  "mg": "Bumetanide 1mg",
  "purpose": "Used to treat fluid retention (edema) associated with congestive heart failure, liver disease, or kidney disease.",
  "additionalInformation": "Burinex is a potent loop diuretic that works by helping the kidneys remove excess fluid and salt from the body. It is prescription-only and should be used under medical supervision to avoid dehydration or electrolyte imbalance."
},
{
  "barcode": "305913369016 ",
  "name": "Butalbital/Acetaminophen/Caffeine",
  "price": 11.99,
  "fakeOrReal": "real",
  "mg": "Butalbital 50mg / Acetaminophen 325mg / Caffeine 40mg",
  "purpose": "Used to relieve tension headaches caused by muscle contractions.",
  "additionalInformation": "This combination medication works by relaxing muscle contractions involved in tension headaches. It is available by prescription only and should be used with caution due to the risk of dependency from butalbital and liver damage from excessive acetaminophen use."
},
{
  "barcode": "304561410903",
  "name": "Bystolic",
  "price": 13.49,
  "fakeOrReal": "real",
  "mg": "Nebivolol 5mg",
  "purpose": "Used to treat high blood pressure (hypertension) by helping the heart beat more efficiently.",
  "additionalInformation": "Bystolic is a beta-blocker that lowers blood pressure and reduces the risk of strokes and heart attacks. It is prescription-only and should be taken regularly as directed. It may cause dizziness or fatigue in some patients."
},
{
  "barcode": "851273002015",
  "name": "C. Difficile Test Kit",
  "price": 24.99,
  "fakeOrReal": "real",
  "mg": "N/A",
  "purpose": "Used to detect the presence of Clostridioides difficile toxins in stool samples for diagnosing C. difficile infection.",
  "additionalInformation": "This diagnostic kit is commonly used in clinical laboratories to identify C. difficile, a bacterium that can cause severe diarrhea and colitis. Results help guide treatment decisions. It must be used as per the instructions by trained professionals or under medical guidance."
},
 {
    "barcode": "36050529960",
    "name": "Duloxetine",
    "price": 35,
    "fakeOrReal": "real",
    "mg": "60mg",
    "purpose": "Antidepressant, nerve pain",
    "additionalInformation": "Take with food"
  },
  {
    "barcode": "300743012071",
    "name": "Duopa",
    "price": 1200,
    "fakeOrReal": "real",
    "mg": "4.63/20mg/ml",
    "purpose": "Parkinson’s disease",
    "additionalInformation": "Administered via pump"
  },
  {
    "barcode": "301730784018",
    "name": "Dynacirc CR",
    "price": 45,
    "fakeOrReal": "real",
    "mg": "5mg",
    "purpose": "Hypertension",
    "additionalInformation": "Controlled-release, take daily"
  },
  {
    "barcode": "03582186006207",
    "name": "Dysport",
    "price": 800,
    "fakeOrReal": "real",
    "mg": "500 units",
    "purpose": "Muscle spasms, cosmetic",
    "additionalInformation": "Injectable, by professional only"
  },
  {
    "barcode": "396315303028",
    "name": "Ciprofloxacin Ear Drops",
    "price": 20,
    "fakeOrReal": "real",
    "mg": "0.3%",
    "purpose": "Ear infections",
    "additionalInformation": "Generic antibiotic, shake well"
  },
  {
    "barcode": "8698856350305",
    "name": "Elidel",
    "price": 90,
    "fakeOrReal": "real",
    "mg": "1%",
    "purpose": "Eczema treatment",
    "additionalInformation": "Pimecrolimus, apply thin layer"
  },
  {
    "barcode": "7501092722564",
    "name": "Edarbi",
    "price": 40,
    "fakeOrReal": "real",
    "mg": "40mg",
    "purpose": "Hypertension",
    "additionalInformation": "Take once daily"
  },
  {
    "barcode": "300025123303",
    "name": "Effient",
    "price": 45,
    "fakeOrReal": "real",
    "mg": "10mg",
    "purpose": "Antiplatelet, heart attack prevention",
    "additionalInformation": "Take with aspirin"
  },
  {
    "barcode": "8901226102145",
    "name": "Eflornithine Cream",
    "price": 80,
    "fakeOrReal": "real",
    "mg": "13.9%",
    "purpose": "Facial hair reduction",
    "additionalInformation": "Apply twice daily"
  },
  {
    "barcode": "5909990053742",
    "name": "Elaprase",
    "price": 5000,
    "fakeOrReal": "real",
    "mg": "2mg/ml",
    "purpose": "Hunter syndrome treatment",
    "additionalInformation": "IV infusion, hospital use"
  },
  {
    "barcode": "6178901234567",
    "name": "Eldec Multivitamin",
    "price": 25,
    "fakeOrReal": "real",
    "mg": "N/A",
    "purpose": "Vitamin supplement",
    "additionalInformation": "Take with meals"
  },
  {
    "barcode": "55280060000",
    "name": "Eletriptan",
    "price": 35,
    "fakeOrReal": "real",
    "mg": "40mg",
    "purpose": "Migraine treatment",
    "additionalInformation": "Take at onset of migraine"
  },
  {
    "barcode": "6190123456789",
    "name": "Eligard",
    "price": 600,
    "fakeOrReal": "real",
    "mg": "22.5mg",
    "purpose": "Prostate cancer treatment",
    "additionalInformation": "Injectable, every 3 months"
  },
  {
    "barcode": "6201234567890",
    "name": "Elimite",
    "price": 40,
    "fakeOrReal": "real",
    "mg": "5%",
    "purpose": "Scabies treatment",
    "additionalInformation": "Apply to entire body"
  },
  {
    "barcode": "6212345678901",
    "name": "Elitek",
    "price": 2000,
    "fakeOrReal": "real",
    "mg": "1.5mg",
    "purpose": "Uric acid reduction, cancer therapy",
    "additionalInformation": "IV infusion, hospital use"
  },
  {
    "barcode": "6223456789012",
    "name": "Eliquis",
    "price": 55,
    "fakeOrReal": "real",
    "mg": "5mg",
    "purpose": "Blood thinner, stroke prevention",
    "additionalInformation": "Take twice daily"
  },
  {
    "barcode": "6234567890123",
    "name": "Elocon Lotion",
    "price": 30,
    "fakeOrReal": "real",
    "mg": "0.1%",
    "purpose": "Eczema, dermatitis treatment",
    "additionalInformation": "Mometasone, apply sparingly"
  },
  {
    "barcode": "6245678901234",
    "name": "Eloctate",
    "price": 2500,
    "fakeOrReal": "real",
    "mg": "1000 IU",
    "purpose": "Hemophilia A treatment",
    "additionalInformation": "IV injection, as prescribed"
  },
  {
    "barcode": "6256789012345",
    "name": "Elores",
    "price": 60,
    "fakeOrReal": "real",
    "mg": "1.5g",
    "purpose": "Antibiotic, severe infections",
    "additionalInformation": "IV use, hospital administration"
  },
  {
    "barcode": "6267890123456",
    "name": "Elosulfase Alpha",
    "price": 6000,
    "fakeOrReal": "real",
    "mg": "1mg/ml",
    "purpose": "Mucopolysaccharidosis IVA",
    "additionalInformation": "Weekly IV infusion"
  },
  {
    "barcode": "6278901234567",
    "name": "Eloxatin",
    "price": 1500,
    "fakeOrReal": "real",
    "mg": "100mg",
    "purpose": "Colorectal cancer treatment",
    "additionalInformation": "IV chemotherapy, hospital use"
  },
  {
    "barcode": "6289012345678",
    "name": "Embeda",
    "price": 80,
    "fakeOrReal": "real",
    "mg": "20/0.8mg",
    "purpose": "Chronic pain relief",
    "additionalInformation": "Extended-release, prescription only"
  },
  {
    "barcode": "6290123456789",
    "name": "Emcyt",
    "price": 100,
    "fakeOrReal": "real",
    "mg": "140mg",
    "purpose": "Prostate cancer treatment",
    "additionalInformation": "Take on empty stomach"
  },
  {
    "barcode": "6301234567890",
    "name": "Emedastine Eye Drops",
    "price": 25,
    "fakeOrReal": "real",
    "mg": "0.05%",
    "purpose": "Allergic conjunctivitis",
    "additionalInformation": "Use twice daily"
  },
  {
    "barcode": "6312345678901",
    "name": "EMLA Cream",
    "price": 35,
    "fakeOrReal": "real",
    "mg": "2.5%/2.5%",
    "purpose": "Topical anesthetic",
    "additionalInformation": "Apply 1 hour before procedure"
  },
  {
    "barcode": "6323456789012",
    "name": "Empagliflozin/Linagliptin",
    "price": 60,
    "fakeOrReal": "real",
    "mg": "25/5mg",
    "purpose": "Diabetes management",
    "additionalInformation": "Take once daily"
  },
  {
    "barcode": "6334567890123",
    "name": "Empro",
    "price": 20,
    "fakeOrReal": "real",
    "mg": "N/A",
    "purpose": "Digestive health supplement",
    "additionalInformation": "Take with meals"
  },
  {
    "barcode": "6345678901234",
    "name": "Emtriva",
    "price": 150,
    "fakeOrReal": "real",
    "mg": "200mg",
    "purpose": "HIV treatment",
    "additionalInformation": "Take with other antiretrovirals"
  },
  {
    "barcode": "6356789012345",
    "name": "Enbrel SureClick",
    "price": 2000,
    "fakeOrReal": "real",
    "mg": "50mg/ml",
    "purpose": "Rheumatoid arthritis, psoriasis",
    "additionalInformation": "Inject weekly"
  },
  {
    "barcode": "6367890123456",
    "name": "Encainide",
    "price": 40,
    "fakeOrReal": "real",
    "mg": "25mg",
    "purpose": "Arrhythmia treatment",
    "additionalInformation": "Monitor heart rhythm"
  },
  {
    "barcode": "6378901234567",
    "name": "Endocet",
    "price": 50,
    "fakeOrReal": "real",
    "mg": "5/325mg",
    "purpose": "Pain relief",
    "additionalInformation": "Contains oxycodone/acetaminophen"
  },
  {
    "barcode": "6389012345678",
    "name": "Endocrine Supplements",
    "price": 30,
    "fakeOrReal": "real",
    "mg": "N/A",
    "purpose": "Hormonal balance support",
    "additionalInformation": "Consult doctor before use"
  },
  {
    "barcode": "6390123456789",
    "name": "Enestro",
    "price": 45,
    "fakeOrReal": "real",
    "mg": "N/A",
    "purpose": "Hormone replacement therapy",
    "additionalInformation": "Prescription only"
  },
  {
    "barcode": "6401234567890",
    "name": "Enoxaparin Sodium",
    "price": 55,
    "fakeOrReal": "real",
    "mg": "40mg",
    "purpose": "Blood thinner, clot prevention",
    "additionalInformation": "Injectable, monitor for bleeding"
  },
  {
    "barcode": "6412345678901",
    "name": "Enpresse",
    "price": 25,
    "fakeOrReal": "real",
    "mg": "0.15/0.03mg",
    "purpose": "Oral contraceptive",
    "additionalInformation": "Take daily at same time"
  },
  {
    "barcode": "6423456789012",
    "name": "Enstilar Foam",
    "price": 80,
    "fakeOrReal": "real",
    "mg": "0.005%/0.064%",
    "purpose": "Psoriasis treatment",
    "additionalInformation": "Apply once daily"
  },
  {
    "barcode": "6434567890123",
    "name": "Entacapone",
    "price": 35,
    "fakeOrReal": "real",
    "mg": "200mg",
    "purpose": "Parkinson’s disease adjunct",
    "additionalInformation": "Take with levodopa"
  },
  {
    "barcode": "6445678901234",
    "name": "Enterogermina",
    "price": 20,
    "fakeOrReal": "real",
    "mg": "2 billion spores",
    "purpose": "Probiotic, gut health",
    "additionalInformation": "Mix with water"
  },
  {
    "barcode": "6456789012345",
    "name": "Entyvio",
    "price": 3500,
    "fakeOrReal": "real",
    "mg": "300mg",
    "purpose": "Ulcerative colitis, Crohn’s",
    "additionalInformation": "IV infusion, hospital use"
  },
  {
    "barcode": "6467890123456",
    "name": "Envirotabs",
    "price": 15,
    "fakeOrReal": "real",
    "mg": "N/A",
    "purpose": "Water purification",
    "additionalInformation": "Dissolve in water"
  },
  {
    "barcode": "6478901234567",
    "name": "Epclusa",
    "price": 15000,
    "fakeOrReal": "real",
    "mg": "400/100mg",
    "purpose": "Hepatitis C treatment",
    "additionalInformation": "Take once daily"
  },
  {
    "barcode": "6489012345678",
    "name": "Epidiolex",
    "price": 1000,
    "fakeOrReal": "real",
    "mg": "100mg/ml",
    "purpose": "Seizure treatment",
    "additionalInformation": "Oral solution, shake well"
  },
  {
    "barcode": "6490123456789",
    "name": "Epinephrine",
    "price": 150,
    "fakeOrReal": "real",
    "mg": "0.3mg",
    "purpose": "Allergic reaction treatment",
    "additionalInformation": "Injectable, emergency use"
  },
  {
    "barcode": "6501234567890",
    "name": "EpiPen Jr.",
    "price": 150,
    "fakeOrReal": "real",
    "mg": "0.15mg",
    "purpose": "Allergic reaction treatment",
    "additionalInformation": "For children 33-66 lbs"
  },
  {
    "barcode": "6512345678901",
    "name": "EpiPen Trainer",
    "price": 50,
    "fakeOrReal": "real",
    "mg": "N/A",
    "purpose": "Training for EpiPen use",
    "additionalInformation": "Non-medicated device"
  },
  {
    "barcode": "6523456789012",
    "name": "Epivir HBV",
    "price": 200,
    "fakeOrReal": "real",
    "mg": "100mg",
    "purpose": "Hepatitis B treatment",
    "additionalInformation": "Take once daily"
  },
  {
    "barcode": "6534567890123",
    "name": "Epoetin Alfa",
    "price": 500,
    "fakeOrReal": "real",
    "mg": "4000 IU",
    "purpose": "Anemia treatment",
    "additionalInformation": "Injectable, monitor hemoglobin"
  },
  {
    "barcode": "6545678901234",
    "name": "Eprex",
    "price": 550,
    "fakeOrReal": "real",
    "mg": "4000 IU",
    "purpose": "Anemia in kidney disease",
    "additionalInformation": "Subcutaneous injection"
  },
  {
    "barcode": "6556789012345",
    "name": "Ergocalciferol",
    "price": 20,
    "fakeOrReal": "real",
    "mg": "50000 IU",
    "purpose": "Vitamin D deficiency",
    "additionalInformation": "Take weekly"
  },
  {
    "barcode": "6578901234567",
    "name": "Ertapenem",
    "price": 100,
    "fakeOrReal": "real",
    "mg": "1g",
    "purpose": "Antibiotic, severe infections",
    "additionalInformation": "IV use, hospital administration"
  },
  {
    "barcode": "6589012345678",
    "name": "Erygel",
    "price": 30,
    "fakeOrReal": "real",
    "mg": "2%",
    "purpose": "Acne treatment",
    "additionalInformation": "Apply to affected area"
  },
  {
    "barcode": "6590123456789",
    "name": "Erythromycin Ophthalmic",
    "price": 25,
    "fakeOrReal": "real",
    "mg": "0.5%",
    "purpose": "Eye infections",
    "additionalInformation": "Apply to eyes twice daily"
  },
  {
    "barcode": "6601234567890",
    "name": "Escitalopram Oxalate",
    "price": 30,
    "fakeOrReal": "real",
    "mg": "20mg",
    "purpose": "Antidepressant, anxiety",
    "additionalInformation": "Take in morning"
  },
  {
    "barcode": "6612345678901",
    "name": "Esclar Cream",
    "price": 40,
    "fakeOrReal": "real",
    "mg": "N/A",
    "purpose": "Skin brightening, hydration",
    "additionalInformation": "Apply twice daily"
  },
  {
    "barcode": "6623456789012",
    "name": "Esomeprazole Injection",
    "price": 50,
    "fakeOrReal": "real",
    "mg": "40mg",
    "purpose": "Acid reflux, ulcers",
    "additionalInformation": "IV use, hospital administration"
  },
  {
    "barcode": "6634567890123",
    "name": "Estazolam",
    "price": 35,
    "fakeOrReal": "real",
    "mg": "2mg",
    "purpose": "Insomnia treatment",
    "additionalInformation": "Take at bedtime"
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