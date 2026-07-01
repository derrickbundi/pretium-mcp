import { z } from "zod";
import { callApi, toolErr } from "./helpers.js";

export function registerRatesTool(server, api) {
  server.tool(
    "get_exchange_rates",
    "Get buying and selling exchange rates for NGN (Nigeria Naira), KES (Kenyan Shilling) or UGX (Ugandan Shilling) against USD. ONLY NGN, KES and UGX are supported. Do NOT use this tool for any other currency including GHS, TZS or any other.",
    {
      currency_code: z.enum(["KES", "UGX", "NGN"]).describe(
        "The currency code to get rates for. ONLY NGN, KES or UGX are accepted. Reject any other currency."
      ),
    },
    {
      title: "Get Exchange Rates",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
    async ({ currency_code }) => {
      const code = currency_code.toUpperCase();

      if(!["KES", "UGX", "NGN"].includes(code)) {
        return toolErr(`Currency ${currency_code} is not supported. Only NGN, KES and UGX are available.`);
      }

      return callApi(() => api.post("/rates", { currency_code: code }));
    }
  );
}