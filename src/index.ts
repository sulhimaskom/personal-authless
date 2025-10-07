import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "GitHub Tools",
		version: "1.0.0",
	});

	async init(env: Env) {
		// Tool to list user repositories
		this.server.tool(
			"list_user_repos",
			{
				username: z.string().describe("The GitHub username to fetch repositories for."),
			},
			async ({ username }) => {
				try {
					const response = await fetch(`https://api.github.com/users/${username}/repos`, {
						headers: {
							"User-Agent": "Gemini-MCP-Agent",
							"Authorization": `Bearer ${env.GITHUB_TOKEN}`,
						},
					});

					if (!response.ok) {
						throw new Error(`GitHub API responded with ${response.status}`);
					}

					const repos = await response.json() as any[];
					const repoNames = repos.map((repo) => repo.name);
					return {
						content: [
							{
								type: "text",
								text: `Found ${repoNames.length} repositories for ${username}:\n${repoNames.join("\n")}`,
							},
						],
					};
				} catch (error: any) {
					return {
						content: [
							{
								type: "text",
								text: `Error fetching repositories for ${username}: ${error.message}`,
							},
						],
					};
				}
			},
		);
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
