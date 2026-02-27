import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type Connection = Tables<"whatsapp_connections">;
type ConnectionInsert = TablesInsert<"whatsapp_connections">;

export function useConnections() {
  return useQuery({
    queryKey: ["whatsapp_connections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Connection[];
    },
  });
}

export function useAddConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conn: Omit<ConnectionInsert, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .insert({ ...conn, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp_connections"] }),
  });
}

export function useUpdateConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Connection> & { id: string }) => {
      const { data, error } = await supabase
        .from("whatsapp_connections")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp_connections"] }),
  });
}

export function useDeleteConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("whatsapp_connections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp_connections"] }),
  });
}
