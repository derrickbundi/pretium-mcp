import { z } from "zod";

export function registerCreateAgentTool(server, api) {
  server.tool(
    "register_agent",
    "Register an agent with Pretium using a secret key provisioned by Pretium. All agent details (payout method, currency, contact info, etc.) are already configured server-side at the time the secret key was provisioned — this tool simply activates/registers that agent.",
    {
      secret_key: z.string().describe("Secret key provisioned by Pretium."),
    },
    async ({ secret_key }) => {
      if (!secret_key) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "secret_key is required" }) }],
        };
      }

      const { data } = await api.post(`/agent/create`, {
        secret_key
      });

      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}

export function registerCreateAgentSpendPolicyTool(server, api) {
  server.tool(
    "create_agent_spend_policy",
    "Create a spend policy for an agent registered with Pretium, defining limits the agent can transact within without requiring manual approval — e.g. max amount per transaction, daily/monthly limits, and transaction velocity. Requires the agent_id returned from register_agent.",
    {
      agent_id: z.string().describe("ID of the agent returned from register_agent"),
      asset_type: z
        .enum(["fiat", "stablecoin"])
        .describe("Whether this policy governs fiat payouts or stablecoin settlement"),
      currency_code: z
        .string()
        .optional()
        .describe("Currency code this policy applies to, e.g. KES, UGX, NGN — required when asset_type is 'fiat'"),
      max_auto_approve_amount: z
        .number()
        .positive()
        .describe("Maximum amount per transaction the agent can send without requiring approval"),
      daily_limit: z
        .number()
        .positive()
        .optional()
        .describe("Maximum total amount the agent can transact within a rolling 24-hour period (optional)"),
      monthly_limit: z
        .number()
        .positive()
        .optional()
        .describe("Maximum total amount the agent can transact within a calendar month (optional)"),
    },

     async ({ agent_id, asset_type, currency_code, max_auto_approve_amount, daily_limit, monthly_limit}) => {
      if (!agent_id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "agent_id is required" }) }],
        };
      }

      if (asset_type === "fiat" && !currency_code) {
        return {
          content: [
            { type: "text", text: JSON.stringify({ error: "currency_code is required when asset_type is 'fiat'" }) },
          ],
        };
      }

      const { data } = await api.post(`/agent/spend-policy`, {
        agent_id,
        asset_type,
        ...(asset_type === "fiat" ? { currency_code } : {}),
        max_auto_approve_amount,
        ...(daily_limit ? { daily_limit } : {}),
        ...(monthly_limit ? { monthly_limit } : {}),
      });

      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}

export function registerGetAgentTool(server, api) {
  server.tool(
    "get_agent",
    "Retrieve details for an agent registered with Pretium, including spend policies. Requires the agent_id returned from register_agent.",
    {
      agent_id: z.string().describe("ID of the agent returned from register_agent"),
    },
    async ({ agent_id }) => {
      if(!agent_id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "agent_id is required" }) }],
        };
      }

      const { data } = await api.get(`/agent/q/${agent_id}`);

      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}

export function registerGetBalanceTool(server, api) {
  server.tool(
    "get_balance",
    "Get the current balance for an agent — either fiat payout balance or stablecoin settlement balance. Requires the agent_id returned from register_agent.",
    {
      agent_id: z.string().describe("ID of the agent returned from register_agent"),
      asset_type: z
        .enum(["fiat", "stablecoin"])
        .describe("Whether to fetch fiat balance or stablecoin balance"),
      currency_code: z
        .string()
        .optional()
        .describe("Currency code, e.g. KES, UGX, NGN — required when asset_type is 'fiat'"),
      asset_code: z
        .string()
        .optional()
        .describe("Stablecoin asset code, e.g. USDT, USDC — required when asset_type is 'stablecoin'"),
      network: z
        .string()
        .optional()
        .describe("Blockchain network, e.g. celo, base, bnb, solana — required when asset_type is 'stablecoin'"),
    },
    async ({ agent_id, asset_type, currency_code, asset_code, network }) => {
      if (!agent_id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "agent_id is required" }) }],
        };
      }
      if (asset_type === "fiat" && !currency_code) {
        return {
          content: [
            { type: "text", text: JSON.stringify({ error: "currency_code is required when asset_type is 'fiat'" }) },
          ],
        };
      }
      if (asset_type === "stablecoin" && !asset_code) {
        return {
          content: [
            { type: "text", text: JSON.stringify({ error: "asset_code is required when asset_type is 'stablecoin'" }) },
          ],
        };
      }
      if (asset_type === "stablecoin" && !network) {
        return {
          content: [
            { type: "text", text: JSON.stringify({ error: "network is required when asset_type is 'stablecoin'" }) },
          ],
        };
      }
      const { data } = await api.get(`/agent/balance`, {
        params: {
          agent_id,
          asset_type,
          ...(asset_type === "fiat" ? { currency_code } : { asset_code, network }),
        },
      });
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}