const userService = require('../services/userService');

exports.followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.user_number; // 현재 로그인 사용자
    await userService.followUser(currentUser, userId);
    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.user_number;
    await userService.unfollowUser(currentUser, userId);
    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.user_number;
    await userService.blockUser(currentUser, userId);
    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.unblockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user.user_number;
    await userService.unblockUser(currentUser, userId);
    res.status(200).json({ message: 'User unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const currentUser = req.user.user_number;
    await userService.likePost(currentUser, postId);
    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.unlikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const currentUser = req.user.user_number;
    await userService.unlikePost(currentUser, postId);
    res.status(200).json({ message: 'Post unliked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.likeFeed = async (req, res, next) => {
  try {
    const { feedId } = req.params;
    const currentUser = req.user.user_number;
    await userService.likeFeed(currentUser, feedId);
    res.status(200).json({ message: 'Feed liked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.unlikeFeed = async (req, res, next) => {
  try {
    const { feedId } = req.params;
    const currentUser = req.user.user_number;
    await userService.unlikeFeed(currentUser, feedId);
    res.status(200).json({ message: 'Feed unliked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.likeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const currentUser = req.user.user_number;
    await userService.likeComment(currentUser, commentId);
    res.status(200).json({ message: 'Comment liked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.unlikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const currentUser = req.user.user_number;
    await userService.unlikeComment(currentUser, commentId);
    res.status(200).json({ message: 'Comment unliked successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getLikesCount = async (req, res, next) => {
  const { type, id } = req.params; // type: post, feed, comment
  try {
    let count = 0;
    if (type === 'post') {
      count = await userService.countLikesForPost(id); // 서비스 호출
    } else if (type === 'feed') {
      count = await userService.countLikesForFeed(id); // 서비스 호출
    } else if (type === 'comment') {
      count = await userService.countLikesForComment(id); // 서비스 호출
    } else {
      return res.status(400).json({ message: 'Invalid type specified' });
    }
    res.status(200).json({ id, type, likes: count });
  } catch (error) {
    next(error);
  }
};


// 상태별 유저 조회
exports.getUsersByStatus = async (req, res, next) => {
  const { status } = req.params;  // 요청에서 status를 가져옵니다
  try {
    const users = await userService.getUsersByStatus(status);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// 상태별 유저 조회 (선택적 필터링)
exports.getUsers = async (req, res, next) => {
  const { status } = req.query;  // 요청의 쿼리 파라미터에서 status를 가져옵니다
  try {
    const users = await userService.getUsers({ status });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};


// ID 또는 이름으로 유저 검색 컨트롤러
exports.searchUsers = async (req, res, next) => {
  try {
    const keyword = req.query.keyword;

    if (!keyword) {
      return res.status(400).json({ message: 'Keyword is required' });
    }

    const users = await userService.searchUsers(keyword);

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};