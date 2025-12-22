"use client"

import { StatCard } from "@/components/admin/stat-card"
import { DollarSign, Calendar, Ticket, TrendingUp } from "lucide-react"
import { mockOrders, mockFunctions } from "@/lib/mock-admin-data"
import { formatPrice } from "@/lib/format"

export default function AdminDashboardPage() {
  // Calcular estadísticas
  const totalSales = mockOrders.reduce((sum, order) => sum + order.finalAmount, 0)

  const todayFunctions = mockFunctions.filter((func) => {
    const today = new Date()
    const funcDate = new Date(func.date)
    return (
      funcDate.getDate() === today.getDate() &&
      funcDate.getMonth() === today.getMonth() &&
      funcDate.getFullYear() === today.getFullYear()
    )
  })

  const allTickets = mockOrders.flatMap((order) => order.tickets)
  const scannedTickets = allTickets.filter((ticket) => ticket.scanned).length
  const totalTickets = allTickets.length

  const scanPercentage = totalTickets > 0 ? Math.round((scannedTickets / totalTickets) * 100) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de la plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas Totales"
          value={formatPrice(totalSales)}
          icon={DollarSign}
          trend={{ value: "12%", positive: true }}
          description="Últimos 30 días"
        />
        <StatCard title="Shows Hoy" value={todayFunctions.length} icon={Calendar} description="Funciones programadas" />
        <StatCard
          title="Tickets Escaneados"
          value={`${scannedTickets}/${totalTickets}`}
          icon={Ticket}
          description={`${scanPercentage}% completado`}
        />
        <StatCard
          title="Tasa de Conversión"
          value="68%"
          icon={TrendingUp}
          trend={{ value: "5%", positive: true }}
          description="Visitantes a compradores"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Órdenes Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tickets</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm font-medium">{order.id}</td>
                  <td className="p-4 text-sm">{order.customerName}</td>
                  <td className="p-4 text-sm">{order.ticketQuantity}</td>
                  <td className="p-4 text-sm font-medium">{formatPrice(order.finalAmount)}</td>
                  <td className="p-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "confirmed"
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                      }`}
                    >
                      {order.status === "confirmed"
                        ? "Confirmada"
                        : order.status === "pending"
                          ? "Pendiente"
                          : "Cancelada"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{order.createdAt.toLocaleDateString("es-ES")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Shows */}
      {todayFunctions.length > 0 && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Shows de Hoy</h2>
          </div>
          <div className="p-6 space-y-4">
            {todayFunctions.map((func) => (
              <div key={func.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Función #{func.id}</h3>
                  <p className="text-sm text-muted-foreground">Hora: {func.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {func.availableSeats} / {func.totalSeats} disponibles
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      func.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                    }`}
                  >
                    {func.status === "active" ? "Activo" : "Agotado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
