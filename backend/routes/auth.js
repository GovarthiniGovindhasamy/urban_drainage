const express = require('express');
const db = require('../db');
const router = express.Router();

// 1. REGISTER
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, phone, zone, password } = req.body;

        // In production, encrypt your password using bcrypt before saving!
        // const bcrypt = require('bcrypt');
        // const hash = await bcrypt.hash(password, 10);
        const hash = password;

        const [result] = await db.query(
            'INSERT INTO users (full_name, email, phone, zone, password_hash) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, phone, zone, hash]
        );

        res.status(201).json({ message: 'User created', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: error.message });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = rows[0];

        // In production: await bcrypt.compare(password, user.password_hash)
        if (user.password_hash !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // In production: generate and return a JWT token here
        res.json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.full_name } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
