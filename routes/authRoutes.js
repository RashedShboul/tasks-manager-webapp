const express = require('express'); 
const router = express.Router(); 
const authController = require('../controllers/authController'); 


router.post('/register', authController.registerUser); 
// router.post('/login', ); 
// router.post('/logout', ); 
// router.post('/refresh', ); 

module.exports = router; 