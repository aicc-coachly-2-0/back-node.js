// reportModel
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

// 신고 접수 및 처리 내역 자동 생성
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

  // 신고가 접수된 후 자동으로 신고 처리 내역을 생성
  const report = rows[0];
  await reportModel.insertReportManagement({
    report_type: domain,
    report_id: report[`${domain}_report_number`], // 도메인별 보고서 번호
    admin_number: null, // 초기에는 null로 설정 (관리자가 처리하기 전)
    report_content: `신고 접수: ${report_reason}`,
    state: 'pending', // 신고 처리 상태 초기화
    ban_until: null,  // 영구 정지나 기간이 없는 경우 null로 설정
  });

  return report;
};

// 도메인별 신고 조회 (목록) - 상태와 카테고리 필터링 추가
exports.findReportsByDomain = async (domain, { state, report_category }) => {
  const table = DOMAIN_TABLE_MAP[domain];
  if (!table) throw new Error('Invalid domain');

  let orderByClause = 'ORDER BY report_at DESC'; // 기본적으로 최신순 정렬

  // 상태가 'pending'일 경우에는 오래된 순서대로 정렬
  if (state === 'pending') {
    orderByClause = 'ORDER BY report_at ASC'; // 오래된 순서대로 정렬
  }

  const query = `
    SELECT * FROM ${table}
    WHERE ($1::text IS NULL OR state = $1)
      AND ($2::text IS NULL OR report_category = $2)
    ${orderByClause};
  `;
  const values = [state, report_category];
  const { rows } = await postgreSQL.query(query, values);
  return rows;
};


// 특정 사용자가 받은 신고와 신고 수 조회
exports.findReportsForUser = async (user_number) => {
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
  const { rows } = await postgreSQL.query(query, [user_number]);
  return rows[0]; // 특정 사용자만 조회하므로 첫 번째 결과만 반환
};

// 특정 유저가 한 신고 조회
exports.findReportsMadeByUser = async (user_number) => {
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
  const { rows } = await postgreSQL.query(query, [user_number]);
  return rows; // 특정 유저가 한 신고 내역 반환
};

// 특정 신고 조회
exports.findReportById = async (domain, report_id) => {
  const table = DOMAIN_TABLE_MAP[domain];
  if (!table) throw new Error('Invalid domain');

  const query = `
    SELECT * FROM ${table} WHERE ${getPrimaryKey(domain)} = $1;
  `;
  const { rows } = await postgreSQL.query(query, [report_id]);
  return rows[0];
};

// 신고 처리 내역 기록
exports.insertReportManagement = async ({ report_type, report_id, admin_number, report_content, state, ban_until }) => {
  const query = `
    INSERT INTO report_managements (report_type, report_id, admin_number, report_content, state, resolution_at, ban_until)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
    RETURNING *;
  `;
  const values = [report_type, report_id, admin_number, report_content, state, ban_until];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]; // 삽입된 신고 처리 내역 반환
  } catch (error) {
    console.error('Failed to insert report management:', error.message);
    throw error;
  }
};

// 블랙리스트에 영구 정지 기록
exports.insertToBlacklist = async (report_number, ban_reason) => {
  const query = `
    INSERT INTO blacklist (report_number, reason, suspension_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    RETURNING *;
  `;
  const values = [report_number, ban_reason];

  try {
    const { rows } = await postgreSQL.query(query, values);
    return rows[0]; // 블랙리스트 삽입된 내용 반환
  } catch (error) {
    console.error('Failed to insert to blacklist:', error.message);
    throw error;
  }
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

exports.findBlacklist = async (filters = {}) => {
  try {
    // 필터링 조건을 적용하여 블랙리스트 데이터를 조회
    let query = 'SELECT * FROM blacklist WHERE 1=1';
    const params = [];

    // 필터링 조건이 있으면 query 수정
    if (filters.state) {
      query += ' AND state = ?';
      params.push(filters.state);
    }

    if (filters.reason) {
      query += ' AND reason LIKE ?';
      params.push(`%${filters.reason}%`);
    }

    // DB에서 블랙리스트 조회
    const [rows] = await db.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error in findBlacklist model:', error.message);
    throw error;
  }
};