---
name: pretium-payments
description: Pay with stablecoins and send fiat across Africa using pretium.africa MCP tools — register agents, set spend policies, and execute M-Pesa, mobile money, paybill, and bank payouts in KES, UGX, NGN.
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

## Supported markets

- **KES** — Kenya (M-Pesa, paybill, till, bank)
- **UGX** — Uganda (mobile money, bank)
- **NGN** — Nigeria (bank transfer)

## Links

- Homepage: https://pretium.africa
- Docs: https://docs.pretium.africa
- Support: hello@pretium.africa
