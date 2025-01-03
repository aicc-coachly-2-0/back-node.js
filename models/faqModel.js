const { postgreSQL } = require('../config/database');

// 자주 묻는 질문 작성
exports.insertFaq = async ({ question_classification_number, content, answer, admin_number }) => {
  const query = `
    INSERT INTO faqs (question_classification_number, content, answer, admin_number, created_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [question_classification_number, content, answer, admin_number];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 자주 묻는 질문 수정
exports.updateFaq = async (faqNumber, { question_classification_number, content, answer, state, admin_number }) => {
  const query = `
    UPDATE faqs
    SET 
      question_classification_number = COALESCE($1, question_classification_number),
      content = COALESCE($2, content),
      answer = COALESCE($3, answer),
      admin_number = COALESCE($4, admin_number),
      state = COALESCE($5::faq_state_enum, state), -- 'active', 'inactive', 'deleted'
      updated_at = CURRENT_TIMESTAMP
    WHERE faq_number = $6
    RETURNING *;
  `;
  
  const values = [question_classification_number, content, answer, admin_number, state, faqNumber];
  
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 자주 묻는 질문 조회 (단일)
exports.findFaqById = async (faqNumber, role) => {
  let query;
  let values = [faqNumber];

  if (role === 'admin') {
    // 관리자는 모든 정보 조회
    query = `
      SELECT f.*, a.admin_id
      FROM faqs f
      JOIN administrators a ON f.admin_number = a.admin_number
      WHERE f.faq_number = $1 AND f.deleted_at IS NULL;
    `;
  } else {
    // 일반 사용자는 state가 'active'인 FAQ만 조회
    query = `
      SELECT f.question_classification_number, f.content, f.answer
      FROM faqs f
      WHERE f.faq_number = $1 AND f.deleted_at IS NULL AND f.state = 'active';
    `;
  }

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]; // 단일 FAQ 반환
  } catch (error) {
    console.error('Error fetching FAQ by ID:', error.message);
    throw error;
  }
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
    SELECT f.question_classification_number, f.content, f.answer
    FROM faqs f
    WHERE f.deleted_at IS NULL AND f.state = 'active'
    ORDER BY f.created_at DESC;
  `;

  // 관리자일 경우 모든 정보 반환, 유저일 경우 제한된 정보 반환
  const query = role === 'admin' ? queryForAdmin : queryForUser;
  const { rows } = await postgreSQL.query(query);
  return rows;
};
