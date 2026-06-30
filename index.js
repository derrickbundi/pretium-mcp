import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
config({ path: join(dirname(fileURLToPath(import.meta.url)), ".env") });

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import axios from "axios";
import { registerRatesTool } from "./tools/rates.js";
import {
  registerCreateOrderTool,
  registerConfirmOrderTool,
  registerOrderStatusTool,
  registerValidateBankAccountTool,
  registerValidatePhoneNumberTool
} from "./tools/transactions.js";
import {
  registerCreateAgentTool,
  registerCreateAgentSpendPolicyTool,
  registerGetAgentTool
} from "./tools/agent.js";

const app = express();
app.use(express.json());

const api = axios.create({
  baseURL: process.env.PRETIUM_API_BASE_URL,
  headers: { "x-api-key": process.env.PRETIUM_API_KEY },
});

function createServer() {
  const server = new McpServer({
    name: "pretium-mcp",
    version: "1.0.0",
  });

  registerRatesTool(server, api);
  registerCreateOrderTool(server, api);
  registerConfirmOrderTool(server, api);
  registerOrderStatusTool(server, api);
  registerValidateBankAccountTool(server, api);
  registerValidatePhoneNumberTool(server, api);
  registerCreateAgentTool(server, api);
  registerCreateAgentSpendPolicyTool(server, api);
  registerGetAgentTool(server, api);

  return server;
}

const transports = {};

app.get("/sse", async (req, res) => {
  const server = createServer();
  const transport = new SSEServerTransport("/messages", res);

  transports[transport.sessionId] = transport;

  res.on("close", () => {
    delete transports[transport.sessionId];
  });

  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId;
  const transport = transports[sessionId];

  if (!transport) {
    return res.status(404).json({ error: "Session not found" });
  }

  await transport.handlePostMessage(req, res);
});

app.post("/mcp", async (req, res) => {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const keepAlive = setInterval(() => {
    res.write(": ping\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(keepAlive);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Pretium MCP server running on port ${PORT}`);
});