const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all requests
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM requests ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new complaint request
router.post('/', async (req, res) => {
    try {
        const {
            user_id, title, category, description, latitude, longitude,
            address, area, pincode, landmark, ward, priority
        } = req.body;

        const [result] = await db.query(`
      INSERT INTO requests 
      (user_id, title, category, description, latitude, longitude, address, area, pincode, landmark, ward, priority) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id || null, title, category, description, latitude, longitude, address, area, pincode, landmark, ward, priority || 'medium']
        );

        res.status(201).json({ message: 'Request created', requestId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update request status
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE requests SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Request updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
