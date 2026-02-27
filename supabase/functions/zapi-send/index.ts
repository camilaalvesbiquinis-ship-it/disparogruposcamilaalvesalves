import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
  const token = Deno.env.get("ZAPI_TOKEN");
  const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");

  if (!instanceId || !token || !clientToken) {
    return new Response(JSON.stringify({ error: "Z-API credentials not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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

  const { data: { user }, error: userError } = await supabase.auth.getUser(tokenStr);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { phone, message, contentType, mediaUrl, mentionAll } = body;

    if (!phone || (!message && !mediaUrl)) {
      return new Response(JSON.stringify({ error: "phone and message/mediaUrl are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let endpoint = "send-text";
    let payload: Record<string, unknown> = { phone, message };

    if (contentType === "image" && mediaUrl) {
      endpoint = "send-image";
      payload = { phone, image: mediaUrl, caption: message || "" };
    } else if (contentType === "video" && mediaUrl) {
      endpoint = "send-video";
      payload = { phone, video: mediaUrl, caption: message || "" };
    } else if (contentType === "pdf" && mediaUrl) {
      endpoint = "send-document/pdf";
      payload = { phone, document: mediaUrl, fileName: "document.pdf" };
    } else if (contentType === "link") {
      endpoint = "send-link";
      payload = { phone, message: message || "", image: "", linkUrl: mediaUrl || message, title: "", linkDescription: "" };
    }

    if (mentionAll) {
      (payload as Record<string, unknown>).mentionsEveryOne = true;
    }

    const res = await fetch(
      `${ZAPI_BASE}/instances/${instanceId}/token/${token}/${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Client-Token": clientToken,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Z-API send failed [${res.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, ...data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Z-API send error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
