const questionService = require('../services/questionService');

exports.createQuestion = async (req, res, next) => {
  try {
    const question = await questionService.createQuestion(req.body);
    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    next(error);
  }
};

exports.getQuestion = async (req, res, next) => {
  try {
    const question = await questionService.getQuestion(req.params.question_number);
    res.status(200).json(question);
  } catch (error) {
    next(error);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await questionService.updateQuestion(req.params.question_number, req.body);
    res.status(200).json({ message: 'Question updated successfully', question });
  } catch (error) {
    next(error);
  }
};

exports.getQuestionsByUser = async (req, res, next) => {
  try {
    const questions = await questionService.getQuestionsByUser(req.params.user_number);
    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};

exports.getAllQuestions = async (req, res, next) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};
