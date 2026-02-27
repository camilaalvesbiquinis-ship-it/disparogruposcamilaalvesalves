import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw, CheckCircle2, Smartphone, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Step = "generating" | "ready" | "scanning" | "connected" | "error";

interface QrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (number: string, device: string) => void;
}

export function QrCodeDialog({ open, onOpenChange, onConnected }: QrCodeDialogProps) {
  const [step, setStep] = useState<Step>("generating");
  const [qrBase64, setQrBase64] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const fetchQrCode = useCallback(async () => {
    setStep("generating");
    setErrorMsg("");
    try {
      const { data, error } = await supabase.functions.invoke("zapi-qrcode", {
        body: { action: "qrcode" },
      });

      if (error) throw new Error(error.message || "Erro ao gerar QR Code");

      if (data?.qrcode) {
        const qr = data.qrcode;
        setQrBase64(qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`);
        setStep("ready");
      } else if (data?.connected) {
        setStep("connected");
        checkPhoneInfo();
      } else if (data?.error) {
        throw new Error(`${data.error}${data.hint ? `\n${data.hint}` : ""}${data.details ? `\n\nDetalhes: ${data.details}` : ""}`);
      } else {
        throw new Error("QR Code não disponível. Verifique sua instância Z-API.");
      }
    } catch (e: unknown) {
      console.error("QR fetch error:", e);
      setErrorMsg(e instanceof Error ? e.message : "Erro desconhecido");
      setStep("error");
    }
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const { data } = await supabase.functions.invoke("zapi-qrcode", {
        body: { action: "status" },
      });

      if (data?.connected) {
        stopPolling();
        setStep("connected");
        checkPhoneInfo();
      }
    } catch {
      // ignore polling errors
    }
  }, [stopPolling]);

  const checkPhoneInfo = async () => {
    try {
      const { data } = await supabase.functions.invoke("zapi-qrcode", {
        body: { action: "device" },
      });
      console.log("Device info:", data);
      const phone = data?.phone || "Número conectado";
      const deviceModel = data?.device?.device_model || data?.device?.device_manufacturer || "WhatsApp";

      setTimeout(() => {
        onConnected(phone, deviceModel);
        onOpenChange(false);
      }, 2000);
    } catch {
      onConnected("Número conectado", "WhatsApp");
      setTimeout(() => onOpenChange(false), 2000);
    }
  };

  useEffect(() => {
    if (open) {
      fetchQrCode();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [open, fetchQrCode, stopPolling]);

  // Start polling when QR is ready
  useEffect(() => {
    if (step === "ready") {
      pollRef.current = setInterval(checkStatus, 3000);
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [step, checkStatus, stopPolling]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Conectar Número
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-4">
          {step === "generating" && (
            <>
              <div className="h-52 w-52 rounded-xl bg-secondary/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Gerando QR Code via Z-API...</p>
            </>
          )}

          {step === "ready" && qrBase64 && (
            <>
              <div className="p-3 rounded-xl bg-white">
                <img
                  src={qrBase64}
                  alt="QR Code WhatsApp"
                  className="h-52 w-52 object-contain"
                />
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm text-foreground font-medium">Escaneie o QR Code</p>
                <p className="text-xs text-muted-foreground">
                  Abra o WhatsApp → Menu → Dispositivos Conectados → Conectar
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Aguardando escaneamento...
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full border-border text-foreground"
                onClick={fetchQrCode}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Gerar Novo QR Code
              </Button>
            </>
          )}

          {step === "error" && (
            <>
              <div className="h-auto min-h-[13rem] w-full rounded-xl bg-destructive/10 flex flex-col items-center justify-center gap-3 p-4">
                <AlertTriangle className="h-10 w-10 text-destructive" />
                <p className="text-xs text-center text-destructive whitespace-pre-wrap max-w-sm">{errorMsg}</p>
              </div>
              <Button
                size="sm"
                className="w-full bg-primary text-primary-foreground"
                onClick={fetchQrCode}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Tentar Novamente
              </Button>
            </>
          )}

          {step === "connected" && (
            <>
              <div className="h-52 w-52 rounded-xl bg-success/10 flex flex-col items-center justify-center gap-3">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm text-foreground font-medium">Conectado com sucesso!</p>
                <p className="text-xs text-muted-foreground">Seu número está pronto para uso</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
