import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users, AlertCircle } from "lucide-react";

const JoinPage = () => {
  const [status, setStatus] = useState<"loading" | "redirecting" | "full" | "error">("loading");

  useEffect(() => {
    const findGroup = async () => {
      try {
        const { data: groups, error } = await supabase.rpc("get_join_groups");

        if (error) throw error;

        const available = (groups || []).find(
          (g: any) => (g.member_count ?? 0) < (g.max_members || 1000)
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#FAF8F5' }}>
      <div className="rounded-2xl p-8 max-w-sm w-full text-center space-y-4" style={{ background: '#FFFFFF', border: '1px solid #E8E2DC', boxShadow: '0 8px 28px rgba(44,36,32,0.1)' }}>
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#EAF4EF' }}>
          <Users className="h-8 w-8" style={{ color: '#2D6A4F' }} />
        </div>

        {status === "loading" && (
          <>
            <h1 className="text-[20px] font-display font-semibold" style={{ color: '#1C1917' }}>Buscando grupo disponível...</h1>
            <Loader2 className="h-6 w-6 animate-spin mx-auto" style={{ color: '#8B6E5A' }} />
            <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>Encontrando o melhor grupo para você</p>
          </>
        )}

        {status === "redirecting" && (
          <>
            <h1 className="text-[20px] font-display font-semibold" style={{ color: '#1C1917' }}>Redirecionando...</h1>
            <Loader2 className="h-6 w-6 animate-spin mx-auto" style={{ color: '#8B6E5A' }} />
            <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>Você será redirecionado para o grupo do WhatsApp</p>
          </>
        )}

        {status === "full" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#FEF9E7' }}>
              <AlertCircle className="h-8 w-8" style={{ color: '#7D6608' }} />
            </div>
            <h1 className="text-[20px] font-display font-semibold" style={{ color: '#1C1917' }}>Todos os grupos estão cheios</h1>
            <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>
              No momento não há vagas disponíveis. Tente novamente mais tarde.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#FDECEA' }}>
              <AlertCircle className="h-8 w-8" style={{ color: '#922B21' }} />
            </div>
            <h1 className="text-[20px] font-display font-semibold" style={{ color: '#1C1917' }}>Erro ao buscar grupo</h1>
            <p className="text-[13px] font-sans font-light" style={{ color: '#6B6560' }}>Ocorreu um erro. Tente novamente.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 text-[13px] font-sans font-semibold uppercase tracking-[0.07em] rounded-md transition"
              style={{ background: '#2C2420', color: '#FFFFFF' }}
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
