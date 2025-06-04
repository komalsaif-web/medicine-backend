const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images-db', express.static(path.join(__dirname, 'images-db')));
app.use(express.static(path.join(__dirname, 'public'))); // Serve favicon.ico and favicon.png from public

// Routes
const imageRoutes = require('./routes/imageRoutes');
const medicineRoutes = require('./routes/medicineRoutes');

app.use('/images', imageRoutes);
app.use('/medicines', medicineRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Pharmacy Medicine API');
});

// Export for Vercel
module.exports = app;