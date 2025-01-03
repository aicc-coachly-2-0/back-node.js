const answerService = require('../services/answerService');

exports.createAnswer = async (req, res, next) => {
  try {
    const answer = await answerService.createAnswer(req.body);
    res.status(201).json({ message: 'Answer created successfully', answer });
  } catch (error) {
    next(error);
  }
};

exports.getAnswersByQuestion = async (req, res, next) => {
  try {
    const answers = await answerService.getAnswersByQuestion(
      req.params.question_number
    );
    res.status(200).json(answers);
  } catch (error) {
    next(error);
  }
};

exports.updateAnswer = async (req, res, next) => {
  try {
    const answer = await answerService.updateAnswer(
      req.params.answer_number,
      req.body
    );
    res.status(200).json({ message: 'Answer updated successfully', answer });
  } catch (error) {
    next(error);
  }
};
