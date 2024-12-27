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
exports.insertReport = async (domain, { user_number, target_id, report_reason }) => {
  const table = DOMAIN_TABLE_MAP[domain];
  if (!table) throw new Error('Invalid domain');

  const query = `
    INSERT INTO ${table} (user_number, ${getTargetColumn(domain)}, report_reason, state, report_at)
    VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [user_number, target_id, report_reason];
  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 도메인별 신고 조회 (목록)
exports.findReportsByDomain = async (domain, { state }) => {
  const table = DOMAIN_TABLE_MAP[domain];
  if (!table) throw new Error('Invalid domain');

  const query = `
    SELECT * FROM ${table}
    WHERE ($1::text IS NULL OR state = $1)
    ORDER BY report_at DESC;
  `;
  const { rows } = await postgreSQL.query(query, [state]);
  return rows;
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
