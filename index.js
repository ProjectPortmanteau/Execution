// index.js
const express = require('express');
const bodyParser = require('body-parser');
const { handleGitHubPush } = require('./services/githubSync');
const { verifyGitHubSignature } = require('./utils/webhookSecurity');

const app = express();

// Use raw body parser for webhook signature verification
app.use('/api/webhooks/github', bodyParser.raw({ type: 'application/json' }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// 1. Health Check
app.get('/', (req, res) => {
    res.send('OPVS Genesis Engine: ONLINE 🟢');
});

// 2. The Webhook Listener (Connect this URL to GitHub)
app.post('/api/webhooks/github', async (req, res) => {
    const signature = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'];
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    
    // Convert raw body to string once
    const rawBody = req.body.toString('utf8');
    
    // Verify webhook signature for security
    if (webhookSecret) {
        const isValid = verifyGitHubSignature(rawBody, signature, webhookSecret);
        
        if (!isValid) {
            console.error('⚠️  Invalid webhook signature - possible security breach attempt');
            return res.status(401).send('Unauthorized: Invalid signature');
        }
        
        console.log('✓ Webhook signature verified');
    } else {
        console.warn('⚠️  GITHUB_WEBHOOK_SECRET not set - webhook verification disabled');
    }
    
    console.log("GitHub Webhook Received ⚓");
    
    // Parse JSON from raw body with error handling
    try {
        const payload = JSON.parse(rawBody);
        await handleGitHubPush(payload);
        res.status(200).send('Sync Complete');
    } catch (error) {
        console.error('⚠️  Failed to parse webhook payload:', error.message);
        return res.status(400).send('Bad Request: Invalid JSON payload');
    }
});

// 3. The Graph API (For Frontend)
app.get('/api/graph', async (req, res) => {
    // Return Nodes/Strings for React Force Graph
    // Implementation pending DB query
    res.json({ nodes: [], links: [] }); 
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Boolean is watching...`);
});
