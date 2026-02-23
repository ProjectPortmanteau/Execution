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

// 1. Homepage with Feedback Section
app.get('/', (req, res) => {
 res.send(`<!DOCTYPE html>
<html lang="en">
<head>
 <meta charset="UTF-8">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>OPVS Genesis Engine</title>
 <style>
 body { font-family: sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; background: #0d1117; color: #c9d1d9; }
 h1 { color: #58a6ff; }
 .status { color: #3fb950; font-size: 1.2rem; margin-bottom: 2rem; }
 .feedback-section { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 1.5rem; margin-top: 2rem; }
 .feedback-section h2 { color: #58a6ff; margin-top: 0; }
 label { display: block; margin-top: 1rem; color: #8b949e; }
 input, textarea { width: 100%; padding: 0.5rem; margin-top: 0.25rem; background: #0d1117; border: 1px solid #30363d; border-radius: 4px; color: #c9d1d9; box-sizing: border-box; }
 textarea { min-height: 100px; resize: vertical; }
 button { margin-top: 1rem; padding: 0.6rem 1.5rem; background: #238636; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; }
 button:hover { background: #2ea043; }
 .msg { margin-top: 1rem; padding: 0.75rem; border-radius: 4px; display: none; }
 .msg.success { display: block; background: #0d2818; border: 1px solid #238636; color: #3fb950; }
 .msg.error { display: block; background: #280d0d; border: 1px solid #da3633; color: #f85149; }
 </style>
</head>
<body>
 <h1>OPVS Genesis Engine</h1>
 <p class="status">&#x1F7E2; ONLINE</p>

 <div class="feedback-section">
 <h2>Share Your Feedback</h2>
 <p>Help us build better substitutes. Your voice matters.</p>
 <form id="feedbackForm">
 <label for="name">Name (optional)</label>
 <input type="text" id="name" name="name" placeholder="Your name">
 <label for="email">Email (optional)</label>
 <input type="email" id="email" name="email" placeholder="you@example.com">
 <label for="message">Message <span style="color:#f85149">*</span></label>
 <textarea id="message" name="message" placeholder="Tell us what you think..." required></textarea>
 <button type="submit">Send Feedback</button>
 </form>
 <div id="result" class="msg"></div>
 </div>

 <script>
 document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
 e.preventDefault();
 const result = document.getElementById('result');
 result.className = 'msg';
 result.style.display = 'none';
 const body = {
 name: document.getElementById('name').value.trim(),
 email: document.getElementById('email').value.trim(),
 message: document.getElementById('message').value.trim()
 };
 try {
 const res = await fetch('/api/feedback', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(body)
 });
 const data = await res.json();
 if (res.ok) {
 result.textContent = data.message;
 result.className = 'msg success';
 document.getElementById('feedbackForm').reset();
 } else {
 result.textContent = data.error || 'Something went wrong.';
 result.className = 'msg error';
 }
 } catch (err) {
 result.textContent = 'Network error. Please try again.';
 result.className = 'msg error';
 }
 });
 </script>
</body>
</html>`);
});

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
