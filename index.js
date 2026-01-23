// index.js
const express = require('express');
const bodyParser = require('body-parser');
const { handleGitHubPush } = require('./services/githubSync');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// 1. Health Check
app.get('/', (req, res) => {
    res.send('OPVS Genesis Engine: ONLINE 🟢');
});

// 2. The Webhook Listener (Connect this URL to GitHub)
app.post('/api/webhooks/github', async (req, res) => {
    const signature = req.headers['x-hub-signature'];
    // TODO: Verify signature for security
    
    console.log("GitHub Webhook Received ⚓");
    await handleGitHubPush(req.body);
    
    res.status(200).send('Sync Complete');
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
