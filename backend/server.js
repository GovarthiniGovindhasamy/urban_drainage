const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db'); // Will trigger connection & table creation

const app = express();

// Allow all origins — required so phones on the same WiFi can reach the API
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const profileRoutes = require('./routes/profile');

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/profile', profileRoutes);

// Test Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
