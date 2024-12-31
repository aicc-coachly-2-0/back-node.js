const { postgreSQL } = require('../config/database');

exports.insertQuestion = async ({ user_number, question_classification_number, title, question_content }) => {
  const query = `
    INSERT INTO questions (user_number, question_classification_number, title, question_content)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [user_number, question_classification_number, title, question_content];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

exports.findQuestionById = async (questionNumber) => {
  const query = `SELECT * FROM questions WHERE question_number = $1`;
  const { rows } = await postgreSQL.query(query, [questionNumber]);
  return rows[0];
};

exports.updateQuestion = async (questionNumber, { title, question_content }) => {
  const query = `
    UPDATE questions SET title = $1, question_content = $2, updated_at = CURRENT_TIMESTAMP
    WHERE question_number = $3
    RETURNING *;
  `;
  const values = [title, question_content, questionNumber];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

exports.findQuestionsByUser = async (userNumber) => {
  const query = `SELECT * FROM questions WHERE user_number = $1`;
  const { rows } = await postgreSQL.query(query, [userNumber]);
  return rows;
};

exports.findAllQuestions = async () => {
  const query = `SELECT * FROM questions`;
  const { rows } = await postgreSQL.query(query);
  return rows;
};

exports.findUnansweredQuestions = async () => {
  const query = `
    SELECT q.*
    FROM questions q
    LEFT JOIN answers a ON q.question_number = a.question_number
    WHERE a.answer_number IS NULL
    ORDER BY q.created_at ASC;
  `;

  const { rows } = await postgreSQL.query(query);
  return rows;
};
