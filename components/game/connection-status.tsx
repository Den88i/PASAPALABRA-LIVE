"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Signal } from "lucide-react"

interface ConnectionStatusProps {
  isConnected: boolean
  quality?: "excellent" | "good" | "fair" | "poor"
}

export function ConnectionStatus({ isConnected, quality = "good" }: ConnectionStatusProps) {
  const [networkSpeed, setNetworkSpeed] = useState<string>("Midiendo...")

  useEffect(() => {
    // Simular medición de velocidad de red
    const measureNetworkSpeed = () => {
      const connection = (navigator as any).connection
      if (connection) {
        const speed = connection.downlink
        if (speed >= 10) setNetworkSpeed("Excelente")
        else if (speed >= 5) setNetworkSpeed("Buena")
        else if (speed >= 1) setNetworkSpeed("Regular")
        else setNetworkSpeed("Lenta")
      } else {
        setNetworkSpeed("Desconocida")
      }
    }

    measureNetworkSpeed()
    const interval = setInterval(measureNetworkSpeed, 10000) // Cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  const getQualityColor = () => {
    switch (quality) {
      case "excellent":
        return "bg-green-600"
      case "good":
        return "bg-blue-600"
      case "fair":
        return "bg-yellow-600"
      case "poor":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getQualityIcon = () => {
    if (!isConnected) return <WifiOff className="h-3 w-3" />

    switch (quality) {
      case "excellent":
      case "good":
        return <Wifi className="h-3 w-3" />
      default:
        return <Signal className="h-3 w-3" />
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${getQualityColor()} text-white flex items-center gap-1`}>
        {getQualityIcon()}
        {isConnected ? "Conectado" : "Desconectado"}
      </Badge>
      <span className="text-xs text-white/60">Red: {networkSpeed}</span>
    </div>
  )
}
