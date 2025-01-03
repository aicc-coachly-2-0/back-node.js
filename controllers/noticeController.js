const noticeService = require('../services/noticeService');

// 공지글 작성 (사진 포함)
exports.createNoticeWithImages = async (req, res, next) => {
  try {
    const { admin_number, title, content } = req.body;
    const images = req.fileUrls?.map((file) => file.fileUrl) || []; // 이미지 배열 처리
    const notice = await noticeService.createNoticeWithImages({
      admin_number,
      title,
      content,
      images,
    });
    res.status(201).json({ message: 'Notice created successfully', notice });
  } catch (error) {
    next(error);
  }
};

// 공지글 수정
exports.updateNotice = async (req, res, next) => {
  try {
    const { notice_number } = req.params;
    const { title, content } = req.body;
    const images = req.fileUrls?.map((file) => file.fileUrl) || null; // 이미지 배열 처리
    const notice = await noticeService.updateNotice(notice_number, {
      title,
      content,
      images,
    });
    res.status(200).json({ message: 'Notice updated successfully', notice });
  } catch (error) {
    next(error);
  }
};

// 공지글 조회 (단일, 사진 포함)
exports.getNoticeWithImages = async (req, res, next) => {
  try {
    const notice = await noticeService.getNoticeWithImages(
      req.params.notice_number
    );
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.status(200).json(notice);
  } catch (error) {
    next(error);
  }
};

// 공지글 전체 조회
exports.getAllNotices = async (req, res, next) => {
  try {
    const notices = await noticeService.getAllNotices();
    res.status(200).json(notices);
  } catch (error) {
    next(error);
  }
};

// 활성 상태의 공지글 조회
exports.getActiveNotices = async (req, res, next) => {
  try {
    const notices = await noticeService.getActiveNotices();
    res.status(200).json(notices);
  } catch (error) {
    next(error);
  }
};
