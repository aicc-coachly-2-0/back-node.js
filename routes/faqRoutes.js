const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const authMiddleware = require('../middlewares/authMiddleware');

// 자주 묻는 질문 작성
router.post('/', faqController.createFaq);

// 자주 묻는 질문 수정
router.patch('/:faq_number', faqController.updateFaq);

// 자주 묻는 질문 조회 (단일)
router.get('/:faq_number',authMiddleware.authenticateToken, faqController.getFaq);

// 자주 묻는 질문 전체 조회
router.get('/', authMiddleware.authenticateToken, faqController.getAllFaqs);

module.exports = router;
