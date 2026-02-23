// index.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { handleGitHubPush, syncArk, syncArkToSoil, getAllBeansFromSoil } = require('./services/githubSync');
const { verifyGitHubSignature } = require('./utils/webhookSecurity');

const app = express();

// Use raw body parser for webhook signature verification
app.use('/api/webhooks/github', bodyParser.raw({ type: 'application/json' }));
app.use(bodyParser.json());

// Serve static frontend files from public/
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// In-memory feedback store (until DB is connected)
const feedbackStore = [];

// 1. Homepage served statically from public/index.html

// 2. Feedback Endpoint
app.post('/api/feedback', (req, res) => {
 const { name, email, message } = req.body || {};

 if (!message || typeof message !== 'string' || !message.trim()) {
 return res.status(400).json({ error: 'Message is required.' });
 }

 const feedback = {
 id: require('crypto').randomUUID(),
 name: (typeof name === 'string' ? name.trim() : '') || 'Anonymous',
 email: typeof email === 'string' ? email.trim() : '',
 message: message.trim(),
 created_at: new Date().toISOString()
 };

 feedbackStore.push(feedback);
 console.log(`Feedback received: ${feedback.id}`);

 res.status(201).json({ message: 'Thank you for your feedback!' });
});

// 3. The Webhook Listener (Connect this URL to GitHub)
// TODO: Add rate limiting middleware to prevent abuse (e.g., express-rate-limit)
app.post('/api/webhooks/github', async (req, res) => {
 const signature = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'];
 const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

 // Convert raw body to string once
 const rawBody = req.body.toString('utf8');

 // Verify webhook signature for security
 if (webhookSecret) {
 const isValid = verifyGitHubSignature(rawBody, signature, webhookSecret);

 if (!isValid) {
 console.error('⚠️ Invalid webhook signature - possible security breach attempt');
 return res.status(401).send('Unauthorized: Invalid signature');
 }

 console.log('✓ Webhook signature verified');
 } else {
 console.warn('⚠️ GITHUB_WEBHOOK_SECRET not set - webhook verification disabled');
 }

 console.log("GitHub Webhook Received ⚓");

 // Parse JSON from raw body with error handling
 try {
 const payload = JSON.parse(rawBody);
 await handleGitHubPush(payload);
 res.status(200).send('Sync Complete');
 } catch (error) {
 console.error('⚠️ Failed to parse webhook payload:', error.message);
 return res.status(400).send('Bad Request: Invalid JSON payload');
 }
});

// 4. Neon Auth - GitHub OAuth Callback
// Callback URL: https://ep-damp-wildflower-aik1cjop.neonauth.c-4.us-east-1.aws.neon.tech/neondb/auth/callback/github
// NeonAuth handles the full OAuth flow (token exchange, session creation, user sync).
// This endpoint receives the final redirect after NeonAuth completes authentication.
app.get('/auth/callback/github', (req, res) => {
 const { code, error, error_description } = req.query;

 if (error) {
 console.error(`GitHub OAuth error: ${error} - ${error_description || 'no description'}`);
 return res.status(400).send('Authentication failed. Please try again.');
 }

 if (!code) {
 return res.status(400).send('Missing authorization code.');
 }

 console.log(`GitHub OAuth callback received at ${new Date().toISOString()}`);
 // NeonAuth handles token exchange and user sync to neon_auth.users_sync
 // Redirect to homepage after successful authentication
 res.redirect('/');
});

// 5. Ark Sync Endpoint (Safe Sync turns the Ark light GREEN)
app.get('/api/sync-ark', async (req, res) => {
 try {
 const token = process.env.GITHUB_TOKEN || null;
 const result = await syncArk({ token });
 const statusCode = result.status === 'RATE_LIMITED' ? 429
 : result.status === 'ERROR' ? 502
 : 200;
 res.status(statusCode).json(result);
 } catch (err) {
 res.status(500).json({ status: 'ERROR', message: err.message, beans: [], errors: [] });
 }
});

// 6. The Graph API (For Frontend)
app.get('/api/graph', async (req, res) => {
 // Return Nodes/Strings for React Force Graph
 // Implementation pending DB query
 res.json({ nodes: [], links: [] });
});

// 7. Ark-to-Soil Sync Endpoint Pulls beans from GitHub (Ark) and persists them into Neon (Soil)
app.get('/api/sync/ark-to-soil', async (req, res) => {
 try {
 const token = process.env.GITHUB_TOKEN || null;
 const result = await syncArkToSoil({ token });
 const statusCode = result.status === 'RATE_LIMITED' ? 429
 : result.status === 'ERROR' ? 502
 : 200;
 res.status(statusCode).json(result);
 } catch (err) {
 res.status(500).json({ status: 'ERROR', message: err.message });
 }
});

// 8. All Beans Endpoint Returns all beans from the database (Soil)
app.get('/api/all-beans', async (req, res) => {
 try {
 const beans = await getAllBeansFromSoil();
 res.json({ status: 'OK', count: beans.length, beans });
 } catch (err) {
 res.status(500).json({ status: 'ERROR', message: err.message, beans: [] });
 }
});

app.listen(PORT, () => {
 console.log(`Server listening on port ${PORT}`);
 console.log(`Boolean is watching...`);
});
