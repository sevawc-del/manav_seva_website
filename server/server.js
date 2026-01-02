const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message, err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
