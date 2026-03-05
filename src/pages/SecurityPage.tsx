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

const levelColors: Record<string, { bg: string; color: string; border: string; label: string }> = {
  info: { bg: "#F5EDE5", color: "#6B5044", border: "#D4B9A8", label: "Info" },
  warn: { bg: "#FEF9E7", color: "#7D6608", border: "#F0D9A0", label: "Aviso" },
  error: { bg: "#FDECEA", color: "#922B21", border: "#F5C0BB", label: "Risco" },
};

const SecurityPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-display font-semibold" style={{ color: '#1C1917' }}>Segurança</h1>
          <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>Monitoramento e controle anti-spam</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Score de Saúde" value="87/100" icon={<Shield className="h-5 w-5" />} trend={{ value: "+3 pts", positive: true }} />
          <KpiCard title="Alertas Ativos" value={2} icon={<AlertTriangle className="h-5 w-5" />} />
          <KpiCard title="Blacklist" value={14} subtitle="Números bloqueados" icon={<CheckCircle className="h-5 w-5" />} />
          <KpiCard title="Delay Médio" value="4.2s" subtitle="Entre disparos" icon={<Clock className="h-5 w-5" />} />
        </div>

        <div className="card-glow rounded-xl p-5">
          <h3 className="section-title flex items-center gap-2">
            <Activity className="h-4 w-4" style={{ color: '#8B6E5A' }} />
            Log de Atividades
          </h3>
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
        </div>
      </div>
    </AppLayout>
  );
};

export default SecurityPage;
