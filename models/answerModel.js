const { postgreSQL } = require('../config/database');

exports.insertAnswer = async ({ question_number, admin_number, answer_content }) => {
  const query = `
    INSERT INTO answers (question_number, admin_number, answer_content)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [question_number, admin_number, answer_content];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

exports.findAnswersByQuestion = async (questionNumber) => {
  const query = `SELECT * FROM answers WHERE question_number = $1`;
  const { rows } = await postgreSQL.query(query, [questionNumber]);
  return rows;
};

exports.updateAnswer = async (answerNumber, { answer_content }) => {
  const query = `
    UPDATE answers SET answer_content = $1, answer_at = CURRENT_TIMESTAMP
    WHERE answer_number = $2
    RETURNING *;
  `;
  const values = [answer_content, answerNumber];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};
