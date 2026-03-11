import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Pause, Trash2, CalendarClock, Loader2, Copy, MoreVertical } from "lucide-react";
import { useSchedules, useAddSchedule, useUpdateSchedule, useDeleteSchedule } from "@/hooks/useSchedules";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const freqLabels: Record<string, string> = {
  once: "Único", daily: "Diário", weekly: "Semanal", monthly: "Mensal", custom: "Personalizado",
};

const SchedulesPage = () => {
  const { data: schedules = [], isLoading } = useSchedules();
  const addSchedule = useAddSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const navigate = useNavigate();

  const toggleActive = (id: string, current: boolean) => {
    updateSchedule.mutate(
      { id, is_active: !current },
      { onSuccess: () => toast.success(current ? "Agendamento pausado" : "Agendamento ativado") }
    );
  };

  const cloneSchedule = (schedule: typeof schedules[0]) => {
    const params = new URLSearchParams();
    if (schedule.content) params.set("message", schedule.content);
    if (schedule.content_type) params.set("contentType", schedule.content_type);
    if (schedule.connection_id) params.set("connectionId", schedule.connection_id);
    navigate(`/broadcast?${params.toString()}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-sm text-muted-foreground">
              {schedules.filter((s) => s.is_active).length} ativos · {schedules.filter((s) => !s.is_active).length} pausados
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/broadcast")}>
            <CalendarClock className="h-4 w-4 mr-2" /> Novo Agendamento
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
        ) : schedules.length === 0 ? (
          <div className="card-glow rounded-xl p-12 text-center space-y-3">
            <CalendarClock className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhum agendamento criado</p>
            <p className="text-xs text-muted-foreground">Crie uma mensagem e clique em "Agendar" para agendar o envio</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="card-glow rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-slide-in">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${schedule.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{schedule.title}</h3>
                    {schedule.content && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{schedule.content}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {freqLabels[schedule.frequency]}
                  </Badge>
                  {schedule.next_run_at && (
                    <span className="text-muted-foreground">
                      Próximo: <span className="text-foreground">{new Date(schedule.next_run_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </span>
                  )}
                  <Badge variant="outline" className={schedule.is_active ? "bg-success/10 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}>
                    {schedule.is_active ? "Ativo" : "Pausado"}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleActive(schedule.id, schedule.is_active)}>
                      {schedule.is_active ? (
                        <><Pause className="h-3.5 w-3.5 mr-2" /> Pausar</>
                      ) : (
                        <><Play className="h-3.5 w-3.5 mr-2" /> Ativar</>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => cloneSchedule(schedule)}>
                      <Copy className="h-3.5 w-3.5 mr-2" /> Clonar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => deleteSchedule.mutate(schedule.id, { onSuccess: () => toast.success("Agendamento cancelado") })}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Cancelar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SchedulesPage;
