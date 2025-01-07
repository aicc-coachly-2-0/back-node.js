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

// 도메인 테이블 맵핑 가져오기
function getDomainTable(domain) {
  console.log('Received domain:', domain); // 로그 추가
  const table = DOMAIN_TABLE_MAP[domain];
  if (!table) throw new Error('Invalid domain');
  return table;
}

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

// 도메인별 user_number를 찾는 쿼리
function getUserNumberTable(domain) {
  const DOMAIN_USER_TABLE_MAP = {
    feed: 'feeds',
    comment: 'comments',
    post: 'posts',
    post_comment: 'post_comments',
    mission: 'missions',
    mission_validation: 'mission_validations',
    user: 'users',
  };
  return DOMAIN_USER_TABLE_MAP[domain] || null;
}

// 신고 접수
exports.insertReport = async (
  domain,
  { user_number, target_id, report_reason }
) => {
  const table = getDomainTable(domain);
  const targetColumn = getTargetColumn(domain);

  const query = `
    INSERT INTO ${table} (user_number, ${targetColumn}, report_reason, state, report_at)
    VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP)
    RETURNING *;
  `;

  const values = [user_number, target_id, report_reason];

  const { rows } = await postgreSQL.query(query, values);
  return rows[0];
};

// 도메인별 신고 조회 (목록) - 상태와 카테고리 필터링 추가
exports.findReportsByDomain = async (domain, { state }) => {
  const table = getDomainTable(domain);

  let orderByClause = 'ORDER BY report_at DESC'; // 기본적으로 최신순 정렬

  // 상태가 'pending'일 경우에는 오래된 순서대로 정렬
  if (state === 'pending') {
    orderByClause = 'ORDER BY report_at ASC'; // 오래된 순서대로 정렬
  }

  const query = `
    SELECT * FROM ${table}
    WHERE ($1::text IS NULL OR state = $1)
    ${orderByClause};
  `;
  const values = [state];
  const { rows } = await postgreSQL.query(query, values);
  return rows;
};

// 도메인별 특정 사용자가 받은 신고와 신고 수 조회
exports.findReportsForUser = async (user_number, domain) => {
  const table = getDomainTable(domain);
  const targetColumn = getTargetColumn(domain);
  const userTable = getUserNumberTable(domain);
  console.log('Received domain!!!:', domain); // 로그 추가

  // 'user' 도메인일 경우, 'f.user_number' 대신 'f.reporting_user_number' 사용
  const userColumn =
    domain === 'user' ? 'reporting_user_number' : 'user_number';

  const query = `
    SELECT 
          fr.${targetColumn} AS target_id,
          COUNT(*) AS report_count,
          ARRAY_AGG(fr.report_reason) AS report_reasons,
          ARRAY_AGG(fr.state) AS report_states,
          ARRAY_AGG(fr.report_at) AS report_dates
      FROM 
          ${userTable} f
      JOIN 
          ${table} fr ON fr.${targetColumn} = f.${targetColumn}  -- 해당 피드의 신고 내역을 연결
      WHERE 
          f.${userColumn} = $1  -- 특정 사용자의 user_number로 필터링
      GROUP BY 
          fr.${targetColumn};  -- 신고된 피드의 고유 ID를 기준으로 그룹화
  `;
  const { rows } = await postgreSQL.query(query, [user_number]);
  return rows;
};

// 전체 도메인에서 특정 사용자가 받은 신고와 신고 수 조회
exports.findAllReportsForUser = async (user_number) => {
  const domains = Object.keys(DOMAIN_TABLE_MAP);
  console.log('Received domain!:', domains); // 로그 추가
  const reportPromises = domains.map(async (domain) => {
    const table = getDomainTable(domain);
    const targetColumn = getTargetColumn(domain);
    const userTable = getUserNumberTable(domain);

    // 'user' 도메인일 경우, 'f.user_number' 대신 'f.reporting_user_number' 사용
    const userColumn =
      domain === 'user' ? 'reporting_user_number' : 'user_number';

    const query = `
      SELECT 
          fr.${targetColumn} AS target_id,
          COUNT(*) AS report_count,
          ARRAY_AGG(fr.report_reason) AS report_reasons,
          ARRAY_AGG(fr.state) AS report_states,
          ARRAY_AGG(fr.report_at) AS report_dates
      FROM 
          ${userTable} f
      JOIN 
          ${table} fr ON fr.${targetColumn} = f.${targetColumn}  -- 해당 피드의 신고 내역을 연결
      WHERE 
          f.${userColumn} = $1  -- 특정 사용자의 user_number로 필터링
      GROUP BY 
          fr.${targetColumn};  -- 신고된 피드의 고유 ID를 기준으로 그룹화
    `;
    console.log('Executing query:', query); // 실행되는 쿼리 출력
    const { rows } = await postgreSQL.query(query, [user_number]);
    return rows;
  });

  // 모든 도메인의 데이터를 병합
  const allReports = await Promise.all(reportPromises);
  return allReports.flat(); // 배열을 평탄화하여 결과 반환
};

// 1. 사용자가 1주일 내 금지된 도메인 여부 확인
const checkWeeklyBan = async (userId, domain) => {
  const now = new Date();
  const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));

  const { rows: recentSuspensions } = await postgreSQL.query(
    `
    SELECT COUNT(*) 
    FROM report_managements
    WHERE user_id = $1
    AND domain = $2
    AND state = 'resolved'  -- 'resolved' 상태에서만 금지된 것으로 간주
    AND report_at > $3;    -- 1주일 이내에 신고가 처리된 경우
  `,
    [userId, domain, oneWeekAgo]
  );

  return recentSuspensions[0].count > 0;
};

// 2. 사용자의 1개월 내 누적 정지 횟수 확인
const checkMonthlySuspensionCount = async (userId) => {
  const now = new Date();
  const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));

  const { rows: monthlySuspensions } = await postgreSQL.query(
    `
    SELECT COUNT(*) 
    FROM report_managements
    WHERE user_id = $1
    AND state = 'resolved'  -- 'resolved' 상태에서만 정지된 것으로 간주
    AND report_at > $2;    -- 1개월 이내에 신고가 처리된 경우
  `,
    [userId, oneMonthAgo]
  );

  return monthlySuspensions[0].count;
};

// 3. 영구 정지 및 도메인 금지 체크
const checkSuspensionStatus = async (userId, domain) => {
  const weeklyBan = await checkWeeklyBan(userId, domain);
  const monthlySuspensionCount = await checkMonthlySuspensionCount(userId);

  if (monthlySuspensionCount >= 3) {
    return {
      status: 'permanent-ban',
      message: '영구 정지되었습니다. AI 도메인 외에 글 작성이 금지됩니다.',
    };
  }

  if (weeklyBan) {
    return {
      status: 'domain-banned',
      message: `해당 도메인(${domain})은 1주일 내에 금지되었습니다.`,
    };
  }

  return { status: 'ok' };
};

// 4. 계정 정지 상태에 따라 권한 처리
const handleUserAction = async (userId, domain, action) => {
  const suspensionStatus = await checkSuspensionStatus(userId, domain);

  if (suspensionStatus.status === 'permanent-ban') {
    if (domain !== 'AI') {
      return { success: false, message: suspensionStatus.message };
    }
  } else if (suspensionStatus.status === 'domain-banned') {
    return { success: false, message: suspensionStatus.message };
  }

  // 정지 상태가 아니면 글 작성 등을 처리하는 로직 진행
  if (action === 'write') {
    // 글 작성 로직
    return { success: true, message: '글 작성이 완료되었습니다.' };
  }

  return { success: false, message: '알 수 없는 액션입니다.' };
};

// 특정 유저가 한 신고 조회
exports.findReportsMadeByUser = async (user_number) => {
  //  도메인 리스트 가져오기
  const domains = Object.keys(DOMAIN_TABLE_MAP);

  // 각 도메인에 대한 신고 조회 쿼리 실행
  const reportPromises = domains.map(async (domain) => {
    const table = getDomainTable(domain);
    const targetColumn = getTargetColumn(domain);

    // 'user' 도메인 처리
    const userColumn =
      domain === 'user' ? 'reporting_user_number' : 'user_number';
    // 쿼리 작성
    const query = `
   SELECT
       '${domain}' AS domain, -- 도메인 이름 추가
       ${targetColumn} AS target_id,   -- 신고 고유 번호
       report_reason,         -- 신고 사유
       state,                 -- 신고 상태
       report_at              -- 신고 날짜
   FROM
       ${table}
   WHERE
       ${userColumn} = $1;      -- 특정 유저가 한 신고
  `;

    // 쿼리 실행
    const { rows } = await postgreSQL.query(query, [user_number]);
    return rows;
  });

  // 모든 쿼리 결과를 병합
  const allReports = await Promise.all(reportPromises);
  return allReports.flat(); // 결과를 평탄화하여 반환
};

// 특정 신고 조회
exports.findReportById = async (domain, report_id) => {
  const table = DOMAIN_TABLE_MAP[domain];
  if (!table) throw new Error('Invalid domain');

  const query = `
    SELECT * FROM ${table} WHERE ${getPrimaryKey(domain)} = $1;
  `;
  const { rows } = await postgreSQL.query(query, [reportId]);
  return rows[0];
};

// 신고 상태 업데이트
exports.updateReportState = async (
  domain,
  report_number,
  state,
  admin_number,
  report_content,
  ban_until
) => {
  const table = DOMAIN_TABLE_MAP[domain];
  if (!table) throw new Error('Invalid domain');

  // 신고 상태 업데이트
  const query = `
    UPDATE ${table}
    SET state = $1
    WHERE ${getPrimaryKey(domain)} = $2
    RETURNING *;
  `;
  const values = [state, report_number];
  const { rows } = await postgreSQL.query(query, values);

  if (rows[0]) {
    // 신고 처리 내역 기록 (report_managements 테이블만)
    const reportManagement = await this.insertOrUpdateReportManagement({
      report_type: domain,
      report_number,
      admin_number,
      report_content,
      ban_until,
    });
    return reportManagement; // 업데이트된 또는 삽입된 신고 처리 내역 반환
  }

  return rows[0];
};

// 신고 처리 내역 기록 (업데이트 또는 삽입)
exports.insertOrUpdateReportManagement = async ({
  report_type,
  report_number,
  admin_number,
  report_content,
  ban_until,
}) => {
  // 신고 처리 내역이 이미 존재하는지 확인
  const checkQuery = `
    SELECT * FROM report_managements
    WHERE report_number = $1;
  `;
  const checkResult = await postgreSQL.query(checkQuery, [report_number]);

  if (checkResult.rows.length > 0) {
    // 신고 처리 내역이 존재하면 업데이트
    const updateQuery = `
      UPDATE report_managements
      SET admin_number = $2,
          report_content = $3,
          resolution_at = CURRENT_TIMESTAMP,
          state = 'resolved',
          ban_until = $4
      WHERE report_number = $1
      RETURNING *;
    `;
    const updateValues = [
      report_number,
      admin_number,
      report_content,
      ban_until,
    ];
    const { rows } = await postgreSQL.query(updateQuery, updateValues);
    return rows[0]; // 업데이트된 내역 반환
  } else {
    // 신고 처리 내역이 없으면 삽입
    const insertQuery = `
      INSERT INTO report_managements (report_type, report_number, admin_number, report_content, resolution_at, state, ban_until)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'resolved', $5)
      RETURNING *;
    `;
    const insertValues = [
      report_type,
      report_number,
      admin_number,
      report_content,
      ban_until,
    ];
    const { rows } = await postgreSQL.query(insertQuery, insertValues);
    return rows[0]; // 삽입된 내역 반환
  }
};

// 신고 처리 내역 조회 (특정 신고에 대한 처리 내역)
exports.findReportManagementByReportNumber = async (report_number) => {
  const query = `
    SELECT * FROM report_managements 
    WHERE report_number = $1
    ORDER BY resolution_at DESC;
  `;
  const { rows } = await postgreSQL.query(query, [report_number]);
  return rows;
};
