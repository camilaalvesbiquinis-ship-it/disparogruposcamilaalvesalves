import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, AlertCircle } from "lucide-react";

const JoinPage = () => {
  const [status, setStatus] = useState<"loading" | "redirecting" | "full" | "error">("loading");

  useEffect(() => {
    const findGroup = async () => {
      try {
        const { data: groups, error } = await supabase
          .from("groups")
          .select("id, name, invite_link, member_count, max_members")
          .eq("is_active", true)
          .not("invite_link", "is", null)
          .order("member_count", { ascending: true });

        if (error) throw error;

        const available = (groups || []).find(
          (g: any) => g.member_count < (g.max_members || 256)
        );

        if (available?.invite_link) {
          setStatus("redirecting");
          window.location.href = available.invite_link;
        } else {
          setStatus("full");
        }
      } catch {
        setStatus("error");
      }
    };

    findGroup();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-green-600" />
        </div>

        {status === "loading" && (
          <>
            <h1 className="text-xl font-bold text-gray-900">Buscando grupo disponível...</h1>
            <Loader2 className="h-6 w-6 text-green-600 animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Encontrando o melhor grupo para você</p>
          </>
        )}

        {status === "redirecting" && (
          <>
            <h1 className="text-xl font-bold text-gray-900">Redirecionando...</h1>
            <Loader2 className="h-6 w-6 text-green-600 animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Você será redirecionado para o grupo do WhatsApp</p>
          </>
        )}

        {status === "full" && (
          <>
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Todos os grupos estão cheios</h1>
            <p className="text-sm text-gray-500">
              No momento não há vagas disponíveis. Tente novamente mais tarde.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Erro ao buscar grupo</h1>
            <p className="text-sm text-gray-500">Ocorreu um erro. Tente novamente.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Tentar novamente
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinPage;
