const express = require('express');
const router = express.Router();
const missionController = require('../controllers/missionController');
const missionDetailsController = require('../controllers/missionDetailsController');
const validationController = require('../controllers/validationController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { upload, uploadFileToSFTP } = require('../middlewares/fileUpload');

// 미션방 생성 (SFTP 이미지 업로드 적용)
router.post(
  '/',
  authenticateToken, // 사용자 인증
  upload, // multer로 파일 처리
  uploadFileToSFTP, // SFTP 서버로 파일 업로드 및 URL 생성
  missionController.createMission // 미션방 생성 컨트롤러
);

// 미션 참여 엔드포인트
router.post(
  '/rooms/:room_number/join',
  authenticateToken,
  missionController.joinMissionRoom
);

// "지금 주목받는 미션" 5개 조회
router.get('/popular', missionController.getPopularMissions);

// 마감 임박 미션 5개 조회
router.get('/upcoming', missionController.getUpcomingMissions);

// 참여 중인 미션 5개 조회
router.get(
  '/participating',
  authenticateToken,
  missionController.getParticipatingMissions
);

// 로그인 없이 조회 가능한 미션 전체 조회 + 필터링(카테고리/ 시작일)
router.get('/popular-all', missionController.getPublicMissions); // 주목받는 미션
router.get('/upcoming-all', missionController.getPublicMissions); // 마감 임박 미션

// 로그인 필요한 미션 전체 조회 + 필터링(카테고리)
router.get(
  '/participating-all',
  authenticateToken,
  missionController.getAuthRequiredMissions
); // 참여 중인 미션
router.get(
  '/completed-all',
  authenticateToken,
  missionController.getAuthRequiredMissions
); // 참여했던 미션

// 모집 중인 미션 상세 페이지 조회
router.get(
  '/recruiting/:room_number',
  missionDetailsController.getRecruitingMissionDetails
);

// 진행 중 또는 완료된 미션 상세 페이지 조회
router.get('/detail/:room_number', missionDetailsController.getMissionDetails);

// 미션 인증샷 업로드
router.post(
  '/rooms/:room_number/validate',
  authenticateToken,
  upload, // 이미지 처리 (multer)
  uploadFileToSFTP, // FTP 서버로 이미지 업로드
  validationController.uploadMissionValidation
);

// 미션 인증샷 상세 조회
router.get(
  '/validations/:mission_validation_number',
  authenticateToken,
  validationController.getMissionValidationDetail
);

// 인증샷 확인해주기
router.get(
  '/validations/:mission_validation_number/approvals',
  authenticateToken,
  validationController.approveMissionValidation
);

// 사용자의 미션 인증샷 전체 리스트 조회
router.get(
  '/rooms/:room_number/my-validations',
  authenticateToken,
  validationController.getUserMissionValidations
);

// 참가자 인증샷 전체 리스트 조회 (로그인 유저 제외한 미션방 참여 유저)
router.get(
  '/rooms/:room_number/participant-validations',
  authenticateToken,
  validationController.getParticipantValidations
);

module.exports = router;
