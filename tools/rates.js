import { z } from "zod";

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
      const allowed = ["KES", "UGX", "NGN"];

      if (!allowed.includes(currency_code.toUpperCase())) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: `Currency ${currency_code} is not supported. Only NGG, KES and UGX are available.`,
              }),
            },
          ],
        };
      }

      const { data } = await api.post("/rates", { currency_code: currency_code.toUpperCase() });
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}