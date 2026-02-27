import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, MoreVertical, Users, MessageSquare, Send } from "lucide-react";
import { useState } from "react";

const groups = [
  { id: 1, name: "VIP Clientes Premium", category: "VIP", members: 128, lastActivity: "Há 5 min", number: "+55 11 9999-0001", active: true },
  { id: 2, name: "Promoções Varejo SP", category: "Promoções", members: 342, lastActivity: "Há 1h", number: "+55 11 9999-0001", active: true },
  { id: 3, name: "Atacado Nacional", category: "Atacado", members: 89, lastActivity: "Há 3h", number: "+55 11 9999-0002", active: true },
  { id: 4, name: "Lançamentos 2025", category: "Lançamentos", members: 215, lastActivity: "Há 30 min", number: "+55 11 9999-0001", active: true },
  { id: 5, name: "Internacional - LATAM", category: "Internacional", members: 67, lastActivity: "Há 2 dias", number: "+55 11 9999-0003", active: false },
  { id: 6, name: "Varejo RJ", category: "Varejo", members: 198, lastActivity: "Há 45 min", number: "+55 11 9999-0002", active: true },
  { id: 7, name: "Revendedores Gold", category: "VIP", members: 156, lastActivity: "Há 2h", number: "+55 11 9999-0001", active: true },
  { id: 8, name: "Black Friday 2025", category: "Promoções", members: 520, lastActivity: "Há 1 dia", number: "+55 11 9999-0003", active: false },
];

const categoryColors: Record<string, string> = {
  VIP: "bg-primary/20 text-primary border-primary/30",
  Promoções: "bg-warning/20 text-warning border-warning/30",
  Atacado: "bg-info/20 text-info border-info/30",
  Lançamentos: "bg-success/20 text-success border-success/30",
  Internacional: "bg-accent/20 text-accent border-accent/30",
  Varejo: "bg-secondary text-secondary-foreground border-border",
};

const GroupsPage = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = groups.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || g.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Grupos</h1>
            <p className="text-sm text-muted-foreground">{groups.length} grupos conectados</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Grupo
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar grupos..."
              className="pl-9 bg-card border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-card border-border">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="Varejo">Varejo</SelectItem>
              <SelectItem value="Atacado">Atacado</SelectItem>
              <SelectItem value="Promoções">Promoções</SelectItem>
              <SelectItem value="Lançamentos">Lançamentos</SelectItem>
              <SelectItem value="Internacional">Internacional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((group) => (
            <div key={group.id} className="card-glow rounded-xl p-5 space-y-4 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
                  <p className="text-xs text-muted-foreground">{group.number}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${group.active ? "bg-success" : "bg-muted-foreground"}`} />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <Badge variant="outline" className={`text-[10px] ${categoryColors[group.category] || ""}`}>
                {group.category}
              </Badge>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{group.members} membros</span>
                </div>
                <span>{group.lastActivity}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs border-border text-foreground hover:bg-secondary">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Detalhes
                </Button>
                <Button size="sm" className="flex-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                  <Send className="h-3 w-3 mr-1" />
                  Disparar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default GroupsPage;
