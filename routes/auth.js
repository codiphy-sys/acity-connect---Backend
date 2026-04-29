const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { error } = require('node:console');

const router = express.Router();

const ALLOWED_DOMAIN = '@acity.edu.gh';

//register
router.post('/register', async (req, res) => {
    const { email, password, full_name } = req.body;

if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
}

if (!email.endsWith(ALLOWED_DOMAIN)) {
    return res.status(400).json({ error: 'Invalid email domain' });
}

const existing =await pool.query('SELECT id FROM users WHERE email = $1', [email]);
if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Email already registered' });
}

const password_hash = await bcrypt.hash(password, 10);

const result = await pool.query(
    'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, role',
    [email, password_hash, full_name]
);

const user = result.rows[0];
const token = jwt.sign({ id: user.id, email: user.email,  role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' });

res.status(201).json({token, user});
});

//login section 
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '7d' });

        res.json({ 
    token,
    user: {
        id: user.id, 
        email: user.email, 
        full_name: user.full_name, 
        role: user.role
    }
});
});

module.exports = router;