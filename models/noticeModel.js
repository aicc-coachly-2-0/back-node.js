const { postgreSQL } = require('../config/database');

// 공지글 작성
exports.insertNotice = async ({ admin_number, title, content }) => {
  const query = `
    INSERT INTO notices (admin_number, title, content, created_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [admin_number, title, content];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 공지글 수정
exports.updateNotice = async (noticeNumber, { title, content }) => {
  const query = `
    UPDATE notices
    SET title = $1,
        content = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE notice_number = $3
    RETURNING *;
  `;
  const values = [title, content, noticeNumber];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 공지글 이미지 삽입
exports.insertNoticeImages = async (noticeNumber, images) => {
  const query = `
    INSERT INTO notice_images (notice_number, img_link)
    VALUES ($1, unnest($2::text[]));
  `;
  const values = [noticeNumber, images];
  await postgreSQL.query(query, values);
};

// 공지글 이미지 수정
exports.updateNoticeImages = async (noticeNumber, images) => {
  const deleteQuery = `
    DELETE FROM notice_images WHERE notice_number = $1;
  `;
  await postgreSQL.query(deleteQuery, [noticeNumber]);

  const insertQuery = `
    INSERT INTO notice_images (notice_number, img_link)
    VALUES ($1, unnest($2::text[]));
  `;
  const values = [noticeNumber, images];
  await postgreSQL.query(insertQuery, values);
};

// 공지글 조회 (단일)
exports.findNoticeById = async (noticeNumber) => {
  const query = `
      SELECT * FROM notices WHERE notice_number = $1;
    `;
  const { rows } = await postgreSQL.query(query, [noticeNumber]);
  return rows[0];
};

// 공지글 이미지 조회
exports.findImagesByNoticeId = async (noticeNumber) => {
  const query = `
    SELECT img_link FROM notice_images WHERE notice_number = $1;
  `;
  const { rows } = await postgreSQL.query(query, [noticeNumber]);
  return rows.map((row) => row.img_link);
};

// 공지글 전체 조회
exports.findAllNotices = async () => {
  const query = `
      SELECT * FROM notices ORDER BY created_at DESC;
    `;
  const { rows } = await postgreSQL.query(query);
  return rows;
};

// 활성 상태의 공지글 조회
exports.findActiveNotices = async () => {
  const query = `
    SELECT * FROM notices
    WHERE state = 'active'
    ORDER BY created_at DESC;
  `;
  const { rows } = await postgreSQL.query(query);
  return rows;
};
