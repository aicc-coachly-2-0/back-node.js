-- ENUM 타입 정의
CREATE TYPE mission_state_enum AS ENUM ('active', 'inactive'); -- 미션 카테고리 상태
CREATE TYPE level_enum AS ENUM ('easy', 'medium', 'hard'); -- 미션 난이도
CREATE TYPE cert_freq_enum AS ENUM ('매일', '평일 매일', '주말 매일'); -- 미션 인증 빈도
CREATE TYPE mission_rooms_state_enum AS ENUM ('recruiting', 'ongoing', 'completed'); -- 미션방 상태
-- CREATE TYPE field_enum AS ENUM ('field1', 'field2', 'field3', 'field4');
-- CREATE TYPE is_secret_enum AS ENUM ('yes', 'no');

CREATE TYPE participant_state_enum AS ENUM ('active', 'banned'); -- 미션 참가자 상태

CREATE TYPE validation_status_enum AS ENUM ('pending', 'approved', 'rejected'); -- 미션 성공 상태
CREATE TYPE validation_state_enum AS ENUM ('active', 'inactive'); -- 미션 인증 상태

CREATE TYPE feed_state_enum AS ENUM ('active', 'inactive', 'deleted');
CREATE TYPE community_state_enum AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE comment_state_enum AS ENUM ('active', 'deleted');
CREATE TYPE post_state_enum AS ENUM ('active', 'hidden', 'deleted');
CREATE TYPE payment_status_enum AS ENUM ('success', 'failed', 'pending');
CREATE TYPE subscription_state_enum AS ENUM ('active', 'paused', 'canceled');
CREATE TYPE refund_state_enum AS ENUM ('requested', 'approved', 'completed', 'rejected');
CREATE TYPE refund_review_state_enum AS ENUM ('pending', 'in_progress', 'approved', 'rejected');
CREATE TYPE classification_state_enum AS ENUM ('active', 'inactive'); -- 질문 카테고리 상태
CREATE TYPE question_state_enum AS ENUM ('pending', 'answered', 'deleted');
CREATE TYPE admin_position_enum AS ENUM ('superadmin', 'manager', 'staff');
CREATE TYPE admin_state_enum AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE answer_state_enum AS ENUM ('active', 'edited', 'deleted');
CREATE TYPE faq_state_enum AS ENUM ('active', 'inactive', 'deleted');
CREATE TYPE notice_state_enum AS ENUM ('active', 'archived', 'deleted');

-- Users 테이블
CREATE TABLE users (
    user_number SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    user_name VARCHAR(50),
    user_email VARCHAR(100),
    user_pw VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 관리자 테이블
CREATE TABLE administrators (
    admin_number SERIAL PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL UNIQUE,
    admin_pw VARCHAR(255) NOT NULL,
    position admin_position_enum DEFAULT 'staff',
    state admin_state_enum DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 미션 종류
CREATE TABLE missions (
    mission_number SERIAL PRIMARY KEY,
    title VARCHAR(50),
    img_link VARCHAR,
    state mission_state_enum DEFAULT 'inactive'
);

-- 미션 방
CREATE TABLE mission_rooms (
    room_number SERIAL PRIMARY KEY,
    user_number INT NOT NULL,
    mission_number INT NOT NULL,
    title VARCHAR(255),
    content TEXT,
    img_link VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at DATE,
    level level_enum,
    field1 field_enum,
    field2 field_enum,
    field3 field_enum,
    is_secret is_secret_enum DEFAULT 'no',
    password VARCHAR(255),
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE,
    CONSTRAINT fk_mission_number FOREIGN KEY (mission_number) REFERENCES missions(mission_number) ON DELETE CASCADE
);
 
-- 미션 참가자
CREATE TABLE mission_participants (
    group_number SERIAL PRIMARY KEY,
    user_number INT NOT NULL,
    room_number INT NOT NULL,
    state participant_state_enum DEFAULT 'active',
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE,
    CONSTRAINT fk_room_number FOREIGN KEY (room_number) REFERENCES mission_rooms(room_number) ON DELETE CASCADE
);

-- 미션 인증
CREATE TABLE mission_validations (
    mission_validation_number SERIAL PRIMARY KEY,
    group_number INT NOT NULL,
    img_link VARCHAR,
    success_status validation_status_enum DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    state validation_state_enum DEFAULT 'active',
    CONSTRAINT fk_group_number FOREIGN KEY (group_number) REFERENCES mission_participants(group_number) ON DELETE CASCADE
);

-- 커뮤니티
CREATE TABLE communities (
    community_number SERIAL PRIMARY KEY,
    community_category VARCHAR(255) NOT NULL,
    state community_state_enum DEFAULT 'active'
);

-- 게시글
CREATE TABLE posts (
    post_number SERIAL PRIMARY KEY,
    user_number INT NOT NULL,
    community_number INT NOT NULL,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    state post_state_enum DEFAULT 'active',
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE,
    CONSTRAINT fk_community_number FOREIGN KEY (community_number) REFERENCES communities(community_number) ON DELETE CASCADE
);

-- 게시글 댓글
CREATE TABLE post_comments (
    post_comment_number SERIAL PRIMARY KEY,
    user_number INT NOT NULL,
    post_number INT NOT NULL,
    reference_comment_number INT DEFAULT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    state comment_state_enum DEFAULT 'active',
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE,
    CONSTRAINT fk_post_number FOREIGN KEY (post_number) REFERENCES posts(post_number) ON DELETE CASCADE,
    CONSTRAINT fk_reference_comment_number FOREIGN KEY (reference_comment_number) REFERENCES post_comments(post_comment_number) ON DELETE SET NULL
);

-- 피드글
CREATE TABLE feeds (
    feed_number SERIAL PRIMARY KEY,
    user_number INT NOT NULL,
    img_number VARCHAR,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    state feed_state_enum DEFAULT 'active',
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE
);


-- 피드 댓글
CREATE TABLE feed_comments (
    feed_comment_number SERIAL PRIMARY KEY,
    feed_number INT NOT NULL,
    user_number INT NOT NULL,
    reference_comment_number INT DEFAULT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    state comment_state_enum DEFAULT 'active',
    CONSTRAINT fk_feed_number FOREIGN KEY (feed_number) REFERENCES feeds(feed_number) ON DELETE CASCADE,
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE,
    CONSTRAINT fk_reference_comment FOREIGN KEY (reference_comment_number) REFERENCES feed_comments(feed_comment_number) ON DELETE SET NULL
);

-- 피드 신고
CREATE TABLE feed_reports (
    feed_report_number SERIAL PRIMARY KEY,
    feed_number INT NOT NULL,
    user_number INT NOT NULL, -- 신고한 사용자
    report_reason TEXT,
    report_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    state VARCHAR(20) DEFAULT 'pending',
    CONSTRAINT fk_feed_number FOREIGN KEY (feed_number) REFERENCES feeds(feed_number) ON DELETE CASCADE,
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE
);
-- 같은 유저가 여러번 하나에 대해 신고하는 것을 방지
ALTER TABLE feed_reports
ADD CONSTRAINT unique_user_feed_report UNIQUE (feed_number, user_number);

-- 피드 댓글 신고
CREATE TABLE feed_comment_reports (
    feed_comment_report_number SERIAL PRIMARY KEY, -- 신고 고유 ID
    feed_comment_number INT NOT NULL, -- 신고 대상 댓글의 ID
    user_number INT NOT NULL, -- 신고자 ID
    report_reason TEXT, -- 신고 사유
    report_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 신고 시간
    state VARCHAR(20) DEFAULT 'pending', -- 신고 상태 ('pending', 'reviewed', 'resolved')
    CONSTRAINT fk_feed_comment_number FOREIGN KEY (feed_comment_number) REFERENCES feed_comments(feed_comment_number) ON DELETE CASCADE,
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE
);
ALTER TABLE feed_comment_reports
ADD CONSTRAINT unique_user_comment_report UNIQUE (feed_comment_number, user_number);

-- 게시글 신고
CREATE TABLE post_reports (
    post_report_number SERIAL PRIMARY KEY, -- 신고 고유 ID
    post_number INT NOT NULL, -- 신고 대상 게시물 ID
    user_number INT NOT NULL, -- 신고자 ID
    report_reason TEXT, -- 신고 사유
    report_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 신고 시간
    state VARCHAR(20) DEFAULT 'pending', -- 신고 상태 (pending, reviewed, resolved)
    CONSTRAINT fk_post_number FOREIGN KEY (post_number) REFERENCES posts(post_number) ON DELETE CASCADE,
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE
);
ALTER TABLE post_reports
ADD CONSTRAINT unique_user_post_report UNIQUE (post_number, user_number);


-- 게시글 댓글 신고
CREATE TABLE post_comment_reports (
    post_comment_report_number SERIAL PRIMARY KEY, -- 신고 고유 ID
    post_comment_number INT NOT NULL, -- 신고 대상 댓글의 ID
    user_number INT NOT NULL, -- 신고자 ID
    report_reason TEXT, -- 신고 사유
    report_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 신고 시간
    state VARCHAR(20) DEFAULT 'pending', -- 신고 상태 (pending, reviewed, resolved)
    CONSTRAINT fk_post_comment_number FOREIGN KEY (post_comment_number) REFERENCES post_comments(post_comment_number) ON DELETE CASCADE,
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE
);
ALTER TABLE post_comment_reports
ADD CONSTRAINT unique_user_post_comment_report UNIQUE (post_comment_number, user_number);

-- 미션 신고
CREATE TABLE mission_reports (
    mission_report_number SERIAL PRIMARY KEY,
    room_number INT NOT NULL,
    user_number INT NOT NULL, -- 신고한 사용자
    report_reason TEXT,
    report_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 신고 시간 기본값
    state VARCHAR(20) DEFAULT 'pending', -- 신고 상태
    CONSTRAINT fk_room_number FOREIGN KEY (room_number) REFERENCES mission_rooms(room_number) ON DELETE CASCADE,
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE
);
ALTER TABLE mission_reports
ADD CONSTRAINT unique_user_room_report UNIQUE (room_number, user_number);

-- 미션인증신고
CREATE TABLE mission_validation_reports (
    mission_validation_report_number SERIAL PRIMARY KEY, -- 신고 고유 ID
    mission_validation_number INT NOT NULL, -- 신고 대상 미션 인증 ID
    user_number INT NOT NULL, -- 신고자 ID
    report_reason TEXT, -- 신고 사유
    report_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 신고 시간
    state VARCHAR(20) DEFAULT 'pending', -- 신고 상태 (pending, reviewed, resolved)
    CONSTRAINT fk_mission_validation_number FOREIGN KEY (mission_validation_number) REFERENCES mission_validations(mission_validation_number) ON DELETE CASCADE,
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE
);
ALTER TABLE mission_validation_reports
ADD CONSTRAINT unique_user_mission_validation_report UNIQUE (mission_validation_number, user_number);


-- 유저 신고
CREATE TABLE user_reports (
    user_report_number SERIAL PRIMARY KEY, -- 신고 고유 ID
    reported_user_number INT NOT NULL, -- 신고된 사용자 ID
    reporting_user_number INT NOT NULL, -- 신고한 사용자 ID
    report_reason TEXT, -- 신고 사유
    report_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 신고 시간
    state VARCHAR(20) DEFAULT 'pending', -- 신고 상태 (pending, reviewed, resolved)
    CONSTRAINT fk_reported_user_number FOREIGN KEY (reported_user_number) REFERENCES users(user_number) ON DELETE CASCADE,
    CONSTRAINT fk_reporting_user_number FOREIGN KEY (reporting_user_number) REFERENCES users(user_number) ON DELETE CASCADE
);
ALTER TABLE user_reports
ADD CONSTRAINT unique_user_report UNIQUE (reported_user_number, reporting_user_number);

-- 신고처리
CREATE TABLE report_managements (
    report_number SERIAL PRIMARY KEY, -- 신고 처리 고유 ID
    report_type VARCHAR(50) NOT NULL, -- 신고 유형 (user, post, feed_comment, mission_validation 등)
    report_id INT NOT NULL, -- 신고 테이블의 고유 ID
    admin_number INT NOT NULL, -- 신고 처리 담당 관리자 ID
    report_content TEXT, -- 신고 처리 내용
    resolution_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 처리 완료 시간
    state VARCHAR(20) DEFAULT 'pending', -- 처리 상태 (pending, reviewed, resolved)
    CONSTRAINT fk_admin_number FOREIGN KEY (admin_number) REFERENCES users(user_number) ON DELETE CASCADE
);

-- 구독
CREATE TABLE subscriptions (
    subscription_number SERIAL PRIMARY KEY,
    user_number INT NOT NULL,
    billing_key VARCHAR(255),
    recurring_payment_date DATE,
    state subscription_state_enum DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE
);

-- 구독취소
CREATE TABLE subscription_cancellations (
    subscription_cancellation_number SERIAL PRIMARY KEY, -- 구독 취소 고유 ID
    subscription_number INT NOT NULL, -- 구독 번호
    reason VARCHAR(255), -- 취소 사유
    canceled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 취소 시간
    CONSTRAINT fk_subscription_number FOREIGN KEY (subscription_number) REFERENCES subscriptions(subscription_number) ON DELETE CASCADE
);


-- 환불
CREATE TABLE refunds (
    refund_number SERIAL PRIMARY KEY, -- 환불 고유 ID
    payment_number INT NOT NULL, -- 결제 번호
    reason VARCHAR(255), -- 환불 요청 사유
    request_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 환불 요청 시간
    completed_at TIMESTAMP, -- 환불 완료 시간
    state refund_state_enum DEFAULT 'requested', -- 환불 상태
    CONSTRAINT fk_payment_number FOREIGN KEY (payment_number) REFERENCES payments(payment_number) ON DELETE CASCADE
);

-- 환불심사
CREATE TABLE refund_reviews (
    refund_review_number SERIAL PRIMARY KEY, -- 환불 검토 고유 ID
    refund_number INT NOT NULL, -- 환불 요청 ID
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 검토 시작 시간
    completed_at TIMESTAMP, -- 검토 완료 시간
    reason VARCHAR(255), -- 검토 사유
    state refund_review_state_enum DEFAULT 'pending', -- 검토 상태
    CONSTRAINT fk_refund_number FOREIGN KEY (refund_number) REFERENCES refunds(refund_number) ON DELETE CASCADE
);

-- 질문 카테고리
CREATE TABLE question_classifications (
    question_category_number SERIAL PRIMARY KEY, -- 질문 카테고리 고유 ID
    question_category VARCHAR(255) NOT NULL, -- 질문 카테고리 이름
    state classification_state_enum DEFAULT 'active' -- 카테고리 상태
);

-- 질문 테이블
CREATE TABLE questions (
    question_number SERIAL PRIMARY KEY, -- 질문 고유 ID
    user_number INT NOT NULL, -- 질문 작성자 ID
    question_classification_number INT NOT NULL, -- 질문 분류 ID
    title VARCHAR(255) NOT NULL, -- 질문 제목
    question_content TEXT NOT NULL, -- 질문 내용
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 생성 시간
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 수정 시간
    state question_state_enum DEFAULT 'pending', -- 질문 상태
    CONSTRAINT fk_user_number FOREIGN KEY (user_number) REFERENCES users(user_number) ON DELETE CASCADE,
    CONSTRAINT fk_question_classification FOREIGN KEY (question_classification_number) REFERENCES question_classifications(question_classification_number) ON DELETE CASCADE
);

-- 질문 대답
CREATE TABLE answers (
    answer_number SERIAL PRIMARY KEY, -- 답변 고유 ID
    question_number INT NOT NULL, -- 질문 ID
    admin_number INT NOT NULL, -- 답변 작성자 (관리자 ID)
    answer_content TEXT NOT NULL, -- 답변 내용
    answer_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 답변 작성 시간
    state answer_state_enum DEFAULT 'active', -- 답변 상태
    CONSTRAINT fk_question_number FOREIGN KEY (question_number) REFERENCES questions(question_number) ON DELETE CASCADE,
    CONSTRAINT fk_admin_number FOREIGN KEY (admin_number) REFERENCES administrators(admin_number) ON DELETE CASCADE
);

-- 자주묻는 질문
CREATE TABLE faqs (
    faq_number SERIAL PRIMARY KEY, -- FAQ 고유 ID
    question_category_number INT NOT NULL, -- 질문 카테고리 ID
    content TEXT NOT NULL, -- FAQ 질문 내용
    answer TEXT NOT NULL, -- FAQ 답변 내용
    state faq_state_enum DEFAULT 'active', -- FAQ 상태
    CONSTRAINT fk_question_category FOREIGN KEY (question_category_number) REFERENCES question_classifications(question_category_number) ON DELETE CASCADE
);

-- 공지
CREATE TABLE notices (
    notice_number SERIAL PRIMARY KEY, -- 공지 고유 ID
    admin_number INT NOT NULL, -- 공지 작성 관리자 ID
    title VARCHAR(255) NOT NULL, -- 공지 제목
    content TEXT NOT NULL, -- 공지 내용
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 공지 작성 시간
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 공지 수정 시간
    deleted_at TIMESTAMP, -- 공지 삭제 시간
    state notice_state_enum DEFAULT 'active', -- 공지 상태
    CONSTRAINT fk_admin_number FOREIGN KEY (admin_number) REFERENCES administrators(admin_number) ON DELETE CASCADE
);


-- 공지 사진
CREATE TABLE notice_images (
    notice_image_number SERIAL PRIMARY KEY, -- 공지 이미지 고유 ID
    notice_number INT NOT NULL, -- 공지사항 ID
    img_link VARCHAR(255) NOT NULL, -- 이미지 링크
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 이미지 추가 시간
    CONSTRAINT fk_notice_number FOREIGN KEY (notice_number) REFERENCES notices(notice_number) ON DELETE CASCADE
);

-- 블랙리스트
CREATE TABLE blacklists (
    blacklist_number SERIAL PRIMARY KEY, -- 블랙리스트 고유 ID
    report_number INT NOT NULL, -- 신고 ID
    reason VARCHAR(255) NOT NULL, -- 블랙리스트 사유
    suspension_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 블랙리스트 등록 시간
    CONSTRAINT fk_report_number FOREIGN KEY (report_number) REFERENCES report_managements(report_number) ON DELETE CASCADE
);


-- Updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Questions 테이블에 트리거 추가
CREATE TRIGGER trigger_update_questions
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Administrators 테이블에 트리거 추가
CREATE TRIGGER trigger_update_admin_updated_at
BEFORE UPDATE ON administrators
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Notices 테이블에 트리거 추가
CREATE TRIGGER trigger_update_notice_updated_at
BEFORE UPDATE ON notices
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Subscriptions 테이블에 트리거 추가
CREATE TRIGGER trigger_update_subscriptions
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();