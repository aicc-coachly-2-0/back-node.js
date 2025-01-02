const questionModel = require('../models/questionModel');

// 새로운 질문을 생성하는 서비스 함수
// 입력받은 questionData를 모델의 insertQuestion 메서드에 전달하여 DB에 저장
exports.createQuestion = async (questionData) => {
  return await questionModel.insertQuestion(questionData);
};

// 특정 질문을 가져오는 서비스 함수
// questionNumber를 전달받아 해당 번호의 질문 데이터를 모델에서 조회
exports.getQuestion = async (questionNumber) => {
  return await questionModel.findQuestionById(questionNumber);
};

// 특정 질문의 내용을 업데이트하는 서비스 함수
// questionNumber와 업데이트할 데이터(questionData)를 전달받아 모델의 updateQuestion 메서드 호출
exports.updateQuestion = async (questionNumber, questionData) => {
  return await questionModel.updateQuestion(questionNumber, questionData);
};

// 특정 사용자가 작성한 질문 목록을 조회하는 서비스 함수
// userNumber를 전달받아 해당 사용자의 질문들을 모델에서 조회
exports.getQuestionsByUser = async (userNumber) => {
  return await questionModel.findQuestionsByUser(userNumber);
};

// 답변이 달리지 않은 질문을 오래된 순서대로 조회하는 서비스 함수
// 모델의 findUnansweredQuestions 메서드를 호출하여 데이터를 반환
exports.getUnansweredQuestions = async () => {
  return await questionModel.findUnansweredQuestions();
};
