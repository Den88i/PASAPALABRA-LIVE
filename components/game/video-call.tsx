"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WebRTCManager } from "@/lib/webrtc"

interface VideoCallProps {
  gameId: string
  userId: string
  isPlayer: boolean
  audioEnabled: boolean
  videoEnabled: boolean
}

export function VideoCall({ gameId, userId, isPlayer, audioEnabled, videoEnabled }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const webrtcManager = useRef<WebRTCManager | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [remoteUsers, setRemoteUsers] = useState<string[]>([])

  useEffect(() => {
    initializeWebRTC()
    return () => {
      webrtcManager.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (webrtcManager.current && localVideoRef.current) {
      // Actualizar configuración de audio/video
      webrtcManager.current.initializeMedia(videoEnabled, audioEnabled).then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      })
    }
  }, [audioEnabled, videoEnabled])

  const initializeWebRTC = async () => {
    try {
      webrtcManager.current = new WebRTCManager()

      // Configurar callbacks
      webrtcManager.current.onRemoteStream = (peerId: string, stream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream
        }
        setRemoteUsers((prev) => [...prev.filter((id) => id !== peerId), peerId])
      }

      webrtcManager.current.onUserLeft = (peerId: string) => {
        setRemoteUsers((prev) => prev.filter((id) => id !== peerId))
      }

      // Inicializar medios
      const stream = await webrtcManager.current.initializeMedia(videoEnabled, audioEnabled)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Unirse a la sala
      await webrtcManager.current.joinRoom(gameId, isPlayer)
      setIsConnected(true)
    } catch (error) {
      console.error("Error initializing WebRTC:", error)
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          Video en Vivo
          <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Conectado" : "Desconectado"}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video local (si es jugador) */}
        {isPlayer && (
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-32 bg-black rounded-lg object-cover"
            />
            <Badge className="absolute top-2 left-2 bg-blue-600">Tú</Badge>
          </div>
        )}

        {/* Video remoto */}
        <div className="relative">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg object-cover" />
          {remoteUsers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white/60">
              Esperando jugadores...
            </div>
          )}
          {remoteUsers.length > 0 && <Badge className="absolute top-2 left-2 bg-green-600">Oponente</Badge>}
        </div>

        {/* Espectadores */}
        {!isPlayer && (
          <div className="text-center text-white/80 text-sm">
            <p>Modo Espectador</p>
            <p>{remoteUsers.length} jugadores conectados</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
