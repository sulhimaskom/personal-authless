import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { Octokit } from "octokit";
import { z } from "zod";
import { GitHubHandler } from "./github-handler";
import type { Props } from "./utils";

// Durable MCP instance that is bootstrapped once per authenticated session
export class MyMCP extends McpAgent<Env, Record<string, never>, Props> {
	server = new McpServer({
		name: "GitHub Tools",
		version: "1.0.0",
	});

	async init() {
		const session = this.props;
		if (!session) {
			throw new Error("Missing OAuth session context");
		}

		const octokit = new Octokit({ auth: session.accessToken });

		this.server.tool(
			"list_user_repos",
			"List public repositories for a GitHub username using the authenticated session.",
			{
				username: z
					.string()
					.describe("GitHub username to inspect; defaults to the signed-in user when omitted.")
					.optional(),
			},
			async ({ username }) => {
				const target = username ?? session.login;
				const repos = await octokit.paginate(octokit.rest.repos.listForUser, {
					per_page: 100,
					username: target,
				});
				return {
					content: [
						{
							type: "text",
							text: `Found ${repos.length} repositories for ${target}:\n${repos
								.map((repo) => repo.name)
								.sort((a, b) => a.localeCompare(b))
								.join("\n")}`,
						},
					],
				};
			},
		);

		this.server.tool(
			"whoami",
			"Return the GitHub profile associated with the current OAuth session.",
			{},
			async () => {
				const profile = await octokit.rest.users.getAuthenticated();
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(profile.data, null, 2),
						},
					],
				};
			},
		);
	}
}

export default new OAuthProvider({
	apiHandlers: {
		"/sse": MyMCP.serveSSE("/sse"),
		"/mcp": MyMCP.serve("/mcp"),
	},
	authorizeEndpoint: "/authorize",
	clientRegistrationEndpoint: "/register",
	defaultHandler: GitHubHandler as any,
	tokenEndpoint: "/token",
});
