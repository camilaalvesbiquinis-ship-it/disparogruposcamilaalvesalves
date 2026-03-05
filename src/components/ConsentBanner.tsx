/**
 * LGPD Consent Banner - displayed on first visit.
 * Stores consent records in the database for compliance tracking.
 */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CONSENT_KEY = "lgpd_consent_shown";

interface ConsentType {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

const consentTypes: ConsentType[] = [
  { id: "essential", label: "Essenciais", description: "Necessários para o funcionamento do sistema", required: true },
  { id: "analytics", label: "Análise de uso", description: "Ajudam a melhorar a experiência do usuário", required: false },
  { id: "marketing", label: "Marketing", description: "Comunicações e promoções personalizadas", required: false },
  { id: "data_sharing", label: "Compartilhamento", description: "Compartilhamento com parceiros integrados", required: false },
];

export function ConsentBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [consents, setConsents] = useState<Record<string, boolean>>({
    essential: true,
    analytics: false,
    marketing: false,
    data_sharing: false,
  });

  useEffect(() => {
    const shown = localStorage.getItem(CONSENT_KEY);
    if (!shown) setVisible(true);
  }, []);

  const handleAcceptAll = async () => {
    const all = { essential: true, analytics: true, marketing: true, data_sharing: true };
    setConsents(all);
    await saveConsents(all);
    localStorage.setItem(CONSENT_KEY, "true");
    setVisible(false);
  };

  const handleSavePreferences = async () => {
    await saveConsents(consents);
    localStorage.setItem(CONSENT_KEY, "true");
    setVisible(false);
  };

  const handleRejectOptional = async () => {
    const minimal = { essential: true, analytics: false, marketing: false, data_sharing: false };
    setConsents(minimal);
    await saveConsents(minimal);
    localStorage.setItem(CONSENT_KEY, "true");
    setVisible(false);
  };

  const saveConsents = async (c: Record<string, boolean>) => {
    if (!user) return;
    try {
      for (const [type, granted] of Object.entries(c)) {
        await supabase.from("consent_records").insert({
          user_id: user.id,
          consent_type: type,
          granted,
        });
      }
    } catch {
      // Silently fail — consent saving should not block UX
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="max-w-2xl mx-auto rounded-xl p-6 space-y-4" style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', boxShadow: '0 8px 28px rgba(44,36,32,0.12)', borderLeft: '3px solid #8B6E5A' }}>
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 mt-0.5 shrink-0" style={{ color: '#8B6E5A' }} />
          <div>
            <h3 className="text-[14px] font-display font-semibold" style={{ color: '#1C1917' }}>
              Privacidade e Proteção de Dados
            </h3>
            <p className="text-[12px] font-sans font-light mt-1" style={{ color: '#6B6560' }}>
              Utilizamos dados para melhorar sua experiência. Conforme a LGPD, você pode gerenciar suas preferências abaixo.
            </p>
          </div>
        </div>

        <div className="space-y-0">
          {consentTypes.map((ct) => (
            <div key={ct.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #F0EBE5' }}>
              <div>
                <p className="text-[13px] font-sans font-medium" style={{ color: '#1C1917' }}>{ct.label}</p>
                <p className="text-[11px] font-sans font-light" style={{ color: '#A09890' }}>{ct.description}</p>
              </div>
              <Switch
                checked={consents[ct.id]}
                disabled={ct.required}
                onCheckedChange={(v) => setConsents((p) => ({ ...p, [ct.id]: v }))}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={handleRejectOptional} className="text-[12px] font-sans font-medium" style={{ border: '1px solid #E8E2DC', color: '#6B6560' }}>
            Apenas essenciais
          </Button>
          <Button variant="outline" size="sm" onClick={handleSavePreferences} className="text-[12px] font-sans font-medium" style={{ border: '1px solid #2C2420', color: '#2C2420' }}>
            Salvar preferências
          </Button>
          <Button size="sm" onClick={handleAcceptAll} className="text-[12px] font-sans font-semibold uppercase tracking-[0.05em]" style={{ background: '#2C2420', color: '#FFFFFF' }}>
            Aceitar todos
          </Button>
        </div>
      </div>
    </div>
  );
}
