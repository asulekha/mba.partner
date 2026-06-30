require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');         // ← was missing in the uploaded server.js
const dashboardRoutes = require('./routes/dashboardRoutes'); // ← NEW
const { notFound, errorHandler } = require('./middleware/errorHandler');

connectDB();

const app = express();

app.use(helmet());

// Allow both the live Netlify site and local dev servers to call this API.
const allowedOrigins = [
  'https://astaaa.netlify.app',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, mobile apps, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS: ' + origin));
      }
    },
    credentials: true, // allow the auth_token cookie to be sent/received
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);           // ← was missing in the uploaded server.js
app.use('/api/dashboard', dashboardRoutes);    // ← NEW

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
