import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Send, ImageIcon, FileText, Video, Link2, AtSign, Clock, Zap, Loader2, Upload, X, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { useConnections } from "@/hooks/useConnections";
import { useAddBroadcast } from "@/hooks/useBroadcasts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logAuditAction } from "@/lib/audit";
import { sanitizeText, containsSQLInjection } from "@/lib/validation";
import MessagePreview from "@/components/MessagePreview";

const contentTypes = [
  { id: "text", label: "Texto", icon: FileText },
  { id: "image", label: "Imagem", icon: ImageIcon },
  { id: "video", label: "Vídeo", icon: Video },
  { id: "link", label: "Link", icon: Link2 },
];

const BroadcastPage = () => {
  const { data: groups = [] } = useGroups();
  const { data: connections = [] } = useConnections();
  const addBroadcast = useAddBroadcast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [contentType, setContentType] = useState("text");
  const [delay, setDelay] = useState([3]);
  const [mentionAll, setMentionAll] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [improving, setImproving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load cloned broadcast data from query params
  useEffect(() => {
    const msg = searchParams.get("message");
    const ct = searchParams.get("contentType");
    const media = searchParams.get("mediaUrl");
    const mention = searchParams.get("mentionMode");
    const d = searchParams.get("delay");
    const conn = searchParams.get("connectionId");

    if (msg) setMessage(msg);
    if (ct) setContentType(ct);
    if (media) { setMediaUrl(media); setPreviewUrl(media); }
    if (mention === "all") setMentionAll(true);
    if (d) setDelay([Number(d)]);
    if (conn) setConnectionId(conn);

    // Clear params after loading
    if (msg || ct || media) {
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 10MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("broadcast-media")
        .upload(fileName, file, { contentType: file.type });
      if (error) throw error;

      // Use signed URL instead of public URL (bucket is private)
      const { data: signedData, error: signedError } = await supabase.storage
        .from("broadcast-media")
        .createSignedUrl(fileName, 3600); // 1 hour expiry
      if (signedError) throw signedError;

      setMediaUrl(signedData.signedUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setContentType("image");
      toast.success("Imagem enviada!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = () => {
    setMediaUrl("");
    setPreviewUrl("");
    setContentType("text");
  };

  const handleImproveMessage = async () => {
    if (!message.trim()) {
      toast.error("Digite uma mensagem primeiro");
      return;
    }
    setImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke("improve-message", {
        body: { message },
      });
      if (error) throw error;
      if (data?.improved) {
        setMessage(data.improved);
        toast.success("Mensagem melhorada com IA!");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao melhorar mensagem");
    } finally {
      setImproving(false);
    }
  };

  const toggleGroup = (id: string) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (selectedGroups.length === 0 || (!message && !mediaUrl)) {
      toast.error("Selecione grupos e escreva uma mensagem");
      return;
    }

    // Validate and sanitize message
    if (message.length > 4096) {
      toast.error("Mensagem deve ter no máximo 4096 caracteres");
      return;
    }
    if (containsSQLInjection(message)) {
      toast.error("Conteúdo inválido detectado na mensagem");
      return;
    }
    const sanitizedMessage = sanitizeText(message);
    const effectiveContentType = mediaUrl && contentType === "text" ? "image" : contentType;

    setSending(true);
    try {
      // Save broadcast record
      const broadcast = await addBroadcast.mutateAsync({
        title: sanitizedMessage.slice(0, 50) || "Disparo",
        content: sanitizedMessage,
        content_type: effectiveContentType as any,
        media_url: mediaUrl || null,
        connection_id: connectionId || null,
        delay_seconds: delay[0],
        total_groups: selectedGroups.length,
        mention_mode: mentionAll ? "all" : "none",
        status: "sending",
      });

      // Audit log for broadcast creation
      await logAuditAction({
        action: "edit",
        tableName: "broadcasts",
        recordId: broadcast.id,
        details: { groups: selectedGroups.length, contentType: effectiveContentType },
      });

      // Send to each group with delay
      let sentCount = 0;
      for (const groupId of selectedGroups) {
        const group = groups.find((g) => g.id === groupId);
        if (!group) continue;

        try {
          // Extract WhatsApp group identifier from group description (format: "WhatsApp ID: xxx")
          const rawWhatsAppId = group.description?.replace("WhatsApp ID:", "").trim();
          if (!rawWhatsAppId) {
            console.error(`Group ${group.name} has no WhatsApp ID`);
            continue;
          }

          // Support canonical JID, legacy numeric-hyphen and Z-API "-group" formats
          let whatsappId = rawWhatsAppId;
          const isSupportedFormat =
            /^[\d-]+@g\.us$/.test(whatsappId) ||
            /^\d+-\d+$/.test(whatsappId) ||
            /^\d+-group$/.test(whatsappId);

          if (!isSupportedFormat) {
            if (/^[\d-]+$/.test(whatsappId)) {
              whatsappId = `${whatsappId}@g.us`;
            } else {
              console.error(`Group ${group.name} has invalid WhatsApp ID format: ${rawWhatsAppId}`);
              continue;
            }
          }

          const { error } = await supabase.functions.invoke("zapi-send", {
            body: {
              phone: whatsappId,
              message: sanitizedMessage,
              contentType: effectiveContentType,
              mediaUrl: mediaUrl || undefined,
              mentionAll,
            },
          });

          if (error) throw error;
          sentCount++;
        } catch (e) {
          console.error(`Failed to send to group ${group.name}:`, e);
        }

        // Delay between sends
        if (selectedGroups.indexOf(groupId) < selectedGroups.length - 1) {
          await new Promise((r) => setTimeout(r, delay[0] * 1000));
        }
      }

      // Update broadcast status and sent count
      await supabase
        .from("broadcasts")
        .update({
          status: sentCount > 0 ? "sent" : "failed",
          sent_count: sentCount,
        })
        .eq("id", broadcast.id);

      toast.success(`Enviado para ${sentCount}/${selectedGroups.length} grupos!`);
      setSelectedGroups([]);
      setMessage("");
      setMediaUrl("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar");
    } finally {
      setSending(false);
    }
  };

  return (
    <AppLayout wide>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Disparo</h1>
          <p className="text-sm text-muted-foreground">Envie mensagens em massa para seus grupos via Z-API</p>
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
                    <p className="text-xs text-muted-foreground">{group.member_count} membros</p>
                  </div>
                </label>
              ))}
              {groups.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum grupo cadastrado</p>
              )}
            </div>
            {groups.length > 0 && (
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
            )}
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

              {/* Image attachment */}
              {previewUrl ? (
                <div className="relative inline-block">
                  <img src={previewUrl} alt="Anexo" className="h-32 rounded-lg object-cover border border-border" />
                  <button
                    onClick={removeMedia}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {uploading ? "Enviando..." : "Anexar Imagem"}
                  </Button>
                </div>
              )}

              <Textarea
                placeholder={`Digite sua mensagem...\n\nVariáveis disponíveis: {nome_grupo}, {categoria}, {data}`}
                className="min-h-[160px] bg-secondary/50 border-border resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={4096}
              />
              <p className="text-[10px] text-muted-foreground text-right">{message.length}/4096</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Variáveis:</span>
                  {["{nome_grupo}", "{categoria}", "{data}"].map((v) => (
                    <button
                      key={v}
                      className="px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-mono"
                      onClick={() => setMessage((prev) => prev + v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 text-primary hover:bg-primary/10"
                  onClick={handleImproveMessage}
                  disabled={improving || !message.trim()}
                >
                  {improving ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {improving ? "Melhorando..." : "Melhorar com IA"}
                </Button>
              </div>
            </div>

            <MessagePreview
              message={message}
              previewUrl={previewUrl}
              mentionAll={mentionAll}
            />

            <div className="card-glow rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Configurações de Envio
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Número de envio</Label>
                  <Select value={connectionId} onValueChange={setConnectionId}>
                    <SelectTrigger className="bg-secondary/50 border-border">
                      <SelectValue placeholder="Selecione o número" />
                    </SelectTrigger>
                    <SelectContent>
                      {connections.filter(c => c.status === "connected").map((conn) => (
                        <SelectItem key={conn.id} value={conn.id}>
                          {conn.phone_number}
                        </SelectItem>
                      ))}
                      {connections.filter(c => c.status === "connected").length === 0 && (
                        <SelectItem value="_none" disabled>Nenhum número conectado</SelectItem>
                      )}
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
                disabled={selectedGroups.length === 0 || sending || (!message && !mediaUrl)}
                onClick={handleSend}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {sending ? "Enviando..." : `Enviar Agora (${selectedGroups.length} grupos)`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BroadcastPage;
