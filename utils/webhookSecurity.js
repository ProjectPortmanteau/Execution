// utils/webhookSecurity.js
const crypto = require('crypto');

/**
 * Verify GitHub Webhook Signature
 * 
 * GitHub signs webhook payloads with HMAC-SHA256 using the webhook secret.
 * The signature is sent in the X-Hub-Signature-256 header as 'sha256=<hash>'.
 * 
 * @param {string} payload - Raw request body as string
 * @param {string} signature - Signature from X-Hub-Signature-256 header
 * @param {string} secret - GitHub webhook secret
 * @returns {boolean} - True if signature is valid, false otherwise
 */
const verifyGitHubSignature = (payload, signature, secret) => {
    if (!signature || !secret) {
        return false;
    }

    // GitHub sends signature as 'sha256=<hash>' or 'sha1=<hash>'
    const signatureBuffer = Buffer.from(signature);
    
    // Compute expected signature using HMAC-SHA256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload, 'utf8');
    const expectedSignature = 'sha256=' + hmac.digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature);

    // Use timing-safe comparison to prevent timing attacks
    if (signatureBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
};

module.exports = { verifyGitHubSignature };
