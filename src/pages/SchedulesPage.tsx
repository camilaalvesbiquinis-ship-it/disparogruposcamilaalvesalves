import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, Trash2, CalendarClock, MoreVertical } from "lucide-react";

const schedules = [
  {
    id: 1,
    name: "Promoção Semanal",
    groups: 5,
    frequency: "Semanal",
    nextRun: "Seg, 10:00",
    status: "active",
    type: "Texto + Imagem",
  },
  {
    id: 2,
    name: "Catálogo Diário",
    groups: 12,
    frequency: "Diário",
    nextRun: "Amanhã, 08:00",
    status: "active",
    type: "Catálogo",
  },
  {
    id: 3,
    name: "Newsletter Mensal",
    groups: 47,
    frequency: "Mensal",
    nextRun: "01/04, 09:00",
    status: "paused",
    type: "Texto",
  },
  {
    id: 4,
    name: "Lembrete VIP",
    groups: 3,
    frequency: "Semanal",
    nextRun: "Qui, 14:00",
    status: "active",
    type: "Texto + Botões",
  },
  {
    id: 5,
    name: "Black Friday Countdown",
    groups: 20,
    frequency: "Personalizado",
    nextRun: "—",
    status: "paused",
    type: "Texto + Imagem",
  },
];

const SchedulesPage = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-sm text-muted-foreground">
              {schedules.filter((s) => s.status === "active").length} ativos · {schedules.filter((s) => s.status === "paused").length} pausados
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="card-glow rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all duration-300"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${schedule.status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{schedule.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {schedule.groups} grupos · {schedule.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {schedule.frequency}
                </Badge>
                <span className="text-muted-foreground">
                  Próximo: <span className="text-foreground">{schedule.nextRun}</span>
                </span>
                <Badge
                  variant="outline"
                  className={
                    schedule.status === "active"
                      ? "bg-success/10 text-success border-success/30"
                      : "bg-muted text-muted-foreground border-border"
                  }
                >
                  {schedule.status === "active" ? "Ativo" : "Pausado"}
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  {schedule.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default SchedulesPage;
