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

const consentTypes = [
  { id: "essential", label: "Essenciais", description: "Necessários para o funcionamento do sistema", required: true },
  { id: "analytics", label: "Análise de uso", description: "Ajudam a melhorar a experiência do usuário", required: false },
  { id: "marketing", label: "Marketing", description: "Comunicações e promoções personalizadas", required: false },
  { id: "data_sharing", label: "Compartilhamento", description: "Compartilhamento com parceiros integrados", required: false },
];

export function ConsentBanner() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [consents, setConsents] = useState<Record<string, boolean>>({ essential: true, analytics: false, marketing: false, data_sharing: false });

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  const saveConsents = async (c: Record<string, boolean>) => {
    if (!user) return;
    try {
      for (const [type, granted] of Object.entries(c)) {
        await supabase.from("consent_records").insert({ user_id: user.id, consent_type: type, granted });
      }
    } catch { /* silent */ }
  };

  const accept = async (c: Record<string, boolean>) => {
    setConsents(c);
    await saveConsents(c);
    localStorage.setItem(CONSENT_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="max-w-xl mx-auto card-glow p-6 space-y-4 border-l-2 border-l-foreground">
        <div className="flex items-start gap-3">
          <Shield className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-sans font-semibold text-foreground normal-case tracking-normal">Privacidade e Proteção de Dados</h3>
            <p className="text-[12px] font-sans text-muted-foreground mt-1">
              Utilizamos dados para melhorar sua experiência. Conforme a LGPD, você pode gerenciar suas preferências.
            </p>
          </div>
        </div>

        <div>
          {consentTypes.map((ct) => (
            <div key={ct.id} className="flex items-center justify-between py-2.5 border-b last:border-b-0">
              <div>
                <p className="text-[13px] font-sans font-semibold text-foreground">{ct.label}</p>
                <p className="text-[11px] font-sans text-muted-foreground">{ct.description}</p>
              </div>
              <Switch checked={consents[ct.id]} disabled={ct.required} onCheckedChange={(v) => setConsents((p) => ({ ...p, [ct.id]: v }))} />
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => accept({ essential: true, analytics: false, marketing: false, data_sharing: false })} className="text-[12px] font-sans rounded-sm">
            Apenas essenciais
          </Button>
          <Button variant="outline" size="sm" onClick={() => accept(consents)} className="text-[12px] font-sans rounded-sm">
            Salvar preferências
          </Button>
          <Button size="sm" onClick={() => accept({ essential: true, analytics: true, marketing: true, data_sharing: true })} className="text-[12px] font-sans font-semibold uppercase tracking-[0.05em] rounded-sm">
            Aceitar todos
          </Button>
        </div>
      </div>
    </div>
  );
}
