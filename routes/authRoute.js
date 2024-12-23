const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validation = require('../middlewares/validation');

router.post('/signup', validation.validateSignup, authController.signup);

module.exports = router;
