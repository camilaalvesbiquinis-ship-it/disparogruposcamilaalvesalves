/**
 * Edge function: delete-user-data
 * Anonymizes/deletes all user data across tables for LGPD compliance.
 * Requires authenticated user. Only deletes the requesting user's own data.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Create client with user's auth context
  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const tokenStr = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser(tokenStr);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    if (!body.confirm) {
      return new Response(JSON.stringify({ error: "Confirmation required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to delete across all tables
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const userId = user.id;
    const deletedTables: string[] = [];

    // Delete user data from all related tables
    const tables = [
      "broadcast_groups",
      "broadcast_logs",
      "schedule_groups",
      "schedules",
      "broadcasts",
      "groups",
      "whatsapp_connections",
      "consent_records",
      "user_roles",
    ];

    // For broadcast_groups and broadcast_logs, delete via broadcast ownership
    const { data: userBroadcasts } = await supabaseAdmin
      .from("broadcasts")
      .select("id")
      .eq("user_id", userId);
    
    const broadcastIds = userBroadcasts?.map((b: { id: string }) => b.id) ?? [];
    
    if (broadcastIds.length > 0) {
      await supabaseAdmin.from("broadcast_groups").delete().in("broadcast_id", broadcastIds);
      await supabaseAdmin.from("broadcast_logs").delete().in("broadcast_id", broadcastIds);
      deletedTables.push("broadcast_groups", "broadcast_logs");
    }

    // For schedule_groups, delete via schedule ownership
    const { data: userSchedules } = await supabaseAdmin
      .from("schedules")
      .select("id")
      .eq("user_id", userId);
    
    const scheduleIds = userSchedules?.map((s: { id: string }) => s.id) ?? [];
    
    if (scheduleIds.length > 0) {
      await supabaseAdmin.from("schedule_groups").delete().in("schedule_id", scheduleIds);
      deletedTables.push("schedule_groups");
    }

    // Direct user_id deletions
    for (const table of ["schedules", "broadcasts", "groups", "whatsapp_connections", "consent_records", "user_roles"]) {
      const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
      if (!error) deletedTables.push(table);
    }

    // Anonymize profile instead of deleting (keep record for audit)
    await supabaseAdmin
      .from("profiles")
      .update({
        display_name: "[dados removidos]",
        email: `deleted-${userId.slice(0, 8)}@removed.lgpd`,
        avatar_url: null,
      })
      .eq("user_id", userId);
    deletedTables.push("profiles (anonymized)");

    // Create audit log entry for the deletion
    await supabaseAdmin.from("audit_logs").insert({
      user_id: userId,
      action: "data_request",
      table_name: "all",
      details: { type: "full_deletion", tables_affected: deletedTables },
      user_agent: req.headers.get("user-agent"),
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Dados removidos com sucesso",
      tables_affected: deletedTables 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("delete-user-data error:", error);
    return new Response(JSON.stringify({ error: "Erro ao processar exclusão" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
