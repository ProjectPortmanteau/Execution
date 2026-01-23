-- 1. Enable UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table (The Village)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(255),
    riss_score INTEGER DEFAULT 0, -- Resonance & Integrity Score
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Beans Table (The Fluid Reality)
CREATE TABLE IF NOT EXISTS beans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255),
    content TEXT, -- Markdown content
    type VARCHAR(50), -- [SPARK], [BLOCKER], [SOLUTION], [LORE], [PODIUM]
    layer INTEGER DEFAULT 1,
    
    -- Provenance (The Shadow Ledger)
    git_hash VARCHAR(255),
    git_url TEXT,
    
    -- Web3 (The Invisible Ledger)
    is_minted BOOLEAN DEFAULT FALSE,
    token_id VARCHAR(255),
    tx_hash VARCHAR(255),
    ipfs_cid VARCHAR(255),
    
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bean Strings (The Connections)
CREATE TABLE IF NOT EXISTS bean_strings (
    source_bean_id UUID REFERENCES beans(id),
    target_bean_id UUID REFERENCES beans(id),
    resonance_type VARCHAR(50) CHECK (resonance_type IN ('HARMONIZES_WITH', 'DISRUPTS')),
    tension INTEGER DEFAULT 1,
    PRIMARY KEY (source_bean_id, target_bean_id)
);
