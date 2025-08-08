const pool = require('../config/db'); // PostgreSQL pool connection

// POST: upload scan info
exports.uploadScanInfo = async (req, res) => {
    try {
        const { medicineName, medicineCompany, longitude, latitude, dateTime, potency, status } = req.body;

        if (!medicineName || !medicineCompany || !dateTime || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const query = `
            INSERT INTO scan_info (medicineName, medicineCompany, longitude, latitude, dateTime, potency, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `;

        const values = [medicineName, medicineCompany, longitude, latitude, dateTime, potency, status];
        const result = await pool.query(query, values);

        res.status(201).json({ message: "Scan info uploaded successfully", id: result.rows[0].id });
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).json({ message: "Database error", error: err.message });
    }
};

// GET: all scan info
exports.getAllScanInfo = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM scan_info ORDER BY created_at DESC`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Database error", error: err.message });
    }
};

// GET: by company name
exports.getByCompany = async (req, res) => {
    try {
        let { company } = req.params;

        // Normalize input: lowercase and remove spaces
        company = company.toLowerCase().replace(/\s+/g, '');

        const query = `
            SELECT * 
            FROM scan_info 
            WHERE REPLACE(LOWER(medicineCompany), ' ', '') = $1
        `;

        const result = await pool.query(query, [company]);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ 
            message: "Database error", 
            error: err.message 
        });
    }
};


// GET: company authentic scans
exports.getCompanyAuthenticScans = async (req, res) => {
    try {
        const { company } = req.params;
        const result = await pool.query(
            `SELECT * FROM scan_info WHERE medicineCompany = $1 AND status = 'authentic'`,
            [company]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Database error", error: err.message });
    }
};

// GET: company fake scans
exports.getCompanyFakeScans = async (req, res) => {
    try {
        const { company } = req.params;
        const result = await pool.query(
            `SELECT * FROM scan_info WHERE medicineCompany = $1 AND status = 'fake'`,
            [company]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: "Database error", error: err.message });
    }
};
