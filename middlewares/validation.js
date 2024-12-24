exports.validateSignup = (req, res, next) => {
  const {
    user_id,
    user_name,
    user_email,
    user_pw,
    user_phone,
    user_date_of_birth,
    user_gender,
  } = req.body;

  if (
    !user_id ||
    !user_name ||
    !user_email ||
    !user_pw ||
    !user_phone ||
    !user_date_of_birth ||
    !user_gender
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user_email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  next();
};

exports.validateAdminSignup = (req, res, next) => {
  const { admin_id, admin_pw } = req.body;

  if (!admin_id || !admin_pw) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  next();
};
