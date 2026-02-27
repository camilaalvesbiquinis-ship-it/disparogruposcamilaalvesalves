import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCodeDialog } from "@/components/QrCodeDialog";
import { Smartphone, Plus, RefreshCw, MoreVertical, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface Connection {
  id: number;
  number: string;
  device: string;
  status: string;
  groups: number;
  maxGroups: number;
  lastSeen: string;
}

const initialConnections: Connection[] = [
  { id: 1, number: "+55 11 9999-0001", device: "Samsung Galaxy S23", status: "connected", groups: 22, maxGroups: 50, lastSeen: "Agora" },
  { id: 2, number: "+55 11 9999-0002", device: "iPhone 15 Pro", status: "connected", groups: 15, maxGroups: 50, lastSeen: "Há 2 min" },
  { id: 3, number: "+55 11 9999-0003", device: "Xiaomi 14", status: "disconnected", groups: 10, maxGroups: 50, lastSeen: "Há 3h" },
];

const statusConfig: Record<string, { label: string; class: string; icon: typeof Wifi }> = {
  connected: { label: "Conectado", class: "bg-success/10 text-success border-success/30", icon: Wifi },
  disconnected: { label: "Desconectado", class: "bg-destructive/10 text-destructive border-destructive/30", icon: WifiOff },
  blocked: { label: "Bloqueado", class: "bg-warning/10 text-warning border-warning/30", icon: AlertTriangle },
};

const ConnectionsPage = () => {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [qrOpen, setQrOpen] = useState(false);

  const handleConnected = (number: string, device: string) => {
    setConnections((prev) => [
      ...prev,
      {
        id: Date.now(),
        number,
        device,
        status: "connected",
        groups: 0,
        maxGroups: 50,
        lastSeen: "Agora",
      },
    ]);
  };

  const handleReconnect = (id: number) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "connected", lastSeen: "Agora" } : c))
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Conexões WhatsApp</h1>
            <p className="text-sm text-muted-foreground">{connections.length} números configurados</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setQrOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Conectar Número
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {connections.map((conn) => {
            const sc = statusConfig[conn.status] || statusConfig.disconnected;
            return (
              <div key={conn.id} className="card-glow rounded-xl p-5 space-y-4 animate-slide-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground font-mono">{conn.number}</p>
                      <p className="text-xs text-muted-foreground">{conn.device}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Badge variant="outline" className={sc.class}>
                  <sc.icon className="h-3 w-3 mr-1" />
                  {sc.label}
                </Badge>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Grupos</span>
                    <span>{conn.groups} / {conn.maxGroups}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(conn.groups / conn.maxGroups) * 100}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Última atividade: {conn.lastSeen}</span>
                  {conn.status === "disconnected" && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary" onClick={() => handleReconnect(conn.id)}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reconectar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <QrCodeDialog open={qrOpen} onOpenChange={setQrOpen} onConnected={handleConnected} />
    </AppLayout>
  );
};

export default ConnectionsPage;
