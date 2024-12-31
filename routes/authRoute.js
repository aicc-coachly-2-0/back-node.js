const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validation = require('../middlewares/validation');
const upload = require('../middlewares/fileUpload');

// 회원가입 엔드포인트
router.post(
  '/signup',
  upload.single('profilePicture'),
  validation.validateSignup,
  authController.signup
);
router.post(
  '/admin-signup',
  validation.validateAdminSignup,
  authController.adminsignup
);

// 로그인 엔드포인트 (user_id, admin_id로 로그인)
router.post('/user-signin', authController.login);
router.post('/admin-signin', authController.adminlogin);
module.exports = router;
