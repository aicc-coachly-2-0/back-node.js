const authService = require('../services/authService');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await authService.createUser(req.body); // 요청 데이터를 그대로 전달
    res
      .status(201)
      .json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    next(error); // 에러 미들웨어로 전달
  }
};
