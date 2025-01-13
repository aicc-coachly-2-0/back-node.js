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
    const answers = await answerService.getAnswersByQuestion(req.params.question_number);
    
    // 답변이 없으면 빈 배열을 반환
    if (answers.length === 0) {
      return res.status(200).json([]); // 빈 배열 반환
    }
    
    res.status(200).json(answers); // 답변이 있으면 반환
  } catch (error) {
    next(error); // 오류가 발생하면 다음 미들웨어로 전달
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
