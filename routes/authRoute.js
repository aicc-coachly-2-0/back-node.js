const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validation = require("../middlewares/validation");
// const authMiddleware = require('../middlewares/authMiddleware');

// 회원가입 엔드포인트
router.post("/signup", validation.validateSignup, authController.signup);
router.post(
  "/admin-signup",
  validation.validateAdminSignup,
  authController.adminsignup
);

// 로그인 엔드포인트 (user_id로 로그인)
router.post(
  "/user-signin",
  // authMiddleware.authenticateToken,
  authController.login
);
router.post(
  "/admin-signin",
  // authMiddleware.authenticateToken,
  authController.adminlogin
);
module.exports = router;
