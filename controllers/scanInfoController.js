const supabase = require('../config/db'); // Supabase client

// POST: upload scan info
exports.uploadScanInfo = async (req, res) => {
    try {
        const { medicineName, medicineCompany, longitude, latitude, dateTime, potency, status } = req.body;

        if (!medicineName || !medicineCompany || !dateTime || !status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const { data, error } = await supabase
            .from('scan_info')
            .insert([
                { medicineName, medicineCompany, longitude, latitude, dateTime, potency, status }
            ])
            .select(); // returns inserted row

        if (error) throw error;

        res.status(201).json({ message: "Scan info uploaded successfully", id: data[0].id });
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).json({ message: "Database error", error: err.message });
    }
};

// GET: all scan info
exports.getAllScanInfo = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('scan_info')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Database error", error: err.message });
    }
};

// GET: by company name
exports.getByCompany = async (req, res) => {
    try {
        const { company } = req.params;

        const { data, error } = await supabase
            .from('scan_info')
            .select('*')
            .eq('medicineCompany', company);

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Database error", error: err.message });
    }
};

// GET: company authentic scans
exports.getCompanyAuthenticScans = async (req, res) => {
    try {
        const { company } = req.params;

        const { data, error } = await supabase
            .from('scan_info')
            .select('*')
            .eq('medicineCompany', company)
            .eq('status', 'authentic');

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Database error", error: err.message });
    }
};

// GET: company fake scans
exports.getCompanyFakeScans = async (req, res) => {
    try {
        const { company } = req.params;

        const { data, error } = await supabase
            .from('scan_info')
            .select('*')
            .eq('medicineCompany', company)
            .eq('status', 'fake');

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Database error", error: err.message });
    }
};
