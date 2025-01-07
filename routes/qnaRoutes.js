const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const answerController = require('../controllers/answerController');

// 질문 작성
router.post('/questions', questionController.createQuestion);

// 질문 조회 (단일)
router.get('/questions/:question_number', questionController.getQuestion);

// 질문 수정
router.put('/questions/:question_number', questionController.updateQuestion);

// 특정 유저 질문 조회
router.get(
  '/users/:user_number/questions',
  questionController.getQuestionsByUser
);

// 전체 질문 조회
router.get('/questions', questionController.getAllQuestions);

// 답변 없는 질문 조회
router.get('/unanswered', questionController.getUnansweredQuestions);

// 답변 작성
router.post('/answers', answerController.createAnswer);

// 답변 조회 (질문별)
router.get(
  '/questions/:question_number/answers',
  answerController.getAnswersByQuestion
);

// 답변 수정
router.put('/answers/:answer_number', answerController.updateAnswer);

module.exports = router;
