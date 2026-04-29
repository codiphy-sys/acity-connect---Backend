const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

//get all approved listings with optional search query
router.get('/', async (req, res) => {
    const {search,category,status} = req.query;

    let query = `SELECT l.*, u.full_name, u.avatar_url
    FROM listings l
     JOIN users u ON l.user_id = u.id
      WHERE l.is_approved = TRUE`;

      const values = [];

      if (search) {
        values.push(`%${search}%`);
        query += ` AND (l.title ILIKE $${values.length} OR l.description ILIKE $${values.length})`;
    }

    if (category) {
        values.push(category);
        query += ` AND l.category = $${values.length}`;
    }

    if (status) {
        values.push(status);
        query += ` AND l.status = $${values.length}`;
    }

    query += ' ORDER BY l.created_at DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
      });

//get a single listing by id
router.get('/:id', async (req, res) => {
  const result = await pool.query(
    `SELECT l.*, u.full_name, u.avatar_url, u.bio 
     FROM listings l 
     JOIN users u ON l.user_id = u.id 
     WHERE l.id = $1`,
    [req.params.id]
  );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(result.rows[0]);
});

//create a new listing
router.post('/', authMiddleware, async (req, res) => {
    const { title, description, category, price } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    const result = await pool.query(
        'INSERT INTO listings (user_id, title, description, category, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [req.user.id, title, description, category, price]
    );
    res.status(201).json(result.rows[0]);
});

//update a listing 
router.patch('/:id', authMiddleware, async (req, res) => {
    const { title, description, category, price, status } = req.body;

    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found' });
    }

    if (result.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    const updateResult = await pool.query(
        `UPDATE listings
         SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            price = COALESCE($3, price),
            status = COALESCE($4, status)
        WHERE id = $5
        RETURNING *`,
        [title, description, price, status, req.params.id]
    );

    res.json(updateResult.rows[0]);
});


//delete a listing
router.delete('/:id', authMiddleware, async (req, res) => {
    const result = await pool.query('SELECT * FROM listings WHERE id = $1', [req.params.id]);   

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found' });
    }

    if (result.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    await pool.query('DELETE FROM listings WHERE id = $1', [req.params.id]);
    res.json({ message: 'Listing deleted successfully' });
});

module.exports = router;