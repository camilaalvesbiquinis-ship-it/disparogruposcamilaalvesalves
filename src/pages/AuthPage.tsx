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
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center space-y-4">
          <Zap className="h-5 w-5 mx-auto text-foreground" />
          <h1 className="text-2xl font-display font-light tracking-[0.15em] uppercase text-foreground">
            GroupFlow
          </h1>
          <p className="text-[13px] font-sans text-muted-foreground">
            {isLogin ? "Entre na sua conta" : "Crie sua conta"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-glow p-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-sans font-semibold uppercase tracking-[0.07em] text-muted-foreground">
              Email
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="bg-transparent border-input text-foreground placeholder:text-muted-foreground/50 focus:ring-foreground/20 rounded-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-sans font-semibold uppercase tracking-[0.07em] text-muted-foreground">
              Senha
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-transparent border-input text-foreground placeholder:text-muted-foreground/50 focus:ring-foreground/20 rounded-sm"
            />
          </div>
          <Button
            type="submit"
            className="w-full text-[13px] font-sans font-semibold uppercase tracking-[0.07em] rounded-sm"
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

        <p className="text-center text-[13px] font-sans text-muted-foreground">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="underline underline-offset-4 text-foreground transition-colors duration-200"
          >
            {isLogin ? "Criar conta" : "Fazer login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
