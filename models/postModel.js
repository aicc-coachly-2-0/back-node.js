const { postgreSQL } = require("../config/database");

exports.insertPost = async ({
  user_number,
  community_number,
  title,
  content,
  img_path,
}) => {
  const query = `
    INSERT INTO posts (user_number, community_number, title, content, img_path)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [user_number, community_number, title, content, img_path];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

exports.insertComment = async ({
  user_number,
  post_number,
  reference_comment_number,
  content,
}) => {
  const query = `
    INSERT INTO post_comments (user_number, post_number, reference_comment_number, content)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [user_number, post_number, reference_comment_number, content];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

exports.insertCommunity = async ({ community_category }) => {
  const query = `
    INSERT INTO communities (community_category)
    VALUES ($1)
    RETURNING *;
  `;
  const values = [community_category];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

exports.selectAllCommunities = async () => {
  const query = `SELECT * FROM communities WHERE state = 'active';`;
  const { rows } = await postgreSQL.query(query);
  return rows;
};

exports.selectPostsByCommunity = async (community_number) => {
  const query = `
    SELECT 
      posts.*, 
      users.img_link AS user_img_link,
      users.user_name AS user_name
    FROM 
      posts
    LEFT JOIN 
      users ON posts.user_number = users.user_number
    WHERE 
      posts.community_number = $1 AND posts.state = 'active';
  `;

  const { rows } = await postgreSQL.query(query, [community_number]);
  return rows;
};

exports.selectByCommunity = async (community_number) => {
  const query = `
    SELECT * FROM posts
  `;

  const { rows } = await postgreSQL.query(query);
  return rows;
};

exports.selectPostsByUser = async (user_number) => {
  const query = `
    SELECT 
      posts.*, 
      users.img_link
    FROM posts
    JOIN users ON posts.user_number = users.user_number
    WHERE posts.user_number = $1 AND posts.state = 'active';
  `;
  const { rows } = await postgreSQL.query(query, [user_number]);
  return rows;
};

exports.selectCommentsByPost = async (post_number) => {
  const query = `
    SELECT 
      post_comments.*, 
      users.user_name, 
      users.img_link
    FROM 
      post_comments
    LEFT JOIN 
      users ON post_comments.user_number = users.user_number
    WHERE 
      post_comments.post_number = $1 AND post_comments.state = 'active';
  `;
  const { rows } = await postgreSQL.query(query, [post_number]);
  return rows;
};

exports.updatePost = async (post_number, { title, content }) => {
  const query = `
    UPDATE posts
    SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
    WHERE post_number = $3 AND state = 'active'
    RETURNING *;
  `;
  const values = [title, content, post_number];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

exports.softDeletePost = async (post_number) => {
  const query = `
    UPDATE posts
    SET state = 'deleted'
    WHERE post_number = $1;
  `;
  await postgreSQL.query(query, [post_number]);
};

exports.softDeleteComment = async (post_comment_number) => {
  const query = `
    UPDATE post_comments
    SET state = 'deleted'
    WHERE post_comment_number = $1;
  `;
  await postgreSQL.query(query, [post_comment_number]);
};

exports.getPostById = async (post_number) => {
  const query = `
    SELECT * FROM posts WHERE post_number = $1 AND state = 'active';
  `;
  const { rows } = await postgreSQL.query(query, [post_number]);
  return rows[0];
};

exports.getCommentById = async (post_comment_number) => {
  const query = `
    SELECT * FROM post_comments WHERE post_comment_number = $1 AND state = 'active';
  `;
  const { rows } = await postgreSQL.query(query, [post_comment_number]);
  return rows[0];
};
