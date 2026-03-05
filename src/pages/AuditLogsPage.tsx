import { AppLayout } from "@/components/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Search, Filter } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";

const actionLabels: Record<string, { label: string; bg: string; color: string; border: string }> = {
  view: { label: "Visualização", bg: "#EAF2FF", color: "#1A5276", border: "#B3D4F7" },
  edit: { label: "Edição", bg: "#FEF9E7", color: "#7D6608", border: "#F0D9A0" },
  delete: { label: "Exclusão", bg: "#FDECEA", color: "#922B21", border: "#F5C0BB" },
  export: { label: "Exportação", bg: "#F5EDE5", color: "#6B5044", border: "#D4B9A8" },
  decrypt: { label: "Revelação", bg: "#F5EDE5", color: "#6B5044", border: "#D4B9A8" },
  login: { label: "Login", bg: "#EAF4EF", color: "#2D6A4F", border: "#A8D5B5" },
  logout: { label: "Logout", bg: "#F2EDE8", color: "#6B6560", border: "#E8E2DC" },
  role_change: { label: "Alteração de Papel", bg: "#F5EDE5", color: "#6B5044", border: "#D4B9A8" },
  consent_change: { label: "Consentimento", bg: "#EAF2FF", color: "#1A5276", border: "#B3D4F7" },
  data_request: { label: "Solicitação LGPD", bg: "#FDECEA", color: "#922B21", border: "#F5C0BB" },
};

const AuditLogsPage = () => {
  const { canManage, isLoading: roleLoading } = useUserRole();
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs", actionFilter],
    queryFn: async () => {
      let query = (supabase.from("audit_logs") as any).select("*").order("created_at", { ascending: false }).limit(200);
      if (actionFilter !== "all") query = query.eq("action", actionFilter);
      const { data, error } = await query;
      if (error) throw error;
      return data as Array<{
        id: string; user_id: string; action: string; table_name: string | null;
        record_id: string | null; details: Record<string, unknown>; user_agent: string | null; created_at: string;
      }>;
    },
    enabled: canManage,
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles-for-audit"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, display_name, email");
      if (error) throw error;
      return data;
    },
    enabled: canManage,
  });

  const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name || p.email || p.user_id]) ?? []);

  if (roleLoading) return <AppLayout><div className="flex items-center justify-center py-20"><Skeleton className="h-8 w-48" /></div></AppLayout>;
  if (!canManage) return <Navigate to="/" replace />;

  const filteredLogs = logs?.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const userName = profileMap.get(log.user_id)?.toLowerCase() ?? "";
    return userName.includes(q) || log.action.includes(q) || log.table_name?.toLowerCase().includes(q) || log.record_id?.toLowerCase().includes(q);
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[28px] font-display font-semibold flex items-center gap-2" style={{ color: '#1C1917' }}>
            <Shield className="h-6 w-6" style={{ color: '#8B6E5A' }} />
            Logs de Auditoria
          </h1>
          <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>
            Registro de todas as ações sensíveis realizadas no sistema
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#A09890' }} />
            <Input
              placeholder="Buscar por usuário, tabela, registro..."
              className="pl-9"
              style={{ background: '#FAF8F5', border: '1px solid #E8E2DC', color: '#1C1917' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[200px]" style={{ background: '#FAF8F5', border: '1px solid #E8E2DC' }}>
              <Filter className="h-4 w-4 mr-2" style={{ color: '#A09890' }} />
              <SelectValue placeholder="Filtrar ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="view">Visualização</SelectItem>
              <SelectItem value="edit">Edição</SelectItem>
              <SelectItem value="delete">Exclusão</SelectItem>
              <SelectItem value="export">Exportação</SelectItem>
              <SelectItem value="decrypt">Revelação</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="role_change">Alteração de Papel</SelectItem>
              <SelectItem value="consent_change">Consentimento</SelectItem>
              <SelectItem value="data_request">Solicitação LGPD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="card-glow rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow style={{ background: '#F7F4F0', borderBottom: '1px solid #E8E2DC' }}>
                <TableHead className="text-[11px] font-sans font-medium uppercase tracking-[0.08em]" style={{ color: '#A09890' }}>Usuário</TableHead>
                <TableHead className="text-[11px] font-sans font-medium uppercase tracking-[0.08em]" style={{ color: '#A09890' }}>Ação</TableHead>
                <TableHead className="text-[11px] font-sans font-medium uppercase tracking-[0.08em]" style={{ color: '#A09890' }}>Tabela</TableHead>
                <TableHead className="text-[11px] font-sans font-medium uppercase tracking-[0.08em]" style={{ color: '#A09890' }}>Registro</TableHead>
                <TableHead className="text-[11px] font-sans font-medium uppercase tracking-[0.08em]" style={{ color: '#A09890' }}>Data/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} style={{ borderBottom: '1px solid #F0EBE5' }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-[13px] font-sans" style={{ color: '#A09890' }}>
                    Nenhum registro de auditoria encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs?.map((log) => {
                  const actionCfg = actionLabels[log.action] ?? { label: log.action, bg: "#F2EDE8", color: "#6B6560", border: "#E8E2DC" };
                  return (
                    <TableRow key={log.id} className="transition-colors duration-150 hover:bg-[#FBF9F6]" style={{ borderBottom: '1px solid #F0EBE5' }}>
                      <TableCell className="text-[13px] font-sans font-medium" style={{ color: '#1C1917' }}>
                        {profileMap.get(log.user_id) ?? log.user_id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-data" style={{ background: actionCfg.bg, color: actionCfg.color, borderColor: actionCfg.border }}>
                          {actionCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[13px] font-data" style={{ color: '#1C1917' }}>
                        {log.table_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-[13px] font-data" style={{ color: '#A09890' }}>
                        {log.record_id ? log.record_id.slice(0, 8) + "..." : "—"}
                      </TableCell>
                      <TableCell className="text-[13px] font-data" style={{ color: '#A09890' }}>
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default AuditLogsPage;
