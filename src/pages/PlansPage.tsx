import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Building2 } from "lucide-react";

const plans = [
  {
    name: "Start",
    price: "R$ 97",
    period: "/mês",
    description: "Ideal para iniciantes",
    features: ["1 número", "Até 20 grupos", "10 agendamentos", "Suporte por email"],
    current: false,
    popular: false,
  },
  {
    name: "Pro",
    price: "R$ 297",
    period: "/mês",
    description: "Para equipes em crescimento",
    features: [
      "3 números",
      "Grupos ilimitados",
      "Agendamentos ilimitados",
      "Relatórios avançados",
      "Suporte prioritário",
      "Menções em massa",
    ],
    current: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description: "Para grandes operações",
    features: [
      "Números ilimitados",
      "API aberta",
      "White label",
      "Webhooks",
      "Gestor dedicado",
      "SLA garantido",
    ],
    current: false,
    popular: false,
  },
];

const PlansPage = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-center max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Planos e Preços</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha o plano ideal para a sua operação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-6 space-y-5 transition-all duration-300 ${
                plan.popular
                  ? "card-glow border-primary/40 glow-primary relative"
                  : "card-glow"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px]">
                  Mais Popular
                </Badge>
              )}

              <div className="text-center space-y-1">
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {plan.name === "Enterprise" ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <Zap className="h-5 w-5" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </div>

              <div className="text-center">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.current
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                disabled={plan.current}
              >
                {plan.current ? "Plano Atual" : "Assinar"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default PlansPage;
