# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in this repository, please report it responsibly. Do NOT create a public GitHub issue.

Contact: [add your preferred secure contact method]

## Security Architecture

This project handles sensitive data through several mechanisms:

### API Keys (BYOK Model)
- User-provided LLM API keys are stored in session memory only (never persisted to database or disk)
- Keys are isolated per session — no cross-session access
- Keys are transmitted over HTTPS only

### GitHub Webhooks
- All webhook payloads are verified via HMAC-SHA256 signature validation
- The webhook secret is stored as a GitHub repository secret, never in code

### Database
- PostgreSQL connections use SSL with certificate verification
- No user credentials are stored in the application database
- Authentication is handled via NeonAuth (delegated to GitHub OAuth)

### Rate Limiting
- All mutation endpoints are rate-limited (sliding window)
- Webhook endpoints have burst-friendly limits to accommodate GitHub's delivery patterns

## What This Repository Does NOT Do
- Store or log user API keys
- Process payments or financial data
- Store personally identifiable information beyond GitHub OAuth profile data
- Execute arbitrary user-provided code
