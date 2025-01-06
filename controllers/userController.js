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

// 상태에 따른 전체 유저 조회
exports.getUsers = async (req, res, next) => {
  const { status } = req.query;
  try {
    const users = await userService.getUsers({ status });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// 검색으로 유저 조회
exports.searchUsers = async (req, res, next) => {
  try {
    const searchTerm = req.query.searchTerm;
    const users = await userService.searchUsers(searchTerm);

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// 특정 유저 정보 조회
exports.getUserByNumber = async (req, res) => {
  const { user_number } = req.params;

  try {
    const user = await userService.getUserByNumber(user_number);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res
      .status(200)
      .json({ message: 'User retrieved successfully', data: user });
  } catch (error) {
    console.error('Error retrieving user:', error.message);
    res
      .status(500)
      .json({ message: 'Failed to retrieve user', error: error.message });
  }
};

// 회원 정보 업데이트
exports.updateUser = async (req, res) => {
  const { role } = req.user;
  const { user_number } = req.params;
  const {
    user_name,
    user_email,
    user_phone,
    user_date_of_birth,
    user_gender,
    status,
    user_id,
  } = req.body;

  const fieldsToUpdate = {
    user_name,
    user_email,
    user_phone,
    user_date_of_birth,
    user_gender,
    status,
    user_id,
  };

  if (req.fileUrls && req.fileUrls.length > 0) {
    fieldsToUpdate.profilePicture = req.fileUrls.find(
      (file) => file.fieldName === 'profilePicture'
    )?.fileUrl;
  }

  try {
    const updatedUser = await userService.updateUser(
      user_number,
      fieldsToUpdate,
      role
    );

    res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({
      message: 'Failed to update user',
      error: error.message,
    });
  }
};
