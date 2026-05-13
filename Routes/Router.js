const express = require('express');
const router = express.Router(); 

const { registerUser, loginUser, getUserProfile, refreshTokenHandler, logoutUser } = require('../controllers/UserController');
const { authenticateToken } = require('../middleware/authMiddleware');



router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', refreshTokenHandler);

// Protect route 
router.get('/profile', authenticateToken, getUserProfile);
router.post('/logout', authenticateToken, logoutUser);

module.exports = router;  