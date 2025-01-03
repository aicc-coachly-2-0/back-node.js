const multer = require('multer');
const { Readable } = require('stream');
const ftp = require('basic-ftp');
const config = require('../config/config');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
});

const uploadFileToFTP = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(); // 파일이 없으면 바로 다음 미들웨어로
  }

  const client = new ftp.Client();
  const uploadedFiles = [];

  try {
    await client.access({
      host: config.ftp.host,
      port: config.ftp.port,
      user: config.ftp.user,
      password: config.ftp.password,
      secure: config.ftp.secure,
    });

    const imageType = req.body.imageType || 'profile';
    const uploaderId = req.body.user_id || req.body.admin_id;
    const isAdmin = req.body.admin_id ? true : false;

    if (!uploaderId) {
      throw new Error('Uploader ID (user_id or admin_id) is required');
    }

    for (const [fieldName, files] of Object.entries(req.files)) {
      for (const file of files) {
        const prefix = isAdmin ? 'admin' : 'user';
        const fileName = `${prefix}_${uploaderId}_${Date.now()}`;
        const ftpDirectory = `${imageType}/`;
        const filePath = `${ftpDirectory}${fileName}`;

        await client.uploadFrom(Readable.from(file.buffer), filePath);
        const fileUrl = `${config.ftp.baseUrl}/${filePath}`;
        uploadedFiles.push({ fieldName, filePath, fileUrl });
      }
    }

    req.fileUrls = uploadedFiles.map((file) => ({
      fieldName: file.fieldName,
      fileUrl: file.fileUrl,
    }));
    client.close();
    next();
  } catch (err) {
    console.error('FTP 업로드 실패:', err.message);

    // 실패 시 업로드된 파일 삭제
    for (const file of uploadedFiles) {
      try {
        await client.remove(file.filePath);
        console.log(`삭제 완료: ${file.filePath}`);
      } catch (deleteError) {
        console.error(
          `파일 삭제 실패 (${file.filePath}):`,
          deleteError.message
        );
      }
    }

    client.close();
    res.status(500).json({ error: '파일 업로드 실패' });
  }
};

module.exports = {
  upload: upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'feedPicture', maxCount: 1 },
    { name: 'noticePicture', maxCount: 10 },
  ]),
  uploadFileToFTP,
};
