import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import {
  Smartphone,
  Users,
  MessageSquare,
  CalendarClock,
  Send,
  Activity,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: connections = [], isLoading: loadingConn } = useQuery({
    queryKey: ["dashboard-connections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("whatsapp_connections").select("id, status");
      if (error) throw error;
      return data;
    },
  });

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ["dashboard-groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("id, is_active, member_count");
      if (error) throw error;
      return data;
    },
  });

  const { data: broadcasts = [], isLoading: loadingBroadcasts } = useQuery({
    queryKey: ["dashboard-broadcasts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("broadcasts").select("id, status, sent_count, delivered_count, title, created_at, total_groups").order("created_at", { ascending: false }).limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["dashboard-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schedules").select("id, is_active");
      if (error) throw error;
      return data;
    },
  });

  const isLoading = loadingConn || loadingGroups || loadingBroadcasts;

  const connActive = connections.filter((c) => c.status === "connected").length;
  const connPaused = connections.length - connActive;
  const activeGroups = groups.filter((g) => g.is_active).length;
  const totalMembers = groups.reduce((sum, g) => sum + (g.member_count || 0), 0);
  const totalSent = broadcasts.reduce((sum, b) => sum + (b.sent_count || 0), 0);
  const activeSchedules = schedules.filter((s) => s.is_active).length;
  const pausedSchedules = schedules.length - activeSchedules;

  const statusLabels: Record<string, { label: string; className: string }> = {
    sent: { label: "Entregue", className: "badge-trend-up" },
    sending: { label: "Enviando", className: "" },
    scheduled: { label: "Agendado", className: "" },
    draft: { label: "Rascunho", className: "" },
    failed: { label: "Falhou", className: "badge-trend-down" },
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#8B6E5A' }} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-display font-semibold" style={{ color: '#1C1917' }}>Dashboard</h1>
          <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>Visão geral do seu sistema de disparos</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Números Conectados"
            value={connections.length}
            subtitle={`${connActive} ativo${connActive !== 1 ? "s" : ""}, ${connPaused} pausado${connPaused !== 1 ? "s" : ""}`}
            icon={<Smartphone className="h-5 w-5" />}
          />
          <KpiCard
            title="Grupos Ativos"
            value={activeGroups}
            subtitle={`${groups.length} total`}
            icon={<Users className="h-5 w-5" />}
          />
          <KpiCard
            title="Mensagens Enviadas"
            value={totalSent.toLocaleString("pt-BR")}
            subtitle="Total"
            icon={<Send className="h-5 w-5" />}
          />
          <KpiCard
            title="Agendamentos"
            value={schedules.length}
            subtitle={`${activeSchedules} ativo${activeSchedules !== 1 ? "s" : ""}, ${pausedSchedules} pausado${pausedSchedules !== 1 ? "s" : ""}`}
            icon={<CalendarClock className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <KpiCard
            title="Total de Membros"
            value={totalMembers.toLocaleString("pt-BR")}
            subtitle="Em todos os grupos"
            icon={<Activity className="h-5 w-5" />}
          />
          <KpiCard
            title="Disparos Realizados"
            value={broadcasts.length}
            subtitle="Últimos registros"
            icon={<MessageSquare className="h-5 w-5" />}
          />
        </div>

        {broadcasts.length > 0 && (
          <div className="card-glow p-6">
            <h3 className="section-title">Disparos Recentes</h3>
            <div className="space-y-0">
              {broadcasts.map((b) => {
                const s = statusLabels[b.status] ?? statusLabels.draft;
                return (
                  <div key={b.id} className="flex items-center justify-between py-3.5" style={{ borderBottom: '1px solid #F0EBE5' }}>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4" style={{ color: '#A09890' }} />
                      <div>
                        <p className="text-[13px] font-sans font-medium" style={{ color: '#1C1917' }}>{b.title}</p>
                        <p className="text-[11px] font-data" style={{ color: '#A09890' }}>
                          {new Date(b.created_at).toLocaleDateString("pt-BR")} · {b.sent_count} enviadas · {b.total_groups} grupos
                        </p>
                      </div>
                    </div>
                    {s.className ? (
                      <span className={s.className}>{s.label}</span>
                    ) : (
                      <span className="text-[11px] font-data font-medium px-2.5 py-1 rounded-full" style={{ background: '#F2EDE8', color: '#6B6560', border: '1px solid #E8E2DC' }}>
                        {s.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
