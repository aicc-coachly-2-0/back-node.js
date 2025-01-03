const faqModel = require('../models/faqModel');

// 자주 묻는 질문 작성
exports.createFaq = async (faqData) => {
  return await faqModel.insertFaq(faqData);
};

// 자주 묻는 질문 수정
exports.updateFaq = async (faqNumber, faqData) => {
  return await faqModel.updateFaq(faqNumber, faqData);
};

// 자주 묻는 질문 조회 (단일)
exports.getFaq = async (faqNumber) => {
  return await faqModel.findFaqById(faqNumber);
};

// 자주 묻는 질문 전체 조회
exports.getAllFaqs = async () => {
  return await faqModel.findAllFaqs();
};
