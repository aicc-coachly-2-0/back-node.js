const postModel = require("../models/postModel");

exports.createPost = async (postData) => {
  return await postModel.insertPost(postData);
};

exports.createComment = async (commentData) => {
  return await postModel.insertComment(commentData);
};

exports.createCommunity = async (communityData) => {
  return await postModel.insertCommunity(communityData);
};

exports.getCommunities = async () => {
  return await postModel.selectAllCommunities();
};

exports.getCommunityPosts = async (community_number) => {
  return await postModel.selectPostsByCommunity(community_number);
};

exports.getCommunity = async () => {
  return await postModel.selectByCommunity();
};

exports.getUserPosts = async (user_number) => {
  return await postModel.selectPostsByUser(user_number);
};

exports.getPostComments = async (post_number) => {
  return await postModel.selectCommentsByPost(post_number);
};

exports.updatePost = async (post_number, postData) => {
  return await postModel.updatePost(post_number, postData);
};

exports.deletePost = async (post_number) => {
  return await postModel.softDeletePost(post_number);
};

exports.deleteComment = async (post_comment_number) => {
  return await postModel.softDeleteComment(post_comment_number);
};
