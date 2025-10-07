### Project Overview

This project is a Cloudflare Worker that implements a remote MCP (Model Context Protocol) server. It's designed to be deployed on Cloudflare's serverless platform and provides a set of tools that can be accessed by an MCP client, such as the Cloudflare AI Playground or Claude Desktop. The server is "authless," meaning it doesn't require any authentication to use its tools.

The core logic is in `src/index.ts`, which defines an `McpAgent` with a tool for interacting with GitHub. The server uses Cloudflare Durable Objects to maintain the state of the MCP agent.

The project is written in TypeScript and uses `wrangler` for development and deployment. It also includes configuration for `biome` for linting and formatting, and `tsc` for type-checking.

### Available Tools

#### `list_user_repos`

*   **Function**: Lists the public repositories for a given GitHub user.
*   **Parameters**:
    *   `username` (string): The GitHub username to fetch repositories for.
*   **Example Usage**: `list_user_repos(username: "google")`

### Building and Running

**Dependencies:**

*   Node.js and npm
*   Wrangler CLI

**Installation:**

```bash
npm install
```

**Running in Development:**

To run the worker locally, you need to create a `.dev.vars` file in the root of the project and add your GitHub personal access token:

```
GITHUB_TOKEN="your_github_token_here"
```

Then, run the following command:

```bash
npm run dev
```

This will start a local development server at `http://localhost:8787`.

**Deploying to Cloudflare:**

Before deploying, you need to set the `GITHUB_TOKEN` as a secret in your Cloudflare Worker's settings.

1.  Go to your Worker in the Cloudflare dashboard.
2.  Navigate to **Settings** > **Variables**.
3.  Under **Environment Variables**, add a secret variable named `GITHUB_TOKEN` with your GitHub token as the value.

After setting the secret, deploy the worker:

```bash
npm run deploy
```

### Development Conventions

*   **Code Style:** The project uses Biome for code formatting and linting. The configuration is in `biome.json`.
*   **Typing:** The project uses TypeScript with strict mode enabled. The configuration is in `tsconfig.json`.
*   **API Interaction**: The project uses the native `fetch` API to interact with the GitHub API. No external libraries like `@octokit/rest` are required.
*   **Authentication**: A GitHub personal access token is required for API authentication. This is managed through the `GITHUB_TOKEN` environment variable.