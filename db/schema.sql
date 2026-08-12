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

-- 8. Bean Converter: Corpus Ingestion Pipeline
-- Staging ground between raw sources (Apple Notes, Drive logs, Claude chat exports)
-- and the `beans` table. Nothing here is canon until it passes review (Phase 3).

-- corpus_raw: one row per source unit (a chat message, a note, a doc chunk).
-- Sources with a natural stable id (external_id, e.g. Claude message.uuid) dedup on that id,
-- since short messages can legitimately repeat verbatim without being duplicate imports.
-- Sources without one (Apple Notes) dedup on sha256 instead. The two partial unique indexes
-- below let both regimes coexist without a global unique constraint on sha256.
CREATE TABLE IF NOT EXISTS corpus_raw (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type         VARCHAR(50) NOT NULL,   -- apple_notes | drive_log | claude_chat
    source_path         TEXT NOT NULL,          -- claude_chat://{conversationUuid}/{messageUuid}
    external_id         TEXT,                   -- message.uuid; populated for sources with a natural id
    parent_external_id  TEXT,                   -- message.parent_message_uuid
    speaker             VARCHAR(20),            -- human | assistant | null (source has no speaker concept)
    sha256              TEXT NOT NULL,
    content             TEXT NOT NULL,
    captured_at         TIMESTAMP,
    ingested_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shard_id            TEXT                    -- conversationUuid for claude_chat
);

CREATE UNIQUE INDEX IF NOT EXISTS corpus_raw_extid_uniq
    ON corpus_raw (source_type, external_id)
    WHERE external_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS corpus_raw_sha256_uniq
    ON corpus_raw (source_type, sha256)
    WHERE external_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_corpus_raw_shard_id ON corpus_raw (shard_id);
CREATE INDEX IF NOT EXISTS idx_corpus_raw_parent_external_id ON corpus_raw (parent_external_id);

-- corpus_candidate: a proposed Bean staged from a corpus_raw row.
-- Provenance tracks who the *idea* belongs to, separate from who typed it (speaker, on corpus_raw).
-- Only human_stated and assistant_proposed_ratified are eligible for review_status='accepted';
-- everything else (assistant_proposed_unratified, assistant_synthesis, unclassified) stays in the
-- pool pending a human review decision, never auto-promoted.
CREATE TABLE IF NOT EXISTS corpus_candidate (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_id          UUID NOT NULL REFERENCES corpus_raw(id),
    proposed_type   VARCHAR(50) NOT NULL,   -- concept | decision | correction | fiction | log
    provenance      VARCHAR(50) NOT NULL DEFAULT 'unclassified'
                    CHECK (provenance IN (
                        'human_stated',
                        'assistant_proposed_ratified',
                        'assistant_proposed_unratified',
                        'assistant_synthesis',
                        'unclassified'
                    )),
    nucleus         TEXT NOT NULL,
    proposed_edges  JSONB,
    confidence      REAL,
    classifier_run  VARCHAR(100) NOT NULL,
    review_status   VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending', 'accepted', 'rejected')),
    review_note     TEXT,
    bean_id         UUID REFERENCES beans(id)
);

CREATE INDEX IF NOT EXISTS idx_corpus_candidate_raw_id ON corpus_candidate (raw_id);
CREATE INDEX IF NOT EXISTS idx_corpus_candidate_review_status ON corpus_candidate (review_status);

-- corpus_source_index: triage-only index of source documents/conversations, one row each.
-- Holds AI-generated summaries so they never leak into corpus_raw or corpus_candidate as source
-- material (a summary is already-synthesized, not genesis material).
CREATE TABLE IF NOT EXISTS corpus_source_index (
    conversation_id  UUID PRIMARY KEY,
    title            TEXT NOT NULL,
    summary          TEXT NOT NULL,
    created_at       TIMESTAMP,
    message_count    INTEGER,
    word_count       INTEGER,
    excluded         BOOLEAN DEFAULT FALSE,
    exclude_reason   TEXT
);

-- reply_pair: structural (assistant -> human) adjacency discovered by threading corpus_raw via
-- parent_external_id. Purely structural — whether a pair is a ratification, correction, etc. is a
-- semantic call made later (classifier proposal + human review), not decided here.
CREATE TABLE IF NOT EXISTS reply_pair (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assistant_raw_id  UUID NOT NULL REFERENCES corpus_raw(id),
    human_raw_id      UUID NOT NULL REFERENCES corpus_raw(id) UNIQUE,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reply_pair_assistant_raw_id ON reply_pair (assistant_raw_id);
