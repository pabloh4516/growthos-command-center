import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { niche, objective, location, ageRange, gender, budget, websiteUrl } = await req.json();

    const systemPrompt = `Você é um especialista em Google Ads e segmentação de públicos-alvo.
Com base nas informações fornecidas, gere 4-6 sugestões de públicos-alvo detalhados para campanhas no Google Ads.

Para cada público, forneça:
- name: nome descritivo do público
- type: tipo de audiência (affinity/in_market/custom_intent/custom_affinity/remarketing/combined/similar)
- description: descrição do público e por que é relevante
- interests: array de interesses/afinidades relevantes
- keywords: array de keywords de intenção de compra
- demographics: objeto com age_range, gender, household_income, parental_status
- estimated_size: tamanho estimado (small/medium/large/very_large)
- rationale: justificativa estratégica de por que este público é recomendado
- google_ads_config: objeto com campaign_type (search/display/video/discovery), bid_strategy sugerida, e targeting_expansion (true/false)`;

    const userPrompt = `Gere públicos-alvo para Google Ads com estas informações:
- Nicho/Produto: ${niche}
- Objetivo: ${objective}
- Localização: ${location || "Brasil"}
- Faixa etária: ${ageRange || "18-65"}
- Gênero: ${gender || "Todos"}
- Orçamento estimado: ${budget || "Não informado"}
- URL do site: ${websiteUrl || "Não informado"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_audiences",
              description: "Return 4-6 detailed Google Ads audience suggestions",
              parameters: {
                type: "object",
                properties: {
                  audiences: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        type: {
                          type: "string",
                          enum: ["affinity", "in_market", "custom_intent", "custom_affinity", "remarketing", "combined", "similar"],
                        },
                        description: { type: "string" },
                        interests: { type: "array", items: { type: "string" } },
                        keywords: { type: "array", items: { type: "string" } },
                        demographics: {
                          type: "object",
                          properties: {
                            age_range: { type: "string" },
                            gender: { type: "string" },
                            household_income: { type: "string" },
                            parental_status: { type: "string" },
                          },
                        },
                        estimated_size: {
                          type: "string",
                          enum: ["small", "medium", "large", "very_large"],
                        },
                        rationale: { type: "string" },
                        google_ads_config: {
                          type: "object",
                          properties: {
                            campaign_type: { type: "string" },
                            bid_strategy: { type: "string" },
                            targeting_expansion: { type: "boolean" },
                          },
                        },
                      },
                      required: ["name", "type", "description", "interests", "keywords", "demographics", "estimated_size", "rationale", "google_ads_config"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["audiences"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_audiences" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const audiences = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(audiences), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-audiences error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
