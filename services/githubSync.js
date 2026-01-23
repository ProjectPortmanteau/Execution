// services/githubSync.js
const { Client } = require('pg');
const { parseCommitMessage, parseMarkdownFile } = require('../utils/parser');
// You'll need a GitHub API client or simple-git here
// For MVP, we simulate processing a Webhook payload

let db = null;

const getDbConnection = async () => {
    if (!db) {
        db = new Client({ connectionString: process.env.DATABASE_URL });
        await db.connect();
    }
    return db;
};

const handleGitHubPush = async (payload) => {
    const commits = payload.commits; // From GitHub Webhook JSON
    const userId = "00000000-0000-0000-0000-000000000000"; // Placeholder for 'System/Robert'
    const dbClient = await getDbConnection();

    for (const commit of commits) {
        console.log(`Processing Commit: ${commit.id}`);
        
        // 1. Parse the Semantic Tag
        const parsed = parseCommitMessage(commit.message);
        
        if (parsed.isValid) {
            console.log(`> Detected Bean Type: ${parsed.type}`);
            
            // 2. Insert into Fluid Reality (Postgres)
            try {
                const query = `
                    INSERT INTO beans (user_id, content, type, git_hash, git_url)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                `;
                const values = [
                    userId, 
                    parsed.content, 
                    parsed.type, 
                    commit.id, 
                    commit.url
                ];
                
                const res = await dbClient.query(query, values);
                console.log(`> Bean Created: ${res.rows[0].id}`);
                
                // 3. (Optional) Check for Crystallization Trigger
                if (parsed.type === 'PODIUM') {
                    console.log("!!! PODIUM DETECTED !!! Initiating Minting Protocol...");
                    // await mintingService.crystallize(res.rows[0].id);
                }

            } catch (err) {
                console.error("Error creating Bean:", err);
            }
        } else {
            console.log("> Standard commit. No Bean created.");
        }
    }
};

module.exports = { handleGitHubPush };
