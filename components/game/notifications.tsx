"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCircle, XCircle, Info } from "lucide-react"

export function Notifications() {
  const notifications = [
    { id: "1", type: "success", message: "¡Respuesta correcta! +10 puntos", time: "Hace 1 min" },
    { id: "2", type: "info", message: "Turno del oponente", time: "Hace 2 min" },
    { id: "3", type: "error", message: "Respuesta incorrecta", time: "Hace 3 min" },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "error":
        return <XCircle className="h-3 w-3 text-red-500" />
      default:
        return <Info className="h-3 w-3 text-blue-500" />
    }
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {notifications.map((notification) => (
            <div key={notification.id} className="flex items-start gap-2 p-2 bg-white/5 rounded text-xs">
              {getIcon(notification.type)}
              <div className="flex-1">
                <p className="text-white">{notification.message}</p>
                <p className="text-white/50 text-xs">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
