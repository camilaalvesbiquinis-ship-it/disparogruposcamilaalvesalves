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
    features: ["3 números", "Grupos ilimitados", "Agendamentos ilimitados", "Relatórios avançados", "Suporte prioritário", "Menções em massa"],
    current: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description: "Para grandes operações",
    features: ["Números ilimitados", "API aberta", "White label", "Webhooks", "Gestor dedicado", "SLA garantido"],
    current: false,
    popular: false,
  },
];

const PlansPage = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-center max-w-lg mx-auto">
          <h1 className="text-[28px] font-display font-semibold" style={{ color: '#1C1917' }}>Planos e Preços</h1>
          <p className="text-[13px] font-sans font-light mt-1" style={{ color: '#6B6560' }}>
            Escolha o plano ideal para a sua operação
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-xl p-6 space-y-5 transition-all duration-300 relative"
              style={{
                background: '#FFFFFF',
                border: plan.popular ? '2px solid #8B6E5A' : '1px solid #E8E2DC',
              }}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-sans font-semibold uppercase tracking-[0.07em]" style={{ background: '#2C2420', color: '#FFFFFF' }}>
                  Mais Popular
                </Badge>
              )}

              <div className="text-center space-y-1">
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg" style={{ background: '#F5EDE5', color: '#8B6E5A' }}>
                  {plan.name === "Enterprise" ? <Building2 className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                </div>
                <h3 className="text-[18px] font-display font-semibold" style={{ color: '#1C1917' }}>{plan.name}</h3>
                <p className="text-[12px] font-sans font-light" style={{ color: '#A09890' }}>{plan.description}</p>
              </div>

              <div className="text-center">
                <span className="text-[32px] font-data font-medium" style={{ color: '#1C1917' }}>{plan.price}</span>
                <span className="text-[13px] font-sans" style={{ color: '#A09890' }}>{plan.period}</span>
              </div>

              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] font-sans" style={{ color: '#1C1917' }}>
                    <Check className="h-4 w-4 shrink-0" style={{ color: '#2D6A4F' }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full text-[13px] font-sans font-semibold uppercase tracking-[0.07em]"
                style={plan.current ? { background: '#F2EDE8', color: '#6B6560' } : { background: '#2C2420', color: '#FFFFFF' }}
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
