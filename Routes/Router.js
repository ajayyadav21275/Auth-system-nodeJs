const express = require('express');
const router = express.Router(); 

const { registerUser, loginUser, getUserProfile } = require('../controllers/UserController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route - JWT token required
router.get('/profile', authenticateToken, getUserProfile);

module.exports = router;  