const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000; // ✅ Port changed from 5432 to avoid conflict

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images-db', express.static('images-db'));  // Serve static images from folder

// Routes
const imageRoutes = require('./routes/imageRoutes');
const medicineRoutes = require('./routes/medicineRoutes');

app.use('/images', imageRoutes);
app.use('/medicines', medicineRoutes);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
