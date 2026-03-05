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

const roleConfig: Record<AppRole, { label: string; icon: typeof Shield; bg: string; color: string; border: string }> = {
  gerente: { label: "Gerente", icon: Shield, bg: "#FDECEA", color: "#922B21", border: "#F5C0BB" },
  criador: { label: "Criador", icon: PenTool, bg: "#F5EDE5", color: "#6B5044", border: "#D4B9A8" },
  leitor: { label: "Leitor", icon: Eye, bg: "#F2EDE8", color: "#6B6560", border: "#E8E2DC" },
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
      const { data: profiles, error: pErr } = await supabase.from("profiles").select("user_id, display_name, email, created_at");
      if (pErr) throw pErr;
      const { data: roles, error: rErr } = await supabase.from("user_roles").select("user_id, role");
      if (rErr) throw rErr;
      const roleMap = new Map(roles.map((r) => [r.user_id, r.role as AppRole]));
      return (profiles || []).map((p) => ({
        user_id: p.user_id, display_name: p.display_name, email: p.email,
        role: roleMap.get(p.user_id) ?? "leitor", created_at: p.created_at,
      })) as UserWithRole[];
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId);
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
          <h1 className="text-[28px] font-display font-semibold" style={{ color: '#1C1917' }}>Usuários</h1>
          <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>Monitoramento e gerenciamento de papéis</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.entries(roleConfig) as [AppRole, typeof roleConfig.gerente][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className="card-glow rounded-xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: cfg.bg, color: cfg.color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[28px] font-data font-medium" style={{ color: '#1C1917' }}>{roleCounts[key]}</p>
                  <p className="text-[12px] font-sans" style={{ color: '#A09890' }}>{cfg.label}s</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card-glow rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow style={{ background: '#F7F4F0', borderBottom: '1px solid #E8E2DC' }}>
                <TableHead className="text-[11px] font-sans font-medium uppercase tracking-[0.08em]" style={{ color: '#A09890' }}>Usuário</TableHead>
                <TableHead className="text-[11px] font-sans font-medium uppercase tracking-[0.08em]" style={{ color: '#A09890' }}>Email</TableHead>
                <TableHead className="text-[11px] font-sans font-medium uppercase tracking-[0.08em]" style={{ color: '#A09890' }}>Papel</TableHead>
                <TableHead className="text-[11px] font-sans font-medium uppercase tracking-[0.08em]" style={{ color: '#A09890' }}>Membro desde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} style={{ borderBottom: '1px solid #F0EBE5' }}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <Users className="h-10 w-10 mx-auto mb-2" style={{ color: '#A09890' }} />
                    <p className="font-sans" style={{ color: '#A09890' }}>Nenhum usuário encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                users?.map((u) => {
                  const cfg = roleConfig[u.role];
                  const isSelf = u.user_id === currentUser?.id;
                  return (
                    <TableRow key={u.user_id} className="transition-colors duration-150 hover:bg-[#FBF9F6]" style={{ borderBottom: '1px solid #F0EBE5' }}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#F5EDE5' }}>
                            <span className="text-[11px] font-sans font-semibold" style={{ color: '#8B6E5A' }}>
                              {(u.display_name || u.email || "U").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-[13px] font-sans font-medium" style={{ color: '#1C1917' }}>{u.display_name || "Sem nome"}</span>
                          {isSelf && <Badge variant="outline" className="text-[10px] font-data" style={{ background: '#F5EDE5', color: '#6B5044', borderColor: '#D4B9A8' }}>Você</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-[13px] font-sans" style={{ color: '#6B6560' }}>{u.email}</TableCell>
                      <TableCell>
                        {canManage && !isSelf ? (
                          <Select value={u.role} onValueChange={(val) => updateRole.mutate({ userId: u.user_id, newRole: val as AppRole })}>
                            <SelectTrigger className="w-[130px] h-8 text-[12px]" style={{ background: '#FAF8F5', border: '1px solid #E8E2DC' }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="leitor">Leitor</SelectItem>
                              <SelectItem value="criador">Criador</SelectItem>
                              <SelectItem value="gerente">Gerente</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline" className="text-[11px] font-data" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                            {cfg.label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-[13px] font-data" style={{ color: '#A09890' }}>
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
