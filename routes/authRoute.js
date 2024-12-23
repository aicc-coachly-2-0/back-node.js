const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validation = require('../middlewares/validation');

// 회원가입 엔드포인트
router.post('/signup', validation.validateSignup, authController.signup);

// 로그인 엔드포인트 (user_id로 로그인)
router.post('/user-signin', authController.login);

module.exports = router;
