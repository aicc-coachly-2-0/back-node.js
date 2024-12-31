const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// 자주 묻는 질문 작성
router.post('/faqs', faqController.createFaq);

// 자주 묻는 질문 수정
router.put('/faqs/:faq_number', faqController.updateFaq);

// 자주 묻는 질문 조회 (단일)
router.get('/faqs/:faq_number', faqController.getFaq);

// 자주 묻는 질문 전체 조회
router.get('/faqs', authMiddleware.authenticateToken, faqController.getAllFaqs);

module.exports = router;
