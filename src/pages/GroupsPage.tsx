import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, MoreVertical, Users, MessageSquare, Send, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useGroups, useAddGroup, useDeleteGroup } from "@/hooks/useGroups";
import { useConnections } from "@/hooks/useConnections";
import { toast } from "sonner";
import type { Enums } from "@/integrations/supabase/types";

const categoryLabels: Record<string, string> = {
  varejo: "Varejo", atacado: "Atacado", vip: "VIP", internacional: "Internacional",
  promocoes: "Promoções", lancamentos: "Lançamentos", outros: "Outros",
};

const categoryColors: Record<string, string> = {
  vip: "bg-primary/20 text-primary border-primary/30",
  promocoes: "bg-warning/20 text-warning border-warning/30",
  atacado: "bg-info/20 text-info border-info/30",
  lancamentos: "bg-success/20 text-success border-success/30",
  internacional: "bg-accent/20 text-accent border-accent/30",
  varejo: "bg-secondary text-secondary-foreground border-border",
  outros: "bg-muted text-muted-foreground border-border",
};

const GroupsPage = () => {
  const { data: groups = [], isLoading } = useGroups();
  const { data: connections = [] } = useConnections();
  const addGroup = useAddGroup();
  const deleteGroup = useDeleteGroup();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Enums<"group_category">>("outros");
  const [newConnectionId, setNewConnectionId] = useState("");

  const filtered = groups.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || g.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    addGroup.mutate(
      {
        name: newName.trim(),
        category: newCategory,
        connection_id: newConnectionId || null,
      },
      {
        onSuccess: () => {
          toast.success("Grupo criado!");
          setDialogOpen(false);
          setNewName("");
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Grupos</h1>
            <p className="text-sm text-muted-foreground">{groups.length} grupos conectados</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Grupo
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar grupos..." className="pl-9 bg-card border-border" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-card border-border"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {Object.entries(categoryLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="card-glow rounded-xl p-12 text-center space-y-3">
            <Users className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{groups.length === 0 ? "Nenhum grupo criado ainda" : "Nenhum grupo encontrado"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((group) => (
              <div key={group.id} className="card-glow rounded-xl p-5 space-y-4 transition-all duration-300 animate-slide-in">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
                    <p className="text-xs text-muted-foreground">{group.description || "Sem descrição"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${group.is_active ? "bg-success" : "bg-muted-foreground"}`} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteGroup.mutate(group.id, { onSuccess: () => toast.success("Grupo removido") })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <Badge variant="outline" className={`text-[10px] ${categoryColors[group.category] || ""}`}>
                  {categoryLabels[group.category] || group.category}
                </Badge>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Users className="h-3 w-3" /><span>{group.member_count} membros</span></div>
                  <span>{new Date(group.updated_at).toLocaleDateString("pt-BR")}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs border-border text-foreground hover:bg-secondary">
                    <MessageSquare className="h-3 w-3 mr-1" /> Detalhes
                  </Button>
                  <Button size="sm" className="flex-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                    <Send className="h-3 w-3 mr-1" /> Disparar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">Novo Grupo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do grupo" className="bg-secondary/50 border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Categoria</Label>
              <Select value={newCategory} onValueChange={(v) => setNewCategory(v as Enums<"group_category">)}>
                <SelectTrigger className="bg-secondary/50 border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {connections.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Número</Label>
                <Select value={newConnectionId} onValueChange={setNewConnectionId}>
                  <SelectTrigger className="bg-secondary/50 border-border"><SelectValue placeholder="Selecionar número" /></SelectTrigger>
                  <SelectContent>
                    {connections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.phone_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button className="w-full bg-primary text-primary-foreground" onClick={handleCreate} disabled={addGroup.isPending}>
              {addGroup.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Grupo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default GroupsPage;
