"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Download, Filter } from "lucide-react"
import type { Order } from "@/types/admin"
import { formatPrice } from "@/lib/format"
import { parseLocalDate } from "@/lib/cart-utils"

interface OrdenesPageProps {
  orders: Order[]
}

export function OrdenesPage({ orders }: OrdenesPageProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerDni.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.play.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const downloadOrder = (order: Order) => {
    const orderData = {
      orderId: order.id,
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        dni: order.customerDni,
        phone: order.customerPhone,
      },
      show: order.play,
      performance: {
        id: order.performance.id,
        date: order.performance.date,
        time: order.performance.time,
      },
      tickets: order.tickets.map((t) => ({
        id: t.id,
        qrCode: t.qrCode,
        sectionName: t.sectionName,
        seatNumber: t.seatNumber,
        scanned: t.scanned,
        scannedAt: t.scannedAt,
      })),
      payment: {
        quantity: order.ticketQuantity,
        subtotal: order.subtotal,
        discount: order.discount,
        discountType: order.discountType,
        total: order.total,
      },
      status: order.status,
      createdAt: order.createdAt,
    }

    const dataStr = JSON.stringify(orderData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `order-${order.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pagada"
      case "pending":
        return "Pendiente"
      case "cancelled":
        return "Cancelada"
      default:
        return status
    }
  }

  const getStatusClassName = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Órdenes de Compra</h1>
        <p className="text-muted-foreground mt-1">Gestiona todas las órdenes y ventas</p>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por ID, nombre, email, DNI u obra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-background border border-input rounded-md"
            >
              <option value="all">Todos los estados</option>
              <option value="paid">Pagadas</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Canceladas</option>
            </select>
            <Button variant="outline" className="gap bg-transparent">
              <Filter className="w-4 h-4" />
              Filtrar
            </Button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Órdenes</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Tickets</p>
          <p className="text-2xl font-bold">{orders.reduce((sum, o) => sum + o.ticketQuantity, 0)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Recaudado</p>
          <p className="text-2xl font-bold">{formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}</p>
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">DNI</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Obra</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tickets</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm">{order.customerName}</td>
                  <td className="p-4 text-sm text-muted-foreground">{order.customerEmail}</td>
                  <td className="p-4 text-sm font-medium">{order.customerDni}</td>
                  <td className="p-4 text-sm">{order.play}</td>
                  <td className="p-4 text-sm">{order.ticketQuantity}</td>
                  <td className="p-4 text-sm font-medium">{formatPrice(order.total)}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClassName(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {order.createdAt.toLocaleDateString("es-ES")}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => downloadOrder(order)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="flex justify-center items-center p-8">
              <div className="text-center">
                <p className="text-muted-foreground">No se encontraron órdenes</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm || filterStatus !== "all" 
                    ? "Intenta con otros criterios de búsqueda" 
                    : "Aún no hay órdenes registradas"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Detalles de la Orden</h2>
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                Cerrar
              </Button>
            </div>

            <div className="space-y-6">
              {/* Info de la Obra */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Información de la Función</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Obra:</span> <strong>{selectedOrder.play}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Fecha:</span>{" "}
                    {parseLocalDate(selectedOrder.performance.date).toLocaleDateString("es-ES", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Horario:</span> {selectedOrder.performance.time} hs
                  </p>
                </div>
              </div>

              {/* Info del Cliente */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Información del Cliente</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Nombre:</span> {selectedOrder.customerName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email:</span> {selectedOrder.customerEmail}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Teléfono:</span> {selectedOrder.customerPhone}
                  </p>
                  <p>
                    <span className="text-muted-foreground">DNI:</span> {selectedOrder.customerDni}
                  </p>
                </div>
              </div>

              {/* Info del Pago */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Información del Pago</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cantidad de Tickets:</span>
                    <span>{selectedOrder.ticketQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Descuento ({selectedOrder.discountType}):</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total:</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Tickets */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Tickets</h3>
                <div className="space-y-3">
                  {selectedOrder.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between bg-background p-3 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Sección: {ticket.sectionName}</p>
                        <p className="text-xs text-muted-foreground">QR: {ticket.qrCode.substring(0, 8)}...</p>
                        {ticket.seatNumber && (
                          <p className="text-xs text-muted-foreground">Asiento: {ticket.seatNumber}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {ticket.scanned ? (
                          <div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                              Escaneado ✓
                            </span>
                            {ticket.scannedAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {ticket.scannedAt.toLocaleString("es-ES")}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={() => downloadOrder(selectedOrder)} className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                Descargar Orden
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}