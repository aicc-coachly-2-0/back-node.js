const validationService = require('../services/validationService');

exports.uploadMissionValidation = async (req, res, next) => {
  try {
    // 1. 요청 데이터 가져오기
    const { room_number } = req.params; // URL 파라미터에서 room_number 가져오기
    const user_number = req.user.user_number; // JWT 토큰에서 user_number 가져오기
    const imageUrl = req.fileUrls?.[0]?.fileUrl; // 업로드된 이미지 URL 가져오기

    // 2. group_number 조회
    const group_number = await validationService.getGroupNumber(
      user_number,
      room_number
    );

    // 3. group_number가 없으면 에러 반환
    if (!group_number) {
      return res
        .status(404)
        .json({ error: '해당 미션방에 참여 기록이 없습니다.' });
    }

    // 4. 서비스 계층으로 데이터 전달
    const validationData = {
      group_number,
      image_url: imageUrl,
    };

    const savedValidation = await validationService.uploadMissionValidation(
      validationData
    );

    // 5. 성공 응답
    res.status(201).json({
      message: '미션 인증샷 업로드 성공',
      data: savedValidation,
    });
  } catch (error) {
    // 6. 에러 처리
    console.error('미션 인증샷 업로드 실패:', error.message);
    next(error);
  }
};
