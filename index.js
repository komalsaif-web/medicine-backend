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
const feedbackRoute = require('./routes/feedbackRoutes');
const purchaseRoute = require('./routes/purchaseRoutes');
const authRoute = require('./routes/authRoutes');
const ratingRoute = require('./routes/ratingRoutes');
const googleRoutes = require('./routes/googleUserRoutes')
const medicineProduct = require('./routes/medicineRoutes')
const scanInfoRoutes = require('./routes/scanInfoRoutes');
// API endpoints
app.use('/api', feedbackRoute);
app.use('/api', purchaseRoute);
app.use('/api', authRoute);
app.use('/api', ratingRoute);
app.use('/api', googleRoutes);
app.use('/api', medicineProduct);
app.use('/api', scanInfoRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Pharmacy Medicine API');
});

// Export for Vercel
module.exports = app;
