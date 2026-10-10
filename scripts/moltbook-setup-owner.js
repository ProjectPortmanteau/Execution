#!/usr/bin/env node
// scripts/moltbook-setup-owner.js
//
// One-time call that registers the owner email for a Moltbook agent.
// Moltbook then emails a verification link to that address; the agent's
// write operations stay 403 until the owner clicks it and connects an
// X account.
//
// Usage:
// MOLTBOOK_API_KEY=<agent-api-key> node scripts/moltbook-setup-owner.js <owner-email>

// Keep the `www`: the bare domain redirects and drops the Authorization header.
const BASE = 'https://www.moltbook.com/api/v1';

async function setupOwnerEmail(email) {
  const key = process.env.MOLTBOOK_API_KEY;
  if (!key) throw new Error('MOLTBOOK_API_KEY not set');

  const res = await fetch(`${BASE}/agents/me/setup-owner-email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
    // Fail loudly rather than follow a redirect that strips the key.
    redirect: 'error',
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Moltbook ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/moltbook-setup-owner.js <owner-email>');
  process.exit(1);
}

setupOwnerEmail(email)
  // Print the full body: it may carry a verification challenge to answer.
  .then((b) => console.log('Sent:', JSON.stringify(b, null, 2)))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
