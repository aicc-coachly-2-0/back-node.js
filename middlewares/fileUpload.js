const multer = require('multer');
const { Readable } = require('stream');
const Client = require('ssh2-sftp-client');
const config = require('../config/config');
const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

const uploadFileToSFTP = async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(); // 파일이 없으면 바로 다음 미들웨어로
  }

  const sftp = new Client();
  const uploadedFiles = [];

  try {
    console.log('SFTP 연결 시도 중...');
    await sftp.connect({
      host: config.ftp.host,
      port: config.ftp.port,
      username: config.ftp.user,
      password: config.ftp.password,
      secure: config.ftp.secure,
      readyTimeout: 120000, // Timeout을 2분으로 늘려보기
      keepaliveInterval: 60000, // 연결을 유지하기 위한 설정
      maxConnections: 5, // 최대 연결 수 설정
    });
    console.log('SFTP 연결 성공');

    const imageType = req.body.imageType || 'profile'; // body에서 imageType 받기
    const uploaderId = req.body.user_id || req.body.admin_id;
    const isAdmin = req.body.admin_id ? true : false;

    if (!uploaderId) {
      throw new Error('Uploader ID (user_id or admin_id) is required');
    }

    console.log('파일 업로드 시작');
    console.log('파일 개수:', Object.keys(req.files).length);
    console.log('이미지 타입:', imageType);

    const uploadDir = `${imageType}/`;
    await sftp.mkdir(uploadDir, true);

    // 파일 업로드 시작
    for (const [fieldName, files] of Object.entries(req.files)) {
      for (const file of files) {
        const prefix = isAdmin ? 'admin' : 'user';
        const fileExtension = file.originalname.split('.').pop();

        // 유저 ID만으로 파일 이름 설정
        let fileName = `${prefix}_${uploaderId}.${fileExtension}`;
        let filePath = `${uploadDir}${fileName}`;
        let fileExists = await sftp.exists(filePath);

        // 같은 이름의 파일이 있을 경우 숫자를 붙여서 이름을 변경
        let counter = 1;
        while (fileExists) {
          fileName = `${prefix}_${uploaderId}-${counter}.${fileExtension}`;
          filePath = `${uploadDir}${fileName}`;
          fileExists = await sftp.exists(filePath);
          counter++;
        }

        const fileStream = Readable.from(file.buffer);

        console.log(`파일 업로드 중: ${filePath}`);
        await sftp.put(fileStream, filePath);
        const fileUrl = `${config.ftp.baseUrl}/${filePath}`;
        uploadedFiles.push({ fieldName, filePath, fileUrl });
        console.log(`파일 업로드 완료: ${filePath}`);
      }
    }

    req.fileUrls = uploadedFiles.map((file) => ({
      fieldName: file.fieldName,
      fileUrl: file.fileUrl,
    }));

    console.log('모든 파일 업로드 완료');

    // 업로드가 완료되었으므로 다음 미들웨어로 진행
    return next();
  } catch (err) {
    console.error('SFTP 업로드 실패:', err.message);

    // 업로드된 파일 삭제
    for (const file of uploadedFiles) {
      try {
        console.log(`파일 삭제 중: ${file.filePath}`);
        await sftp.remove(file.filePath);
        console.log(`삭제 완료: ${file.filePath}`);
      } catch (deleteError) {
        console.error(`파일 삭제 실패: ${file.filePath}`, deleteError);
      }
    }

    // 실패 시 에러 응답
    return res.status(500).json({ error: '파일 업로드 실패' });
  } finally {
    // 항상 연결 종료
    try {
      console.log('SFTP 연결 종료 중...');
      await sftp.end();
      console.log('SFTP 연결 종료 완료');
    } catch (endError) {
      console.error('SFTP 연결 종료 오류:', endError.message);
      // 추가적인 정보로 endError.stack 출력
      console.error(endError.stack);
    }
  }
};

module.exports = {
  upload: upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'feedPicture', maxCount: 1 },
    { name: 'postPicture', maxCount: 1 },
    { name: 'noticePicture', maxCount: 10 },
  ]),
  uploadFileToSFTP,
};
