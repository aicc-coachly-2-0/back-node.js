const answerModel = require('../models/answerModel');
const questionModel = require('../models/questionModel');

exports.createAnswer = async ({ question_number, admin_number, answer_content }) => {
  if (!question_number || !admin_number || !answer_content) {
    throw new Error(
      'Missing required fields: question_number, admin_number, or answer_content'
    );
  }

  // 1. 답변 생성
  const answer = await answerModel.insertAnswer({
    question_number,
    admin_number,
    answer_content,
  });

  // 2. 질문의 관련 답변 중 상태가 'active' 또는 'edited'인 답변이 있는지 확인
  const validAnswers = await answerModel.findValidAnswersByQuestion(question_number);

  // 3. 조건에 따라 질문 상태를 업데이트
  if (validAnswers.length > 0) {
    await questionModel.updateQuestionState(question_number, 'answered');
  } else {
    await questionModel.updateQuestionState(question_number, 'pending');
  }

  return answer;
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

  // 1. 답변 업데이트
  const updatedAnswer = await answerModel.updateAnswer(answer_number, {
    answer_content,
  });
  if (!updatedAnswer) {
    throw new Error(
      `Answer with number ${answer_number} not found or update failed`
    );
  }

  // 2. 답변 상태를 'edited'로 변경
  await answerModel.updateAnswerState(answer_number, 'edited');

  // 3. 질문 상태 확인 및 업데이트
  const { question_number } = updatedAnswer;

  const validAnswers = await answerModel.findValidAnswersByQuestion(question_number);
  const newState = validAnswers.length > 0 ? 'answered' : 'pending';
  await questionModel.updateQuestionState(question_number, newState);

  return updatedAnswer;
};