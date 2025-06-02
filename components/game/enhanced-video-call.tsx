"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EnhancedWebRTCManager } from "@/lib/webrtc-enhanced"
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react"

interface EnhancedVideoCallProps {
  gameId: string
  userId: string
  username: string
  isPlayer: boolean
  audioEnabled: boolean
  videoEnabled: boolean
  onAudioToggle: (enabled: boolean) => void
  onVideoToggle: (enabled: boolean) => void
}

export function EnhancedVideoCall({
  gameId,
  userId,
  username,
  isPlayer,
  audioEnabled,
  videoEnabled,
  onAudioToggle,
  onVideoToggle,
}: EnhancedVideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const webrtcManager = useRef<EnhancedWebRTCManager | null>(null)

  const [connectionState, setConnectionState] = useState<"disconnected" | "connecting" | "connected">("disconnected")
  const [remoteUsers, setRemoteUsers] = useState<any[]>([])
  const [roomStats, setRoomStats] = useState({ players: 0, spectators: 0 })
  const [networkQuality, setNetworkQuality] = useState<"good" | "fair" | "poor">("good")

  useEffect(() => {
    initializeWebRTC()
    return () => {
      webrtcManager.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    if (webrtcManager.current) {
      webrtcManager.current.toggleAudio(audioEnabled)
      webrtcManager.current.toggleVideo(videoEnabled)
    }
  }, [audioEnabled, videoEnabled])

  const initializeWebRTC = async () => {
    try {
      setConnectionState("connecting")
      webrtcManager.current = new EnhancedWebRTCManager()

      // Configurar callbacks
      webrtcManager.current.onRemoteStream = (peerId: string, stream: MediaStream) => {
        console.log("Stream remoto recibido:", peerId)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream
        }
        setRemoteUsers((prev) => {
          const filtered = prev.filter((u) => u.id !== peerId)
          return [...filtered, { id: peerId, stream }]
        })
      }

      webrtcManager.current.onUserJoined = (user: any) => {
        console.log("Usuario se unió:", user)
      }

      webrtcManager.current.onUserLeft = (userId: string) => {
        console.log("Usuario se fue:", userId)
        setRemoteUsers((prev) => prev.filter((u) => u.id !== userId))
      }

      webrtcManager.current.onRoomStateUpdate = (room: any) => {
        setRoomStats({
          players: room.players?.length || 0,
          spectators: room.spectators?.length || 0,
        })
      }

      webrtcManager.current.onPeerConnected = (peerId: string) => {
        setConnectionState("connected")
        setNetworkQuality("good")
      }

      webrtcManager.current.onPeerDisconnected = (peerId: string) => {
        setNetworkQuality("poor")
      }

      // Inicializar medios
      const stream = await webrtcManager.current.initializeMedia(videoEnabled, audioEnabled)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Unirse a la sala
      await webrtcManager.current.joinRoom(gameId, userId, username, isPlayer)

      if (!isPlayer) {
        setConnectionState("connected")
      }
    } catch (error) {
      console.error("Error inicializando WebRTC:", error)
      setConnectionState("disconnected")
    }
  }

  const handleDisconnect = () => {
    webrtcManager.current?.disconnect()
    setConnectionState("disconnected")
    setRemoteUsers([])
  }

  const getConnectionBadgeColor = () => {
    switch (connectionState) {
      case "connected":
        return "bg-green-600"
      case "connecting":
        return "bg-yellow-600"
      default:
        return "bg-red-600"
    }
  }

  const getNetworkQualityColor = () => {
    switch (networkQuality) {
      case "good":
        return "text-green-500"
      case "fair":
        return "text-yellow-500"
      default:
        return "text-red-500"
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Video en Vivo</span>
          <div className="flex items-center gap-2">
            <Badge className={`${getConnectionBadgeColor()} text-white`}>
              {connectionState === "connected"
                ? "Conectado"
                : connectionState === "connecting"
                  ? "Conectando..."
                  : "Desconectado"}
            </Badge>
            <div className={`w-2 h-2 rounded-full ${getNetworkQualityColor()}`} />
          </div>
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
            <Badge className="absolute top-2 left-2 bg-blue-600">{username} (Tú)</Badge>
            {!videoEnabled && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                <VideoOff className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
        )}

        {/* Video remoto */}
        <div className="relative">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg object-cover" />
          {remoteUsers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white/60 bg-black/50 rounded-lg">
              <div className="text-center">
                <Video className="h-8 w-8 mx-auto mb-2" />
                <p>Esperando jugadores...</p>
              </div>
            </div>
          )}
          {remoteUsers.length > 0 && <Badge className="absolute top-2 left-2 bg-green-600">Oponente</Badge>}
        </div>

        {/* Controles de video (solo para jugadores) */}
        {isPlayer && (
          <div className="flex justify-center gap-2">
            <Button
              variant={audioEnabled ? "default" : "destructive"}
              size="icon"
              onClick={() => onAudioToggle(!audioEnabled)}
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
            <Button
              variant={videoEnabled ? "default" : "destructive"}
              size="icon"
              onClick={() => onVideoToggle(!videoEnabled)}
            >
              {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDisconnect}>
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Estadísticas de la sala */}
        <div className="text-center text-white/80 text-sm space-y-1">
          <p>
            {roomStats.players} jugadores • {roomStats.spectators} espectadores
          </p>
          <div className="flex items-center justify-center gap-2">
            <span>Calidad de red:</span>
            <span className={getNetworkQualityColor()}>
              {networkQuality === "good" ? "Excelente" : networkQuality === "fair" ? "Regular" : "Pobre"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
