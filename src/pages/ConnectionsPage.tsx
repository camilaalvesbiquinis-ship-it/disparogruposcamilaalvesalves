import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCodeDialog } from "@/components/QrCodeDialog";
import { Smartphone, Plus, RefreshCw, MoreVertical, Wifi, WifiOff, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useConnections, useAddConnection, useUpdateConnection, useDeleteConnection } from "@/hooks/useConnections";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Connection = Tables<"whatsapp_connections">;

const statusConfig: Record<string, { label: string; class: string; icon: typeof Wifi }> = {
  connected: { label: "Conectado", class: "bg-success/10 text-success border-success/30", icon: Wifi },
  disconnected: { label: "Desconectado", class: "bg-destructive/10 text-destructive border-destructive/30", icon: WifiOff },
  blocked: { label: "Bloqueado", class: "bg-warning/10 text-warning border-warning/30", icon: AlertTriangle },
};

const ConnectionsPage = () => {
  const { data: connections = [], isLoading } = useConnections();
  const addConnection = useAddConnection();
  const updateConnection = useUpdateConnection();
  const deleteConnection = useDeleteConnection();
  const [qrOpen, setQrOpen] = useState(false);

  const handleConnected = (number: string, device: string) => {
    addConnection.mutate(
      { phone_number: number, device_name: device, status: "connected" },
      {
        onSuccess: () => toast.success("Número conectado com sucesso!"),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleReconnect = (id: string) => {
    updateConnection.mutate(
      { id, status: "connected" },
      { onSuccess: () => toast.success("Reconectado!") }
    );
  };

  const handleDelete = (id: string) => {
    deleteConnection.mutate(id, {
      onSuccess: () => toast.success("Número removido"),
      onError: (e) => toast.error(e.message),
    });
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

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : connections.length === 0 ? (
          <div className="card-glow rounded-xl p-12 text-center space-y-3">
            <Smartphone className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhum número conectado ainda</p>
            <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => setQrOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Conectar Primeiro Número
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {connections.map((conn) => {
              const sc = statusConfig[conn.status] || statusConfig.disconnected;
              const groupCount = 0; // Would come from a count query
              return (
                <div key={conn.id} className="card-glow rounded-xl p-5 space-y-4 animate-slide-in">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground font-mono">{conn.phone_number}</p>
                        <p className="text-xs text-muted-foreground">{conn.device_name || "Dispositivo"}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(conn.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Badge variant="outline" className={sc.class}>
                    <sc.icon className="h-3 w-3 mr-1" />
                    {sc.label}
                  </Badge>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Grupos</span>
                      <span>{groupCount} / {conn.max_groups}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(groupCount / conn.max_groups) * 100}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Conectado {new Date(conn.created_at).toLocaleDateString("pt-BR")}</span>
                    {conn.status === "disconnected" && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => handleReconnect(conn.id)}>
                        <RefreshCw className="h-3 w-3 mr-1" /> Reconectar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <QrCodeDialog open={qrOpen} onOpenChange={setQrOpen} onConnected={handleConnected} />
    </AppLayout>
  );
};

export default ConnectionsPage;
