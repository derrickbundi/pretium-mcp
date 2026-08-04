---
name: pretium-payments
description: Pay with stablecoins and send fiat across 7+ African markets using pretium.africa MCP tools — M-Pesa, MTN, Airtel Money, paybills, till numbers, and bank transfers with programmable AI agent spend policies.
---

# Pretium Payments

Use the Pretium MCP server to let AI agents pay with stablecoins and send fiat across Africa.

## Prerequisites

1. Partner API key from [pretium.africa](https://pretium.africa)
2. `pretium-mcp` running locally (`npm run dev`) with `.env` configured
3. Optional: agent `secret_key` from Pretium for `register_agent`

## Core workflows

**Register agent and send fiat:**

```
register_agent → create_agent_spend_policy → agent_create_fiat_order → get_agent_fiat_order_status
```

**Off-ramp (stablecoin → fiat):**

```
create_order → on-chain payment → confirm_order → get_order_status
```

## Tools

| Module | Tools |
|--------|-------|
| Rates | `get_exchange_rates` |
| Transactions | `create_order`, `confirm_order`, `get_order_status`, `validate_bank_account`, `validate_phone_number` |
| Agent | `register_agent`, `create_agent_spend_policy`, `get_agent`, `get_agent_balance`, `agent_create_fiat_order`, `get_agent_fiat_order_status`, `agent_create_stablecoin_order` |

## Payment rails

- **M-Pesa** — mobile money, paybills, and till numbers (Kenya)
- **MTN Mobile Money** — Uganda, Ghana, and other corridors
- **Airtel Money / AirtelTigo** — mobile money payouts
- **Bank transfers** — NGN, KES, UGX, and other supported markets
- **Stablecoins** — USDT/USDC on Celo, Base, BNB, Polygon, Arbitrum, Avalanche, Solana, and Stellar

## Supported markets (7+)

Pretium operates across **7+ African markets**, including:

| Market | Currency | Rails |
|--------|----------|-------|
| Kenya | KES | M-Pesa, Airtel Money, paybill, till, bank |
| Uganda | UGX | MTN, Airtel Money, bank |
| Nigeria | NGN | Bank transfer |
| Ghana | GHS | MTN, AirtelTigo |
| Zambia | ZMW | Mobile money, bank |
| Malawi | MWK | Airtel Money |
| DR Congo | CDF | Mobile money |
| + more | — | Expanding corridors |

> **MCP agent fiat payouts** currently support **KES**, **UGX**, and **NGN** via agent tools. Other markets are available through the Pretium Payment API and consumer app at [pretium.africa](https://pretium.africa).

## Links

- Homepage: https://pretium.africa
- Docs: https://docs.pretium.africa
- Support: hello@pretium.africa
