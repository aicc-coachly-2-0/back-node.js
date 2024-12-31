const authService = require('../services/authService');

// 유저 회원가입

exports.signup = async (req, res, next) => {
  try {
    const remoteImageUrl = req.body.profilePictureUrl;
    const newUser = await authService.createUser(req.body, remoteImageUrl);

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
    const newAdmin = await authService.createAdmin(req.body);
    res
      .status(201)
      .json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (error) {
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
