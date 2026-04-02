import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body).slice(0, 500));

    // Handle poll vote events
    if (body.pollVote) {
      const { pollMessageId, options } = body.pollVote;
      const voterPhone = body.participantPhone || body.phone || "unknown";
      const groupPhone = body.phone || "unknown";

      if (!pollMessageId || !Array.isArray(options)) {
        return new Response(JSON.stringify({ ok: true, skipped: "invalid poll vote" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Look up which broadcast this poll belongs to
      const { data: pollMsg } = await supabase
        .from("broadcast_poll_messages")
        .select("broadcast_id")
        .eq("zapi_message_id", pollMessageId)
        .maybeSingle();

      const broadcastId = pollMsg?.broadcast_id || null;

      // Insert one row per option voted
      const votes = options.map((opt: { name: string }) => ({
        broadcast_id: broadcastId,
        group_phone: groupPhone,
        voter_phone: voterPhone,
        option_name: opt.name,
        poll_message_id: pollMessageId,
      }));

      if (votes.length > 0) {
        // Delete previous votes from this voter for this poll (vote change)
        await supabase
          .from("poll_votes")
          .delete()
          .eq("poll_message_id", pollMessageId)
          .eq("voter_phone", voterPhone);

        const { error } = await supabase.from("poll_votes").insert(votes);
        if (error) {
          console.error("Error inserting poll votes:", error);
        } else {
          console.log(`Recorded ${votes.length} vote(s) from ${voterPhone} for poll ${pollMessageId}`);
        }
      }

      return new Response(JSON.stringify({ ok: true, votes: votes.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For all other webhook events, just acknowledge
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
