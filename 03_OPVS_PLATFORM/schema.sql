-- OPVS MVP PostgreSQL Schema
-- Omniversal Project Vision System Database Schema

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================
-- Bean types enum
CREATE TYPE bean_type AS ENUM ('SPARK', 'LORE', 'BLOCKER', 'SOLUTION');

-- Resonance types enum for bean relationships
CREATE TYPE resonance_type AS ENUM ('HARMONIZES_WITH', 'DISRUPTS', 'SUPPORTS', 'CONTRADICTS', 'EXTENDS', 'REFERENCES');

-- ============================================================================
-- TABLE: users
-- ============================================================================
-- Stores user information including wallet addresses and RISS scores
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    wallet_address TEXT NULL,  -- For MPC wallet (supports multiple blockchain formats)
    riss_score INTEGER NOT NULL DEFAULT 0,  -- "Resonance & Integrity Score"
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);

-- Index for wallet address lookups
CREATE INDEX idx_users_wallet_address ON users(wallet_address) WHERE wallet_address IS NOT NULL;

-- ============================================================================
-- TABLE: beans
-- ============================================================================
-- Stores beans (atomic units of work, ideas, or content)
CREATE TABLE beans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,  -- Markdown content
    type bean_type NOT NULL,  -- SPARK, LORE, BLOCKER, or SOLUTION
    layer INTEGER NOT NULL CHECK (layer >= 1 AND layer <= 5),  -- Layer 1 to 5
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_minted BOOLEAN NOT NULL DEFAULT FALSE,
    token_id TEXT NULL,  -- Flexible for various token ID formats
    tx_hash TEXT NULL,  -- Supports transaction hashes from various blockchains
    ipfs_cid TEXT NULL,  -- Supports CIDv0 and CIDv1 formats
    last_synced_at TIMESTAMP NULL,  -- For GitHub Sync
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_beans_user_id FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- Index for user lookups
CREATE INDEX idx_beans_user_id ON beans(user_id);

-- Index for type and layer queries
CREATE INDEX idx_beans_type ON beans(type);
CREATE INDEX idx_beans_layer ON beans(layer);

-- Index for minted beans
CREATE INDEX idx_beans_is_minted ON beans(is_minted);

-- Index for JSONB metadata queries
CREATE INDEX idx_beans_metadata ON beans USING GIN(metadata);

-- ============================================================================
-- TABLE: bean_strings
-- ============================================================================
-- Stores connections/relationships between beans
CREATE TABLE bean_strings (
    source_bean_id UUID NOT NULL,
    target_bean_id UUID NOT NULL,
    resonance_type resonance_type NOT NULL,  -- Type of relationship
    tension INTEGER NOT NULL CHECK (tension >= 1 AND tension <= 10),  -- Tension level 1-10
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_bean_strings_source FOREIGN KEY (source_bean_id) 
        REFERENCES beans(id) ON DELETE CASCADE,
    CONSTRAINT fk_bean_strings_target FOREIGN KEY (target_bean_id) 
        REFERENCES beans(id) ON DELETE CASCADE,
    
    -- Prevent self-referential connections
    CONSTRAINT chk_bean_strings_no_self_reference CHECK (source_bean_id != target_bean_id),
    
    -- Composite primary key to prevent duplicate connections
    PRIMARY KEY (source_bean_id, target_bean_id),
    
    -- Ensure bidirectional uniqueness: prevent both A->B and B->A
    CONSTRAINT chk_bean_strings_unique_pair CHECK (source_bean_id < target_bean_id)
);

-- Index for reverse lookups (finding all beans connected TO a specific bean)
CREATE INDEX idx_bean_strings_target_bean_id ON bean_strings(target_bean_id);

-- Index for resonance type queries
CREATE INDEX idx_bean_strings_resonance_type ON bean_strings(resonance_type);

-- ============================================================================
-- FUNCTION: Update timestamp trigger
-- ============================================================================
-- Automatically update the updated_at timestamp when a bean is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to beans table
CREATE TRIGGER trigger_beans_updated_at
    BEFORE UPDATE ON beans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts in the OPVS system';
COMMENT ON COLUMN users.riss_score IS 'Resonance & Integrity Score - measures user engagement and quality';
COMMENT ON COLUMN users.wallet_address IS 'MPC wallet address for blockchain interactions';

COMMENT ON TABLE beans IS 'Atomic units of work, ideas, or content in the OPVS system';
COMMENT ON COLUMN beans.type IS 'Bean type: SPARK, LORE, BLOCKER, or SOLUTION (enforced by ENUM)';
COMMENT ON COLUMN beans.layer IS 'Layer number from 1 to 5';
COMMENT ON COLUMN beans.metadata IS 'Additional flexible data stored as JSON';
COMMENT ON COLUMN beans.is_minted IS 'Whether the bean has been minted as an NFT';
COMMENT ON COLUMN beans.last_synced_at IS 'Last time this bean was synced with GitHub';

COMMENT ON TABLE bean_strings IS 'Connections and relationships between beans';
COMMENT ON COLUMN bean_strings.resonance_type IS 'Type of relationship (enforced by ENUM): HARMONIZES_WITH, DISRUPTS, SUPPORTS, CONTRADICTS, EXTENDS, or REFERENCES';
COMMENT ON COLUMN bean_strings.tension IS 'Tension level of the relationship (1-10)';
