const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files (if any)
app.use('/images-db', express.static(path.join(__dirname, 'images-db')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const imageRoutes = require('./routes/imageRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const verifyImageRoute = require('./routes/verifyImageRoute');

// API endpoints
app.use('/api', verifyImageRoute);
app.use('/images', imageRoutes);
app.use('/medicines', medicineRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Pharmacy Medicine API');
});

// Export for Vercel
module.exports = app;
