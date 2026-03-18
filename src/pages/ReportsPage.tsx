import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, MessageSquare, Users, TrendingUp, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const tooltipStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E8E2DC",
  borderRadius: "8px",
  color: "#1C1917",
  fontSize: 12,
  fontFamily: "'DM Mono', monospace",
  padding: "10px 14px",
  boxShadow: "0 4px 16px rgba(44,36,32,0.1)",
};

function useReportsData() {
  return useQuery({
    queryKey: ["reports-data"],
    queryFn: async () => {
      // Fetch all broadcasts
      const { data: broadcasts = [] } = await supabase
        .from("broadcasts")
        .select("id, status, sent_count, delivered_count, total_groups, created_at, title")
        .order("created_at", { ascending: false });

      // Fetch all groups
      const { data: groups = [] } = await supabase
        .from("groups")
        .select("id, name, member_count, created_at, is_active");

      // Fetch broadcast_groups for per-group stats
      const { data: broadcastGroups = [] } = await supabase
        .from("broadcast_groups")
        .select("group_id, status");

      // Monthly send data (last 6 months)
      const now = new Date();
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const monthBroadcasts = broadcasts.filter((b) => {
          const d = new Date(b.created_at);
          return d >= start && d <= end;
        });
        const totalSent = monthBroadcasts.reduce((sum, b) => sum + (b.sent_count || 0), 0);
        monthlyData.push({
          month: format(monthDate, "MMM", { locale: ptBR }).replace(/^./, (c) => c.toUpperCase()),
          enviadas: totalSent,
        });
      }

      // Member growth (cumulative groups created by month)
      const memberGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const end = endOfMonth(monthDate);
        const groupsUntil = groups.filter((g) => new Date(g.created_at) <= end);
        const totalMembers = groupsUntil.reduce((sum, g) => sum + (g.member_count || 0), 0);
        memberGrowth.push({
          month: format(monthDate, "MMM", { locale: ptBR }).replace(/^./, (c) => c.toUpperCase()),
          membros: totalMembers,
        });
      }

      // Top groups by broadcast count
      const groupSendCount: Record<string, number> = {};
      broadcastGroups.forEach((bg) => {
        groupSendCount[bg.group_id] = (groupSendCount[bg.group_id] || 0) + 1;
      });
      const topGroups = groups
        .map((g) => ({
          name: g.name,
          msgs: groupSendCount[g.id] || 0,
          members: g.member_count || 0,
        }))
        .sort((a, b) => b.msgs - a.msgs)
        .slice(0, 5);

      // KPIs
      const currentMonth = broadcasts.filter((b) => {
        const d = new Date(b.created_at);
        return d >= startOfMonth(now) && d <= endOfMonth(now);
      });
      const prevMonth = broadcasts.filter((b) => {
        const d = new Date(b.created_at);
        const pm = subMonths(now, 1);
        return d >= startOfMonth(pm) && d <= endOfMonth(pm);
      });

      const currentSent = currentMonth.reduce((s, b) => s + (b.sent_count || 0), 0);
      const prevSent = prevMonth.reduce((s, b) => s + (b.sent_count || 0), 0);
      const sentTrend = prevSent > 0 ? (((currentSent - prevSent) / prevSent) * 100).toFixed(0) : "0";

      const totalMembers = groups.reduce((s, g) => s + (g.member_count || 0), 0);
      const totalGroups = groups.length;

      const totalDelivered = broadcasts.reduce((s, b) => s + (b.delivered_count || 0), 0);
      const totalSentAll = broadcasts.reduce((s, b) => s + (b.sent_count || 0), 0);
      const deliveryRate = totalSentAll > 0 ? ((totalDelivered / totalSentAll) * 100).toFixed(1) : "—";

      return {
        monthlyData,
        memberGrowth,
        topGroups,
        currentSent,
        sentTrend,
        totalMembers,
        totalGroups,
        deliveryRate,
        totalBroadcasts: broadcasts.length,
      };
    },
  });
}

const ReportsPage = () => {
  const { data, isLoading } = useReportsData();

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
    monthlyData = [],
    memberGrowth = [],
    topGroups = [],
    currentSent = 0,
    sentTrend = "0",
    totalMembers = 0,
    totalGroups = 0,
    deliveryRate = "—",
    totalBroadcasts = 0,
  } = data || {};

  const maxMsgs = Math.max(...topGroups.map((g) => g.msgs), 1);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-display font-semibold" style={{ color: '#1C1917' }}>Relatórios</h1>
            <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>Análise de performance e métricas reais</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Envios (Mês)"
            value={currentSent.toLocaleString("pt-BR")}
            icon={<MessageSquare className="h-5 w-5" />}
            trend={Number(sentTrend) !== 0 ? { value: `${Number(sentTrend) > 0 ? "+" : ""}${sentTrend}%`, positive: Number(sentTrend) >= 0 } : undefined}
          />
          <KpiCard title="Membros Totais" value={totalMembers.toLocaleString("pt-BR")} icon={<Users className="h-5 w-5" />} />
          <KpiCard title="Taxa Entrega" value={deliveryRate === "—" ? "—" : `${deliveryRate}%`} icon={<TrendingUp className="h-5 w-5" />} />
          <KpiCard title="Total Disparos" value={totalBroadcasts} icon={<BarChart3 className="h-5 w-5" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card-glow p-6">
            <h3 className="section-title">Envios por Mês</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE5" />
                <XAxis dataKey="month" tick={{ fill: '#C4B8B0', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#C4B8B0', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="enviadas" fill="#8B6E5A" radius={[5, 5, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glow p-6">
            <h3 className="section-title">Membros Totais por Mês</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE5" />
                <XAxis dataKey="month" tick={{ fill: '#C4B8B0', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#C4B8B0', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="membros" stroke="#2C2420" strokeWidth={2} dot={{ fill: "#2C2420" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glow p-6">
          <h3 className="section-title flex items-center gap-2">
            <BarChart3 className="h-4 w-4" style={{ color: '#8B6E5A' }} />
            Grupos Mais Ativos
          </h3>
          {topGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum dado de envio ainda</p>
          ) : (
            <div className="space-y-3">
              {topGroups.map((g, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-[11px] font-data w-6" style={{ color: '#C4B8B0' }}>#{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-[13px] font-sans font-medium" style={{ color: '#1C1917' }}>{g.name}</p>
                    <div className="mt-1 progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${(g.msgs / maxMsgs) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-data font-medium" style={{ color: '#1C1917' }}>{g.msgs} <span className="text-[11px]" style={{ color: '#A09890' }}>envios</span></p>
                    <p className="text-[11px] font-data" style={{ color: '#A09890' }}>{g.members} membros</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
