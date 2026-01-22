-- Schema for OPVS

CREATE TABLE beans (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    minted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_minted_at (user_id, minted_at)
);

-- Add rate limiting constraints based on minted_at
-- Additional constraints and indexes can be added here.