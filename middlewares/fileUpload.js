const multer = require('multer');
const { Readable } = require('stream'); // Readable 추가
const ftp = require('basic-ftp');
const config = require('../config/config');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadFileToFTP = async (req, res, next) => {
  if (!req.file) {
    return next(); // 파일이 없으면 바로 다음 미들웨어로
  }

  const client = new ftp.Client();
  try {
    await client.access({
      host: config.ftp.host,
      port: config.ftp.port,
      user: config.ftp.user,
      password: config.ftp.password,
      secure: config.ftp.secure,
    });

    // 이미지 타입 가져오기
    const imageType = req.body.imageType || 'profile'; // 기본값: 'profile'

    // user_id 또는 admin_id 가져오기
    const uploaderId = req.body.user_id || req.body.admin_id;
    const isAdmin = req.body.admin_id ? true : false;

    if (!uploaderId) {
      return res
        .status(400)
        .json({ error: 'Uploader ID (user_id or admin_id) is required' });
    }

    // 파일 이름 생성
    const prefix = isAdmin ? 'admin' : 'user';
    const fileName = `${prefix}${uploaderId}_${Date.now()}`;

    // 업로드 경로 동적 설정
    const ftpDirectory = `${imageType}/`; // 이미지 성질에 따라 디렉토리 설정
    await client.uploadFrom(
      Readable.from(req.file.buffer),
      `${ftpDirectory}${fileName}`
    );

    req.fileUrl = `${config.ftp.baseUrl}/${ftpDirectory}${fileName}`; // 업로드된 파일 URL 저장
    client.close();
    next();
  } catch (err) {
    client.close();
    console.error('FTP 업로드 실패:', err.message);
    res.status(500).json({ error: '파일 업로드 실패' });
  }
};

module.exports = {
  upload,
  uploadFileToFTP,
};
