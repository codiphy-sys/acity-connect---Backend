const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// get a user profile by id
router.get('/:id', async (req, res) => {
    const result = await pool.query(
    'SELECT id, full_name, email, bio, skills_offered, skills_needed, avatar_url,role, created_at FROM users WHERE id=$1', 
    [req.params.id]
);

if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
}

res.json(result.rows[0]);
});

//get my own listings 
router.get('/me/listings', authMiddleware, async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
    );
    res.json(result.rows);
});

//update my profile
router.patch('/me', authMiddleware, async (req, res) => {
    const { full_name, bio, skills_offered, skills_needed } = req.body;

    const result = await pool.query(
        'UPDATE users SET full_name = COALESCE($1, full_name), bio = COALESCE($2, bio), skills_offered = COALESCE($3, skills_offered), skills_needed = COALESCE($4, skills_needed) WHERE id = $5 RETURNING id, full_name, email, bio, skills_offered, skills_needed, avatar_url',
        [full_name, bio, skills_offered, skills_needed, req.user.id]
    );
    res.json(result.rows[0]);
});

module.exports = router;