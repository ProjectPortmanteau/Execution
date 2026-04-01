#!/usr/bin/env node

/**
 * viberank — CLI tool for analyzing and ranking Beans by philosophical alignment
 * 
 * Usage:
 *   npx viberank
 *   npx viberank --layer 0
 *   npx viberank --verbose
 */

const fs = require('fs');
const path = require('path');
const { parseMarkdownFile, splitBeansFromFile } = require('../utils/parser');

// Philosophy keywords from Layer 0 (PHIL-001 through PHIL-012)
const PHILOSOPHY_KEYWORDS = [
    'people', 'money', 'freedom', 'empowerment',
    'broken system', 'soil', 'healing', 'environment',
    'nuance', 'boxes', 'categories', 'unique',
    'good', 'greedy', 'benevolent', 'sentient economy',
    'door number 3', 'create', 'architect', 'substitute',
    'creative license', 'smudge', 'ambiguity',
    'ego', 'fart', 'objective awareness',
    'happy', 'pride', 'peace', 'vibe',
    'positive-sum', 'collaboration', 'bigger pie',
    'integrity', 'marine', 'abandon', 'loyalty',
    'keller', 'perspective', 'subjective',
    'idea', 'person', 'separation', 'debate'
];

/**
 * Calculate vibe score for a bean based on philosophical alignment
 */
function calculateVibeScore(beanContent) {
    if (!beanContent) return 0;
    
    const lowerContent = beanContent.toLowerCase();
    let score = 0;
    
    // Count philosophy keyword matches
    PHILOSOPHY_KEYWORDS.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerContent.match(regex);
        if (matches) {
            score += matches.length;
        }
    });
    
    // Bonus for explicit Layer 0 references
    if (/PHIL-\d{3}/i.test(beanContent)) {
        score += 5;
    }
    
    // Bonus for principle-related headers
    if (/principle:|application:|content:/i.test(beanContent)) {
        score += 2;
    }
    
    return score;
}

/**
 * Load and parse all bean files
 */
function loadBeans(beansDir) {
    const beans = [];
    const files = fs.readdirSync(beansDir).filter(f => f.endsWith('.md') && !f.startsWith('_'));
    
    files.forEach(file => {
        const filePath = path.join(beansDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const { metadata, body } = parseMarkdownFile(content);
        
        // Extract layer from filename if not in metadata
        let layer = metadata.layer;
        if (layer === undefined) {
            const match = file.match(/^(\d{2})_/);
            if (match) {
                layer = parseInt(match[1], 10);
            }
        }
        
        // Split into individual beans
        const individualBeans = splitBeansFromFile(body);
        
        individualBeans.forEach(bean => {
            beans.push({
                id: bean.id,
                title: bean.title,
                content: bean.content,
                layer: layer,
                file: file,
                vibeScore: calculateVibeScore(bean.content)
            });
        });
    });
    
    return beans;
}

/**
 * Display beans in ranked order
 */
function displayRankedBeans(beans, options = {}) {
    // Filter by layer if specified
    let filteredBeans = beans;
    if (options.layer !== undefined) {
        filteredBeans = beans.filter(b => b.layer === options.layer);
    }
    
    // Sort by vibe score (descending)
    const rankedBeans = filteredBeans.sort((a, b) => b.vibeScore - a.vibeScore);
    
    console.log('\n🫘 VIBERANK — Bean Philosophical Alignment Analysis\n');
    console.log('═'.repeat(80));
    
    if (options.layer !== undefined) {
        console.log(`\nLayer ${options.layer} Beans (ranked by philosophical alignment)\n`);
    } else {
        console.log('\nAll Beans (ranked by philosophical alignment)\n');
    }
    
    console.log('Rank | ID           | Vibe | Layer | Title');
    console.log('─'.repeat(80));
    
    rankedBeans.forEach((bean, index) => {
        const rank = (index + 1).toString().padStart(4, ' ');
        const id = bean.id.padEnd(12, ' ');
        const score = bean.vibeScore.toString().padStart(4, ' ');
        const layer = `L${bean.layer}`.padEnd(5, ' ');
        const title = bean.title.length > 45 ? bean.title.substring(0, 42) + '...' : bean.title;
        
        console.log(`${rank} | ${id} | ${score} | ${layer} | ${title}`);
        
        if (options.verbose) {
            console.log(`     └─ Source: ${bean.file}`);
        }
    });
    
    console.log('─'.repeat(80));
    console.log(`\nTotal beans analyzed: ${rankedBeans.length}`);
    
    if (rankedBeans.length > 0) {
        const avgScore = (rankedBeans.reduce((sum, b) => sum + b.vibeScore, 0) / rankedBeans.length).toFixed(2);
        const maxScore = rankedBeans[0].vibeScore;
        const minScore = rankedBeans[rankedBeans.length - 1].vibeScore;
        
        console.log(`Average vibe score: ${avgScore}`);
        console.log(`Range: ${minScore} - ${maxScore}`);
    }
    
    console.log('\n');
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--layer' && i + 1 < args.length) {
            options.layer = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === '--verbose' || args[i] === '-v') {
            options.verbose = true;
        } else if (args[i] === '--help' || args[i] === '-h') {
            options.help = true;
        }
    }
    
    return options;
}

/**
 * Display help message
 */
function showHelp() {
    console.log(`
🫘 viberank — Bean Philosophical Alignment Analysis Tool

Usage:
  npx viberank [options]

Options:
  --layer <N>    Filter beans by layer (0-6)
  --verbose, -v  Show detailed information
  --help, -h     Show this help message

Examples:
  npx viberank                  # Rank all beans
  npx viberank --layer 0        # Rank only Layer 0 beans
  npx viberank --verbose        # Show detailed output

Description:
  viberank analyzes Beans in the repository and ranks them based on their
  philosophical alignment with Layer 0 principles. The "vibe score" measures
  how strongly a Bean resonates with core Project Portmanteau philosophy.
  
  Higher scores indicate stronger alignment with concepts like:
  - People > Money
  - Broken systems, not broken people
  - Door Number 3 thinking
  - Positive-sum collaboration
  - And other Layer 0 axioms
`);
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);
    const options = parseArgs(args);
    
    if (options.help) {
        showHelp();
        process.exit(0);
    }
    
    // Determine beans directory
    const beansDir = path.join(__dirname, '..', 'beans');
    
    if (!fs.existsSync(beansDir)) {
        console.error('Error: beans directory not found');
        console.error('Make sure you are running this from the project root');
        process.exit(1);
    }
    
    try {
        const beans = loadBeans(beansDir);
        displayRankedBeans(beans, options);
    } catch (error) {
        console.error('Error analyzing beans:', error.message);
        if (options.verbose) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { calculateVibeScore, loadBeans };
