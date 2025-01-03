const answerModel = require('../models/answerModel');

exports.createAnswer = async ({
  question_number,
  admin_number,
  answer_content,
}) => {
  if (!question_number || !admin_number || !answer_content) {
    throw new Error(
      'Missing required fields: question_number, admin_number, or answer_content'
    );
  }

  return await answerModel.insertAnswer({
    question_number,
    admin_number,
    answer_content,
  });
};

exports.getAnswersByQuestion = async (question_number) => {
  if (!question_number) {
    throw new Error('Missing required field: question_number');
  }

  const answers = await answerModel.findAnswersByQuestion(question_number);
  if (!answers || answers.length === 0) {
    throw new Error(`No answers found for question number ${question_number}`);
  }

  return answers;
};

exports.updateAnswer = async (answer_number, { answer_content }) => {
  if (!answer_number || !answer_content) {
    throw new Error('Missing required fields: answer_number or answer_content');
  }

  const updatedAnswer = await answerModel.updateAnswer(answer_number, {
    answer_content,
  });
  if (!updatedAnswer) {
    throw new Error(
      `Answer with number ${answer_number} not found or update failed`
    );
  }

  return updatedAnswer;
};
