// utils/parser.js

/**
 * Parses a Git Commit Message for Semantic Tags
 * Input: "[SPARK] The first note of the symphony."
 * Output: { type: "SPARK", content: "The first note of the symphony." }
 */
const parseCommitMessage = (message) => {
    // Regex to find [TAG] at the start
    const tagPattern = /^\[(SPARK|BLOCKER|SOLUTION|LORE|PODIUM)\]\s*(.*)/i;
    const match = message.match(tagPattern);

    if (match) {
        return {
            type: match[1].toUpperCase(),
            content: match[2].trim(),
            isValid: true
        };
    }
    
    return { isValid: false };
};

/**
 * Parses Markdown Frontmatter (for file-based syncing)
 * Uses 'gray-matter' library
 */
const parseMarkdownFile = (fileContent) => {
    const matter = require('gray-matter');
    const { data, content } = matter(fileContent);
    return {
        metadata: data, // { title: "...", layer: 1 }
        body: content
    };
};

/**
 * V6.1 Lexicon Layer Map
 * Normalizes legacy layer names to the canonical V6.1 schema.
 * Ensures backward compatibility when syncing Beans from the Ark.
 */
const LAYER_MAP = {
    'philosophy':        0, 'soul code':         0, 'layer 0': 0, 'layer0': 0,
    'visionary':         1, 'blueprint':         1, 'layer 1': 1, 'layer1': 1,
    'narrative':         2, 'roadmap':           2, 'layer 2': 2, 'layer2': 2,
    'execution':         3, 'scene construction': 3, 'layer 3': 3, 'layer3': 3,
    'lore':              4, 'world weaving':     4, 'layer 4': 4, 'layer4': 4,
    'process':           5, 'chronicle':         5, 'layer 5': 5, 'layer5': 5,
    'ark':               6, 'consolidated':      6, 'layer 6': 6, 'layer6': 6,
};

/**
 * Resolve a layer value to a valid V6.1 layer number (0–6).
 * Accepts numbers, numeric strings, or legacy layer name strings.
 * Returns null if the value cannot be resolved.
 */
const normalizeLayer = (raw) => {
    if (raw === null || raw === undefined) return null;

    // Already a valid number
    if (typeof raw === 'number' && raw >= 0 && raw <= 6) return raw;

    // Numeric string
    const num = Number(raw);
    if (!isNaN(num) && num >= 0 && num <= 6) return num;

    // Legacy name lookup
    if (typeof raw === 'string') {
        const key = raw.trim().toLowerCase();
        if (key in LAYER_MAP) return LAYER_MAP[key];
    }

    return null;
};

/**
 * Extracts Bean IDs from markdown content using the [BEAN #ID] pattern.
 * Returns an array of { id, title } objects found in the text.
 */
const extractBeanIds = (text) => {
    const beans = [];
    const pattern = /\[BEAN\s+#([A-Z]+-\d+)\]\s*(?:Title:\s*)?(.+)/gi;
    let match;
    while ((match = pattern.exec(text)) !== null) {
        beans.push({ id: match[1].toUpperCase(), title: match[2].trim() });
    }
    return beans;
};

/**
 * Safe Bean Parser — parses a single bean file (JSON or Markdown).
 * Returns { ok: true, data } on success, { ok: false, error } on failure.
 * Ensures one broken bean never crashes the entire sync.
 */
const safeParseBeanFile = (filePath, rawText) => {
    try {
        let beanData;

        if (filePath.endsWith('.json')) {
            beanData = JSON.parse(rawText);
        } else {
            const { metadata, body } = parseMarkdownFile(rawText);

            // Normalize layer from frontmatter or filename
            let layer = normalizeLayer(metadata.layer);
            if (layer === null) {
                // Attempt to infer layer from filename (e.g. 00_Philosophy.md → 0)
                const fileMatch = filePath.match(/(\d{2})_/);
                if (fileMatch) {
                    const parsed = parseInt(fileMatch[1], 10);
                    if (parsed >= 0 && parsed <= 6) layer = parsed;
                }
            }

            // Extract embedded Bean IDs from body
            const embeddedBeans = extractBeanIds(body);

            beanData = {
                ...metadata,
                layer,
                content: body,
                embeddedBeans,
            };
        }

        return { ok: true, data: beanData };
    } catch (err) {
        return { ok: false, error: err.message, filePath };
    }
};

module.exports = {
    parseCommitMessage,
    parseMarkdownFile,
    normalizeLayer,
    extractBeanIds,
    safeParseBeanFile,
    LAYER_MAP,
};
