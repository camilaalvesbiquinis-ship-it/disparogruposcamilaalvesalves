/**
 * LGPD "Meus Dados" page — allows users to:
 * - View all stored personal data
 * - Download data as JSON (portability)
 * - Request complete data deletion (right to be forgotten)
 * - Manage consent preferences
 */
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Trash2, Shield, Database, FileJson, AlertTriangle } from "lucide-react";
import { logAuditAction } from "@/lib/audit";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const consentLabels: Record<string, string> = {
  essential: "Essenciais",
  analytics: "Análise de uso",
  marketing: "Marketing",
  data_sharing: "Compartilhamento de dados",
};

const MyDataPage = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: consents, isLoading: consentsLoading } = useQuery({
    queryKey: ["my-consents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("consent_records").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      const map = new Map<string, { granted: boolean; created_at: string }>();
      for (const r of data ?? []) {
        if (!map.has(r.consent_type)) map.set(r.consent_type, { granted: r.granted, created_at: r.created_at });
      }
      return map;
    },
    enabled: !!user,
  });

  const toggleConsent = useMutation({
    mutationFn: async ({ type, granted }: { type: string; granted: boolean }) => {
      await supabase.from("consent_records").insert({ user_id: user!.id, consent_type: type, granted });
      await logAuditAction({ action: "consent_change", tableName: "consent_records", details: { consent_type: type, granted } });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-consents"] }); toast.success("Preferência atualizada"); },
  });

  const handleDownload = async () => {
    if (!user) return;
    await logAuditAction({ action: "export", tableName: "profiles", recordId: user.id, details: { type: "data_portability" } });
    const { data: profileData } = await supabase.from("profiles").select("*").eq("user_id", user.id);
    const { data: consentData } = await supabase.from("consent_records").select("*").eq("user_id", user.id);
    const exportData = { exported_at: new Date().toISOString(), user_id: user.id, email: user.email, profile: profileData, consents: consentData };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dados exportados com sucesso");
  };

  const handleDeleteRequest = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-user-data", { body: { confirm: true } });
      if (error) throw error;
      toast.success("Seus dados foram removidos. Você será desconectado.");
      await logAuditAction({ action: "data_request", tableName: "all", details: { type: "deletion" } });
      setTimeout(() => signOut(), 2000);
    } catch {
      toast.error("Erro ao solicitar exclusão. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-[28px] font-display font-semibold flex items-center gap-2" style={{ color: '#1C1917' }}>
            <Shield className="h-6 w-6" style={{ color: '#8B6E5A' }} />
            Meus Dados
          </h1>
          <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>
            Gerencie seus dados pessoais conforme a LGPD
          </p>
        </div>

        {/* Personal Data */}
        <div className="card-glow p-6 space-y-3">
          <h3 className="section-title flex items-center gap-2">
            <Database className="h-4 w-4" style={{ color: '#8B6E5A' }} />
            Dados Armazenados
          </h3>
          {profileLoading ? (
            <div className="space-y-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-5 w-36" /></div>
          ) : (
            <div className="space-y-0 text-[13px] font-sans">
              <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #F0EBE5' }}>
                <span style={{ color: '#A09890' }}>Email</span>
                <span className="font-data text-[12px]" style={{ color: '#1C1917' }}>{user?.email ?? "—"}</span>
              </div>
              <div className="flex justify-between py-3" style={{ borderBottom: '1px solid #F0EBE5' }}>
                <span style={{ color: '#A09890' }}>Nome</span>
                <span style={{ color: '#1C1917' }}>{profile?.display_name ?? "—"}</span>
              </div>
              <div className="flex justify-between py-3">
                <span style={{ color: '#A09890' }}>Cadastro</span>
                <span className="font-data text-[12px]" style={{ color: '#1C1917' }}>
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR") : "—"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Consent Management */}
        <div className="card-glow p-6 space-y-3">
          <h3 className="section-title flex items-center gap-2">
            <Shield className="h-4 w-4" style={{ color: '#8B6E5A' }} />
            Consentimentos
          </h3>
          {consentsLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="space-y-0">
              {["essential", "analytics", "marketing", "data_sharing"].map((type) => {
                const current = consents?.get(type);
                const isGranted = current?.granted ?? (type === "essential");
                return (
                  <div key={type} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #F0EBE5' }}>
                    <div>
                      <p className="text-[13px] font-sans font-medium" style={{ color: '#1C1917' }}>{consentLabels[type]}</p>
                      {current?.created_at && (
                        <p className="text-[11px] font-data" style={{ color: '#A09890' }}>
                          Atualizado: {new Date(current.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-data" style={isGranted ? { background: '#EAF4EF', color: '#2D6A4F', borderColor: '#A8D5B5' } : { background: '#F2EDE8', color: '#6B6560', borderColor: '#E8E2DC' }}>
                        {isGranted ? "Ativo" : "Inativo"}
                      </Badge>
                      <Switch
                        checked={isGranted}
                        disabled={type === "essential"}
                        onCheckedChange={(v) => toggleConsent.mutate({ type, granted: v })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="card-glow p-6 space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <FileJson className="h-4 w-4" style={{ color: '#8B6E5A' }} />
            Ações sobre seus dados
          </h3>
          <div className="flex flex-col gap-3">
            <Button variant="outline" className="justify-start gap-2 text-[13px] font-sans" style={{ border: '1px solid #2C2420', color: '#2C2420' }} onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Baixar meus dados (JSON)
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="justify-start gap-2 text-[13px] font-sans" style={{ background: '#FDECEA', color: '#922B21', border: '1px solid #F5C0BB' }}>
                  <Trash2 className="h-4 w-4" />
                  Solicitar exclusão de todos os dados
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent style={{ background: '#FFFFFF', border: '1px solid #E8E2DC' }}>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 font-display text-[20px]" style={{ color: '#1C1917' }}>
                    <AlertTriangle className="h-5 w-5" style={{ color: '#922B21' }} />
                    Confirmar exclusão
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>
                    Esta ação é <strong>irreversível</strong>. Todos os seus dados pessoais serão anonimizados ou removidos permanentemente, incluindo perfil, conexões, grupos e históricos. Você será desconectado após a conclusão.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="text-[13px] font-sans" style={{ border: '1px solid #E8E2DC', color: '#6B6560' }}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteRequest}
                    disabled={deleting}
                    className="text-[13px] font-sans font-semibold"
                    style={{ background: '#922B21', color: '#FFFFFF' }}
                  >
                    {deleting ? "Excluindo..." : "Confirmar exclusão"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MyDataPage;
