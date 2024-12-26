const questionModel = require('../models/questionModel');

exports.createQuestion = async (questionData) => {
  return await questionModel.insertQuestion(questionData);
};

exports.getQuestion = async (questionNumber) => {
  return await questionModel.findQuestionById(questionNumber);
};

exports.updateQuestion = async (questionNumber, questionData) => {
  return await questionModel.updateQuestion(questionNumber, questionData);
};

exports.getQuestionsByUser = async (userNumber) => {
  return await questionModel.findQuestionsByUser(userNumber);
};

exports.getAllQuestions = async () => {
  return await questionModel.findAllQuestions();
};
