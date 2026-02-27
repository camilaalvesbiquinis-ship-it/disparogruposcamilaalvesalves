import { AppLayout } from "@/components/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, Eye, PenTool } from "lucide-react";
import { toast } from "sonner";

const roleConfig: Record<AppRole, { label: string; icon: typeof Shield; color: string }> = {
  gerente: { label: "Gerente", icon: Shield, color: "bg-destructive/10 text-destructive border-destructive/20" },
  criador: { label: "Criador", icon: PenTool, color: "bg-primary/10 text-primary border-primary/20" },
  leitor: { label: "Leitor", icon: Eye, color: "bg-muted text-muted-foreground border-border" },
};

interface UserWithRole {
  user_id: string;
  display_name: string | null;
  email: string | null;
  role: AppRole;
  created_at: string;
}

const UsersPage = () => {
  const { canManage } = useUserRole();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, display_name, email, created_at");
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rErr) throw rErr;

      const roleMap = new Map(roles.map((r) => [r.user_id, r.role as AppRole]));

      return (profiles || []).map((p) => ({
        user_id: p.user_id,
        display_name: p.display_name,
        email: p.email,
        role: roleMap.get(p.user_id) ?? "leitor",
        created_at: p.created_at,
      })) as UserWithRole[];
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
      toast.success("Papel atualizado com sucesso!");
    },
    onError: (err: any) => toast.error(err.message || "Erro ao atualizar papel"),
  });

  const roleCounts = {
    gerente: users?.filter((u) => u.role === "gerente").length ?? 0,
    criador: users?.filter((u) => u.role === "criador").length ?? 0,
    leitor: users?.filter((u) => u.role === "leitor").length ?? 0,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground">Monitoramento e gerenciamento de papéis</p>
        </div>

        {/* Role summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.entries(roleConfig) as [AppRole, typeof roleConfig.gerente][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className="card-glow rounded-xl p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${cfg.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{roleCounts[key]}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}s</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Users table */}
        <div className="card-glow rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Usuário</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Papel</TableHead>
                <TableHead className="text-muted-foreground">Membro desde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum usuário encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                users?.map((u) => {
                  const cfg = roleConfig[u.role];
                  const isSelf = u.user_id === currentUser?.id;
                  return (
                    <TableRow key={u.user_id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-primary">
                              {(u.display_name || u.email || "U").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span>{u.display_name || "Sem nome"}</span>
                          {isSelf && <Badge variant="outline" className="text-[10px]">Você</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        {canManage && !isSelf ? (
                          <Select
                            value={u.role}
                            onValueChange={(val) => updateRole.mutate({ userId: u.user_id, newRole: val as AppRole })}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="leitor">Leitor</SelectItem>
                              <SelectItem value="criador">Criador</SelectItem>
                              <SelectItem value="gerente">Gerente</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                            {cfg.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(u.created_at).toLocaleDateString("pt-BR")}
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

export default UsersPage;
