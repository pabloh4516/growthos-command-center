import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOOGLE_ADS_API_VERSION = "v18";
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GOOGLE_ADS_DEVELOPER_TOKEN = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN");
    const GOOGLE_ADS_REFRESH_TOKEN = Deno.env.get("GOOGLE_ADS_REFRESH_TOKEN");
    const GOOGLE_ADS_CLIENT_ID = Deno.env.get("GOOGLE_ADS_CLIENT_ID");
    const GOOGLE_ADS_CLIENT_SECRET = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET");
    const GOOGLE_ADS_CUSTOMER_ID = Deno.env.get("GOOGLE_ADS_CUSTOMER_ID");

    if (!GOOGLE_ADS_DEVELOPER_TOKEN || !GOOGLE_ADS_REFRESH_TOKEN || !GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_CLIENT_SECRET || !GOOGLE_ADS_CUSTOMER_ID) {
      return new Response(
        JSON.stringify({
          error: "Credenciais do Google Ads não configuradas. Configure GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET e GOOGLE_ADS_CUSTOMER_ID nos secrets do projeto.",
          missing_credentials: true,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get fresh access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_ADS_CLIENT_ID,
        client_secret: GOOGLE_ADS_CLIENT_SECRET,
        refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error("Token refresh failed:", tokenError);
      throw new Error("Falha ao renovar token de acesso do Google Ads");
    }

    const { access_token } = await tokenResponse.json();
    const { audience } = await req.json();

    if (!audience) {
      throw new Error("Dados da audiência não fornecidos");
    }

    const customerId = GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, "");

    // Create Custom Audience via Google Ads API
    const createPayload = {
      operations: [
        {
          create: {
            name: audience.name,
            description: audience.description,
            members: [
              ...audience.keywords.map((kw: string) => ({
                memberType: "KEYWORD",
                keyword: { text: kw },
              })),
              ...(audience.interests || []).slice(0, 10).map((interest: string) => ({
                memberType: "KEYWORD",
                keyword: { text: interest },
              })),
            ],
          },
        },
      ],
    };

    const createResponse = await fetch(
      `${GOOGLE_ADS_BASE_URL}/customers/${customerId}/customAudiences:mutate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "developer-token": GOOGLE_ADS_DEVELOPER_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createPayload),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.text();
      console.error("Google Ads API error:", createResponse.status, errorData);
      throw new Error(`Erro ao criar audiência no Google Ads [${createResponse.status}]: ${errorData}`);
    }

    const result = await createResponse.json();
    const resourceName = result.results?.[0]?.resourceName || "created";

    return new Response(
      JSON.stringify({
        success: true,
        resource_name: resourceName,
        message: `Audiência "${audience.name}" criada com sucesso no Google Ads!`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("create-google-audience error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
