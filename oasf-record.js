export const OASF_SCHEMA_VERSION = "1.0.0";
export const OASF_RECORD_VERSION = "1.0.0";
export const OASF_TAXONOMY_VERSION = "0.8.0";

/** OASF skill paths with catalog IDs (schema.oasf.outshift.com). */
export const OASF_SKILLS = [
  { name: "tool_interaction/automation/workflow_automation", id: 1402 },
  { name: "tool_interaction/api_schema_understanding", id: 1401 },
  {
    name: "natural_language_processing/information_retrieval_and_synthesis/question_answering",
    id: 10302,
  },
  {
    name: "natural_language_processing/conversation/chatbot",
    id: 10204,
  },
  { name: "technology/blockchain/cryptocurrency", id: 10901 },
];

/** OASF domain paths with catalog IDs. */
export const OASF_DOMAINS = [
  { name: "technology/blockchain", id: 109 },
  { name: "technology/blockchain/cryptocurrency", id: 10901 },
  { name: "technology/blockchain/smart_contracts", id: 10903 },
  { name: "finance_and_business/finance", id: 202 },
  { name: "finance_and_business/banking", id: 201 },
  { name: "technology/telecommunications", id: 1601 },
];

/** Comma-separated paths for 8004scan OASF / A2A service registration. */
export const OASF_SKILL_PATHS =
  "tool_interaction/automation/workflow_automation, tool_interaction/api_schema_understanding, finance_and_business/finance/digital_payments, technology/blockchain/cryptocurrency, natural_language_processing/conversation/chatbot";

export const OASF_DOMAIN_PATHS =
  "technology/blockchain, technology/blockchain/cryptocurrency, finance_and_business/finance, finance_and_business/banking, technology/telecommunications";

const DEFAULT_REPO = "https://github.com/derrickbundi/pretium-mcp";

export function getOasfRecord({ baseUrl, repoUrl = DEFAULT_REPO } = {}) {
  const origin = baseUrl?.replace(/\/$/, "") ?? "https://mcp.pretium.africa";
  const repo = repoUrl.replace(/\/$/, "");

  return {
    name: "Pretium MCP",
    description:
      "MCP server for Pretium — pay with stablecoins and send fiat across 7+ African markets via M-Pesa, MTN, Airtel Money, paybills, till numbers, and bank transfers. Exposes 13 MCP tools for agent registration, spend policies, fiat payouts, stablecoin transfers, off-ramp orders, FX rates, and recipient validation.",
    version: OASF_RECORD_VERSION,
    schema_version: OASF_SCHEMA_VERSION,
    authors: ["Pretium <hello@pretium.africa>"],
    created_at: "2025-07-17T00:00:00.000Z",
    annotations: {
      "oasf.taxonomy_version": OASF_TAXONOMY_VERSION,
      mcp_endpoint: `${origin}/mcp`,
      a2a_agent_card: `${origin}/.well-known/agent-card.json`,
      website: "https://pretium.africa",
      documentation: "https://docs.pretium.africa",
      erc8004_agent: "https://8004scan.io/agents/celo/9199",
    },
    skills: OASF_SKILLS,
    domains: OASF_DOMAINS,
    locators: [
      {
        type: "source_code",
        urls: [repo, `${repo}/blob/master/oasf-record.json`],
      },
      {
        type: "documentation",
        urls: ["https://docs.pretium.africa", `${repo}/blob/master/README.md`],
      },
      {
        type: "service",
        urls: [`${origin}/mcp`, `${origin}/.well-known/agent-card.json`],
      },
    ],
    modules: [
      {
        name: "mcp",
        data: {
          transport: "streamable-http",
          endpoint: `${origin}/mcp`,
          tools: [
            "get_exchange_rates",
            "create_order",
            "confirm_order",
            "get_order_status",
            "validate_bank_account",
            "validate_phone_number",
            "register_agent",
            "create_agent_spend_policy",
            "get_agent",
            "get_agent_balance",
            "agent_create_stablecoin_order",
            "agent_create_fiat_order",
            "get_agent_fiat_order_status",
          ],
        },
      },
      {
        name: "a2a",
        data: {
          agent_card: `${origin}/.well-known/agent-card.json`,
        },
      },
    ],
  };
}
