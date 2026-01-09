"use client"

import { useState } from "react"
import { QrCode, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { mockOrders } from "@/lib/mock-admin-data"
import QRScanner from "@/components/admin/scanner/qr-scanner"
import { scanTicket } from "./actions"
import type { ScanResult } from "@/types/admin"


export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)



  const handleQRScanned = async (code: string) => {
    setIsScanning(true);
    const data = await scanTicket(code)
    setIsScanning(false);
    setScanResult(data)
  }
  const resetScanner = () => {
    setScanResult(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <QrCode className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Scanner de Tickets</h1>
        <p className="text-muted-foreground mt-2">Escanea el código QR de los tickets para validar el ingreso</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Estadísticas de Hoy</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              {mockOrders.flatMap((o) => o.tickets).filter((t) => t.scanned).length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Tickets Escaneados</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-muted-foreground">{mockOrders.flatMap((o) => o.tickets).length}</p>
            <p className="text-sm text-muted-foreground mt-1">Total de Tickets</p>
          </div>
        </div>
      </div>

      {/* Scanner Form */}
      <div className="bg-card border border-border rounded-lg p-6 relative">
        <QRScanner onScan={handleQRScanned} resetScan={resetScanner} />

        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Comprobando...</p>
            </div>
          </div>
        )}
      </div>

      {/* Scan Result */}
      {scanResult && (
        <div
          className={`bg-card border-2 rounded-lg p-6 ${scanResult.success
            ? "border-green-500 dark:border-green-600"
            : scanResult.ticket?.alreadyScanned
              ? "border-yellow-500 dark:border-yellow-600"
              : "border-red-500 dark:border-red-600"
            }`}
        >
          <div className="flex items-start gap-4 mb-4">
            {scanResult.success ? (
              <div className="p-3 bg-green-100 dark:bg-green-950 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            ) : scanResult.ticket?.alreadyScanned ? (
              <div className="p-3 bg-yellow-100 dark:bg-yellow-950 rounded-full">
                <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            ) : (
              <div className="p-3 bg-red-100 dark:bg-red-950 rounded-full">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            )}
            <div className="flex-1">
              <h3
                className={`text-xl font-bold mb-1 ${scanResult.success
                  ? "text-green-600 dark:text-green-400"
                  : scanResult.ticket?.alreadyScanned
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                  }`}
              >
                {scanResult.success
                  ? "Acceso Autorizado"
                  : scanResult.ticket?.alreadyScanned
                    ? "Advertencia"
                    : "Acceso Denegado"}
              </h3>
              <p className="text-muted-foreground">{scanResult.message}</p>
            </div>
          </div>

          {scanResult.ticket && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Ticket ID</p>
                  <p className="font-medium">{scanResult.ticket.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Orden ID</p>
                  <p className="font-medium">{scanResult.ticket.orderId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-medium">{scanResult.ticket.customerName}</p>
                </div>
                {scanResult.ticket.seatNumber && (
                  <div>
                    <p className="text-muted-foreground">Asiento</p>
                    <p className="font-medium">{scanResult.ticket.seatNumber}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-muted-foreground text-sm mb-1">Información del Show</p>
                <p className="font-semibold text-lg">{scanResult.ticket.showTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {scanResult.ticket.date} a las {scanResult.ticket.time}
                </p>
              </div>

              {scanResult.ticket.alreadyScanned && scanResult.ticket.scannedAt && (
                <div className="border-t border-border pt-3">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Escaneado anteriormente el {scanResult.ticket.scannedAt.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
