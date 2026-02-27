import { AppLayout } from "@/components/AppLayout";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mail, Search, ImageIcon, Video, FileText, Link2, Clock, CheckCircle2, XCircle, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  sent: { label: "Enviado", icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  sending: { label: "Enviando", icon: Loader2, className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  draft: { label: "Rascunho", icon: FileText, className: "bg-muted text-muted-foreground border-border" },
  failed: { label: "Falhou", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
  scheduled: { label: "Agendado", icon: Clock, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
};

const typeIcons: Record<string, React.ElementType> = {
  text: FileText,
  image: ImageIcon,
  video: Video,
  link: Link2,
};

const MessagesPage = () => {
  const { data: broadcasts = [], isLoading } = useBroadcasts();
  const [search, setSearch] = useState("");

  const filtered = broadcasts.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.content?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mensagens</h1>
          <p className="text-sm text-muted-foreground">Histórico de mensagens enviadas</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar mensagens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-border"
            />
          </div>
          <span className="text-sm text-muted-foreground">{filtered.length} mensagens</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? "Nenhuma mensagem encontrada" : "Nenhuma mensagem enviada ainda"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => {
              const st = statusConfig[b.status] ?? statusConfig.draft;
              const StatusIcon = st.icon;
              const TypeIcon = typeIcons[b.content_type] ?? FileText;

              return (
                <div
                  key={b.id}
                  className="card-glow rounded-xl p-4 flex items-start gap-4 hover:border-primary/20 transition-colors"
                >
                  {b.media_url ? (
                    <img
                      src={b.media_url}
                      alt=""
                      className="h-14 w-14 rounded-lg object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <TypeIcon className="h-6 w-6 text-primary" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">{b.title}</h3>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${st.className}`}>
                        <StatusIcon className={`h-3 w-3 mr-1 ${b.status === "sending" ? "animate-spin" : ""}`} />
                        {st.label}
                      </Badge>
                    </div>
                    {b.content && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{b.content}</p>
                    )}
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Send className="h-3 w-3" />
                        {b.sent_count}/{b.total_groups} grupos
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(b.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MessagesPage;
