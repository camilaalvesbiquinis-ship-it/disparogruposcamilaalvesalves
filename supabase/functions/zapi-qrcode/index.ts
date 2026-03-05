import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ZAPI_BASE = "https://api.z-api.io";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit: 60 reads/min per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, 60, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs, corsHeaders);

  const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
  const token = Deno.env.get("ZAPI_TOKEN");
  const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");

  if (!instanceId || !token || !clientToken) {
    return new Response(JSON.stringify({ error: "Z-API credentials not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const tokenStr = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(tokenStr);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    let action = "qrcode";
    let bodyData: Record<string, unknown> = {};
    
    // Support both GET query params and POST body
    if (req.method === "POST") {
      try {
        bodyData = await req.json();
        action = (bodyData.action as string) || "qrcode";
      } catch {
        // no body, use default
      }
    } else {
      const url = new URL(req.url);
      action = url.searchParams.get("action") || "qrcode";
    }

    console.log(`Z-API action: ${action}, instance: ${instanceId}`);

    if (action === "qrcode") {
      const zapiUrl = `${ZAPI_BASE}/instances/${instanceId}/token/${token}/qr-code/image`;
      console.log(`Fetching QR code from: ${zapiUrl}`);
      
      const res = await fetch(zapiUrl, {
        headers: { "Client-Token": clientToken },
      });
      
      const responseText = await res.text();
      console.log(`Z-API QR response status: ${res.status}, body length: ${responseText.length}`);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        // If response is not JSON, it might be the image directly
        data = { value: responseText };
      }

      if (!res.ok) {
        console.error(`Z-API QR error: ${responseText}`);
        return new Response(JSON.stringify({ 
          error: `Z-API retornou erro ${res.status}`, 
          details: responseText,
          hint: "Verifique se Instance ID, Token e Client Token estão corretos no painel da Z-API"
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Z-API returns { value: "base64..." } for qr-code/image
      if (data?.value) {
        return new Response(JSON.stringify({ qrcode: data.value }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // If connected already
      if (data?.connected === true) {
        return new Response(JSON.stringify({ connected: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Unknown response format
      console.log("Unexpected Z-API QR response:", JSON.stringify(data));
      return new Response(JSON.stringify({ 
        error: "Resposta inesperada da Z-API",
        details: JSON.stringify(data),
        hint: "Verifique se sua instância Z-API está ativa e as credenciais estão corretas"
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "status") {
      const res = await fetch(
        `${ZAPI_BASE}/instances/${instanceId}/token/${token}/status`,
        { headers: { "Client-Token": clientToken } }
      );
      const data = await res.json();
      console.log("Z-API status:", JSON.stringify(data));
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "phone" || action === "device") {
      const res = await fetch(
        `${ZAPI_BASE}/instances/${instanceId}/token/${token}/device`,
        { headers: { "Client-Token": clientToken } }
      );
      const data = await res.json();
      console.log("Z-API device response:", JSON.stringify(data));
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "disconnect") {
      const res = await fetch(
        `${ZAPI_BASE}/instances/${instanceId}/token/${token}/disconnect`,
        { method: "DELETE", headers: { "Client-Token": clientToken } }
      );
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "groups") {
      const page = Number(bodyData.page) || 1;
      const pageSize = Number(bodyData.pageSize) || 100;
      const zapiUrl = `${ZAPI_BASE}/instances/${instanceId}/token/${token}/groups?page=${page}&pageSize=${pageSize}`;
      console.log(`Fetching groups from: ${zapiUrl}`);
      const res = await fetch(zapiUrl, {
        headers: { "Client-Token": clientToken },
      });
      const data = await res.json();
      console.log(`Z-API groups response status: ${res.status}, count: ${Array.isArray(data) ? data.length : 'N/A'}`);
      if (!res.ok) {
        return new Response(JSON.stringify({ error: `Z-API retornou erro ${res.status}`, details: JSON.stringify(data) }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação desconhecida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Z-API error:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
