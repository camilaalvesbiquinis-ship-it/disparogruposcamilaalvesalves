import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Send, ImageIcon, FileText, Video, Link2, AtSign, Clock, Zap } from "lucide-react";
import { useState } from "react";

const groups = [
  { id: "1", name: "VIP Clientes Premium", members: 128 },
  { id: "2", name: "Promoções Varejo SP", members: 342 },
  { id: "3", name: "Atacado Nacional", members: 89 },
  { id: "4", name: "Lançamentos 2025", members: 215 },
  { id: "5", name: "Varejo RJ", members: 198 },
  { id: "6", name: "Revendedores Gold", members: 156 },
];

const contentTypes = [
  { id: "text", label: "Texto", icon: FileText },
  { id: "image", label: "Imagem", icon: ImageIcon },
  { id: "video", label: "Vídeo", icon: Video },
  { id: "link", label: "Link", icon: Link2 },
];

const BroadcastPage = () => {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [contentType, setContentType] = useState("text");
  const [delay, setDelay] = useState([3]);
  const [mentionAll, setMentionAll] = useState(false);

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Disparo</h1>
          <p className="text-sm text-muted-foreground">Envie mensagens em massa para seus grupos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Groups selection */}
          <div className="card-glow rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AtSign className="h-4 w-4 text-primary" />
              Selecionar Grupos
            </h3>
            <p className="text-xs text-muted-foreground">
              {selectedGroups.length} de {groups.length} selecionados
            </p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {groups.map((group) => (
                <label
                  key={group.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => toggleGroup(group.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.members} membros</p>
                  </div>
                </label>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-border"
              onClick={() =>
                setSelectedGroups(
                  selectedGroups.length === groups.length ? [] : groups.map((g) => g.id)
                )
              }
            >
              {selectedGroups.length === groups.length ? "Desmarcar todos" : "Selecionar todos"}
            </Button>
          </div>

          {/* Message composer */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card-glow rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Conteúdo da Mensagem</h3>

              <div className="flex gap-2">
                {contentTypes.map((ct) => (
                  <Button
                    key={ct.id}
                    variant={contentType === ct.id ? "default" : "outline"}
                    size="sm"
                    className={
                      contentType === ct.id
                        ? "bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground"
                    }
                    onClick={() => setContentType(ct.id)}
                  >
                    <ct.icon className="h-3.5 w-3.5 mr-1.5" />
                    {ct.label}
                  </Button>
                ))}
              </div>

              {contentType === "image" && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Arraste ou clique para adicionar imagem</p>
                </div>
              )}

              <Textarea
                placeholder={`Digite sua mensagem...\n\nVariáveis disponíveis: {nome_grupo}, {categoria}, {data}`}
                className="min-h-[160px] bg-secondary/50 border-border resize-none"
              />

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Variáveis:</span>
                {["{nome_grupo}", "{categoria}", "{data}"].map((v) => (
                  <button
                    key={v}
                    className="px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-mono"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-glow rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Configurações de Envio
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Número de envio</Label>
                  <Select>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Selecione o número" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">+55 11 9999-0001</SelectItem>
                      <SelectItem value="2">+55 11 9999-0002</SelectItem>
                      <SelectItem value="3">+55 11 9999-0003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Menções</Label>
                  <Select value={mentionAll ? "all" : "none"} onValueChange={(v) => setMentionAll(v === "all")}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem menção</SelectItem>
                      <SelectItem value="all">Mencionar todos</SelectItem>
                      <SelectItem value="admins">Somente admins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Delay entre grupos: {delay[0]}s
                </Label>
                <Slider
                  value={delay}
                  onValueChange={setDelay}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <p className="text-[10px] text-muted-foreground">
                  Tempo estimado: {selectedGroups.length > 0 ? `${(selectedGroups.length * delay[0] / 60).toFixed(1)} min` : "—"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-border text-foreground">
                <Clock className="h-4 w-4 mr-2" />
                Agendar
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
                disabled={selectedGroups.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Agora ({selectedGroups.length} grupos)
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BroadcastPage;
