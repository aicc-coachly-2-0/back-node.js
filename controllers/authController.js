const authService = require('../services/authService');

// 유저 회원가입
exports.signup = async (req, res, next) => {
  try {
    const uploadedFile = req.file; // Multer로 처리된 파일 데이터
    if (!uploadedFile) {
      return res.status(400).json({ message: 'Profile picture is required' });
    }

    const profilePictureUrl = await authService.uploadToFTP(
      req.body.user_id,
      uploadedFile
    );

    const newUser = await authService.createUser(req.body, profilePictureUrl);

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('회원가입 에러:', error.message);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { token, user } = await authService.loginUser(req.body);
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    next(error);
  }
};

exports.adminsignup = async (req, res, next) => {
  try {
    console.log('Controller called with body:', req.body);

    const newAdmin = await authService.createAdmin(req.body);

    console.log('Admin created:', newAdmin);

    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (error) {
    console.error('Error in adminsignup:', error.message);
    next(error);
  }
};

exports.adminlogin = async (req, res, next) => {
  try {
    const { token, admin } = await authService.loginAdmin(req.body);
    res.status(200).json({ message: 'Login successful', token, admin });
  } catch (error) {
    next(error);
  }
};
