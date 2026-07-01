# Pretium MCP

Model Context Protocol (MCP) server for [Pretium](https://pretium.africa) — lets AI agents send fiat payouts, manage payment agents, and settle off-ramp orders across **KES**, **UGX**, and **NGN**.

## Overview

`pretium-mcp` exposes Pretium's payment API as MCP tools. Agents can:

- Register and configure **Pretium agents** with spend policies
- Send **fiat payouts** (mobile money, paybill, buy goods, bank transfer)
- Transfer **USDT/USDC** on Celo, Base, or BNB
- Run **off-ramp orders** (stablecoin settlement → fiat disbursement)
- Validate recipients, check balances, poll payout status, and fetch FX rates

Supported currencies: **KES** (Kenya), **UGX** (Uganda), **NGN** (Nigeria).

## Quick start

### Prerequisites

- Node.js
- Pretium partner account with API key
- Access to the Pretium payment API

### Install

```bash
git clone <repo-url>
cd pretium-mcp
npm install
```

### Configure

Create a `.env` file in the project root:

```env
PRETIUM_API_BASE_URL=https://mcp.pretium.africa
PRETIUM_API_KEY=your_partner_api_key
PORT=3000
```

`PRETIUM_API_BASE_URL` is the Pretium **payment API** base (used by tools internally). MCP clients connect to **this server** on `PORT`, not to that URL directly.

### Run

```bash
npm run dev
```

The server listens on `PORT` (default `3000`).

## Transports

This server exposes two MCP transports on the same host. Both serve the same 13 tools — pick the one your client supports.

### Streamable HTTP

Stateless MCP over HTTP. Each request is independent; no session ID.

| Method | Path | Role |
|---|---|---|
| `POST` | `/mcp` | Send MCP JSON-RPC; response returned in the same HTTP response |
| `GET` | `/mcp` | Optional SSE keep-alive (`: ping` every 15s) — not for tool calls |

**Client URL:** `http://localhost:3000/mcp` (use `POST` for MCP traffic)

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

Recommended for **Cursor** and other clients with Streamable HTTP support.

### SSE

Session-based MCP: one long-lived SSE connection plus a message POST endpoint.

| Step | Method | Path | Role |
|---|---|---|---|
| 1 | `GET` | `/sse` | Open SSE stream; server issues a `sessionId` |
| 2 | `POST` | `/messages?sessionId={sessionId}` | Send MCP JSON-RPC for that session |

```
Client                         pretium-mcp
  │  GET /sse                       │
  │────────────────────────────────>│
  │  SSE (sessionId in transport)   │
  │<────────────────────────────────│
  │  POST /messages?sessionId=…     │
  │────────────────────────────────>│
  │  MCP result                       │
  │<────────────────────────────────│
```

The session lives while the `/sse` connection is open. Disconnecting clears the session.

**Connect URL:** `http://localhost:3000/sse`  
**Messages URL:** `http://localhost:3000/messages?sessionId=…`

Use for MCP clients that only support the **SSE transport**.

### Choosing a transport

| Transport | When to use |
|---|---|
| **Streamable HTTP** (`POST /mcp`) | Modern MCP clients; simplest setup |
| **SSE** (`GET /sse` + `POST /messages`) | Legacy or SSE-only MCP clients |

## Tools

13 tools are registered across three modules:

| Module | Tools |
|---|---|
| **Rates** | `get_exchange_rates` |
| **Transactions** | `create_order`, `confirm_order`, `get_order_status`, `validate_bank_account`, `validate_phone_number` |
| **Agent** | `register_agent`, `create_agent_spend_policy`, `get_agent`, `get_agent_balance`, `agent_create_fiat_order`, `get_agent_fiat_order_status`, `agent_create_stablecoin_order` |

For full workflows, field requirements, and currency restrictions, see **[skills.md](./skills.md)**.

## Example flows

**Register an agent and send UGX:**

```
register_agent → create_agent_spend_policy → agent_create_fiat_order → get_agent_fiat_order_status
```

**Off-ramp (crypto → fiat):**

```
create_order → on-chain payment → confirm_order → get_order_status
```

## Project structure

```
pretium-mcp/
├── index.js           # Express + MCP server entrypoint
├── tools/
│   ├── rates.js       # FX rate tools
│   ├── transactions.js # Orders, validation, status
│   └── agent.js       # Agent lifecycle and payouts
├── skills.md          # Agent capabilities & workflow guide
├── package.json
└── .env               # Local config (not committed)
```

## API

All tools call the Pretium payment API using `PRETIUM_API_BASE_URL` and authenticate with `PRETIUM_API_KEY` via the `x-api-key` header.

Agent endpoints are under `/agent/*`; standard payment endpoints include `/create-order`, `/confirm-order`, `/order-status`, and `/rates`.

## License

ISC
