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
      <div className="max-w-2xl mx-auto rounded-xl border border-border bg-card shadow-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground text-sm font-[var(--font-serif)]">
              Privacidade e Proteção de Dados
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Utilizamos dados para melhorar sua experiência. Conforme a LGPD, você pode gerenciar suas preferências abaixo.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {consentTypes.map((ct) => (
            <div key={ct.id} className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-xs font-medium text-foreground">{ct.label}</p>
                <p className="text-[11px] text-muted-foreground">{ct.description}</p>
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
          <Button variant="outline" size="sm" onClick={handleRejectOptional} className="text-xs">
            Apenas essenciais
          </Button>
          <Button variant="outline" size="sm" onClick={handleSavePreferences} className="text-xs">
            Salvar preferências
          </Button>
          <Button size="sm" onClick={handleAcceptAll} className="text-xs bg-primary text-primary-foreground">
            Aceitar todos
          </Button>
        </div>
      </div>
    </div>
  );
}
