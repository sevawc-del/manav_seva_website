const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created');
}

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

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');

    // Auto-seed admin user if enabled and doesn't exist
    if (process.env.SEED_ADMIN === 'true') {
      try {
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
          throw new Error('Missing ADMIN_USERNAME, ADMIN_EMAIL, or ADMIN_PASSWORD for admin seeding');
        }

        const existingAdmin = await User.findOne({ role: 'admin' });
        if (!existingAdmin) {
          const hashedPassword = await bcrypt.hash(
            ADMIN_PASSWORD,
            10
          );

          const adminUser = new User({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin'
          });

          await adminUser.save();
          console.log('✅ Admin user auto-seeded successfully');
          console.log('Email:', adminUser.email);
          console.log('⚠️  Remember to set SEED_ADMIN=false after first deployment');
        } else {
          console.log('ℹ️  Admin user already exists, skipping auto-seed');
        }
      } catch (error) {
        console.error('❌ Error auto-seeding admin:', error);
      }
    }

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
    app.use('/api/jobs', require('./routes/jobRoutes'));
    app.use('/api/volunteers', require('./routes/volunteerRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));

    // Error handler (keep LAST)
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(err.status || 500).json({
        message: err.status && err.status < 500 ? 'Request failed' : 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
