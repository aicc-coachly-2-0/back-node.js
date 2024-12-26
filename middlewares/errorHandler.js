module.exports = (error, req, res, next) => {
  console.error(error.stack); // 에러 로그 출력 (선택)

  // 에러 응답 반환
  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error',
  });
};
