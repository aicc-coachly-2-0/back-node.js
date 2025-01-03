const faqService = require('../services/faqService');

// 자주 묻는 질문 작성
exports.createFaq = async (req, res, next) => {
  try {
    const faq = await faqService.createFaq(req.body);
    res.status(201).json({ message: 'FAQ created successfully', faq });
  } catch (error) {
    next(error);
  }
};

// 자주 묻는 질문 수정
exports.updateFaq = async (req, res, next) => {
  try {
    const faq = await faqService.updateFaq(req.params.faq_number, req.body);
    res.status(200).json({ message: 'FAQ updated successfully', faq });
  } catch (error) {
    next(error);
  }
};

// 자주 묻는 질문 조회 (단일)
exports.getFaq = async (req, res, next) => {
  try {
    const faqNumber = req.params.faq_number;
    console.log('User info:', req.user);
    const { role } = req.user;  // 인증 미들웨어에서 설정된 사용자 역할 정보
    const faq = await faqService.findFaqById(faqNumber, role);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.status(200).json(faq);
  } catch (error) {
    next(error);
  }
};

// FAQ 전체 조회 (관리자/유저 역할에 따라 다른 결과 반환)
exports.getAllFaqs = async (req, res, next) => {
  try {
    const { role } = req.user; // 역할 정보는 인증 미들웨어에서 추가
    const faqs = await faqService.getAllFaqs(role);
    res.status(200).json(faqs);
  } catch (error) {
    next(error);
  }
};

