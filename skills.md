# Pretium MCP — Agent Capabilities & Workflows

Guide for AI agents using the Pretium MCP server: what agents can do, which tools exist, and how to chain them.

[Pretium](https://pretium.africa) connects stablecoin infrastructure to **7+ African markets** — M-Pesa, MTN, Airtel Money, paybills, till numbers, and bank transfers across Kenya (KES), Uganda (UGX), Nigeria (NGN), Ghana (GHS), Zambia (ZMW), Malawi (MWK), DR Congo (CDF), and more.

**MCP agent fiat payouts** support **KES**, **UGX**, and **NGN** via mobile money, paybill, buy goods, and bank transfer — funded from an agent's pre-loaded balance or by settling with stablecoin on-chain.

---

## What is a Pretium Agent?

A Pretium agent is a payment identity tied to a partner account. After registration it can:

- Spend **fiat balance** from the partner wallet (per currency)
- Spend **stablecoin balance** on-chain (USDT/USDC on Celo, Base, BNB, Polygon, Arbitrum, Avalanche, Solana, or Stellar)
- Execute payouts within **spend policy** limits without manual approval
- Query balances and track payout status

Each partner registers **one agent**, identified by `agent_id` (format: `AG_XXXXXXXXXXXXXXXXXXXX`). Pass this ID to all agent-scoped tools.

---

## Overall Capabilities at a Glance

| Area | What the agent can do |
|---|---|
| Registration | Activate agent with Pretium `secret_key` |
| Policies | Set per-tx, daily, and monthly spend limits |
| Fiat payouts | Send KES/UGX/NGN to mobile, paybill, till, or bank |
| Stablecoin | Send USDT/USDC to any wallet address |
| Balances | Check fiat, stablecoin, or native token balance |
| Status | Poll fiat payout progress by `reference` |
| Validation | Verify phone numbers and bank accounts before paying |
| FX | Get buying/selling rates for KES, UGX, NGN vs USD |

---

## Tools

### Rates

| Tool | Description |
|---|---|
| `get_exchange_rates` | FX buying/selling rates for **KES**, **UGX**, or **NGN** only |

### Off-ramp (crypto settlement)

| Tool | Description |
|---|---|
| `create_order` | Create payout order; returns `internal_reference_id` and settlement wallets |
| `confirm_order` | Confirm after on-chain payment; disburses fiat to recipient |
| `get_order_status` | Status by `internal_reference_id` or blockchain `hash` |

### Validation

| Tool | Description |
|---|---|
| `validate_phone_number` | Verify mobile number + network (**KES**, **UGX**) |
| `validate_bank_account` | Verify bank account (**KES**, **UGX**, **NGN**) |

### Agent lifecycle

| Tool | Description |
|---|---|
| `register_agent` | Register with `secret_key` + optional `category` (`ERC-20`, `SOLANA`, `STELLAR`); returns `agent_id` |
| `create_agent_spend_policy` | Set fiat or stablecoin spend limits |
| `get_agent` | Agent details and active spend policies |

### Agent payouts & balances

| Tool | Description |
|---|---|
| `get_agent_balance` | Fiat, stablecoin, or native token balance |
| `agent_create_fiat_order` | Fiat payout from agent balance |
| `get_agent_fiat_order_status` | Status of an agent fiat payout |
| `agent_create_stablecoin_order` | Send USDT/USDC to a blockchain address |

---

## Workflows

### Register and configure

```
register_agent(secret_key, category?) → agent_id
create_agent_spend_policy(...)       → per currency / asset type
get_agent(agent_id)                  → confirm policies
```

- `secret_key` is provisioned by Pretium for the partner
- Fiat policies need `currency_code` (`KES`, `UGX`, `NGN`)
- Stablecoin policies use `asset_type: "stablecoin"` (no `currency_code`)

### Check balances

**Fiat:**

```
get_agent_balance(agent_id, asset_type: "fiat", currency_code: "UGX")
```

**Stablecoin:**

```
get_agent_balance(agent_id, asset_type: "stablecoin", asset_code: "USDT", network: "celo")
get_agent_balance(agent_id, asset_type: "stablecoin", asset_code: "USDC", network: "avalanche")
```

**Native token:**

```
get_agent_balance(agent_id, asset_type: "native", asset_code: "CELO", network: "celo")
get_agent_balance(agent_id, asset_type: "native", asset_code: "AVAX", network: "avalanche")
```

### Agent fiat payout

1. Validate recipient (recommended):
   - `validate_phone_number` for mobile
   - `validate_bank_account` for bank

2. Pay:
   ```
   agent_create_fiat_order(agent_id, amount, currency_code, type, ...)
   ```
   Save `reference` from the response.

3. Track:
   ```
   get_agent_fiat_order_status(agent_id, reference, currency_code?)
   ```

**Required fields by `type`:**

| type | Fields |
|---|---|
| `mobile` | `shortcode`, `mobile_network` |
| `paybill` | `shortcode`, `account_number` |
| `buy_goods` | `shortcode` |
| `bank_transfer` | `bank_code`, `account_number`, `account_name` |

**Currency restrictions:**

| Currency | Allowed types |
|---|---|
| UGX | `mobile` only |
| KES | `mobile`, `paybill`, `buy_goods`, `bank_transfer` |
| NGN | `bank_transfer` only |

**Mobile networks:**

| Currency | Values |
|---|---|
| KES | `safaricom`, `airtel` |
| UGX | `mtn`, `airtel` |

### Agent stablecoin transfer

```
agent_create_stablecoin_order(agent_id, address, amount, network, asset_code?)
```

| Network | Assets |
|---|---|
| Celo | USDT, USDC |
| BNB | USDT, USDC |
| Base | USDC only |
| Polygon | USDT, USDC |
| Arbitrum | USDT, USDC |
| Avalanche | USDT, USDC |
| Solana | USDT, USDC |
| Stellar | USDC |

Returns `transaction_hash` on success.

### Off-ramp order (crypto → fiat)

Use when settlement is on-chain, not from agent balance.

```
get_exchange_rates(currency_code)     // optional quote
create_order(amount, currency_code)   // → internal_reference_id
// payer sends stablecoin to settlement wallet
confirm_order(type, internal_reference_id, network, hash, ...)
get_order_status(internal_reference_id | hash)
```

`confirm_order` shares recipient field rules plus `network` and `hash`.

---

## Spend policies

When a policy exists:

- Payout amount must be ≤ `max_auto_approve_amount`
- `daily_limit` and `monthly_limit` may apply server-side
- Fiat payouts need a fiat policy for that `currency_code`
- Stablecoin transfers need a stablecoin policy

Fiat payouts also require sufficient wallet balance. Stablecoin transfers may proceed without a policy depending on server configuration.

---

## Which tool to use

| Intent | Tool(s) |
|---|---|
| Register agent | `register_agent` |
| Check UGX balance | `get_agent_balance` (fiat) |
| Send 5000 UGX to phone | `validate_phone_number` → `agent_create_fiat_order` |
| Send 5 USDT on Celo | `agent_create_stablecoin_order` |
| Payout status | `get_agent_fiat_order_status` |
| Set spend limit | `create_agent_spend_policy` |
| Crypto-to-fiat payment | `create_order` → on-chain pay → `confirm_order` |
| FX rate | `get_exchange_rates` |

---

## Responses

Tools return JSON in MCP text content:

```json
{
  "code": 200,
  "message": "...",
  "data": { }
}
```

Errors use `code: 400` with a `message` (e.g. insufficient balance, spend limit exceeded, unsupported network).

**IDs to keep:**

| Flow | Save |
|---|---|
| Agent registration | `agent_id` |
| Agent fiat payout | `reference` |
| Stablecoin transfer | `transaction_hash` |
| Off-ramp order | `internal_reference_id` |
