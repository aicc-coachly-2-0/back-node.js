const { postgreSQL } = require('../config/database');

// 자주 묻는 질문 작성
exports.insertFaq = async ({ question_category_number, content, answer, admin_number }) => {
  const query = `
    INSERT INTO faqs (question_category_number, content, answer, admin_number, created_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [question_category_number, content, answer, admin_number];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 자주 묻는 질문 수정
exports.updateFaq = async (faqNumber, { question_category_number, content, answer }) => {
  const query = `
    UPDATE faqs
    SET question_category_number = $1,
        content = $2,
        answer = $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE faq_number = $4
    RETURNING *;
  `;
  const values = [question_category_number, content, answer, faqNumber];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 자주 묻는 질문 조회 (단일)
exports.findFaqById = async (faqNumber) => {
  const query = `
    SELECT f.*, a.admin_id
    FROM faqs f
    JOIN administrators a ON f.admin_number = a.admin_number
    WHERE f.faq_number = $1 AND f.deleted_at IS NULL;
  `;
  const { rows } = await postgreSQL.query(query, [faqNumber]);
  return rows[0];
};

// 자주 묻는 질문 전체 조회
exports.findAllFaqs = async (role) => {
  const queryForAdmin = `
    SELECT f.*, a.admin_id
    FROM faqs f
    JOIN administrators a ON f.admin_number = a.admin_number
    WHERE f.deleted_at IS NULL
    ORDER BY f.created_at DESC;
  `;

  const queryForUser = `
    SELECT f.question_category_number, f.content, f.answer
    FROM faqs f
    WHERE f.deleted_at IS NULL AND f.state = 'active'
    ORDER BY f.created_at DESC;
  `;

  // 관리자일 경우 모든 정보 반환, 유저일 경우 제한된 정보 반환
  const query = role === 'admin' ? queryForAdmin : queryForUser;
  const { rows } = await postgreSQL.query(query);
  return rows;
};
