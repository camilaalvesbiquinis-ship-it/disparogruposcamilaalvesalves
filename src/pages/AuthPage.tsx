import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado com sucesso!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada com sucesso!");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#080a0f' }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="flex h-[36px] w-[36px] mx-auto items-center justify-center rounded-[10px]" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-display font-semibold uppercase tracking-[0.1em]" style={{ color: '#F1F5F9' }}>GroupFlow</h1>
          <p className="text-[11px] font-data tracking-[0.1em] uppercase" style={{ color: '#475569' }}>
            {isLogin ? "Entre na sua conta" : "Crie sua conta"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-glow p-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[12px] font-sans font-medium uppercase tracking-[0.05em]" style={{ color: '#64748b' }}>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{ background: '#0d0f14', border: '1px solid rgba(255,255,255,0.08)', color: '#F1F5F9' }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px] font-sans font-medium uppercase tracking-[0.05em]" style={{ color: '#64748b' }}>Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{ background: '#0d0f14', border: '1px solid rgba(255,255,255,0.08)', color: '#F1F5F9' }}
            />
          </div>
          <Button
            type="submit"
            className="w-full text-[13px] font-sans font-semibold uppercase tracking-[0.08em]"
            style={{ background: '#8B6E5A', color: '#FFFFFF' }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Aguarde...
              </span>
            ) : (
              <span>{isLogin ? "Entrar" : "Criar Conta"}</span>
            )}
          </Button>
        </form>

        <p className="text-center text-sm" style={{ color: '#94a3b8' }}>
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="hover:underline font-medium"
            style={{ color: '#D4B9A8' }}
          >
            {isLogin ? "Criar conta" : "Fazer login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
