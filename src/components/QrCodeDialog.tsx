import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, RefreshCw, CheckCircle2, Smartphone, Loader2 } from "lucide-react";

type Step = "generating" | "ready" | "scanning" | "connected";

interface QrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (number: string, device: string) => void;
}

function generateFakeQrMatrix(): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      // Finder patterns (top-left, top-right, bottom-left)
      const inFinderTL = r < 7 && c < 7;
      const inFinderTR = r < 7 && c >= size - 7;
      const inFinderBL = r >= size - 7 && c < 7;
      if (inFinderTL || inFinderTR || inFinderBL) {
        const lr = inFinderBL ? r - (size - 7) : r;
        const lc = inFinderTR ? c - (size - 7) : c;
        const border = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const inner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        row.push(border || inner);
      } else {
        row.push(Math.random() > 0.5);
      }
    }
    matrix.push(row);
  }
  return matrix;
}

export function QrCodeDialog({ open, onOpenChange, onConnected }: QrCodeDialogProps) {
  const [step, setStep] = useState<Step>("generating");
  const [qrMatrix, setQrMatrix] = useState<boolean[][]>([]);
  const [timer, setTimer] = useState(60);

  const resetFlow = useCallback(() => {
    setStep("generating");
    setTimer(60);
    setTimeout(() => {
      setQrMatrix(generateFakeQrMatrix());
      setStep("ready");
    }, 1500);
  }, []);

  useEffect(() => {
    if (open) resetFlow();
  }, [open, resetFlow]);

  // Countdown timer when QR is ready
  useEffect(() => {
    if (step !== "ready") return;
    if (timer <= 0) {
      resetFlow();
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer, resetFlow]);

  const simulateScan = () => {
    setStep("scanning");
    setTimeout(() => {
      setStep("connected");
      setTimeout(() => {
        const numbers = ["+55 21 9888-0004", "+55 31 9777-0005", "+55 41 9666-0006"];
        const devices = ["Pixel 8 Pro", "Galaxy A54", "Motorola Edge 40"];
        const idx = Math.floor(Math.random() * numbers.length);
        onConnected(numbers[idx], devices[idx]);
        onOpenChange(false);
      }, 2000);
    }, 2500);
  };

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
              <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
            </>
          )}

          {step === "ready" && (
            <>
              <div
                className="relative p-3 rounded-xl bg-foreground cursor-pointer group"
                onClick={simulateScan}
                title="Clique para simular escaneamento"
              >
                <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${qrMatrix.length}, 1fr)` }}>
                  {qrMatrix.flat().map((filled, i) => (
                    <div
                      key={i}
                      className={`w-[7px] h-[7px] ${filled ? "bg-background" : "bg-foreground"}`}
                    />
                  ))}
                </div>
                {/* Scan line animation overlay */}
                <div className="absolute inset-3 overflow-hidden rounded pointer-events-none">
                  <div className="absolute left-0 right-0 h-0.5 bg-primary/60 animate-pulse-glow" style={{ top: "50%" }} />
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-primary-foreground opacity-0 group-hover:opacity-80 transition-opacity" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm text-foreground font-medium">Escaneie o QR Code</p>
                <p className="text-xs text-muted-foreground">
                  Abra o WhatsApp → Menu → Dispositivos Conectados → Conectar
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  Expira em {timer}s
                </p>
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-border text-foreground"
                  onClick={resetFlow}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Gerar Novo
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={simulateScan}
                >
                  <Smartphone className="h-3.5 w-3.5 mr-1.5" />
                  Simular Conexão
                </Button>
              </div>
            </>
          )}

          {step === "scanning" && (
            <>
              <div className="h-52 w-52 rounded-xl bg-secondary/50 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                  <span className="text-xs text-muted-foreground">Escaneamento detectado</span>
                </div>
              </div>
              <p className="text-sm text-foreground font-medium">Autenticando dispositivo...</p>
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
