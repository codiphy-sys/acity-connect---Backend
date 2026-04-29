require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({origin: process.env.FRONTEND_URL || '*'}));
app.use(express.json());

// Import routes so we can use them
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/interactions', require('./routes/interactions'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

app.get('health', (req, res) => {
    res.status(200).json({status: 'ok'});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});