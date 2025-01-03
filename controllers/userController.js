const userService = require('../services/userService');
exports.followUser = async (req, res, next) => {
  try {
    const { user_number: targetNumber } = req.params;
    const currentUser = req.user.user_number;
    await userService.followUser(currentUser, targetNumber);
    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const { user_number: targetNumber } = req.params;
    const currentUser = req.user.user_number;
    await userService.unfollowUser(currentUser, targetNumber);
    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const { user_number: targetNumber } = req.params;
    const currentUser = req.user.user_number;
    await userService.blockUser(currentUser, targetNumber);
    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.unblockUser = async (req, res, next) => {
  try {
    const { user_number: targetNumber } = req.params;
    const currentUser = req.user.user_number;
    await userService.unblockUser(currentUser, targetNumber);
    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.likeContent = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const currentUser = req.user.user_number;
    await userService[`like${type.charAt(0).toUpperCase() + type.slice(1)}`](
      currentUser,
      id
    );
    res.status(200).json({ message: `${type} liked successfully` });
  } catch (error) {
    next(error);
  }
};

exports.unlikeContent = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const currentUser = req.user.user_number;
    await userService[`unlike${type.charAt(0).toUpperCase() + type.slice(1)}`](
      currentUser,
      id
    );
    res.status(200).json({ message: `${type} unliked successfully` });
  } catch (error) {
    next(error);
  }
};

exports.getLikesCount = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const count = await userService.countLikesForType(type, id);
    res.status(200).json({ type, id, likes: count });
  } catch (error) {
    next(error);
  }
};

// 상태별 유저 조회
exports.getUsersByStatus = async (req, res, next) => {
  const { status } = req.params; // 요청에서 status를 가져옵니다
  try {
    const users = await userService.getUsersByStatus(status);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// 상태별 유저 조회 (선택적 필터링)
exports.getUsers = async (req, res, next) => {
  const { status } = req.query; // 요청의 쿼리 파라미터에서 status를 가져옵니다
  try {
    const users = await userService.getUsers({ status });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// 유저 검색
exports.searchUsers = async (req, res, next) => {
  try {
    const searchTerm = req.query.searchTerm; // 쿼리 파라미터로 검색어 받기
    const users = await userService.searchUsers(searchTerm);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// 특정 유저 정보 조회
exports.getUserByNumber = async (req, res) => {
  const { user_number } = req.params;

  try {
    // 서비스 계층에서 유저 정보 가져오기
    const user = await userService.getUserByNumber(user_number);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User retrieved successfully", data: user });
  } catch (error) {
    console.error("Error retrieving user:", error.message);
    res.status(500).json({ message: "Failed to retrieve user", error: error.message });
  }
};


// 사용자 정보 업데이트
exports.updateUser = async (req, res) => {
  const { role } = req.user;  // 로그인한 사용자의 role (관리자 또는 일반 사용자)
  const { user_number } = req.params; // URL 파라미터에서 user_number 받기
  const { user_name, user_email, user_phone, user_date_of_birth, user_gender, status, user_id } = req.body;  // 요청 본문에서 필드 값 받기

  const fieldsToUpdate = { user_name, user_email, user_phone, user_date_of_birth, user_gender, status, user_id };
  console.log("Fields to update:", fieldsToUpdate);

  try {
    // 사용자 정보 업데이트 서비스 호출
    const updatedUser = await userService.updateUser(user_number, fieldsToUpdate, role);
    res.status(200).json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

