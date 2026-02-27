import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Play, Pause, Trash2, CalendarClock, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSchedules, useAddSchedule, useUpdateSchedule, useDeleteSchedule } from "@/hooks/useSchedules";
import { toast } from "sonner";
import type { Enums } from "@/integrations/supabase/types";

const freqLabels: Record<string, string> = {
  once: "Único", daily: "Diário", weekly: "Semanal", monthly: "Mensal", custom: "Personalizado",
};

const SchedulesPage = () => {
  const { data: schedules = [], isLoading } = useSchedules();
  const addSchedule = useAddSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFrequency, setNewFrequency] = useState<Enums<"schedule_frequency">>("once");
  const [newDate, setNewDate] = useState("");

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    addSchedule.mutate(
      {
        title: newTitle.trim(),
        frequency: newFrequency,
        scheduled_at: newDate ? new Date(newDate).toISOString() : null,
        next_run_at: newDate ? new Date(newDate).toISOString() : null,
      },
      {
        onSuccess: () => {
          toast.success("Agendamento criado!");
          setDialogOpen(false);
          setNewTitle("");
          setNewDate("");
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const toggleActive = (id: string, current: boolean) => {
    updateSchedule.mutate(
      { id, is_active: !current },
      { onSuccess: () => toast.success(current ? "Pausado" : "Ativado") }
    );
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
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Agendamento
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
        ) : schedules.length === 0 ? (
          <div className="card-glow rounded-xl p-12 text-center space-y-3">
            <CalendarClock className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhum agendamento criado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="card-glow rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-slide-in">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${schedule.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{schedule.title}</h3>
                    <p className="text-xs text-muted-foreground">{schedule.content_type}</p>
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
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => toggleActive(schedule.id, schedule.is_active)}>
                    {schedule.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteSchedule.mutate(schedule.id, { onSuccess: () => toast.success("Removido") })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">Novo Agendamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Título</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Nome do agendamento" className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Frequência</Label>
              <Select value={newFrequency} onValueChange={(v) => setNewFrequency(v as Enums<"schedule_frequency">)}>
                <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(freqLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Data/Hora</Label>
              <Input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="bg-secondary/50 border-border" />
            </div>
            <Button className="w-full bg-primary text-primary-foreground" onClick={handleCreate} disabled={addSchedule.isPending}>
              {addSchedule.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Agendamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SchedulesPage;
