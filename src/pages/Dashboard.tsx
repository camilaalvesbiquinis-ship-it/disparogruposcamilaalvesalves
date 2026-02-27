import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import {
  Smartphone,
  Users,
  MessageSquare,
  CalendarClock,
  TrendingUp,
  AlertTriangle,
  Send,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const chartData = [
  { name: "Seg", enviadas: 420, entregues: 390 },
  { name: "Ter", enviadas: 580, entregues: 540 },
  { name: "Qua", enviadas: 350, entregues: 320 },
  { name: "Qui", enviadas: 720, entregues: 680 },
  { name: "Sex", enviadas: 890, entregues: 850 },
  { name: "Sáb", enviadas: 430, entregues: 400 },
  { name: "Dom", enviadas: 260, entregues: 240 },
];

const hourlyData = [
  { hour: "06h", msgs: 12 },
  { hour: "08h", msgs: 45 },
  { hour: "10h", msgs: 89 },
  { hour: "12h", msgs: 120 },
  { hour: "14h", msgs: 95 },
  { hour: "16h", msgs: 78 },
  { hour: "18h", msgs: 145 },
  { hour: "20h", msgs: 110 },
  { hour: "22h", msgs: 55 },
];

const recentDispatches = [
  { group: "VIP Clientes Premium", status: "Entregue", time: "Há 5 min", count: 128 },
  { group: "Promoções Varejo", status: "Enviando", time: "Agora", count: 342 },
  { group: "Atacado Nacional", status: "Agendado", time: "Em 2h", count: 89 },
  { group: "Lançamentos 2025", status: "Entregue", time: "Há 30 min", count: 215 },
];

const statusColors: Record<string, string> = {
  Entregue: "bg-success/20 text-success",
  Enviando: "bg-info/20 text-info",
  Agendado: "bg-warning/20 text-warning",
};

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral do seu sistema de disparos</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Números Conectados"
            value={3}
            subtitle="2 ativos, 1 pausado"
            icon={<Smartphone className="h-5 w-5" />}
            trend={{ value: "+1 esta semana", positive: true }}
          />
          <KpiCard
            title="Grupos Ativos"
            value={47}
            subtitle="Em 6 categorias"
            icon={<Users className="h-5 w-5" />}
            trend={{ value: "+5 este mês", positive: true }}
          />
          <KpiCard
            title="Mensagens Enviadas"
            value="3.650"
            subtitle="Este mês"
            icon={<Send className="h-5 w-5" />}
            trend={{ value: "+12% vs mês anterior", positive: true }}
          />
          <KpiCard
            title="Agendamentos"
            value={12}
            subtitle="8 ativos, 4 pausados"
            icon={<CalendarClock className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Taxa de Entrega"
            value="94.2%"
            icon={<TrendingUp className="h-5 w-5" />}
            trend={{ value: "+2.1%", positive: true }}
          />
          <KpiCard
            title="Total de Membros"
            value="12.480"
            subtitle="Em todos os grupos"
            icon={<Activity className="h-5 w-5" />}
          />
          <KpiCard
            title="Alertas"
            value={2}
            subtitle="1 desconexão, 1 limite"
            icon={<AlertTriangle className="h-5 w-5" />}
            className="border-warning/30"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-glow rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Mensagens por Dia</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEnviadas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(245, 58%, 58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(245, 58%, 58%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEntregues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(210, 85%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(210, 85%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 18%)" />
                <XAxis dataKey="name" stroke="hsl(220, 10%, 50%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 50%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(228, 15%, 11%)",
                    border: "1px solid hsl(228, 12%, 18%)",
                    borderRadius: "8px",
                    color: "hsl(220, 20%, 92%)",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="enviadas" stroke="hsl(245, 58%, 58%)" fill="url(#colorEnviadas)" strokeWidth={2} />
                <Area type="monotone" dataKey="entregues" stroke="hsl(210, 85%, 55%)" fill="url(#colorEntregues)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card-glow rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Engajamento por Horário</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(228, 12%, 18%)" />
                <XAxis dataKey="hour" stroke="hsl(220, 10%, 50%)" fontSize={11} />
                <YAxis stroke="hsl(220, 10%, 50%)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(228, 15%, 11%)",
                    border: "1px solid hsl(228, 12%, 18%)",
                    borderRadius: "8px",
                    color: "hsl(220, 20%, 92%)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="msgs" fill="hsl(245, 58%, 58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-glow rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Disparos Recentes</h3>
          <div className="space-y-3">
            {recentDispatches.map((d, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.group}</p>
                    <p className="text-xs text-muted-foreground">{d.time} · {d.count} mensagens</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[d.status]}`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
