"use client"

import { useEffect, useState } from "react"
import {
  LiveKitRoom as LiveKitRoomComponent,
  VideoConference,
  RoomAudioRenderer,
  useParticipants,
  Chat,
  ConnectionStateToast,
} from "@livekit/components-react"
import "@livekit/components-styles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LiveKitRoomProps {
  gameId: string
  userId: string
  username: string
  isPlayer: boolean
}

function RoomStats() {
  const participants = useParticipants()
  const players = participants.filter((p) => p.metadata?.includes("player"))
  const spectators = participants.filter((p) => !p.metadata?.includes("player"))

  return (
    <div className="flex gap-2 mb-4">
      <Badge variant="secondary">{players.length} Jugadores</Badge>
      <Badge variant="outline">{spectators.length} Espectadores</Badge>
    </div>
  )
}

export function LiveKitRoom({ gameId, userId, username, isPlayer }: LiveKitRoomProps) {
  const [token, setToken] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/livekit-token?room=${gameId}&username=${username}&userId=${userId}`)
        const data = await response.json()
        setToken(data.token)
      } catch (error) {
        console.error("Error fetching LiveKit token:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [gameId, userId, username])

  if (isLoading || !token) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">🔴 Video en Vivo</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-white/80 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-2"></div>
            Conectando al video...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white">🔴 Video en Vivo</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <LiveKitRoomComponent
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          className="h-full"
          data-lk-theme="dark"
          options={{
            publishDefaults: {
              videoCodec: "h264",
              videoResolution: {
                width: 1280,
                height: 720,
                frameRate: 30,
              },
              audioBitrate: 128000,
            },
          }}
          connectOptions={{
            autoSubscribe: true,
          }}
        >
          <RoomStats />

          {/* Configuración personalizada para el juego */}
          <div className="grid grid-cols-1 gap-4">
            {/* Video principal */}
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: "300px" }}>
              <VideoConference chatMessageFormatter={(message) => `${message.from?.name}: ${message.message}`} />
            </div>

            {/* Chat integrado */}
            <div className="h-48 bg-black/20 rounded-lg overflow-hidden">
              <Chat
                style={{ height: "100%" }}
                messageFormatter={(message) => ({
                  ...message,
                  showName: true,
                  showTimestamp: true,
                })}
              />
            </div>
          </div>

          <RoomAudioRenderer />
          <ConnectionStateToast />
        </LiveKitRoomComponent>
      </CardContent>
    </Card>
  )
}
