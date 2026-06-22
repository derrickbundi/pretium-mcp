import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
config({ path: join(dirname(fileURLToPath(import.meta.url)), ".env") });

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import axios from "axios";
import { registerRatesTool } from "./tools/rates.js";
import {
  registerCreateOrderTool,
  registerConfirmOrderTool,
  registerOrderStatusTool,
} from "./tools/transactions.js";

const app = express();
app.use(express.json());

const api = axios.create({
  baseURL: process.env.PRETIUM_API_BASE_URL,
  headers: { "x-api-key": process.env.PRETIUM_API_KEY },
});

const transports = {};

app.get("/sse", async (req, res) => {
  const server = new McpServer({
    name: "pretium-mcp",
    version: "1.0.0",
  });

  registerRatesTool(server, api);
  registerCreateOrderTool(server, api);
  registerConfirmOrderTool(server, api);
  registerOrderStatusTool(server, api);

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Pretium MCP server running on port ${PORT}`);
});