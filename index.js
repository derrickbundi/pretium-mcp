import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

config({ path: join(dirname(fileURLToPath(import.meta.url)), ".env") });
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { registerRatesTool } from "./tools/rates.js";
import {
  registerCreateOrderTool,
  registerConfirmOrderTool,
  registerOrderStatusTool,
 } from "./tools/transactions.js";

const server = new McpServer({
  name: "pretium-mcp",
  version: "1.0.0",
  debug: true
});

const api = axios.create({
  baseURL: process.env.PRETIUM_API_BASE_URL,
  headers: { "x-api-key": process.env.PRETIUM_API_KEY },
});

registerRatesTool(server, api);
registerCreateOrderTool(server, api);
registerConfirmOrderTool(server, api);
registerOrderStatusTool(server, api);

const transport = new StdioServerTransport();
await server.connect(transport);