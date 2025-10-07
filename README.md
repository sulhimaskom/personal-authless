### Project Overview

This project is a Cloudflare Worker that implements a remote MCP (Model Context Protocol) server. It's designed to be deployed on Cloudflare's serverless platform and provides a set of tools that can be accessed by an MCP client, such as the Cloudflare AI Playground or Claude Desktop. The Worker now requires GitHub OAuth 2.1, so every client must authenticate before invoking tools.

The core logic lives in `src/index.ts`, which defines an `McpAgent` with GitHub-oriented tooling. `src/github-handler.ts` hosts the OAuth endpoints that hand the user off to GitHub, and `src/workers-oauth-utils.ts` renders the approval dialog for new MCP clients. Durable Objects back the MCP agent lifecycle.

The project is written in TypeScript and uses `wrangler` for development and deployment. Tooling includes Biome for linting/formatting and `tsc` for type-checking.

### Available Tools

#### `list_user_repos`

*   **Function**: Lists the public repositories for the supplied GitHub user (defaults to the authenticated user).
*   **Parameters**:
    *   `username` (string, optional): GitHub username to inspect.
*   **Example Usage**: `list_user_repos()` or `list_user_repos(username: "cloudflare")`

#### `whoami`

*   **Function**: Dumps the GitHub profile associated with the OAuth session.
*   **Parameters**: none.
*   **Example Usage**: `whoami()`

### Building and Running

**Dependencies:**

*   Node.js and npm
*   Wrangler CLI

**Installation:**

```bash
npm install
```

**Running in Development:**

To run the worker locally, create a `.dev.vars` file in the project root with your GitHub OAuth credentials and a cookie signing key:

```
GITHUB_CLIENT_ID="your-dev-client-id"
GITHUB_CLIENT_SECRET="your-dev-client-secret"
COOKIE_ENCRYPTION_KEY="a-random-32-byte-string"
```

Use a dedicated GitHub OAuth App for local development with callback `http://localhost:8788/callback`. The encryption key can be any high-entropy string and is used to sign approval cookies.

Then, run the following command:

```bash
npm run dev
```

This will start a local development server at `http://localhost:8787`.

**Deploying to Cloudflare:**

Provision a production GitHub OAuth App whose callback is `<your-worker-subdomain>/callback`. Store its credentials and the cookie key as Worker secrets:

```bash
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put COOKIE_ENCRYPTION_KEY
```

Create or link a KV namespace for the `OAUTH_KV` binding in `wrangler.jsonc` before deploying. Once secrets and KV are configured, deploy:

```bash
npm run deploy
```

### Development Conventions

*   **Code Style:** The project uses Biome for code formatting and linting. The configuration is in `biome.json`.
*   **Typing:** The project uses TypeScript with strict mode enabled. The configuration is in `tsconfig.json`.
*   **API Interaction**: The project uses Octokit to access the GitHub API with the per-user OAuth token.
*   **Authentication**: GitHub OAuth 2.1 (Authorization Code + PKCE via Workers OAuth Provider) is mandatory; never attempt to hard-code tokens.
