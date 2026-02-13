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
    layer INTEGER DEFAULT 1 CHECK (layer >= 0 AND layer <= 6),
    bean_id VARCHAR(50), -- Canonical Bean ID (e.g. PHIL-001, LORE-005)
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
    
    -- Provenance (The Shadow Ledger)
    git_hash VARCHAR(255),
    git_url TEXT,
    source_path TEXT, -- File path in the Ark repository
    
    -- Web3 (The Invisible Ledger)
    is_minted BOOLEAN DEFAULT FALSE,
    token_id VARCHAR(255),
    tx_hash VARCHAR(255),
    ipfs_cid VARCHAR(255),
    
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unique partial index for Ark sync upsert (source_path must be unique when not null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_beans_source_path
    ON beans (source_path) WHERE source_path IS NOT NULL;

-- 4. Bean Strings (The Connections)
CREATE TABLE IF NOT EXISTS bean_strings (
    source_bean_id UUID REFERENCES beans(id),
    target_bean_id UUID REFERENCES beans(id),
    resonance_type VARCHAR(50) CHECK (resonance_type IN ('HARMONIZES_WITH', 'DISRUPTS')),
    tension INTEGER DEFAULT 1,
    PRIMARY KEY (source_bean_id, target_bean_id)
);

-- 5. Sync Log (GitHub Commit Tracking)
CREATE TABLE IF NOT EXISTS sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commit_sha VARCHAR(255) UNIQUE NOT NULL,
    branch VARCHAR(255),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Feedback Table (User Feedback from Homepage)
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) DEFAULT 'Anonymous',
    email VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Neon Auth Users Sync
-- NeonAuth automatically syncs authenticated users into this schema.
-- Reference: https://neon.com/docs/auth/overview
CREATE SCHEMA IF NOT EXISTS neon_auth;

CREATE TABLE IF NOT EXISTS neon_auth.users_sync (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
