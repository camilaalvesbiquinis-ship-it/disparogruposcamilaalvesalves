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
  backgroundColor: "hsl(228, 15%, 11%)",
  border: "1px solid hsl(228, 12%, 18%)",
  borderRadius: "8px",
  color: "hsl(220, 20%, 92%)",
  fontSize: 12,
};

const ReportsPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Análise de performance e métricas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-border text-foreground">
              <Download className="h-3.5 w-3.5 mr-1.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" className="border-border text-foreground">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-glow rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Mensagens por Mês</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(220, 10%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 50%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="enviadas" fill="hsl(245, 58%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glow rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Crescimento de Membros</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(220, 10%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 50%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="membros" stroke="hsl(210, 85%, 55%)" strokeWidth={2} dot={{ fill: "hsl(210, 85%, 55%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glow rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Grupos Mais Ativos
          </h3>
          <div className="space-y-3">
            {topGroups.map((g, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground font-mono w-6">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{g.name}</p>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(g.msgs / 890) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="text-foreground font-medium">{g.msgs} msgs</p>
                  <p className="text-muted-foreground">{g.members} membros</p>
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
