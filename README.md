# Pretium MCP

Model Context Protocol (MCP) server for [Pretium](https://pretium.africa) — pay with stablecoins and let AI agents send fiat across **7+ African markets** via M-Pesa, MTN, Airtel Money, paybills, till numbers, and bank transfers.

## Overview

`pretium-mcp` exposes Pretium's payment API as MCP tools. Agents can:

- Register and configure **Pretium agents** with spend policies
- Send **fiat payouts** via M-Pesa, MTN, Airtel Money, paybill, buy goods, and bank transfer
- Transfer **USDT/USDC** on Celo, Base, BNB, Polygon, Arbitrum, Avalanche, or Solana
- Run **off-ramp orders** (stablecoin settlement → fiat disbursement)
- Validate recipients, check balances, poll payout status, and fetch FX rates

### Payment rails

| Rail | Markets |
|------|---------|
| M-Pesa | Kenya (paybill, till, mobile money) |
| MTN Mobile Money | Uganda, Ghana, and more |
| Airtel Money / AirtelTigo | Kenya, Uganda, Malawi, and more |
| Bank transfers | Nigeria, Kenya, Uganda, and more |
| Stablecoins | USDT/USDC on Celo, Base, BNB, Polygon, Arbitrum, Avalanche, Solana |

### Markets (7+)

Pretium operates across **7+ African markets**, including Kenya (KES), Uganda (UGX), Nigeria (NGN), Ghana (GHS), Zambia (ZMW), Malawi (MWK), DR Congo (CDF), and more.

**MCP agent fiat tools** currently support **KES**, **UGX**, and **NGN**. Other corridors are available via the [Pretium Payment API](https://docs.pretium.africa) and [pretium.africa](https://pretium.africa) consumer app.

## Cursor Directory

Published for discovery on [cursor.directory](https://cursor.directory). To install in Cursor:

1. Clone this repo and configure `.env` (see [Quick start](#quick-start))
2. Run `npm run dev`
3. Add to `~/.cursor/mcp.json` or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "pretium-mcp": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

4. Restart Cursor — 13 tools should appear under **pretium-mcp**

Or submit `https://github.com/derrickbundi/pretium-mcp` at [cursor.directory/plugins/new](https://cursor.directory/plugins/new) for one-click discovery.

## Quick start

### Prerequisites

- Node.js 18+
- [Pretium partner account](#partner-onboarding) with API key
- Access to the Pretium payment API

### Partner onboarding

`pretium-mcp` requires a Pretium **partner API key**. Tools will not work without one.

1. **Apply or sign up** — [pretium.africa](https://pretium.africa)
2. **Complete partner setup** in the Pretium partner portal (wallet, currencies, compliance)
3. **Copy your API key** from the partner dashboard (sent as `x-api-key` to the payment API)
4. **Optional — agents:** request an agent `secret_key` from Pretium to use `register_agent`
5. **Documentation** — [docs.pretium.africa](https://docs.pretium.africa)

For integration help: [hello@pretium.africa](mailto:hello@pretium.africa)

### Install

```bash
git clone <repo-url>
cd pretium-mcp
npm install
```

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

## Discovery (MCP, A2A, OASF, ERC-8004)

This server exposes three machine-readable discovery endpoints:

| Protocol | URL | Purpose |
|----------|-----|---------|
| **MCP** | `POST /mcp` | 13 callable payment tools |
| **A2A** | `GET /.well-known/agent-card.json` | Agent card with 8 skills |
| **OASF** | `GET /.well-known/oasf-record.json` | [Open Agentic Schema Framework](https://github.com/agntcy/oasf) record |

Static copy for GitHub indexing: [`oasf-record.json`](./oasf-record.json)

```bash
curl -sS https://mcp.pretium.africa/.well-known/oasf-record.json | python3 -m json.tool | head -30
```

## Project structure

```
pretium-mcp/
├── index.js                  # Express + MCP server entrypoint
├── agent-card.js             # A2A agent card (/.well-known/agent-card.json)
├── oasf-record.js            # OASF record builder (/.well-known/oasf-record.json)
├── oasf-record.json          # Static OASF record for GitHub discovery
├── mcp.json                  # Cursor MCP config (auto-detected by cursor.directory)
├── .mcp.json                 # Alternate path scanned by cursor.directory
├── .cursor-plugin/
│   └── plugin.json           # Cursor plugin manifest
├── tools/
│   ├── rates.js              # FX rate tools
│   ├── transactions.js       # Orders, validation, status
│   └── agent.js              # Agent lifecycle and payouts
├── skills/
│   └── pretium-payments/
│       └── SKILL.md          # Agent skill (auto-detected by cursor.directory)
├── skills.md                 # Full agent capabilities guide
├── README.md
├── SECURITY.md
├── package.json
└── .env                      # Local config (not committed)
```

## Security

See **[SECURITY.md](./SECURITY.md)** for vulnerability reporting (GitHub issues) and self-hosting guidance.

Do not expose this server publicly without authentication — it uses your partner API key for all tool calls.

## API

All tools call the Pretium payment API using `PRETIUM_API_BASE_URL` and authenticate with `PRETIUM_API_KEY` via the `x-api-key` header.

Agent endpoints are under `/agent/*`; standard payment endpoints include `/create-order`, `/confirm-order`, `/order-status`, and `/rates`.

## License

ISC
