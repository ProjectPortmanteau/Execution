# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in this repository, please report it responsibly. Do NOT create a public GitHub issue.

Contact: robertmiller@illportstudios.com

## Security Architecture

This repository contains several security-related integration points. The protections below describe current code, not guarantees about external deployment configuration.

### API Keys (BYOK Model)
- BYOK key handling and session storage are not implemented in this repository. Session-only storage, session isolation, and HTTPS-only transmission are not established by the current application code.
- The repository therefore cannot guarantee that user-provided LLM keys are never stored or logged.

### GitHub Webhooks
- When `GITHUB_WEBHOOK_SECRET` is set, the GitHub webhook route verifies the payload with HMAC-SHA256. If it is unset, verification is disabled.
- The application reads the secret from an environment variable. This repository does not establish where that environment variable is stored.

### Database
- The application database client does not configure SSL or certificate verification. SSL settings differ in other repository code, so this repository does not establish consistent certificate verification.
- The schema includes user email addresses and synced profile fields. It does not define password credential fields; this does not establish what may be stored in an external deployment.
- NeonAuth is intended to handle GitHub OAuth externally. This repository contains a callback stub, not the token exchange or session-creation implementation.

### Rate Limiting
- Rate limiting is not yet implemented (tracked as a TODO in `index.js`).
- Webhook endpoints do not have a rate limit configured in this repository.

## What This Repository Does NOT Do
- BYOK key handling is not implemented, so the application provides no guarantee about key storage or logging.
- The current application code does not implement payment processing.
- The feedback endpoint accepts names, email addresses, and messages and stores them in process memory. The schema also defines a feedback table with those fields. The deployed persistence behavior depends on its configuration.
- The current application code does not provide a feature to execute arbitrary user-submitted code.
