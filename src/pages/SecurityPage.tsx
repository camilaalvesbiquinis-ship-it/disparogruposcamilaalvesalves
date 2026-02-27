import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { Shield, AlertTriangle, CheckCircle, Clock, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const logs = [
  { time: "14:32", action: "Disparo enviado", detail: "VIP Clientes Premium — 128 msgs", level: "info" },
  { time: "14:28", action: "Limite atingido", detail: "+55 11 9999-0001 — 500/500 msgs", level: "warn" },
  { time: "14:15", action: "Reconexão automática", detail: "+55 11 9999-0003", level: "info" },
  { time: "13:50", action: "Blacklist atualizada", detail: "+55 21 8888-1234 adicionado", level: "info" },
  { time: "13:20", action: "Risco detectado", detail: "+55 11 9999-0002 — alto volume", level: "error" },
  { time: "12:45", action: "Agendamento executado", detail: "Promoção Semanal — 5 grupos", level: "info" },
];

const levelColors: Record<string, string> = {
  info: "bg-info/10 text-info border-info/30",
  warn: "bg-warning/10 text-warning border-warning/30",
  error: "bg-destructive/10 text-destructive border-destructive/30",
};

const SecurityPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Segurança</h1>
          <p className="text-sm text-muted-foreground">Monitoramento e controle anti-spam</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Score de Saúde" value="87/100" icon={<Shield className="h-5 w-5" />} trend={{ value: "+3 pts", positive: true }} />
          <KpiCard title="Alertas Ativos" value={2} icon={<AlertTriangle className="h-5 w-5" />} />
          <KpiCard title="Blacklist" value={14} subtitle="Números bloqueados" icon={<CheckCircle className="h-5 w-5" />} />
          <KpiCard title="Delay Médio" value="4.2s" subtitle="Entre disparos" icon={<Clock className="h-5 w-5" />} />
        </div>

        <div className="card-glow rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            Log de Atividades
          </h3>
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground font-mono w-12 shrink-0">{log.time}</span>
                <Badge variant="outline" className={`text-[10px] ${levelColors[log.level]}`}>
                  {log.level === "info" ? "Info" : log.level === "warn" ? "Aviso" : "Risco"}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground truncate">{log.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SecurityPage;
