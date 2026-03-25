import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ZAPI_BASE = "https://api.z-api.io";
const MEDIA_BUCKET = "broadcast-media";

type DueSchedule = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  content_type: string | null;
  connection_id: string | null;
  frequency: string;
  cron_expression: string | null;
  next_run_at: string | null;
  broadcast_id: string | null;
};

type BroadcastDetails = {
  id: string;
  title: string;
  content: string | null;
  content_type: string;
  connection_id: string | null;
  media_url: string | null;
  mention_mode: string | null;
  delay_seconds: number | null;
  total_groups: number;
};

type GroupDetails = {
  id: string;
  name: string;
  invite_link: string | null;
  description: string | null;
};

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
    const nowIso = new Date().toISOString();
    const { data: dueSchedules, error: schedErr } = await supabase
      .from("schedules")
      .select("id, user_id, title, content, content_type, connection_id, frequency, cron_expression, next_run_at, broadcast_id")
      .eq("is_active", true)
      .not("next_run_at", "is", null)
      .lte("next_run_at", nowIso)
      .order("next_run_at", { ascending: true });

    if (schedErr) throw schedErr;
    if (!dueSchedules?.length) {
      return jsonResponse({ message: "No active schedules due", processed: 0, failed: 0 });
    }

    let processed = 0;
    let failed = 0;

    for (const schedule of dueSchedules as DueSchedule[]) {
      try {
        const broadcast = await getOrCreateBroadcast(supabase, schedule);
        const groups = await getScheduleGroups(supabase, schedule, broadcast.id);

        if (!groups.length) {
          await markScheduleWithoutGroups(supabase, schedule.id);
          failed++;
          continue;
        }

        const mediaUrl = await resolveScheduledMediaUrl(supabase, broadcast.media_url);
        let sentCount = 0;
        const delayMs = Math.max(0, (broadcast.delay_seconds ?? 2) * 1000);

        for (let index = 0; index < groups.length; index++) {
          const group = groups[index];
          const phone = extractGroupTarget(group);
          if (!phone) {
            await insertBroadcastLog(supabase, broadcast.id, group, "failed", "Grupo sem identificador válido para envio");
            continue;
          }

          try {
            const { endpoint, payload } = buildZapiRequest({
              phone,
              message: broadcast.content ?? schedule.content ?? "",
              contentType: broadcast.content_type ?? schedule.content_type ?? "text",
              mediaUrl,
              mentionAll: broadcast.mention_mode === "all",
            });

            const response = await fetch(
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

            const rawBody = await response.text();
            let parsedBody: unknown = null;
            try {
              parsedBody = rawBody ? JSON.parse(rawBody) : null;
            } catch {
              parsedBody = rawBody;
            }

            await insertBroadcastLog(
              supabase,
              broadcast.id,
              group,
              response.ok ? "sent" : "failed",
              response.ok ? null : JSON.stringify(parsedBody)
            );

            if (!response.ok) {
              console.error(`Failed to send schedule ${schedule.id} to ${group.name}:`, parsedBody);
              continue;
            }

            sentCount++;

            if (delayMs > 0 && index < groups.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          } catch (sendErr) {
            console.error(`Failed to send schedule ${schedule.id} to ${group.name}:`, sendErr);
            await insertBroadcastLog(supabase, broadcast.id, group, "failed", String(sendErr));
          }
        }

        await supabase
          .from("broadcasts")
          .update({
            status: sentCount > 0 ? "sent" : "failed",
            sent_count: sentCount,
            total_groups: groups.length,
          })
          .eq("id", broadcast.id);

        const updateData: Record<string, unknown> = { last_run_at: nowIso };
        if (schedule.frequency === "once") {
          updateData.is_active = false;
          updateData.next_run_at = null;
        } else {
          const nextRun = calculateNextRun(schedule.frequency, schedule.cron_expression, new Date());
          updateData.next_run_at = nextRun?.toISOString() ?? null;
          if (!nextRun) updateData.is_active = false;
        }

        await supabase.from("schedules").update(updateData).eq("id", schedule.id);
        processed++;
      } catch (err) {
        console.error(`Error processing schedule ${schedule.id}:`, err);
        failed++;
      }
    }

    return jsonResponse({ message: "Done", processed, failed });
  } catch (error) {
    console.error("Process schedules error:", error);
    return jsonResponse({ error: String(error) }, 500);
  }
});

async function getOrCreateBroadcast(
  supabase: ReturnType<typeof createClient>,
  schedule: DueSchedule
): Promise<BroadcastDetails> {
  if (schedule.broadcast_id) {
    const { data: existingBroadcast, error } = await supabase
      .from("broadcasts")
      .select("id, title, content, content_type, connection_id, media_url, mention_mode, delay_seconds, total_groups")
      .eq("id", schedule.broadcast_id)
      .maybeSingle();

    if (error) throw error;

    if (existingBroadcast) {
      await supabase
        .from("broadcasts")
        .update({ status: "sending" })
        .eq("id", existingBroadcast.id);

      return existingBroadcast as BroadcastDetails;
    }
  }

  const { data: broadcast, error: insertError } = await supabase
    .from("broadcasts")
    .insert({
      user_id: schedule.user_id,
      title: schedule.title,
      content: schedule.content,
      content_type: (schedule.content_type ?? "text") as any,
      connection_id: schedule.connection_id,
      status: "sending",
      total_groups: 0,
    })
    .select("id, title, content, content_type, connection_id, media_url, mention_mode, delay_seconds, total_groups")
    .single();

  if (insertError) throw insertError;

  await supabase
    .from("schedules")
    .update({ broadcast_id: broadcast.id })
    .eq("id", schedule.id);

  return broadcast as BroadcastDetails;
}

async function getScheduleGroups(
  supabase: ReturnType<typeof createClient>,
  schedule: DueSchedule,
  broadcastId: string
): Promise<GroupDetails[]> {
  const { data: scheduleGroups, error: scheduleGroupsError } = await supabase
    .from("schedule_groups")
    .select("group_id")
    .eq("schedule_id", schedule.id);

  if (scheduleGroupsError) throw scheduleGroupsError;

  let groupIds = (scheduleGroups ?? []).map((item: { group_id: string }) => item.group_id);

  if (!groupIds.length) {
    const { data: broadcastGroups, error: broadcastGroupsError } = await supabase
      .from("broadcast_groups")
      .select("group_id")
      .eq("broadcast_id", broadcastId);

    if (broadcastGroupsError) throw broadcastGroupsError;

    groupIds = (broadcastGroups ?? []).map((item: { group_id: string }) => item.group_id);

    if (groupIds.length) {
      const { error: insertError } = await supabase.from("schedule_groups").insert(
        groupIds.map((groupId) => ({ schedule_id: schedule.id, group_id: groupId }))
      );

      if (insertError) throw insertError;
    }
  }

  if (!groupIds.length) return [];

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("id, name, invite_link, description")
    .in("id", groupIds);

  if (groupsError) throw groupsError;
  return (groups ?? []) as GroupDetails[];
}

async function resolveScheduledMediaUrl(
  supabase: ReturnType<typeof createClient>,
  mediaUrl: string | null
): Promise<string | null> {
  if (!mediaUrl) return null;

  const storagePath = extractStoragePath(mediaUrl);
  if (!storagePath) return mediaUrl;

  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error) {
    console.error("Failed to refresh signed media URL:", error);
    return mediaUrl;
  }

  return data.signedUrl;
}

function extractStoragePath(url: string): string | null {
  try {
    const parsed = new URL(url);
    const signedPrefix = `/storage/v1/object/sign/${MEDIA_BUCKET}/`;
    const publicPrefix = `/storage/v1/object/public/${MEDIA_BUCKET}/`;

    if (parsed.pathname.startsWith(signedPrefix)) {
      return decodeURIComponent(parsed.pathname.slice(signedPrefix.length));
    }

    if (parsed.pathname.startsWith(publicPrefix)) {
      return decodeURIComponent(parsed.pathname.slice(publicPrefix.length));
    }

    return null;
  } catch {
    return null;
  }
}

async function markScheduleWithoutGroups(
  supabase: ReturnType<typeof createClient>,
  scheduleId: string
) {
  await supabase
    .from("schedules")
    .update({ is_active: false })
    .eq("id", scheduleId);
}

async function insertBroadcastLog(
  supabase: ReturnType<typeof createClient>,
  broadcastId: string,
  group: GroupDetails,
  status: "sent" | "failed",
  message: string | null
) {
  await supabase.from("broadcast_logs").insert({
    broadcast_id: broadcastId,
    group_id: group.id,
    group_name: group.name,
    status,
    message,
  });
}

function extractGroupTarget(group: GroupDetails): string | null {
  const rawId = group.description?.replace("WhatsApp ID:", "").trim() || group.invite_link?.trim();
  if (!rawId) return null;

  if (/^[\d-]+@g\.us$/.test(rawId) || /^\d+-\d+$/.test(rawId) || /^\d+-group$/.test(rawId)) {
    return rawId;
  }

  if (/^[\d-]+$/.test(rawId)) {
    return `${rawId}@g.us`;
  }

  return null;
}

function buildZapiRequest({
  phone,
  message,
  contentType,
  mediaUrl,
  mentionAll,
}: {
  phone: string;
  message: string;
  contentType: string;
  mediaUrl: string | null;
  mentionAll: boolean;
}) {
  const safeContentType = mediaUrl && contentType === "text" ? "image" : contentType;

  let endpoint = "send-text";
  let payload: Record<string, unknown> = { phone, message };

  if (safeContentType === "image" && mediaUrl) {
    endpoint = "send-image";
    payload = { phone, image: mediaUrl, caption: message };
  } else if (safeContentType === "video" && mediaUrl) {
    endpoint = "send-video";
    payload = { phone, video: mediaUrl, caption: message };
  } else if (safeContentType === "pdf" && mediaUrl) {
    endpoint = "send-document/pdf";
    payload = { phone, document: mediaUrl, fileName: "document.pdf" };
  } else if (safeContentType === "link") {
    endpoint = "send-link";
    payload = { phone, message, image: "", linkUrl: mediaUrl || message, title: "", linkDescription: "" };
  }

  if (mentionAll) {
    payload.mentionsEveryOne = true;
  }

  return { endpoint, payload };
}

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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
