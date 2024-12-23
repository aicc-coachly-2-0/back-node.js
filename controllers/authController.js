const authService = require('../services/authService');

exports.signup = async (req, res, next) => {
  const {
    user_id,
    user_name,
    user_email,
    user_pw,
    user_phone,
    user_date_of_birth,
    user_gender,
  } = req.body;

  try {
    const newUser = await authService.createUser(req.body);
    res
      .status(201)
      .json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    next(error);
  }
};
