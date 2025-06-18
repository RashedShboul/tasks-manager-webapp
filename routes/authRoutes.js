const express = require('express'); 
const router = express.Router(); 
const authController = require('../controllers/authController'); 
const authMiddleware = require('../middleware/authMiddleware'); 

router.get('/me', authMiddleware, authController.getCurrentUser); 
router.post('/register', authController.registerUser); 
// router.post('/login', ); 
router.post('/logout', authController.logout); 
// router.post('/refresh', ); 

module.exports = router; 