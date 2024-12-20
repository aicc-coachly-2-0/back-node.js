exports.validateSignup = (req, res, next) => {
  const requiredFields = [
    'user_id',
    'user_name',
    'user_email',
    'user_pw',
    'user_phone',
    'user_date_of_birth',
    'user_gender',
  ];

  // 필수 필드 확인
  const missingFields = requiredFields.filter((field) => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(', ')}`,
    });
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.user_email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  next();
};
