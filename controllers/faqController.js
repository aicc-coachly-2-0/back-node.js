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
    const faq = await faqService.getFaq(req.params.faq_number);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.status(200).json(faq);
  } catch (error) {
    next(error);
  }
};

// 자주 묻는 질문 전체 조회
exports.getAllFaqs = async (req, res, next) => {
  try {
    const faqs = await faqService.getAllFaqs();
    res.status(200).json(faqs);
  } catch (error) {
    next(error);
  }
};
