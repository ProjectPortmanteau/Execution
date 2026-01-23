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

module.exports = { parseCommitMessage, parseMarkdownFile };
