import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Shield, Globe } from "lucide-react";

const SettingsPage = () => {
  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-[28px] font-display font-semibold" style={{ color: '#1C1917' }}>Configurações</h1>
          <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>Gerencie sua conta e preferências</p>
        </div>

        <div className="card-glow rounded-xl p-6 space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Settings className="h-4 w-4" style={{ color: '#8B6E5A' }} /> Geral
          </h3>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-sans font-medium uppercase tracking-[0.07em]" style={{ color: '#A09890' }}>Nome da Empresa</Label>
              <Input defaultValue="Minha Empresa LTDA" style={{ background: '#FAF8F5', border: '1px solid #E8E2DC', color: '#1C1917' }} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-sans font-medium uppercase tracking-[0.07em]" style={{ color: '#A09890' }}>Email</Label>
              <Input defaultValue="admin@empresa.com" style={{ background: '#FAF8F5', border: '1px solid #E8E2DC', color: '#1C1917' }} />
            </div>
          </div>
        </div>

        <div className="card-glow rounded-xl p-6 space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Bell className="h-4 w-4" style={{ color: '#8B6E5A' }} /> Notificações
          </h3>
          <div className="space-y-0">
            {[
              { label: "Alerta de desconexão", desc: "Receber quando um número desconectar", default: true },
              { label: "Limite de envios", desc: "Avisar ao atingir 80% do limite diário", default: true },
              { label: "Relatório semanal", desc: "Resumo por email toda segunda-feira", default: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #F0EBE5' }}>
                <div>
                  <p className="text-[13px] font-sans font-medium" style={{ color: '#1C1917' }}>{item.label}</p>
                  <p className="text-[12px] font-sans font-light" style={{ color: '#A09890' }}>{item.desc}</p>
                </div>
                <Switch defaultChecked={item.default} />
              </div>
            ))}
          </div>
        </div>

        <div className="card-glow rounded-xl p-6 space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Shield className="h-4 w-4" style={{ color: '#8B6E5A' }} /> Limites de Segurança
          </h3>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-sans font-medium uppercase tracking-[0.07em]" style={{ color: '#A09890' }}>Limite diário por número</Label>
              <Input type="number" defaultValue={500} style={{ background: '#FAF8F5', border: '1px solid #E8E2DC', color: '#1C1917' }} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-sans font-medium uppercase tracking-[0.07em]" style={{ color: '#A09890' }}>Delay mínimo entre envios (segundos)</Label>
              <Input type="number" defaultValue={3} style={{ background: '#FAF8F5', border: '1px solid #E8E2DC', color: '#1C1917' }} />
            </div>
          </div>
        </div>

        <div className="card-glow rounded-xl p-6 space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <Globe className="h-4 w-4" style={{ color: '#8B6E5A' }} /> Integrações
          </h3>
          <p className="text-[12px] font-sans font-light" style={{ color: '#A09890' }}>Conecte com serviços externos (em breve)</p>
          <div className="flex flex-wrap gap-2">
            {["Webhooks", "Nuvemshop", "Shopify", "CRM", "API Pública"].map((name) => (
              <span key={name} className="px-3 py-1.5 text-[11px] font-sans font-medium rounded-full" style={{ background: '#F2EDE8', color: '#6B6560', border: '1px solid #E8E2DC' }}>
                {name}
              </span>
            ))}
          </div>
        </div>

        <Button className="text-[13px] font-sans font-semibold uppercase tracking-[0.07em]" style={{ background: '#2C2420', color: '#FFFFFF' }}>
          Salvar Alterações
        </Button>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
