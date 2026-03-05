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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Trash2, Shield, Database, FileJson, AlertTriangle } from "lucide-react";
import { logAuditAction } from "@/lib/audit";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch consents
  const { data: consents, isLoading: consentsLoading } = useQuery({
    queryKey: ["my-consents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consent_records")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Get latest consent per type
      const map = new Map<string, { granted: boolean; created_at: string }>();
      for (const r of data ?? []) {
        if (!map.has(r.consent_type)) {
          map.set(r.consent_type, { granted: r.granted, created_at: r.created_at });
        }
      }
      return map;
    },
    enabled: !!user,
  });

  // Toggle consent
  const toggleConsent = useMutation({
    mutationFn: async ({ type, granted }: { type: string; granted: boolean }) => {
      await supabase.from("consent_records").insert({
        user_id: user!.id,
        consent_type: type,
        granted,
      });
      await logAuditAction({
        action: "consent_change",
        tableName: "consent_records",
        details: { consent_type: type, granted },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-consents"] });
      toast.success("Preferência atualizada");
    },
  });

  // Download data as JSON
  const handleDownload = async () => {
    if (!user) return;
    await logAuditAction({ action: "export", tableName: "profiles", recordId: user.id, details: { type: "data_portability" } });

    const { data: profileData } = await supabase.from("profiles").select("*").eq("user_id", user.id);
    const { data: consentData } = await supabase.from("consent_records").select("*").eq("user_id", user.id);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile: profileData,
      consents: consentData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dados exportados com sucesso");
  };

  // Request data deletion
  const handleDeleteRequest = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-user-data", {
        body: { confirm: true },
      });
      if (error) throw error;
      toast.success("Seus dados foram removidos. Você será desconectado.");
      await logAuditAction({ action: "data_request", tableName: "all", details: { type: "deletion" } });
      setTimeout(() => signOut(), 2000);
    } catch (e) {
      toast.error("Erro ao solicitar exclusão. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 font-[var(--font-serif)]">
            <Shield className="h-6 w-6 text-primary" />
            Meus Dados
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus dados pessoais conforme a LGPD
          </p>
        </div>

        {/* Personal Data */}
        <Card className="p-5 space-y-3">
          <h3 className="section-title flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dados Armazenados
          </h3>
          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-36" />
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground font-mono text-xs">{user?.email ?? "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Nome</span>
                <span className="text-foreground">{profile?.display_name ?? "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Cadastro</span>
                <span className="text-foreground font-mono text-xs">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("pt-BR") : "—"}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Consent Management */}
        <Card className="p-5 space-y-3">
          <h3 className="section-title flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Consentimentos
          </h3>
          {consentsLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="space-y-2">
              {["essential", "analytics", "marketing", "data_sharing"].map((type) => {
                const current = consents?.get(type);
                const isGranted = current?.granted ?? (type === "essential");
                return (
                  <div key={type} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm text-foreground">{consentLabels[type]}</p>
                      {current?.created_at && (
                        <p className="text-[11px] text-muted-foreground font-mono">
                          Atualizado: {new Date(current.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${isGranted ? "text-success" : "text-muted-foreground"}`}>
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
        </Card>

        {/* Actions */}
        <Card className="p-5 space-y-4">
          <h3 className="section-title flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            Ações sobre seus dados
          </h3>

          <div className="flex flex-col gap-3">
            <Button variant="outline" className="justify-start gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Baixar meus dados (JSON)
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                  Solicitar exclusão de todos os dados
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Confirmar exclusão
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é <strong>irreversível</strong>. Todos os seus dados pessoais serão anonimizados ou removidos permanentemente, incluindo perfil, conexões, grupos e históricos. Você será desconectado após a conclusão.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteRequest}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? "Excluindo..." : "Confirmar exclusão"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default MyDataPage;
