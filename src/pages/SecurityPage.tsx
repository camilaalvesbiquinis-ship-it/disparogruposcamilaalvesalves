import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { Shield, AlertTriangle, CheckCircle, Clock, Activity, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const levelColors: Record<string, { bg: string; color: string; border: string; label: string }> = {
  info: { bg: "#F5EDE5", color: "#6B5044", border: "#D4B9A8", label: "Info" },
  warn: { bg: "#FEF9E7", color: "#7D6608", border: "#F0D9A0", label: "Aviso" },
  error: { bg: "#FDECEA", color: "#922B21", border: "#F5C0BB", label: "Risco" },
};

function useSecurityData() {
  return useQuery({
    queryKey: ["security-data"],
    queryFn: async () => {
      // Fetch recent broadcasts for activity log
      const { data: broadcasts = [] } = await supabase
        .from("broadcasts")
        .select("id, title, status, sent_count, total_groups, created_at, delay_seconds")
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch broadcast logs for detailed events
      const { data: broadcastLogs = [] } = await supabase
        .from("broadcast_logs")
        .select("id, status, message, group_name, created_at, broadcast_id")
        .order("created_at", { ascending: false })
        .limit(30);

      // Build activity log from real data
      const logs: { time: string; action: string; detail: string; level: string }[] = [];

      broadcasts.forEach((b) => {
        const time = format(new Date(b.created_at), "HH:mm", { locale: ptBR });
        if (b.status === "sent") {
          logs.push({
            time,
            action: "Disparo enviado",
            detail: `${b.title?.slice(0, 40)}${(b.title?.length || 0) > 40 ? "..." : ""} — ${b.sent_count}/${b.total_groups} grupos`,
            level: "info",
          });
        } else if (b.status === "failed") {
          logs.push({
            time,
            action: "Disparo falhou",
            detail: `${b.title?.slice(0, 40)}${(b.title?.length || 0) > 40 ? "..." : ""} — ${b.sent_count}/${b.total_groups} grupos`,
            level: "error",
          });
        } else if (b.status === "sending") {
          logs.push({
            time,
            action: "Disparo em andamento",
            detail: `${b.title?.slice(0, 40)}${(b.title?.length || 0) > 40 ? "..." : ""} — ${b.sent_count}/${b.total_groups} grupos`,
            level: "warn",
          });
        } else if (b.status === "scheduled") {
          logs.push({
            time,
            action: "Agendamento criado",
            detail: `${b.title?.slice(0, 40)}${(b.title?.length || 0) > 40 ? "..." : ""} — ${b.total_groups} grupos`,
            level: "info",
          });
        }
      });

      // Add failed broadcast logs
      broadcastLogs
        .filter((l) => l.status === "error" || l.status === "failed")
        .slice(0, 5)
        .forEach((l) => {
          logs.push({
            time: format(new Date(l.created_at), "HH:mm", { locale: ptBR }),
            action: "Erro no envio",
            detail: `${l.group_name || "Grupo desconhecido"} — ${l.message || "Erro interno"}`,
            level: "error",
          });
        });

      // Sort by original timestamp (approximate via time string)
      logs.sort((a, b) => b.time.localeCompare(a.time));

      // KPIs
      const failedCount = broadcasts.filter((b) => b.status === "failed").length;
      const sendingCount = broadcasts.filter((b) => b.status === "sending").length;
      const alertsCount = failedCount + sendingCount;

      const sentBroadcasts = broadcasts.filter((b) => b.status === "sent");
      const totalSent = sentBroadcasts.reduce((s, b) => s + (b.sent_count || 0), 0);
      const totalGroups = sentBroadcasts.reduce((s, b) => s + (b.total_groups || 0), 0);
      const successRate = totalGroups > 0 ? ((totalSent / totalGroups) * 100).toFixed(0) : "100";

      const avgDelay = sentBroadcasts.length > 0
        ? (sentBroadcasts.reduce((s, b) => s + (b.delay_seconds || 3), 0) / sentBroadcasts.length).toFixed(1)
        : "—";

      return {
        logs: logs.slice(0, 15),
        alertsCount,
        successRate,
        avgDelay,
        totalBroadcasts: broadcasts.length,
      };
    },
  });
}

const SecurityPage = () => {
  const { data, isLoading } = useSecurityData();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const {
    logs = [],
    alertsCount = 0,
    successRate = "100",
    avgDelay = "—",
    totalBroadcasts = 0,
  } = data || {};

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-display font-semibold" style={{ color: '#1C1917' }}>Segurança</h1>
          <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>Monitoramento e controle de envios</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Taxa de Sucesso" value={`${successRate}%`} icon={<Shield className="h-5 w-5" />} />
          <KpiCard title="Alertas" value={alertsCount} subtitle="Falhas e pendentes" icon={<AlertTriangle className="h-5 w-5" />} />
          <KpiCard title="Disparos" value={totalBroadcasts} subtitle="Total realizados" icon={<CheckCircle className="h-5 w-5" />} />
          <KpiCard title="Delay Médio" value={avgDelay === "—" ? "—" : `${avgDelay}s`} subtitle="Entre grupos" icon={<Clock className="h-5 w-5" />} />
        </div>

        <div className="card-glow rounded-xl p-5">
          <h3 className="section-title flex items-center gap-2">
            <Activity className="h-4 w-4" style={{ color: '#8B6E5A' }} />
            Log de Atividades
          </h3>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma atividade registrada</p>
          ) : (
            <div className="space-y-0">
              {logs.map((log, i) => {
                const lc = levelColors[log.level];
                return (
                  <div key={i} className="flex items-center gap-4 py-3.5" style={{ borderBottom: i < logs.length - 1 ? '1px solid #F0EBE5' : 'none' }}>
                    <span className="text-[12px] font-data w-12 shrink-0" style={{ color: '#A09890' }}>{log.time}</span>
                    <Badge variant="outline" className="text-[10px] font-data" style={{ background: lc.bg, color: lc.color, borderColor: lc.border }}>
                      {lc.label}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-sans font-medium" style={{ color: '#1C1917' }}>{log.action}</p>
                      <p className="text-[12px] font-sans truncate" style={{ color: '#A09890' }}>{log.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SecurityPage;
