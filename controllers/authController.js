const authService = require('../services/authService');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await authService.createUser(req.body);
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
