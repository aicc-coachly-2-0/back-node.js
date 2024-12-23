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
