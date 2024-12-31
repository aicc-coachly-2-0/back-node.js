const questionService = require('../services/questionService');

// 새로운 질문을 생성하는 컨트롤러 함수
// 요청(req.body)에 포함된 데이터를 받아 서비스 계층의 createQuestion 호출
// 성공 시 생성된 질문 데이터를 응답으로 반환
exports.createQuestion = async (req, res, next) => {
  try {
    const question = await questionService.createQuestion(req.body);
    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    next(error); // 에러 발생 시 에러 핸들러로 전달
  }
};

// 특정 질문을 조회하는 컨트롤러 함수
// 요청 경로(req.params)의 question_number를 전달받아 해당 질문을 서비스 계층에서 조회
// 성공 시 질문 데이터를 응답으로 반환
exports.getQuestion = async (req, res, next) => {
  try {
    const question = await questionService.getQuestion(req.params.question_number);
    res.status(200).json(question);
  } catch (error) {
    next(error); // 에러 발생 시 에러 핸들러로 전달
  }
};

// 특정 질문을 업데이트하는 컨트롤러 함수
// 요청 경로(req.params)의 question_number와 요청 데이터(req.body)를 사용해 질문 업데이트
// 성공 시 업데이트된 질문 데이터를 응답으로 반환
exports.updateQuestion = async (req, res, next) => {
  try {
    const question = await questionService.updateQuestion(req.params.question_number, req.body);
    res.status(200).json({ message: 'Question updated successfully', question });
  } catch (error) {
    next(error); // 에러 발생 시 에러 핸들러로 전달
  }
};

// 특정 사용자가 작성한 질문 목록을 조회하는 컨트롤러 함수
// 요청 경로(req.params)의 user_number를 사용해 해당 사용자의 질문들을 조회
// 성공 시 질문 목록 데이터를 응답으로 반환
exports.getQuestionsByUser = async (req, res, next) => {
  try {
    const questions = await questionService.getQuestionsByUser(req.params.user_number);
    res.status(200).json(questions);
  } catch (error) {
    next(error); // 에러 발생 시 에러 핸들러로 전달
  }
};

// 모든 질문을 조회하는 컨트롤러 함수
// 서비스 계층의 getAllQuestions 호출 후 전체 질문 데이터를 반환
exports.getAllQuestions = async (req, res, next) => {
  try {
    const questions = await questionService.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    next(error); // 에러 발생 시 에러 핸들러로 전달
  }
};

// 답변이 달리지 않은 질문을 오래된 순서대로 조회하는 컨트롤러 함수
// 서비스 계층의 getUnansweredQuestions 호출 후 해당 데이터를 반환
exports.getUnansweredQuestions = async (req, res, next) => {
  try {
    const questions = await questionService.getUnansweredQuestions();
    res.status(200).json(questions);
  } catch (error) {
    next(error); // 에러 발생 시 에러 핸들러로 전달
  }
};
