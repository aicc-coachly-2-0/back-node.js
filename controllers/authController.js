const authService = require("../services/authService");

// 유저 회원가입 컨트롤러
exports.signup = async (req, res, next) => {
  try {
    // Multer에서 처리된 파일 URL들
    const uploadedFiles = req.fileUrls || [];

    // 요청에서 받은 회원가입 데이터
    const userData = req.body;

    console.log("회원가입 데이터:", userData);
    console.log("업로드된 파일들:", uploadedFiles);

    // 유저 데이터로 회원가입 처리
    const newUser = await authService.createUser(userData);

    // 응답
    res.status(200).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("회원가입 에러:", error.message);

    // 클라이언트에게 상세한 에러 메시지 전달
    res.status(500).json({
      error: "회원가입 처리 중 오류가 발생했습니다.",
      message: error.message,
    });

    // 에러 핸들러로 넘기기 (선택 사항)
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { token, user } = await authService.loginUser(req.body);
    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    next(error);
  }
};

exports.adminsignup = async (req, res, next) => {
  try {
    console.log("Controller called with body:", req.body);

    const newAdmin = await authService.createAdmin(req.body);

    console.log("Admin created:", newAdmin);

    res
      .status(201)
      .json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    console.error("Error in adminsignup:", error.message);
    next(error);
  }
};

exports.adminlogin = async (req, res, next) => {
  try {
    const { token, admin } = await authService.loginAdmin(req.body);
    res.status(200).json({ message: "Login successful", token, admin });
  } catch (error) {
    next(error);
  }
};
