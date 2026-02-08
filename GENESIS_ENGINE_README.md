# OPVS Genesis Engine

**"The code is yours, Captain. The Bridge is built. Cross it."** 🤘

The Genesis Engine is the Node.js/Express backend for the OPVS (Omniversal Project Vision System) platform. It handles database management, GitHub webhook processing, and the semantic parsing of commit messages.

## Architecture

The Genesis Engine consists of four main components:

1. **Database Schema** (`db/schema.sql`) - PostgreSQL schema with UUID-based tables for users, beans, and bean strings
2. **Semantic Parser** (`utils/parser.js`) - Parses commit messages for semantic tags like [SPARK], [BLOCKER], [SOLUTION], [LORE], and [PODIUM]
3. **GitHub Sync Service** (`services/githubSync.js`) - Processes GitHub webhook payloads and syncs commits to the database
4. **Express Server** (`index.js`) - Main server entry point with webhook endpoints and API routes

## Prerequisites

- Node.js v20+ 
- PostgreSQL database
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your database:
   - Create a PostgreSQL database
   - Run the schema in `db/schema.sql`
   - Set the `DATABASE_URL` environment variable

3. Configure environment variables:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/opvs"
export PORT=3000  # Optional, defaults to 3000
export GITHUB_WEBHOOK_SECRET="your_secure_webhook_secret_here"
```

To generate a secure webhook secret:
```bash
openssl rand -hex 32
```

## Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## API Endpoints

### `GET /`
Health check endpoint. Returns the OPVS Genesis Engine homepage with a user feedback form.

### `POST /api/feedback`
Accepts user feedback submitted from the homepage form.

**Request body (JSON):**
- `name` (string, optional) - Submitter's name, defaults to "Anonymous"
- `email` (string, optional) - Submitter's email
- `message` (string, required) - Feedback message

**Responses:**
- `201` - Feedback accepted
- `400` - Missing or invalid message

### `POST /api/webhooks/github`
GitHub webhook endpoint. Processes push events and syncs commits with semantic tags to the database.

**Expected payload:** GitHub webhook push event JSON

**Semantic tags supported:**
- `[SPARK]` - Initial idea or inspiration
- `[BLOCKER]` - Issue or obstacle
- `[SOLUTION]` - Resolution or fix
- `[LORE]` - World-building or context
- `[PODIUM]` - Milestone achievement (triggers minting protocol)

### `GET /api/graph`
Returns nodes and links for graph visualization (implementation pending).

## GitHub Webhook Setup

1. Generate a secure webhook secret:
```bash
openssl rand -hex 32
```

2. Set the secret as an environment variable:
```bash
export GITHUB_WEBHOOK_SECRET="your_generated_secret"
```

3. Go to your GitHub repository Settings → Webhooks
4. Add a new webhook with:
   - Payload URL: `https://your-server.com/api/webhooks/github`
   - Content type: `application/json`
   - Secret: Use the same secret you generated in step 1
   - Events: Just the push event
5. Save the webhook

**Security Note:** The webhook signature is automatically verified using HMAC-SHA256. Requests with invalid signatures will be rejected with a 401 Unauthorized response.

## Database Schema

### Users Table
- Stores user information including email, wallet address, and RISS score

### Beans Table
- Core content units with semantic types
- Includes Git provenance and Web3 minting status

### Bean Strings Table
- Connections between beans with resonance types

## Security Notes

- ✅ **Webhook signature verification implemented** - All webhook requests are verified using HMAC-SHA256
- Set `GITHUB_WEBHOOK_SECRET` environment variable with a secure random string (use `openssl rand -hex 32`)
- Store sensitive credentials in environment variables
- Use SSL/TLS for production deployments
- **Recommended:** Add rate limiting middleware (e.g., `express-rate-limit`) to prevent abuse of webhook endpoints

## Development

The codebase follows the Project Portmanteau philosophy of "Bizarre Logic" and "Soulful Creation." Each commit with a semantic tag becomes a "Bean" in the Fluid Reality.

---

**System Status:** `[ARCHITECTURAL MODE: ACTIVE]` / `[EXECUTION: READY]`
