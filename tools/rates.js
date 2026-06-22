import { z } from "zod";

export function registerRatesTool(server, api) {
    server.tool(
        "get_exchange_rates",
        "Get buying and selling exchange rates for a currency against USD",
        {
            currency_code: z.string().describe(
                "The non-USD currency code to get rates for. E.g. KES, UGX"
            ),
        },
        async ({ currency_code }) => {
            const { data } = await api.post("/rates", { currency_code });
            return { content: [{ type: "text", text: JSON.stringify(data) }] };
        }
    );
}