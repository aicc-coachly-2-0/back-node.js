const postService = require("../services/postService");

exports.createPost = async (req, res, next) => {
  try {
    const postData = {
      ...req.body,
      img_path: req.fileUrls?.[0]?.fileUrl || null, // 첫 번째 이미지 URL 추가
    };

    const post = await postService.createPost(postData);
    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    next(error);
  }
};

exports.createPostComment = async (req, res, next) => {
  try {
    const comment = await postService.createComment(req.body);
    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    next(error);
  }
};

exports.createCommunity = async (req, res, next) => {
  try {
    const community = await postService.createCommunity(req.body);
    res
      .status(201)
      .json({ message: "Community created successfully", community });
  } catch (error) {
    next(error);
  }
};

exports.getCommunities = async (req, res, next) => {
  try {
    const communities = await postService.getCommunities();
    res.status(200).json({ communities });
  } catch (error) {
    next(error);
  }
};

exports.getPostsByCommunity = async (req, res, next) => {
  try {
    const posts = await postService.getCommunityPosts(
      req.params.community_number
    );
    res.status(200).json({ posts });
  } catch (error) {
    next(error);
  }
};

exports.getPostsByUser = async (req, res, next) => {
  try {
    const posts = await postService.getUserPosts(req.params.user_number);
    res.status(200).json({ posts });
  } catch (error) {
    next(error);
  }
};

exports.getCommentsByPost = async (req, res, next) => {
  try {
    const comments = await postService.getPostComments(req.params.post_number);
    res.status(200).json({ comments });
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const updatedPost = await postService.updatePost(
      req.params.post_number,
      req.body
    );
    res.status(200).json({ message: "Post updated successfully", updatedPost });
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.params.post_number);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    await postService.deleteComment(req.params.post_comment_number);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};
