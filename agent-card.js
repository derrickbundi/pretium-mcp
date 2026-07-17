export function getAgentCard(baseUrl) {
  const origin = baseUrl.replace(/\/$/, "");

  return {
    name: "Pretium",
    description:
      "Pay with stablecoins and send fiat across 7+ African markets via M-Pesa, MTN, Airtel Money, paybills, till numbers, and bank transfers. Supports programmable AI agent spend policies, off-ramp orders, and USDT/USDC transfers on Celo, Base, and BNB.",
    version: "1.0.0",
    url: `${origin}/mcp`,
    provider: {
      organization: "Pretium",
      url: "https://pretium.africa",
    },
    documentationUrl: "https://docs.pretium.africa",
    capabilities: {
      streaming: true,
    },
    authentication: {
      schemes: [],
    },
    defaultInputModes: ["application/json", "text/plain"],
    defaultOutputModes: ["application/json", "text/plain"],
    skills: [
      {
        id: "agent-fiat-payout",
        name: "Agent Fiat Payout",
        description:
          "Send KES, UGX, or NGN from an agent balance via M-Pesa, MTN, Airtel Money, paybill, till, or bank transfer.",
        tags: ["payments", "fiat", "m-pesa", "mtn", "bank-transfer", "africa"],
        examples: [
          "Send 5000 UGX to an MTN mobile money number",
          "Pay a KES paybill from my agent balance",
        ],
        inputModes: ["application/json", "text/plain"],
        outputModes: ["application/json"],
      },
      {
        id: "agent-stablecoin-transfer",
        name: "Agent Stablecoin Transfer",
        description:
          "Transfer USDT or USDC from an agent balance to a wallet on Celo, Base, or BNB.",
        tags: ["stablecoin", "usdt", "usdc", "celo", "blockchain", "crypto"],
        examples: [
          "Send 10 USDT on Celo to a wallet address",
          "Transfer USDC on Base from my agent balance",
        ],
        inputModes: ["application/json", "text/plain"],
        outputModes: ["application/json"],
      },
      {
        id: "stablecoin-offramp",
        name: "Stablecoin Off-Ramp",
        description:
          "Convert stablecoin settlement into fiat disbursement through create, confirm, and status tools.",
        tags: ["off-ramp", "stablecoin", "fiat", "settlement", "payments"],
        examples: [
          "Off-ramp USDC to KES after on-chain payment",
          "Create and confirm a stablecoin-to-fiat payout order",
        ],
        inputModes: ["application/json", "text/plain"],
        outputModes: ["application/json"],
      },
      {
        id: "exchange-rates",
        name: "Exchange Rates",
        description:
          "Fetch Pretium buying and selling FX rates for KES, UGX, and NGN against USD.",
        tags: ["fx", "rates", "exchange", "kes", "ugx", "ngn"],
        examples: [
          "What is the current KES buying rate?",
          "Get UGX exchange rates before creating an order",
        ],
        inputModes: ["text/plain"],
        outputModes: ["application/json"],
      },
      {
        id: "validate-recipient",
        name: "Validate Recipient",
        description:
          "Verify mobile money numbers and bank accounts before sending a payout.",
        tags: ["validation", "mobile-money", "bank-account", "kyc"],
        examples: [
          "Validate this Safaricom phone number before payout",
          "Check whether this Nigerian bank account is valid",
        ],
        inputModes: ["application/json", "text/plain"],
        outputModes: ["application/json"],
      },
      {
        id: "agent-setup",
        name: "Agent Setup",
        description:
          "Register a Pretium agent and configure fiat or stablecoin spend policies.",
        tags: ["agent", "registration", "spend-policy", "configuration"],
        examples: [
          "Register my Pretium agent and set a daily spend limit",
          "Create a stablecoin spend policy for my agent",
        ],
        inputModes: ["application/json", "text/plain"],
        outputModes: ["application/json"],
      },
      {
        id: "balance-check",
        name: "Balance Check",
        description:
          "Check an agent's fiat wallet balance or on-chain stablecoin balance.",
        tags: ["balance", "wallet", "agent", "stablecoin", "fiat"],
        examples: [
          "What is my agent UGX balance?",
          "Check USDT balance for my agent on Celo",
        ],
        inputModes: ["application/json", "text/plain"],
        outputModes: ["application/json"],
      },
      {
        id: "payout-status",
        name: "Payout Status",
        description:
          "Track agent fiat payout or off-ramp order status by reference or transaction hash.",
        tags: ["status", "tracking", "payout", "orders"],
        examples: [
          "Check status of agent fiat payout reference ABC123",
          "Get order status for an off-ramp transaction hash",
        ],
        inputModes: ["application/json", "text/plain"],
        outputModes: ["application/json"],
      },
    ],
  };
}
