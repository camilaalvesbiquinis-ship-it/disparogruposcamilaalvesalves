import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Users, MessageSquare, Send, Loader2, Trash2, Download, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useGroups, useAddGroup, useDeleteGroup } from "@/hooks/useGroups";
import { useConnections } from "@/hooks/useConnections";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importedGroups, setImportedGroups] = useState<Array<{ phone: string; name: string; participantsCount?: number; communityId?: string }>>([]);
  const [importSearch, setImportSearch] = useState("");
  const [selectedImportGroups, setSelectedImportGroups] = useState<Set<number>>(new Set());
  const [importStep, setImportStep] = useState<"loading" | "select" | "importing" | "done">("loading");
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

  const handleImportStart = async () => {
    setImportStep("loading");
    setImportDialogOpen(true);
    setImportedGroups([]);
    setSelectedImportGroups(new Set());
    try {
      const { data, error } = await supabase.functions.invoke("zapi-qrcode", {
        body: { action: "groups", page: 1, pageSize: 200 },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      const groupsList = Array.isArray(data) ? data : [];
      setImportedGroups(groupsList);
      setSelectedImportGroups(new Set(groupsList.map((_: unknown, i: number) => i)));
      setImportStep("select");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao buscar grupos da Z-API");
      setImportDialogOpen(false);
    }
  };

  const toggleImportGroup = (index: number) => {
    setSelectedImportGroups((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleImportSelected = async () => {
    setImportStep("importing");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Não autenticado"); return; }

    const connectionId = connections.length > 0 ? connections[0].id : null;
    const toImport = importedGroups.filter((_, i) => selectedImportGroups.has(i));
    let imported = 0;

    for (const group of toImport) {
      try {
        await supabase.from("groups").insert({
          name: group.name || group.phone,
          member_count: group.participantsCount || 0,
          user_id: user.id,
          connection_id: connectionId,
          description: `WhatsApp ID: ${group.phone}`,
        });
        imported++;
      } catch {
        // skip duplicates or errors
      }
    }

    queryClient.invalidateQueries({ queryKey: ["groups"] });
    setImportStep("done");
    toast.success(`${imported} grupo(s) importado(s)!`);
    setTimeout(() => setImportDialogOpen(false), 1500);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Grupos</h1>
            <p className="text-sm text-muted-foreground">{groups.length} grupos conectados</p>
          </div>
          <div className="flex gap-2">
            {connections.length > 0 && (
              <Button variant="outline" className="border-border text-foreground" onClick={handleImportStart}>
                <Download className="h-4 w-4 mr-2" /> Importar do WhatsApp
              </Button>
            )}
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Novo Grupo
            </Button>
          </div>
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

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="bg-card border-border sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Importar Grupos do WhatsApp
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Selecione os grupos que deseja importar da sua conta WhatsApp conectada.
            </DialogDescription>
          </DialogHeader>

          {importStep === "loading" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Buscando grupos da Z-API...</p>
            </div>
          )}

          {importStep === "select" && (
            <div className="flex flex-col gap-4 min-h-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{importedGroups.length} grupo(s) encontrado(s)</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                  onClick={() => {
                    if (selectedImportGroups.size === importedGroups.length) {
                      setSelectedImportGroups(new Set());
                    } else {
                      setSelectedImportGroups(new Set(importedGroups.map((_, i) => i)));
                    }
                  }}
                >
                  {selectedImportGroups.size === importedGroups.length ? "Desmarcar todos" : "Selecionar todos"}
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar grupo..."
                  className="pl-9 bg-secondary/50 border-border"
                  value={importSearch}
                  onChange={(e) => setImportSearch(e.target.value)}
                />
              </div>
              <div className="overflow-y-auto max-h-[40vh] space-y-1 pr-1">
                {importedGroups
                  .map((group, i) => ({ group, i }))
                  .filter(({ group }) => !importSearch || (group.name || group.phone).toLowerCase().includes(importSearch.toLowerCase()))
                  .map(({ group, i }) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedImportGroups.has(i) ? "bg-primary/10 border border-primary/30" : "bg-secondary/30 border border-transparent hover:bg-secondary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedImportGroups.has(i)}
                      onChange={() => toggleImportGroup(i)}
                      className="accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{group.name || group.phone}</p>
                      <p className="text-xs text-muted-foreground">{group.participantsCount || 0} membros</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground"
                onClick={handleImportSelected}
                disabled={selectedImportGroups.size === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Importar {selectedImportGroups.size} grupo(s)
              </Button>
            </div>
          )}

          {importStep === "importing" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Importando grupos...</p>
            </div>
          )}

          {importStep === "done" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium text-foreground">Grupos importados com sucesso!</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default GroupsPage;
