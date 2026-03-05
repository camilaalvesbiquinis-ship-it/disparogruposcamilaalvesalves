import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, MessageSquare, Users, TrendingUp, TrendingDown } from "lucide-react";
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

const monthlyData = [
  { month: "Set", enviadas: 1800 },
  { month: "Out", enviadas: 2400 },
  { month: "Nov", enviadas: 3100 },
  { month: "Dez", enviadas: 2900 },
  { month: "Jan", enviadas: 3200 },
  { month: "Fev", enviadas: 3650 },
];

const memberGrowth = [
  { month: "Set", membros: 8200 },
  { month: "Out", membros: 9100 },
  { month: "Nov", membros: 10300 },
  { month: "Dez", membros: 10800 },
  { month: "Jan", membros: 11600 },
  { month: "Fev", membros: 12480 },
];

const topGroups = [
  { name: "Promoções Varejo SP", msgs: 890, members: 342 },
  { name: "Lançamentos 2025", msgs: 650, members: 215 },
  { name: "VIP Clientes Premium", msgs: 520, members: 128 },
  { name: "Varejo RJ", msgs: 480, members: 198 },
  { name: "Revendedores Gold", msgs: 410, members: 156 },
];

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: "8px",
  color: "#1e293b",
  fontSize: 12,
  fontFamily: "'DM Mono', monospace",
  padding: "10px 14px",
};

const ReportsPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Análise de performance e métricas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-border text-muted-foreground font-data text-[12px] tracking-[0.05em]">
              <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" className="border-border text-muted-foreground font-data text-[12px] tracking-[0.05em]">
              <Download className="h-3.5 w-3.5 mr-1.5" /> PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Mensagens (Mês)" value="3.650" icon={<MessageSquare className="h-5 w-5" />} trend={{ value: "+14%", positive: true }} />
          <KpiCard title="Membros Totais" value="12.480" icon={<Users className="h-5 w-5" />} trend={{ value: "+7.6%", positive: true }} />
          <KpiCard title="Taxa Entrega" value="94.2%" icon={<TrendingUp className="h-5 w-5" />} />
          <KpiCard title="Taxa Saída" value="2.1%" icon={<TrendingDown className="h-5 w-5" />} trend={{ value: "-0.3%", positive: true }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card-glow p-6">
            <h3 className="section-title">Mensagens por Mês</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="enviadas" fill="hsl(239, 84%, 67%)" radius={[5, 5, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glow p-6">
            <h3 className="section-title">Crescimento de Membros</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="membros" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ fill: "hsl(38, 92%, 50%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glow p-6">
          <h3 className="section-title flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Grupos Mais Ativos
          </h3>
          <div className="space-y-3">
            {topGroups.map((g, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-[11px] text-muted-foreground font-data w-6">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{g.name}</p>
                  <div className="mt-1 progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(g.msgs / 890) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-data font-semibold text-foreground">{g.msgs} <span className="text-muted-foreground text-[11px]">msgs</span></p>
                  <p className="text-[11px] font-data text-muted-foreground">{g.members} membros</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
