const express = require('express');
const db = require('../db');
const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, full_name, email, phone, zone, role, created_at FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user profile
router.put('/:id', async (req, res) => {
    try {
        const { full_name, phone, zone } = req.body;

        await db.query(
            'UPDATE users SET full_name = ?, phone = ?, zone = ? WHERE id = ?',
            [full_name, phone, zone, req.params.id]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
