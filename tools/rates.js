import { z } from "zod";

export function registerRatesTool(server, api) {
  server.tool(
    "get_exchange_rates",
    "Get buying and selling exchange rates for KES (Kenyan Shilling) or UGX (Ugandan Shilling) against USD",
    {
      currency_code: z.enum(["KES", "UGX"]).describe(
        "The currency code to get rates for. Only KES or UGX are supported."
      ),
    },
    async ({ currency_code }) => {
      const { data } = await api.post("/rates", { currency_code });
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    }
  );
}