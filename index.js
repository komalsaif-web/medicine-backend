const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images-db', express.static('images-db'));  // Static serving of images

// Routes
const imageRoutes = require('./routes/imageRoutes');
const medicineRoutes = require('./routes/medicineRoutes');

app.use('/images', imageRoutes);
app.use('/medicines', medicineRoutes);

// Start
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
