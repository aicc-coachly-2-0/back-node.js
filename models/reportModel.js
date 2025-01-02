const { postgreSQL } = require('../config/database');

// 도메인별 테이블 맵핑
const DOMAIN_TABLE_MAP = {
  feed: 'feed_reports',
  feed_comment: 'feed_comment_reports',
  post: 'post_reports',
  post_comment: 'post_comment_reports',
  mission: 'mission_reports',
  mission_validation: 'mission_validation_reports',
  user: 'user_reports',
};

// 신고 접수
exports.insertReport = async (domain, { user_number, target_id, report_reason, report_category }) => {
  const table = DOMAIN_TABLE_MAP[domain];
  if (!table) throw new Error('Invalid domain');

  const query = `
    INSERT INTO ${table} (user_number, ${getTargetColumn(domain)}, report_reason, report_category, state, report_at)
    VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [user_number, target_id, report_reason, report_category];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 도메인별 신고 조회 (목록) - 상태와 카테고리 필터링 추가
exports.findReportsByDomain = async (domain, { state, report_category }) => {
  const table = DOMAIN_TABLE_MAP[domain];
  if (!table) throw new Error('Invalid domain');

  const query = `
    SELECT * FROM ${table}
    WHERE ($1::text IS NULL OR state = $1)
      AND ($2::text IS NULL OR report_category = $2)
    ORDER BY report_at DESC;
  `;
  const values = [state, report_category];
  const { rows } = await postgreSQL.query(query, values);
  return rows;
};

// 특정 사용자가 받은 신고와 신고 수 조회
exports.findReportsForUser = async (userNumber) => {
  const query = `
    SELECT 
        reported_user_number AS user_number,
        COUNT(*) AS report_count,
        ARRAY_AGG(report_reason) AS report_reasons,
        ARRAY_AGG(state) AS report_states,
        ARRAY_AGG(report_at) AS report_dates
    FROM 
        user_reports
    WHERE 
        reported_user_number = $1
    GROUP BY 
        reported_user_number;
  `;
  const { rows } = await postgreSQL.query(query, [userNumber]);
  return rows[0]; // 특정 사용자만 조회하므로 첫 번째 결과만 반환
};

// 특정 유저가 한 신고 조회
exports.findReportsMadeByUser = async (userNumber) => {
  const query = `
    SELECT 
        report_id,
        reported_user_number AS user_number,
        reporter_user_number AS reporter_number,
        report_reason,
        state,
        report_at
    FROM 
        user_reports
    WHERE 
        reporter_user_number = $1;
  `;
  const { rows } = await postgreSQL.query(query, [userNumber]);
  return rows; // 특정 유저가 한 신고 내역 반환
};

// 특정 신고 조회
exports.findReportById = async (domain, reportId) => {
  const table = DOMAIN_TABLE_MAP[domain];
  if (!table) throw new Error('Invalid domain');

  const query = `
    SELECT * FROM ${table} WHERE ${getPrimaryKey(domain)} = $1;
  `;
  const { rows } = await postgreSQL.query(query, [reportId]);
  return rows[0];
};

// 신고 상태 업데이트
exports.updateReportState = async (domain, reportId, { state, admin_number, report_content }) => {
  const table = DOMAIN_TABLE_MAP[domain];
  if (!table) throw new Error('Invalid domain');

  const query = `
    UPDATE ${table}
    SET state = $1
    WHERE ${getPrimaryKey(domain)} = $2
    RETURNING *;
  `;
  const values = [state, reportId];
  const { rows } = await postgreSQL.query(query, values);

  if (rows[0]) {
    // 신고 처리 내역 기록
    await this.insertReportManagement({
      report_type: domain,
      report_id: reportId,
      admin_number,
      report_content,
    });
  }

  return rows[0];
};

// 신고 처리 내역 기록
exports.insertReportManagement = async ({ report_type, report_id, admin_number, report_content }) => {
  const query = `
    INSERT INTO report_managements (report_type, report_id, admin_number, report_content, resolution_at, state)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'resolved')
    RETURNING *;
  `;
  const values = [report_type, report_id, admin_number, report_content];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 신고 처리 내역 조회
exports.findReportManagements = async ({ state }) => {
  const query = `
    SELECT * FROM report_managements
    WHERE ($1::text IS NULL OR state = $1)
    ORDER BY resolution_at DESC;
  `;
  const { rows } = await postgreSQL.query(query, [state]);
  return rows;
};

// Helper: 도메인별 컬럼 반환
function getTargetColumn(domain) {
  const targetColumns = {
    feed: 'feed_number',
    feed_comment: 'feed_comment_number',
    post: 'post_number',
    post_comment: 'post_comment_number',
    mission: 'room_number',
    mission_validation: 'mission_validation_number',
    user: 'reported_user_number',
  };
  return targetColumns[domain];
}

// Helper: 도메인별 기본 키 반환
function getPrimaryKey(domain) {
  const primaryKeys = {
    feed: 'feed_report_number',
    feed_comment: 'feed_comment_report_number',
    post: 'post_report_number',
    post_comment: 'post_comment_report_number',
    mission: 'mission_report_number',
    mission_validation: 'mission_validation_report_number',
    user: 'user_report_number',
  };
  return primaryKeys[domain];
}
