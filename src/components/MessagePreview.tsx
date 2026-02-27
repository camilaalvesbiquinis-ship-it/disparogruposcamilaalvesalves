import { Check, Eye } from "lucide-react";
import { format } from "date-fns";

interface MessagePreviewProps {
  message: string;
  previewUrl?: string;
  mentionAll?: boolean;
}

const MessagePreview = ({ message, previewUrl, mentionAll }: MessagePreviewProps) => {
  const now = format(new Date(), "HH:mm");
  const hasContent = message || previewUrl;

  // Replace variables with example values for preview
  const previewMessage = message
    .replace(/\{nome_grupo\}/g, "Grupo Exemplo")
    .replace(/\{categoria\}/g, "varejo")
    .replace(/\{data\}/g, format(new Date(), "dd/MM/yyyy"));

  return (
    <div className="card-glow rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Eye className="h-4 w-4 text-primary" />
        Preview da Mensagem
      </h3>

      {/* WhatsApp-style chat background */}
      <div
        className="rounded-lg p-4 min-h-[200px] flex items-end justify-end"
        style={{
          backgroundColor: "hsl(var(--secondary) / 0.5)",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      >
        {hasContent ? (
          <div className="max-w-[85%] rounded-lg overflow-hidden shadow-md bg-primary/15 border border-primary/10">
            {/* Image */}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Anexo"
                className="w-full max-h-48 object-cover"
              />
            )}

            {/* Message body */}
            <div className="px-3 py-2 space-y-1">
              {mentionAll && (
                <p className="text-[11px] font-semibold text-primary">@todos</p>
              )}
              {previewMessage && (
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {previewMessage}
                </p>
              )}
              <div className="flex items-center justify-end gap-1">
                <span className="text-[10px] text-muted-foreground">{now}</span>
                <div className="flex">
                  <Check className="h-3 w-3 text-primary" />
                  <Check className="h-3 w-3 -ml-1.5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center py-10">
            <p className="text-xs text-muted-foreground">
              Digite uma mensagem para ver o preview
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePreview;
