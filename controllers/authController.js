const authService = require('../services/authService');
const path = require('path');

// 유저 회원가입
exports.signup = async (req, res, next) => {
  try {
    const localImagePath = path.resolve(
      __dirname,
      '../uploads',
      req.file.filename
    );
    const newUser = await authService.createUser(req.body, localImagePath);

    res
      .status(201)
      .json({ message: 'User created successfully', user: newUser });
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
