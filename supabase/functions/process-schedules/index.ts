import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ZAPI_BASE = "https://api.z-api.io";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const instanceId = Deno.env.get("ZAPI_INSTANCE_ID");
  const token = Deno.env.get("ZAPI_TOKEN");
  const clientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");

  if (!instanceId || !token || !clientToken) {
    return new Response(JSON.stringify({ error: "Z-API credentials not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Find active schedules that are due
    const now = new Date().toISOString();
    const { data: dueSchedules, error: schedErr } = await supabase
      .from("schedules")
      .select("*")
      .eq("is_active", true)
      .not("next_run_at", "is", null)
      .lte("next_run_at", now);

    if (schedErr) throw schedErr;
    if (!dueSchedules || dueSchedules.length === 0) {
      return new Response(JSON.stringify({ message: "No schedules due", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${dueSchedules.length} due schedule(s)`);

    let processed = 0;
    let failed = 0;

    for (const schedule of dueSchedules) {
      try {
        // Get groups for this schedule
        const { data: scheduleGroups, error: sgErr } = await supabase
          .from("schedule_groups")
          .select("group_id")
          .eq("schedule_id", schedule.id);

        if (sgErr) throw sgErr;

        // Get group details
        const groupIds = (scheduleGroups || []).map((sg: { group_id: string }) => sg.group_id);
        if (groupIds.length === 0) {
          console.log(`Schedule ${schedule.id} has no groups, skipping`);
          // Deactivate schedule with no groups
          await supabase.from("schedules").update({ is_active: false }).eq("id", schedule.id);
          continue;
        }

        const { data: groups, error: gErr } = await supabase
          .from("groups")
          .select("id, name, invite_link")
          .in("id", groupIds);

        if (gErr) throw gErr;

        // Create a broadcast record for tracking
        const { data: broadcast, error: bErr } = await supabase
          .from("broadcasts")
          .insert({
            user_id: schedule.user_id,
            title: schedule.title,
            content: schedule.content,
            content_type: schedule.content_type,
            connection_id: schedule.connection_id,
            status: "sending",
            total_groups: groups?.length || 0,
          })
          .select()
          .single();

        if (bErr) throw bErr;

        // Send to each group
        let sentCount = 0;
        for (const group of groups || []) {
          // Extract phone/group ID from invite_link or name
          const phone = group.invite_link || group.name;
          if (!phone) continue;

          // Determine endpoint and payload
          const contentType = schedule.content_type || "text";
          let endpoint = "send-text";
          let payload: Record<string, unknown> = { phone, message: schedule.content || "" };

          if (contentType === "image") {
            endpoint = "send-image";
            payload = { phone, image: "", caption: schedule.content || "" };
          }

          try {
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
            
            // Log the result
            await supabase.from("broadcast_logs").insert({
              broadcast_id: broadcast.id,
              group_id: group.id,
              group_name: group.name,
              status: res.ok ? "sent" : "failed",
              message: res.ok ? null : JSON.stringify(data),
            });

            if (res.ok) sentCount++;

            // Small delay between sends
            await new Promise((r) => setTimeout(r, 2000));
          } catch (sendErr) {
            console.error(`Failed to send to group ${group.name}:`, sendErr);
            await supabase.from("broadcast_logs").insert({
              broadcast_id: broadcast.id,
              group_id: group.id,
              group_name: group.name,
              status: "failed",
              message: String(sendErr),
            });
          }
        }

        // Update broadcast status
        await supabase
          .from("broadcasts")
          .update({
            status: sentCount > 0 ? "sent" : "failed",
            sent_count: sentCount,
          })
          .eq("id", broadcast.id);

        // Update schedule: set last_run_at, calculate next_run_at
        const updateData: Record<string, unknown> = {
          last_run_at: now,
        };

        if (schedule.frequency === "once") {
          updateData.is_active = false;
          updateData.next_run_at = null;
        } else {
          const nextRun = calculateNextRun(schedule.frequency, schedule.cron_expression, new Date());
          updateData.next_run_at = nextRun?.toISOString() || null;
          if (!nextRun) updateData.is_active = false;
        }

        await supabase.from("schedules").update(updateData).eq("id", schedule.id);
        processed++;
      } catch (err) {
        console.error(`Error processing schedule ${schedule.id}:`, err);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ message: "Done", processed, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Process schedules error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calculateNextRun(
  frequency: string,
  _cronExpression: string | null,
  from: Date
): Date | null {
  const next = new Date(from);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      return next;
    case "weekly":
      next.setDate(next.getDate() + 7);
      return next;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      return next;
    default:
      return null;
  }
}
