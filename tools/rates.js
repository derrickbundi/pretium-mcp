import { z } from "zod";

export function registerRatesTool(server, api) {
  server.tool(
    "get_exchange_rates",
    "Get buying and selling exchange rates for KES (Kenyan Shilling) or UGX (Ugandan Shilling) against USD. ONLY KES and UGX are supported. Do NOT use this tool for any other currency including NGN, GHS, TZS or any other.",
    {
      currency_code: z.enum(["KES", "UGX"]).describe(
        "The currency code to get rates for. ONLY KES or UGX are accepted. Reject any other currency."
      ),
    },
    async ({ currency_code }) => {
      const allowed = ["KES", "UGX"];

      if (!allowed.includes(currency_code.toUpperCase())) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: `Currency ${currency_code} is not supported. Only KES and UGX are available.`,
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