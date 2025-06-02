"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Server } from "lucide-react"

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [serverStatus, setServerStatus] = useState<"online" | "offline" | "checking">("checking")

  useEffect(() => {
    // Verificar estado de conexión
    const checkConnection = () => {
      setIsOnline(navigator.onLine)
    }

    // Verificar estado del servidor
    const checkServerStatus = async () => {
      try {
        const response = await fetch("/api/health", { method: "HEAD" })
        setServerStatus(response.ok ? "online" : "offline")
      } catch {
        setServerStatus("offline")
      }
    }

    checkConnection()
    checkServerStatus()

    // Listeners para cambios de conexión
    window.addEventListener("online", checkConnection)
    window.addEventListener("offline", checkConnection)

    // Verificar servidor cada 30 segundos
    const interval = setInterval(checkServerStatus, 30000)

    return () => {
      window.removeEventListener("online", checkConnection)
      window.removeEventListener("offline", checkConnection)
      clearInterval(interval)
    }
  }, [])

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Estado de Conexión</h3>
          <div className="flex items-center gap-4">
            {/* Estado de Internet */}
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
              <Badge className={isOnline ? "bg-green-600" : "bg-red-600"}>{isOnline ? "Online" : "Offline"}</Badge>
            </div>

            {/* Estado del Servidor */}
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-500" />
              <Badge
                className={
                  serverStatus === "online"
                    ? "bg-green-600"
                    : serverStatus === "offline"
                      ? "bg-red-600"
                      : "bg-yellow-600"
                }
              >
                {serverStatus === "online"
                  ? "Servidor OK"
                  : serverStatus === "offline"
                    ? "Servidor Error"
                    : "Verificando..."}
              </Badge>
            </div>
          </div>
        </div>

        {!isOnline && (
          <div className="mt-2 text-sm text-red-400">
            ⚠️ Sin conexión a Internet. Algunas funciones pueden no estar disponibles.
          </div>
        )}

        {serverStatus === "offline" && (
          <div className="mt-2 text-sm text-red-400">
            ⚠️ Problemas de conexión con el servidor. Reintentando automáticamente...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
