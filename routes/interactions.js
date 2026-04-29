const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// express interest in a listing
router.post('/', authMiddleware, async (req, res) => {
    const { listing_id, type } = req.body;

    if (!listing_id || !type) {
        return res.status(400).json({ error: 'Listing ID and type are required' });
    }

    //check if listing exists and is approved
    const listing = await pool.query('SELECT id , user_id FROM listings WHERE id = $1 ', [listing_id]);
    
    if (listing.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found' });
    }
    
    if (listing.rows[0].user_id === req.user.id) {
        return res.status(400).json({ error: 'You cannot express interest in your own listing' });
    }

    //prevents duplicate 
    const existing = await pool.query(
        'SELECT id FROM interactions WHERE user_id = $1 AND listing_id = $2 AND type = $3',
        [req.user.id, listing_id, type]
    );

    if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'You have already expressed this interest in this listing' });
    }

    const result = await pool.query(
        'INSERT INTO interactions (user_id, listing_id, type) VALUES ($1, $2, $3) RETURNING *',
        [req.user.id, listing_id, type]
    );

    res.status(201).json(result.rows[0]);
});

// get interactions for a listing 
router.get('/mine', authMiddleware,async (req, res) => {
    const result = await pool.query(
        `SELECT i.*, u.full_name, l.title AS listing_title
        FROM interactions i
        JOIN users u ON i.user_id = u.id
        JOIN listings l ON i.listing_id = l.id
        WHERE i.user_id = $1
        ORDER BY i.created_at DESC`,
        [req.user.id]
    );
    res.json(result.rows);
});

module.exports = router; 