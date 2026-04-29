const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { parse } = require('node:path');
const router = express.Router();

//all admin routes require login and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

//get platform stats 
router.get('/stats', async (req ,res) => {
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const listings = await pool.query('SELECT COUNT(*) FROM listings');
    const pending = await pool.query('SELECT COUNT(*) FROM listings WHERE is_approved = FALSE');
    const interactions = await pool.query('SELECT COUNT(*) FROM interactions');

    res.json({
        users: parseInt(users.rows[0].count),
        listings: parseInt(listings.rows[0].count),
        pending: parseInt(pending.rows[0].count),
        interactions: parseInt(interactions.rows[0].count)
    });
});

//get listings optional filter 
router.get('/listings', async (req ,res) => {
    const {filter} = req.query;

    let query = `SELECT l.*, u.full_name FROM listings l 
    JOIN users u ON l.user_id = u.id`;

    if (filter === 'pending') {
        query += ' WHERE l.is_approved = FALSE';
    } else if (filter === 'approved') {
        query += ' WHERE l.is_approved = TRUE';
    }

    query += ' ORDER BY l.created_at DESC';

    const result = await pool.query(query);
    res.json(result.rows);
});

//approve a listing
router.patch('/listings/:id/approve', async (req, res)=> {
    const result = await pool.query(
        'UPDATE listings SET is_approved = TRUE WHERE id = $1 RETURNING *',
        [req.params.id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(result.rows[0]);
});

//delete a listing
router.delete('/listings/:id', async (req, res)=>{
    const result = await pool.query(
        'DELETE FROM listings WHERE id = $1 RETURNING id',
        [req.params.id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ message: 'Listing deleted' });
});
   
//get all users
router.get('/users', async (req, res) => {
    const result = await pool.query(
        'SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
});

// update user roole 
router.patch('/users/:id/role', async(req, res) => {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    const result = await pool.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, full_name, email, role',
        [role, req.params.id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
});

module.exports = router;