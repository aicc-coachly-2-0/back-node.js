const authService = require('../services/authService');

// 유저 회원가입 컨트롤러
exports.signup = async (req, res, next) => {
  try {
    const profilePictureUrl = req.fileUrls?.[0]?.fileUrl || null; // 업로드된 파일 URL
    const userData = req.body;

    const newUser = await authService.createUser(userData, profilePictureUrl);

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
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

    res
      .status(201)
      .json({ message: 'Admin created successfully', admin: newAdmin });
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
