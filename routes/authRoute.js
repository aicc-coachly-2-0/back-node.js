const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const validation = require('../middlewares/validation');

// 회원가입 API
router.post('/signup', validation.validateSignup, authController.signup);

module.exports = router;
