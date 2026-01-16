"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import { Loader2, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (code: string) => void;
  resetScan: () => void;
}

export default function QRScanner({ onScan, resetScan }: QRScannerProps) {
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const startScanner = () => {
    setLoading(true);
    setIsScanning(true);
    resetScan();

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        const lastPart = decodedText;

        onScan(lastPart);

        stopScanner();
      },
      (error) => {
        // errores normales de lectura
      }
    );

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setIsScanning(false);
    setLoading(false);
  };

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => { });
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div id="reader"></div>
      {!isScanning ? (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <div className="p-6 bg-muted/30 rounded-full">
            <Camera className="w-12 h-12 text-muted-foreground" />
          </div>
          <Button onClick={startScanner} size="lg">
            <Camera className="w-4 h-4 mr-2" />
            Iniciar Escáner
          </Button>
        </div>
      ) : (
        <>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg min-h-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Iniciando cámara...</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}