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

const actionLabels: Record<string, { label: string; color: string }> = {
  view: { label: "Visualização", color: "bg-blue-500/10 text-blue-500" },
  edit: { label: "Edição", color: "bg-yellow-500/10 text-yellow-500" },
  delete: { label: "Exclusão", color: "bg-destructive/10 text-destructive" },
  export: { label: "Exportação", color: "bg-orange-500/10 text-orange-500" },
  decrypt: { label: "Revelação", color: "bg-purple-500/10 text-purple-500" },
  login: { label: "Login", color: "bg-green-500/10 text-green-500" },
  logout: { label: "Logout", color: "bg-muted text-muted-foreground" },
  role_change: { label: "Alteração de Papel", color: "bg-primary/10 text-primary" },
  consent_change: { label: "Consentimento", color: "bg-cyan-500/10 text-cyan-500" },
  data_request: { label: "Solicitação LGPD", color: "bg-pink-500/10 text-pink-500" },
};

const AuditLogsPage = () => {
  const { canManage, isLoading: roleLoading } = useUserRole();
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs", actionFilter],
    queryFn: async () => {
      let query = (supabase.from("audit_logs") as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Array<{
        id: string;
        user_id: string;
        action: string;
        table_name: string | null;
        record_id: string | null;
        details: Record<string, unknown>;
        user_agent: string | null;
        created_at: string;
      }>;
    },
    enabled: canManage,
  });

  // Also fetch profiles to map user_id -> display_name
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
    return (
      userName.includes(q) ||
      log.action.includes(q) ||
      log.table_name?.toLowerCase().includes(q) ||
      log.record_id?.toLowerCase().includes(q)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Logs de Auditoria
          </h1>
          <p className="text-sm text-muted-foreground">
            Registro de todas as ações sensíveis realizadas no sistema
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por usuário, tabela, registro..."
              className="pl-9 bg-secondary/50 border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[200px] bg-secondary/50 border-border">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
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

        {/* Logs table */}
        <div className="card-glow rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Usuário</TableHead>
                <TableHead className="text-muted-foreground">Ação</TableHead>
                <TableHead className="text-muted-foreground">Tabela</TableHead>
                <TableHead className="text-muted-foreground">Registro</TableHead>
                <TableHead className="text-muted-foreground">Data/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-24" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    Nenhum registro de auditoria encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs?.map((log) => {
                  const actionCfg = actionLabels[log.action] ?? { label: log.action, color: "bg-muted text-muted-foreground" };
                  return (
                    <TableRow key={log.id} className="border-border">
                      <TableCell className="text-foreground text-sm">
                        {profileMap.get(log.user_id) ?? log.user_id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${actionCfg.color}`}>
                          {actionCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {log.table_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-mono">
                        {log.record_id ? log.record_id.slice(0, 8) + "..." : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
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
