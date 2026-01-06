const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Trust proxy for Render / Vercel
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL
  ].filter(Boolean), // prevents undefined issues
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/sliders', require('./routes/sliderRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/tenders', require('./routes/tenderRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/about', require('./routes/aboutRoutes'));
app.use('/api', require('./routes/activityRoutes'));
app.use('/api', require('./routes/adminActivityRoutes'));
app.use('/api', require('./routes/geographicActivityRoutes'));
app.use('/api/journeys', require('./routes/journeyRoutes'));

// Error handler (keep LAST)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
