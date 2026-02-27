import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "leitor" | "criador" | "gerente";

export function useUserRole() {
  const { user } = useAuth();

  const { data: role, isLoading } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.role as AppRole) ?? "leitor";
    },
    enabled: !!user,
  });

  return {
    role: role ?? null,
    isLoading,
    isGerente: role === "gerente",
    isCriador: role === "criador",
    isLeitor: role === "leitor",
    canCreate: role === "criador" || role === "gerente",
    canManage: role === "gerente",
  };
}
