import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCodeDialog } from "@/components/QrCodeDialog";
import { Smartphone, Plus, RefreshCw, Wifi, WifiOff, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useConnections, useAddConnection, useUpdateConnection, useDeleteConnection } from "@/hooks/useConnections";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Connection = Tables<"whatsapp_connections">;

const statusConfig: Record<string, { label: string; bg: string; color: string; border: string; icon: typeof Wifi }> = {
  connected: { label: "Conectado", bg: "#EAF4EF", color: "#2D6A4F", border: "#A8D5B5", icon: Wifi },
  disconnected: { label: "Desconectado", bg: "#FDECEA", color: "#922B21", border: "#F5C0BB", icon: WifiOff },
  blocked: { label: "Bloqueado", bg: "#FEF9E7", color: "#7D6608", border: "#F0D9A0", icon: AlertTriangle },
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
      { onSuccess: () => toast.success("Número conectado com sucesso!"), onError: (e) => toast.error(e.message) }
    );
  };

  const handleReconnect = (id: string) => {
    updateConnection.mutate({ id, status: "connected" }, { onSuccess: () => toast.success("Reconectado!") });
  };

  const handleDelete = (id: string) => {
    deleteConnection.mutate(id, { onSuccess: () => toast.success("Número removido"), onError: (e) => toast.error(e.message) });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-display font-semibold" style={{ color: '#1C1917' }}>Conexões WhatsApp</h1>
            <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>{connections.length} números configurados</p>
          </div>
          <Button className="text-[13px] font-sans font-semibold uppercase tracking-[0.07em]" style={{ background: '#2C2420', color: '#FFFFFF' }} onClick={() => setQrOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Conectar Número
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#8B6E5A' }} />
          </div>
        ) : connections.length === 0 ? (
          <div className="card-glow rounded-xl p-12 text-center space-y-3">
            <Smartphone className="h-10 w-10 mx-auto" style={{ color: '#A09890' }} />
            <p className="text-[13px] font-sans" style={{ color: '#A09890' }}>Nenhum número conectado ainda</p>
            <Button size="sm" style={{ background: '#2C2420', color: '#FFFFFF' }} onClick={() => setQrOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Conectar Primeiro Número
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {connections.map((conn) => {
              const sc = statusConfig[conn.status] || statusConfig.disconnected;
              return (
                <div key={conn.id} className="card-glow rounded-xl p-5 space-y-4 animate-slide-in">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: '#F5EDE5', color: '#8B6E5A' }}>
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[13px] font-data font-medium" style={{ color: '#1C1917' }}>{conn.phone_number}</p>
                        <p className="text-[12px] font-sans" style={{ color: '#A09890' }}>{conn.device_name || "Dispositivo"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" style={{ color: '#A09890' }} onClick={() => handleDelete(conn.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Badge variant="outline" className="text-[11px] font-data" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                    <sc.icon className="h-3 w-3 mr-1" />
                    {sc.label}
                  </Badge>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[12px] font-sans" style={{ color: '#A09890' }}>
                      <span>Grupos</span>
                      <span className="font-data">0 / {conn.max_groups}</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: '0%' }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[12px] font-sans" style={{ color: '#A09890' }}>
                    <span>Conectado <span className="font-data">{new Date(conn.created_at).toLocaleDateString("pt-BR")}</span></span>
                    {conn.status === "disconnected" && (
                      <Button variant="ghost" size="sm" className="h-7 text-[12px]" style={{ color: '#8B6E5A' }} onClick={() => handleReconnect(conn.id)}>
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
