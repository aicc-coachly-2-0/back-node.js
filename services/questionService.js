const questionModel = require('../models/questionModel');

// 새로운 질문을 생성하는 서비스 함수
exports.createQuestion = async (questionData) => {
  return await questionModel.insertQuestion(questionData);
};

// 특정 질문을 가져오는 서비스 함수
exports.getQuestion = async (questionNumber) => {
  return await questionModel.findQuestionById(questionNumber);
};

// 특정 질문의 내용을 업데이트하는 서비스 함수
exports.updateQuestion = async (questionNumber, questionData) => {
  return await questionModel.updateQuestion(questionNumber, questionData);
};

// 특정 사용자가 작성한 질문 목록을 조회하는 서비스 함수
exports.getQuestionsByUser = async (userNumber) => {
  return await questionModel.findQuestionsByUser(userNumber);
};

// 답변 없는 질문 조회
exports.getUnansweredQuestions = async () => {
  try {
    // 모델에서 답변이 없는 질문들을 조회
    return await questionModel.findUnansweredQuestions();
  } catch (error) {
    console.error("Error fetching unanswered questions:", error);
    throw new Error("Could not fetch unanswered questions");
  }
};

// 전체 질문 목록을 조회하는 서비스 함수 (추가)
exports.getAllQuestions = async () => {
  return await questionModel.findAllQuestions();
};
