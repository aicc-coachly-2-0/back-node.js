-- 유저 테이블

CREATE TYPE gender_enum AS ENUM ('male', 'female');
CREATE TYPE status_enum AS ENUM ('active', 'inactive', 'deleted');

CREATE TABLE users (
    user_number SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    user_name VARCHAR(30),
    user_email VARCHAR(50) UNIQUE,
    user_pw VARCHAR(255),
    user_phone BIGINT,
    user_date_of_birth DATE,
    user_gender gender_enum,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    status status_enum DEFAULT 'active'
);
