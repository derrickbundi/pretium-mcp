import { z } from "zod";

export function registerCreateOrderTool(server, api) {
  server.tool(
    "create_order",
    "Create a new payment order with a specified amount and currency",
    {
      amount: z.number().positive().describe("Amount to send e.g. 100, 50.5"),
      currency_code: z.string().describe("Currency code e.g. KES, UGX"),
    },
    async ({ amount, currency_code }) => {
      const { data } = await api.post(`/create-order`, { currency_code, amount, });
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}

export function registerConfirmOrderTool(server, api) {
  server.tool(
    "confirm_order",
    "Confirm a payment order. Supports blockchain transactions (network + hash) and recipient information (mobile money, bank transfer) using type-specific fields.",
    {
      type: z.enum(["mobile", "paybill", "bank_transfer", "buy_goods"])
        .describe("Payment type to determine which fields are required"),
      network: z.string()
        .describe("Blockchain network e.g. celo, base, bnb, solana"),
      hash: z.string()
        .describe("Transaction hash from the blockchain"),
      shortcode: z.string()
        .optional()
        .describe("Paybill or till number. Required for type=paybill or type=buy_goods or type=mobile"),
      mobile_network: z.string()
        .optional()
        .describe("Mobile network e.g. mpesa, airtel. Required for type=mobile"),
      bank_code: z.string()
        .optional()
        .describe("Bank code or swift code. Required for type=bank_transfer"),
      account_number: z.string()
        .optional()
        .describe("Destination bank account number. Required for type=bank_transfer"),
      account_name: z.string()
        .optional()
        .describe("Account holder name. Required for type=bank_transfer"),
      narration: z.string()
        .optional()
        .describe("Payment narration for bank transfers"),
    },
    async ({ type, internal_reference_id, network, hash, shortcode, mobile_network, bank_code, account_number, account_name, narration }) => {
      if (!network) throw new Error("network is required");
      if (!hash) throw new Error("hash is required");

      const settlement = { internal_reference_id, network, hash };
      const basePayload = { type, ...settlement };

      let payload;
      switch (type) {
        case "mobile":
          if (!shortcode) throw new Error("shortcode is required for type=mobile");
          if (!mobile_network) throw new Error("mobile_network is required for type=mobile");
          payload = { ...basePayload, shortcode, mobile_network };
          break;

        case "paybill":
          if (!shortcode) throw new Error("shortcode is required for type=paybill");
          if (!account_number) throw new Error("account_number is required for type=paybill");
          payload = { ...basePayload, shortcode, ...(narration && { narration }) };
          break;

        case "buy_goods":
          if (!shortcode) throw new Error("shortcode is required for type=buy_goods");
          payload = { ...basePayload, shortcode };
          break;

        case "bank_transfer":
          if (!bank_code) throw new Error("bank_code is required for type=bank_transfer");
          if (!account_number) throw new Error("account_number is required for type=bank_transfer");
          if (!account_name) throw new Error("account_name is required for type=bank_transfer");
          payload = { ...basePayload, bank_code, account_number, account_name, ...(narration && { narration }) };
          break;

        default:
          throw new Error(`Unsupported payment type: ${type}`);
      }

      const { data } = await api.post(`/confirm-order`, payload);
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}

export function registerOrderStatusTool(server, api) {
  server.tool(
    "get_order_status",
    "Check the status of a payment order using its transaction hash or internal reference ID",
    {
      hash: z.string().optional().describe("Transaction hash of the order to check"),
      internal_reference_id: z.string().optional().describe("Internal reference ID of the order to check"),
    },
    async ({ hash, internal_reference_id }) => {
      if (!hash && !internal_reference_id) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Either hash or internal_reference_id must be provided" }),
            },
          ],
        };
      }

      const params = {};
      if (hash) params.hash = hash;
      if (internal_reference_id) params.internal_reference_id = internal_reference_id;

      const { data } = await api.get(`/order-status`, { params });
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}