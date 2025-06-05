const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());

// Preflight OPTIONS requests
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Static file serving
app.use('/images-db', express.static(path.join(__dirname, 'images-db')));
app.use(express.static(path.join(__dirname, 'public')));

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
