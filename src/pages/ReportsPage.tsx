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
  backgroundColor: "#0f1117",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#F1F5F9",
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
            <h1 className="text-2xl font-display font-semibold uppercase tracking-[0.08em]" style={{ color: '#F1F5F9' }}>Relatórios</h1>
            <p className="text-[13px] font-sans" style={{ color: '#94a3b8' }}>Análise de performance e métricas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="font-data text-[12px] tracking-[0.05em]" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8' }}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" className="font-data text-[12px] tracking-[0.05em]" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8' }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="enviadas" fill="#6366f1" radius={[5, 5, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glow p-6">
            <h3 className="section-title">Crescimento de Membros</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="membros" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glow p-6">
          <h3 className="section-title flex items-center gap-2">
            <BarChart3 className="h-4 w-4" style={{ color: '#8B6E5A' }} />
            Grupos Mais Ativos
          </h3>
          <div className="space-y-3">
            {topGroups.map((g, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-[11px] font-data w-6" style={{ color: '#475569' }}>#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-sans" style={{ color: '#F1F5F9' }}>{g.name}</p>
                  <div className="mt-1 progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(g.msgs / 890) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-data font-semibold" style={{ color: '#F1F5F9' }}>{g.msgs} <span className="text-[11px]" style={{ color: '#64748b' }}>msgs</span></p>
                  <p className="text-[11px] font-data" style={{ color: '#64748b' }}>{g.members} membros</p>
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
