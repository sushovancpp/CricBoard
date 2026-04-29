const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Dummy user for example purposes
const user = { username: 'user', password: 'password' }; // stored secret (insecure for demo)

// Authentication endpoint
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate user credentials (in a real app, you'd fetch this from a database)
    if (username === user.username && password === user.password) {
        // Generate token
        const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });
        return res.json({ token });
    }

    // Invalid credentials
    return res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;