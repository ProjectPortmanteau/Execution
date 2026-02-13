// services/githubSync.js
const { Client } = require('pg');
const { parseCommitMessage, parseMarkdownFile, safeParseBeanFile } = require('../utils/parser');

// Configuration constants
const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000"; // Placeholder for 'System/Robert'
const ARK_OWNER = 'ProjectPortmanteau';
const ARK_REPO = 'Execution';
const ARK_BRANCH = 'main';

let db = null;
let dbConnecting = null;

const getDbConnection = async () => {
    if (db) {
        return db;
    }
    
    // Prevent race condition - if already connecting, wait for that promise
    if (dbConnecting) {
        return dbConnecting;
    }
    
    dbConnecting = (async () => {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        db = client;
        dbConnecting = null;
        return db;
    })();
    
    return dbConnecting;
};

const handleGitHubPush = async (payload) => {
    const commits = payload.commits; // From GitHub Webhook JSON
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
                    SYSTEM_USER_ID, 
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
                console.error(`Error creating Bean for commit ${commit.id}:`, err);
                console.error(`Parsed content: ${JSON.stringify(parsed)}`);
            }
        } else {
            console.log("> Standard commit. No Bean created.");
        }
    }
};

/**
 * syncArk — "Safe Sync" Patch
 *
 * Fetches the full Bean tree from the GitHub Ark repository,
 * parses each file individually, and returns a resilient result set.
 *
 * Key guarantees:
 *  - One broken Bean never crashes the entire sync.
 *  - GitHub 403 (rate limit) is caught and reported clearly.
 *  - Layer names are normalized to V6.1 Lexicon via the parser.
 *  - Returns { status, beans[], errors[], message } for the caller.
 *
 * @param {object} [options] - Optional overrides
 * @param {string} [options.token] - GitHub personal access token for authenticated requests
 * @returns {Promise<object>} Sync result
 */
const syncArk = async (options = {}) => {
    const results = { status: 'SYNCING', beans: [], errors: [], message: '' };

    try {
        // 1. Fetch the repository tree
        const treeUrl = `https://api.github.com/repos/${ARK_OWNER}/${ARK_REPO}/git/trees/${ARK_BRANCH}?recursive=1`;
        const headers = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'OPVS-Genesis-Engine' };
        if (options.token) {
            headers['Authorization'] = `token ${options.token}`;
        }

        const treeRes = await fetch(treeUrl, { headers });

        if (!treeRes.ok) {
            if (treeRes.status === 403) {
                results.status = 'RATE_LIMITED';
                results.message = 'GitHub API rate limit reached. Try again later or provide an auth token.';
                return results;
            }
            results.status = 'ERROR';
            results.message = `Ark refused connection: HTTP ${treeRes.status}`;
            return results;
        }

        const treeData = await treeRes.json();

        // 2. Filter for Bean files (beans/ or Beans/ directories, .json or .md)
        const beanFiles = (treeData.tree || []).filter((f) =>
            (f.path.includes('beans/') || f.path.includes('Beans/')) &&
            (f.path.endsWith('.json') || f.path.endsWith('.md')) &&
            f.type === 'blob'
        );

        results.message = `Found ${beanFiles.length} bean files. Parsing...`;

        // 3. Fetch and parse each file individually (safe — one failure won't block others)
        const fetchPromises = beanFiles.map(async (f) => {
            try {
                const rawUrl = `https://raw.githubusercontent.com/${ARK_OWNER}/${ARK_REPO}/${ARK_BRANCH}/${f.path}`;
                const contentRes = await fetch(rawUrl, {
                    headers: { 'User-Agent': 'OPVS-Genesis-Engine' },
                });

                if (!contentRes.ok) {
                    results.errors.push({ path: f.path, error: `HTTP ${contentRes.status}` });
                    return null;
                }

                const text = await contentRes.text();
                const parsed = safeParseBeanFile(f.path, text);

                if (!parsed.ok) {
                    results.errors.push({ path: f.path, error: parsed.error });
                    return null;
                }

                return { path: f.path, ...parsed.data };
            } catch (err) {
                results.errors.push({ path: f.path, error: err.message });
                return null;
            }
        });

        const fetched = await Promise.all(fetchPromises);

        // 4. Collect only successfully parsed beans
        results.beans = fetched.filter(Boolean);
        results.status = results.errors.length > 0 ? 'PARTIAL' : 'SYNCED';
        results.message = `Sync complete: ${results.beans.length} beans loaded, ${results.errors.length} skipped.`;

    } catch (err) {
        results.status = 'ERROR';
        results.message = `Ark sync failed: ${err.message}`;
    }

    return results;
};

module.exports = { handleGitHubPush, syncArk };
