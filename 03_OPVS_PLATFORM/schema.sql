-- Schema for OPVS

-- Core tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE beans (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    content_type VARCHAR(100),
    provenance JSONB,
    minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_minted_at (user_id, minted_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AIstudio integration tables
CREATE TABLE google_ai_studio_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    base_model VARCHAR(100) NOT NULL DEFAULT 'gemini-pro',
    tuned_model_id VARCHAR(255),
    calibration_mode VARCHAR(50) DEFAULT 'transformation',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE google_ai_studio_calibrations (
    id SERIAL PRIMARY KEY,
    session_id INT NOT NULL,
    bean_id INT,
    tuned_model_id VARCHAR(255),
    soul_signature JSONB,
    training_examples INT DEFAULT 0,
    resonance_score FLOAT DEFAULT 0,
    integrity_score FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES google_ai_studio_sessions(id),
    FOREIGN KEY (bean_id) REFERENCES beans(id)
);

CREATE TABLE google_ai_studio_resonance_events (
    id SERIAL PRIMARY KEY,
    calibration_id INT NOT NULL,
    event_type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (calibration_id) REFERENCES google_ai_studio_calibrations(id)
);

-- Indexes for performance
CREATE INDEX idx_gai_sessions_user ON google_ai_studio_sessions(user_id);
CREATE INDEX idx_gai_sessions_started ON google_ai_studio_sessions(started_at);
CREATE INDEX idx_gai_calibrations_session ON google_ai_studio_calibrations(session_id);
CREATE INDEX idx_gai_calibrations_bean ON google_ai_studio_calibrations(bean_id);
CREATE INDEX idx_gai_calibrations_tuned_model ON google_ai_studio_calibrations(tuned_model_id);
CREATE INDEX idx_gai_resonance_calibration ON google_ai_studio_resonance_events(calibration_id);
CREATE INDEX idx_gai_resonance_created ON google_ai_studio_resonance_events(created_at);

-- Add rate limiting constraints based on minted_at
-- Additional constraints and indexes can be added here.