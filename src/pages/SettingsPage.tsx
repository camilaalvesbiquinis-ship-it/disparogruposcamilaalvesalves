import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Globe } from "lucide-react";

const SettingsPage = () => {
  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie sua conta e preferências</p>
        </div>

        <div className="card-glow rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" /> Geral
          </h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nome da Empresa</Label>
              <Input defaultValue="Minha Empresa LTDA" className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input defaultValue="admin@empresa.com" className="bg-secondary/50 border-border" />
            </div>
          </div>
        </div>

        <div className="card-glow rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notificações
          </h3>
          <div className="space-y-3">
            {[
              { label: "Alerta de desconexão", desc: "Receber quando um número desconectar", default: true },
              { label: "Limite de envios", desc: "Avisar ao atingir 80% do limite diário", default: true },
              { label: "Relatório semanal", desc: "Resumo por email toda segunda-feira", default: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.default} />
              </div>
            ))}
          </div>
        </div>

        <div className="card-glow rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Limites de Segurança
          </h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Limite diário por número</Label>
              <Input type="number" defaultValue={500} className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Delay mínimo entre envios (segundos)</Label>
              <Input type="number" defaultValue={3} className="bg-secondary/50 border-border" />
            </div>
          </div>
        </div>

        <div className="card-glow rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Integrações
          </h3>
          <p className="text-xs text-muted-foreground">Conecte com serviços externos (em breve)</p>
          <div className="flex flex-wrap gap-2">
            {["Webhooks", "Nuvemshop", "Shopify", "CRM", "API Pública"].map((name) => (
              <span key={name} className="px-3 py-1.5 text-xs rounded-lg bg-secondary text-muted-foreground border border-border">
                {name}
              </span>
            ))}
          </div>
        </div>

        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Salvar Alterações
        </Button>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
