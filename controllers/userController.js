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

// 사용자 정보 업데이트
exports.updateUser = async (req, res) => {
  const { user_id, role } = req.user; // 로그인한 사용자의 user_id와 role
  const {
    user_name,
    user_email,
    user_phone,
    user_date_of_birth,
    user_gender,
    status,
  } = req.body;

  const fieldsToUpdate = {
    user_name,
    user_email,
    user_phone,
    user_date_of_birth,
    user_gender,
    status,
  };

  try {
    // 사용자 정보 업데이트 서비스 호출
    const updatedUser = await userService.updateUser(
      user_id,
      role,
      fieldsToUpdate
    );
    res
      .status(200)
      .json({ message: 'User updated successfully', data: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({ message: 'Failed to update user' });
  }
};
