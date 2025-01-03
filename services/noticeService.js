const noticeModel = require('../models/noticeModel');

// 공지글 작성 (사진 포함)
exports.createNoticeWithImages = async ({
  admin_number,
  title,
  content,
  images,
}) => {
  const notice = await noticeModel.insertNotice({
    admin_number,
    title,
    content,
  });
  if (images && images.length > 0) {
    await noticeModel.insertNoticeImages(notice.notice_number, images);
  }
  return notice;
};

// 공지글 수정
exports.updateNotice = async (noticeNumber, { title, content, images }) => {
  const updatedNotice = await noticeModel.updateNotice(noticeNumber, {
    title,
    content,
  });
  if (images) {
    await noticeModel.updateNoticeImages(noticeNumber, images);
  }
  return updatedNotice;
};

// 공지글 조회 (단일, 사진 포함)
exports.getNoticeWithImages = async (noticeNumber) => {
  const notice = await noticeModel.findNoticeById(noticeNumber);
  if (!notice) return null;
  const images = await noticeModel.findImagesByNoticeId(noticeNumber);
  return { ...notice, images };
};

// 공지글 전체 조회
exports.getAllNotices = async () => {
  return await noticeModel.findAllNotices();
};

// 활성 상태의 공지글 조회
exports.getActiveNotices = async () => {
  return await noticeModel.findActiveNotices();
};
