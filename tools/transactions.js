import { z } from "zod";
import { callApi, toolErr } from "./helpers.js";

export function registerCreateOrderTool(server, api) {
  server.tool(
    "create_order",
    "Create a new payment order with a specified amount and currency",
    {
      amount: z.number().positive().describe("Amount to send e.g. 100, 5000"),
      currency_code: z.string().describe("Currency code e.g. KES, UGX, NGN"),
    },
    {
      title: "Create Payment Order",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    async ({ amount, currency_code }) =>
      callApi(() => api.post(`/create-order`, { currency_code, amount }))
  );
}

export function registerConfirmOrderTool(server, api) {
  server.tool(
    "confirm_order",
    "Confirm a payment order. Supports blockchain transactions (network + hash) and recipient information (mobile money, bank transfer) using type-specific fields.",
    {
      type: z.enum(["mobile", "paybill", "bank_transfer", "buy_goods"])
        .describe("Payment type to determine which fields are required"),
      internal_reference_id: z.string()
        .describe("Internal reference ID returned when the order was created"),
      network: z
        .enum(["celo", "base", "bnb", "polygon", "arbitrum", "avalanche", "solana"])
        .describe(
          "Blockchain network e.g. celo, base, bnb, polygon, arbitrum, avalanche, solana"
        ),
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
      bank_name: z.string()
        .optional()
        .describe("Bank name. Required for type=bank_transfer"),
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
    {
      title: "Confirm Payment Order",
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
    },
    async ({ type, internal_reference_id, network, hash, shortcode, mobile_network, bank_code, bank_name, account_number, account_name, narration }) => {
      if (!internal_reference_id) return toolErr("internal_reference_id is required");
      if (!network) return toolErr("network is required");
      if (!hash) return toolErr("hash is required");

      const settlement = { internal_reference_id, network, hash };
      const basePayload = { type, ...settlement };

      let payload;
      switch (type) {
        case "mobile":
          if (!shortcode) return toolErr("shortcode is required for type=mobile");
          if (!mobile_network) return toolErr("mobile_network is required for type=mobile");
          payload = { ...basePayload, shortcode, mobile_network };
          break;

        case "paybill":
          if (!shortcode) return toolErr("shortcode is required for type=paybill");
          if (!account_number) return toolErr("account_number is required for type=paybill");
          payload = { ...basePayload, shortcode, ...(narration && { narration }) };
          break;

        case "buy_goods":
          if (!shortcode) return toolErr("shortcode is required for type=buy_goods");
          payload = { ...basePayload, shortcode };
          break;

        case "bank_transfer":
          if (!bank_code) return toolErr("bank_code is required for type=bank_transfer");
          if (!bank_name) return toolErr("bank_name is required for type=bank_transfer");
          if (!account_number) return toolErr("account_number is required for type=bank_transfer");
          if (!account_name) return toolErr("account_name is required for type=bank_transfer");
          payload = { ...basePayload, bank_code, bank_name, account_number, account_name, ...(narration && { narration }) };
          break;

        default:
          return toolErr(`Unsupported payment type: ${type}`);
      }

      return callApi(() => api.post(`/confirm-order`, payload));
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
    {
      title: "Get Order Status",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    async ({ hash, internal_reference_id }) => {
      if (!hash && !internal_reference_id) {
        return toolErr("Either hash or internal_reference_id must be provided");
      }

      const params = {};
      if (hash) params.hash = hash;
      if (internal_reference_id) params.internal_reference_id = internal_reference_id;

      return callApi(() => api.get(`/order-status`, { params }));
    }
  );
}

export function registerValidateBankAccountTool(server, api) {
  server.tool(
    "validate_bank_account",
    "Validate a bank account by providing the bank name, account number, and target country",
    {
      bank_name: z.string().describe("Bank name or swift code e.g. KCB, Opay"),
      account_number: z.string().describe("Bank account number to validate"),
      currency_code: z.enum(["KES", "UGX", "NGN"]).describe("Target country code e.g. KES, UGX, NGN"),
    },
    {
      title: "Validate Bank Account",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    async ({ bank_name, account_number, currency_code }) => {
      if (!bank_name || !account_number || !currency_code) {
        return toolErr("bank_name, account_number, and currency_code are required");
      }

      return callApi(() =>
        api.post(`/validate-bank-account`, {
          bank_name,
          account_number,
          currency_code,
        })
      );
    }
  );
}

export function registerValidatePhoneNumberTool(server, api) {
  server.tool(
    "validate_phone_number",
    "Validate a phone number by providing the mobile number, mobile network, and target country",
    {
      mobile_network: z.string().describe("Mobile network. KES options: safaricom, airtel. UGX options: mtn, airtel"),
      phone_number: z.string().describe("Mobile number to validate"),
      currency_code: z.enum(["KES", "UGX"]).describe("REQUIRED: Target country currency code. KES for Kenya, UGX for Uganda. Must be explicitly provided — do not assume."),
    },
    {
      title: "Validate Phone Number",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    async ({ mobile_network, phone_number, currency_code }) => {
      if (!mobile_network || !phone_number || !currency_code) {
        return toolErr("mobile_network, phone_number, and currency_code are required");
      }

      return callApi(() =>
        api.post(`/validate-phone-number`, {
          mobile_network,
          phone_number,
          currency_code,
        })
      );
    }
  );
}
