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

export function registerGetAgentBalanceTool(server, api) {
  server.tool(
    "get_agent_balance",
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
        .describe("Blockchain network, e.g. celo, base, bnb — required when asset_type is 'stablecoin'"),
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

export function registerAgentCreateStablecoinOrderTool(server, api) {
  server.tool(
    "agent_create_stablecoin_order",
    "Pay USDT or USDC from an agent's stablecoin balance to a blockchain address. Requires the agent_id returned from register_agent.",
    {
      agent_id: z.string().describe("ID of the agent returned from register_agent"),
      address: z.string().describe("Destination wallet address to receive USDT or USDC"),
      network: z
        .enum(["celo", "base", "bnb"])
        .describe("Blockchain network to send on, e.g. celo, base, bnb"),
      amount: z
        .number()
        .positive()
        .describe("Amount of USDT or USDC to send"),
      asset_code: z
        .string()
        .optional()
        .describe("Stablecoin asset code (defaults to USDT)"),
    },
    async ({ agent_id, address, network, amount, asset_code }) => {
      const asset = asset_code ?? "USDT";

      if (!agent_id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "agent_id is required" }) }],
        };
      }
      if (!address) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "address is required" }) }],
        };
      }
      if (!network) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "network is required" }) }],
        };
      }

      const { data } = await api.post(`/agent/pay`, {
        agent_id,
        address,
        amount,
        asset_code: asset,
        network,
      });

      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}

export function registerAgentCreateFiatOrderTool(server, api) {
  server.tool(
    "agent_create_fiat_order",
    "Create a fiat payout from an agent's balance to a recipient. Supports mobile money, paybill, buy goods, and bank transfer using type-specific fields. Requires the agent_id returned from register_agent.",
    {
      agent_id: z.string().describe("ID of the agent returned from register_agent"),
      amount: z.number().positive().describe("Fiat amount to send e.g. 100, 5000"),
      currency_code: z
        .enum(["KES", "UGX", "NGN"])
        .describe("Currency code e.g. KES, UGX, NGN"),
      type: z
        .enum(["mobile", "paybill", "bank_transfer", "buy_goods"])
        .describe("Payment type to determine which fields are required"),
      shortcode: z
        .string()
        .optional()
        .describe("Phone number, paybill, or till number. Required for type=mobile, paybill, or buy_goods"),
      mobile_network: z
        .string()
        .optional()
        .describe("Mobile network e.g. mpesa, airtel, mtn. Required for type=mobile"),
      bank_code: z
        .string()
        .optional()
        .describe("Bank code or swift code. Required for type=bank_transfer"),
      account_number: z
        .string()
        .optional()
        .describe("Destination account number. Required for type=paybill or bank_transfer"),
      account_name: z
        .string()
        .optional()
        .describe("Account holder name. Required for type=bank_transfer"),
      narration: z
        .string()
        .optional()
        .describe("Payment narration for bank transfers"),
    },
    async ({
      agent_id,
      amount,
      currency_code,
      type,
      shortcode,
      mobile_network,
      bank_code,
      account_number,
      account_name,
      narration,
    }) => {
      if (!agent_id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "agent_id is required" }) }],
        };
      }
      if (!amount) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "amount is required" }) }],
        };
      }
      if (!currency_code) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "currency_code is required" }) }],
        };
      }

      const basePayload = { agent_id, amount, currency_code, type };
      let payload;

      switch (type) {
        case "mobile":
          if (!shortcode) {
            return {
              content: [{ type: "text", text: JSON.stringify({ error: "shortcode is required for type=mobile" }) }],
            };
          }
          if (!mobile_network) {
            return {
              content: [{ type: "text", text: JSON.stringify({ error: "mobile_network is required for type=mobile" }) }],
            };
          }
          payload = { ...basePayload, shortcode, mobile_network };
          break;

        case "paybill":
          if (!shortcode) {
            return {
              content: [{ type: "text", text: JSON.stringify({ error: "shortcode is required for type=paybill" }) }],
            };
          }
          if (!account_number) {
            return {
              content: [{ type: "text", text: JSON.stringify({ error: "account_number is required for type=paybill" }) }],
            };
          }
          payload = { ...basePayload, shortcode, account_number, ...(narration && { narration }) };
          break;

        case "buy_goods":
          if (!shortcode) {
            return {
              content: [{ type: "text", text: JSON.stringify({ error: "shortcode is required for type=buy_goods" }) }],
            };
          }
          payload = { ...basePayload, shortcode };
          break;

        case "bank_transfer":
          if (!bank_code) {
            return {
              content: [{ type: "text", text: JSON.stringify({ error: "bank_code is required for type=bank_transfer" }) }],
            };
          }
          if (!account_number) {
            return {
              content: [{ type: "text", text: JSON.stringify({ error: "account_number is required for type=bank_transfer" }) }],
            };
          }
          if (!account_name) {
            return {
              content: [{ type: "text", text: JSON.stringify({ error: "account_name is required for type=bank_transfer" }) }],
            };
          }
          payload = { ...basePayload, bank_code, account_number, account_name, ...(narration && { narration }) };
          break;

        default:
          return {
            content: [{ type: "text", text: JSON.stringify({ error: `Unsupported payment type: ${type}` }) }],
          };
      }

      const { data } = await api.post(`/agent/create-fiat-order`, payload);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}

export function registerAgentFiatOrderStatusTool(server, api) {
  server.tool(
    "get_agent_fiat_order_status",
    "Check the status of an agent fiat payout using the reference returned from agent_create_fiat_order. Requires the agent_id returned from register_agent.",
    {
      agent_id: z.string().describe("ID of the agent returned from register_agent"),
      reference: z
        .string()
        .describe("Order reference returned from agent_create_fiat_order"),
      currency_code: z
        .enum(["KES", "UGX", "NGN"])
        .optional()
        .describe("Currency code e.g. KES, UGX, NGN — optional but helps locate the payout record"),
    },
    async ({ agent_id, reference, currency_code }) => {
      if (!agent_id) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "agent_id is required" }) }],
        };
      }
      if (!reference) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "reference is required" }) }],
        };
      }

      const params = { agent_id, reference };
      if (currency_code) params.currency_code = currency_code;

      const { data } = await api.get(`/agent/fiat-order-status`, { params });
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}