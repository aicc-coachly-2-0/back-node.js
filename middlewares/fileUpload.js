const multer = require('multer');
const storage = multer.memoryStorage(); // 메모리 저장소 사용
const upload = multer({ storage });

module.exports = upload;
