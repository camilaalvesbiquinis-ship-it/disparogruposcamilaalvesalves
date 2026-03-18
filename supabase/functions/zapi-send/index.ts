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

  // Rate limit: 10 writes/min per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(ip, 10, 60_000);
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
  const { data: { user }, error: userError } = await supabase.auth.getUser(tokenStr);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { phone, message, contentType, mediaUrl, mentionAll, pollOptions, pollMaxOptions } = body;

    // Input validation
    if (!phone || typeof phone !== "string") {
      return new Response(JSON.stringify({ error: "phone is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate WhatsApp group identifier format
    const targetPhone = phone.trim();
    const validGroupId =
      /^[\d-]+@g\.us$/.test(targetPhone) ||
      /^\d+-\d+$/.test(targetPhone) ||
      /^\d+-group$/.test(targetPhone);

    if (!validGroupId) {
      return new Response(JSON.stringify({ error: "Invalid phone/group format. Expected: xxxx@g.us, xxxx-xxxx, or xxxx-group" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate message length
    if (message && typeof message === "string" && message.length > 4096) {
      return new Response(JSON.stringify({ error: "Message too long (max 4096 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate media URL format
    if (mediaUrl && typeof mediaUrl === "string") {
      try {
        const parsedUrl = new URL(mediaUrl);
        if (!["https:", "http:"].includes(parsedUrl.protocol)) {
          return new Response(JSON.stringify({ error: "Invalid media URL protocol" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch {
        return new Response(JSON.stringify({ error: "Invalid media URL" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!message && !mediaUrl) {
      return new Response(JSON.stringify({ error: "message or mediaUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate contentType
    const validTypes = ["text", "image", "video", "pdf", "catalog", "link"];
    const safeContentType = validTypes.includes(contentType) ? contentType : "text";
    const effectiveContentType = mediaUrl && safeContentType === "text" ? "image" : safeContentType;

    let endpoint = "send-text";
    let payload: Record<string, unknown> = { phone: targetPhone, message: message || "" };

    if (effectiveContentType === "image" && mediaUrl) {
      endpoint = "send-image";
      payload = { phone: targetPhone, image: mediaUrl, caption: message || "" };
    } else if (effectiveContentType === "video" && mediaUrl) {
      endpoint = "send-video";
      payload = { phone: targetPhone, video: mediaUrl, caption: message || "" };
    } else if (effectiveContentType === "pdf" && mediaUrl) {
      endpoint = "send-document/pdf";
      payload = { phone: targetPhone, document: mediaUrl, fileName: "document.pdf" };
    } else if (effectiveContentType === "link") {
      endpoint = "send-link";
      payload = { phone: targetPhone, message: message || "", image: "", linkUrl: mediaUrl || message, title: "", linkDescription: "" };
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
    return new Response(JSON.stringify({ error: "Falha ao enviar mensagem. Tente novamente." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
