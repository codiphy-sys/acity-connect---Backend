const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// send a message to a listing owner
router.post('/', authMiddleware, async (req, res) => {
    const { receiver_id, listing_id, body } = req.body;

    if (!receiver_id || !listing_id || !body) {
        return res.status(400).json({ error: 'Receiver, listing, and message body are required' });
    }
    
    if (receiver_id === req.user.id){
        return res.status(400).json({ error: 'You cannot send a message to yourself' });
    }

    const result = await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, listing_id, body) 
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.user.id, receiver_id, listing_id || null, body]
    );

    res.status(201).json(result.rows[0]);
});

//get all my messages
router.get('/', authMiddleware, async(req,res) =>{
    const result = await pool.query(
        `SELECT m.*,
        s.full_name AS sender_name,
        r.full_name AS receiver_name
        FROM messages m
        JOIN users s ON m.sender_id = s.id
        JOIN users r ON m.receiver_id = r.id
        WHERE m.sender_id = $1 OR m.receiver_id = $1
        ORDER BY m.created_at ASC`,
        [req.user.id]
    );
    res.json(result.rows);
});

// marking all messages as read 
router.patch('/read/:sender_id', authMiddleware, async(req,res) => {
    await pool.query(
        `UPDATE messages SET is_read = TRUE
        WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
        [req.params.sender_id, req.user.id]
    );
    res.json({ message: 'Messages marked as read' });   
    
});

module.exports = router;