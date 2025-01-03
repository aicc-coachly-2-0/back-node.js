const { postgreSQL } = require('../config/database');

// 피드 생성
exports.createFeed = async ({ user_number, content }) => {
  const query = `
    INSERT INTO feeds (user_number, content)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [user_number, content];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 피드 댓글 생성
exports.createFeedComment = async ({ user_number, feed_number, content }) => {
  const query = `
    INSERT INTO feed_comments (user_number, feed_number, content)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [user_number, feed_number, content];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 전체 피드 조회
exports.getAllFeeds = async () => {
  const query = `SELECT * FROM feeds WHERE state = 'active';`;
  const { rows } = await postgreSQL.query(query);
  return rows;
};

// 특정 유저의 피드 조회
exports.getFeedsByUser = async (user_number) => {
  const query = `SELECT * FROM feeds WHERE user_number = $1 AND state = 'active';`;
  const { rows } = await postgreSQL.query(query, [user_number]);
  return rows;
};

// 피드 댓글 조회
exports.getCommentsByFeed = async (feed_number) => {
  const query = `SELECT * FROM feed_comments WHERE feed_number = $1 AND state = 'active';`;
  const { rows } = await postgreSQL.query(query, [feed_number]);
  return rows;
};

// 피드 수정
exports.updateFeed = async (feed_number, { content }) => {
  const query = `
    UPDATE feeds
    SET content = $1, updated_at = CURRENT_TIMESTAMP
    WHERE feed_number = $2 AND state = 'active'
    RETURNING *;
  `;
  const { rows } = await postgreSQL.query(query, [content, feed_number]);
  return rows[0];
};

// 피드 삭제
exports.deleteFeed = async (feed_number) => {
  const query = `UPDATE feeds SET state = 'inactive' WHERE feed_number = $1;`;
  await postgreSQL.query(query, [feed_number]);
};

// 피드 댓글 삭제
exports.deleteFeedComment = async (feed_comment_number) => {
  const query = `UPDATE feed_comments SET state = 'inactive' WHERE feed_comment_number = $1;`;
  await postgreSQL.query(query, [feed_comment_number]);
};

exports.getFeedById = async (feed_number) => {
  const query = `SELECT * FROM feeds WHERE feed_number = $1 AND state = 'active';`;
  const { rows } = await postgreSQL.query(query, [feed_number]);
  return rows[0];
};

exports.getCommentById = async (feed_comment_number) => {
  const query = `SELECT * FROM feed_comments WHERE feed_comment_number = $1 AND state = 'active';`;
  const { rows } = await postgreSQL.query(query, [feed_comment_number]);
  return rows[0];
};
