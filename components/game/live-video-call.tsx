"use client"

import { useEffect, useState, useRef } from "react"
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useTracks,
  ConnectionStateToast,
  useLocalParticipant,
  VideoTrack,
} from "@livekit/components-react"
import "@livekit/components-styles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Video,
  Users,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  RefreshCw,
  MessageCircle,
  AlertCircle,
  Volume2,
  WifiOff,
  Loader2,
} from "lucide-react"
import { Track } from "livekit-client"
import { LiveKitChat } from "./livekit-chat"

interface LiveVideoCallProps {
  gameId: string
  userId: string
  username: string
  isPlayer: boolean
  isSpectator: boolean
}

function CustomVideoConference({
  userId,
  username,
  isSpectator,
}: { userId: string; username: string; isSpectator: boolean }) {
  const participants = useParticipants()
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone], { onlySubscribed: false })
  const [showChat, setShowChat] = useState(false)
  const { localParticipant } = useLocalParticipant()

  useEffect(() => {
    if (localParticipant) {
      const enableMedia = async () => {
        try {
          if (!isSpectator) {
            await localParticipant.setCameraEnabled(true)
            await localParticipant.setMicrophoneEnabled(true)
            console.log("Jugador: Cámara y micrófono activados.")
          } else {
            await localParticipant.setCameraEnabled(false)
            await localParticipant.setMicrophoneEnabled(false)
            console.log("Espectador: Cámara y micrófono desactivados.")
          }
        } catch (err) {
          console.error("Error al configurar media para participante local:", err)
        }
      }
      // Dar un pequeño tiempo para que el participante se inicialice completamente
      const timer = setTimeout(enableMedia, 1000)
      return () => clearTimeout(timer)
    }
  }, [localParticipant, isSpectator])

  const videoTracks = tracks.filter((trackRef) => trackRef.publication.kind === Track.Kind.Video)
  const audioTracks = tracks.filter((trackRef) => trackRef.publication.kind === Track.Kind.Audio)

  console.log(
    `CustomVideoConference: Participants: ${participants.length}, VideoTracks: ${videoTracks.length}, AudioTracks: ${audioTracks.length}, IsSpectator: ${isSpectator}`,
  )

  return (
    <div className="space-y-4">
      <ParticipantsList participants={participants} tracks={tracks} />

      <div className="space-y-4">
        {videoTracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoTracks.map((trackRef) => (
              <div key={trackRef.participant.identity} className="relative">
                <div className="bg-black rounded-lg overflow-hidden aspect-video">
                  <VideoTrack trackRef={trackRef} className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                  <Badge className="bg-black/70 text-white text-xs">
                    {trackRef.participant.name || trackRef.participant.identity}
                    {trackRef.participant.isLocal && " (Tú)"}
                  </Badge>
                  <div className="flex gap-1">
                    {audioTracks.find(
                      (t) => t.participant.identity === trackRef.participant.identity && !t.publication.isMuted,
                    ) ? (
                      trackRef.participant.isSpeaking ? (
                        <Badge className="bg-green-600 animate-pulse text-xs p-1">🎤</Badge>
                      ) : (
                        <Badge className="bg-blue-600/80 text-xs p-1">
                          <Mic className="h-3 w-3" />
                        </Badge>
                      )
                    ) : (
                      <Badge className="bg-red-600/80 text-xs p-1">
                        <MicOff className="h-3 w-3" />
                      </Badge>
                    )}
                    {!trackRef.publication.isMuted ? (
                      <Badge className="bg-green-600/80 text-xs p-1">
                        <Camera className="h-3 w-3" />
                      </Badge>
                    ) : (
                      <Badge className="bg-red-600/80 text-xs p-1">
                        <CameraOff className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-2 right-2">
                  <div
                    className={`w-2 h-2 rounded-full ${trackRef.participant.isConnected ? "bg-green-500" : "bg-red-500"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-48 bg-black/20 rounded-lg flex items-center justify-center">
            <div className="text-center text-white/60">
              <Video className="h-8 w-8 mx-auto mb-2" />
              {isSpectator ? (
                <>
                  <p>Esperando que los jugadores activen sus cámaras...</p>
                  <p className="text-xs mt-2">Como espectador, solo puedes ver y usar el chat.</p>
                </>
              ) : (
                <>
                  <p>Esperando conexiones de video...</p>
                  <p className="text-xs mt-2">Tu cámara debería activarse automáticamente.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {!isSpectator && <VideoControls />}

      {isSpectator && (
        <div className="bg-blue-600/20 p-3 rounded-lg text-center">
          <p className="text-white text-sm">👁️ Modo Espectador</p>
          <p className="text-white/60 text-xs">Tu cámara y micrófono están desactivados.</p>
          <p className="text-white/60 text-xs mt-1">
            Participantes: {participants.length} | Videos: {videoTracks.length}
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          variant={showChat ? "default" : "outline"}
          size="sm"
          onClick={() => setShowChat(!showChat)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {showChat ? "Ocultar Chat" : "Mostrar Chat"}
        </Button>
      </div>

      {showChat && (
        <div className="h-64 bg-black/20 rounded-lg p-4">
          <LiveKitChat userId={userId} username={username} />
        </div>
      )}
    </div>
  )
}

function ParticipantsList({
  participants,
  tracks,
}: {
  participants: any[]
  tracks: any[]
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-white" />
        <span className="text-white text-sm">{participants.length} conectados</span>
      </div>
      <div className="space-y-2">
        {participants.map((participant) => {
          const audioTrack = tracks.find(
            (trackRef) =>
              trackRef.participant.identity === participant.identity && trackRef.publication.kind === Track.Kind.Audio,
          )
          const videoTrack = tracks.find(
            (trackRef) =>
              trackRef.participant.identity === participant.identity && trackRef.publication.kind === Track.Kind.Video,
          )

          const hasAudio = audioTrack && !audioTrack.publication.isMuted
          const hasVideo = videoTrack && !videoTrack.publication.isMuted

          return (
            <div key={participant.identity} className="flex items-center justify-between p-2 bg-white/5 rounded">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${participant.isConnected ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-white text-sm">{participant.name || participant.identity}</span>
                {participant.isLocal && (
                  <Badge variant="secondary" className="text-xs">
                    Tú
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {participant.isSpeaking && hasAudio ? (
                  <div className="flex items-center gap-1">
                    <Volume2 className="h-3 w-3 text-green-500" />
                  </div>
                ) : hasAudio ? (
                  <Mic className="h-3 w-3 text-blue-500" />
                ) : (
                  <MicOff className="h-3 w-3 text-gray-500" />
                )}
                {hasVideo ? (
                  <Camera className="h-3 w-3 text-blue-500" />
                ) : (
                  <CameraOff className="h-3 w-3 text-gray-500" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function VideoControls() {
  const { localParticipant } = useLocalParticipant()
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)

  useEffect(() => {
    if (localParticipant) {
      setMicEnabled(localParticipant.isMicrophoneEnabled)
      setCameraEnabled(localParticipant.isCameraEnabled)
    }
  }, [localParticipant])

  const toggleMicrophone = async () => {
    if (localParticipant) {
      const newState = !micEnabled
      await localParticipant.setMicrophoneEnabled(newState)
      setMicEnabled(newState)
    }
  }

  const toggleCamera = async () => {
    if (localParticipant) {
      const newState = !cameraEnabled
      await localParticipant.setCameraEnabled(newState)
      setCameraEnabled(newState)
    }
  }

  if (!localParticipant) return null

  return (
    <div className="space-y-4">
      <div className="bg-black/20 p-3 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-medium">Mis Controles</span>
        </div>
        <div className="flex justify-center gap-2">
          <Button
            variant={micEnabled ? "default" : "destructive"}
            size="icon"
            className="h-8 w-8"
            onClick={toggleMicrophone}
            title={micEnabled ? "Desactivar micrófono" : "Activar micrófono"}
          >
            {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button
            variant={cameraEnabled ? "default" : "destructive"}
            size="icon"
            className="h-8 w-8"
            onClick={toggleCamera}
            title={cameraEnabled ? "Desactivar cámara" : "Activar cámara"}
          >
            {cameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function LiveVideoCall({ gameId, userId, username, isPlayer, isSpectator }: LiveVideoCallProps) {
  const [token, setToken] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true)
        setError("")

        if (!process.env.NEXT_PUBLIC_LIVEKIT_URL) {
          console.warn("LiveKit URL no configurada, usando modo fallback.")
          setUseFallback(true)
          setIsLoading(false)
          return
        }

        const spectatorParam = isSpectator ? "&spectator=true" : ""
        const response = await fetch(
          `/api/livekit-token?room=${gameId}&username=${encodeURIComponent(username)}&userId=${encodeURIComponent(userId)}${spectatorParam}`,
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Error del servidor: ${response.status}`)
        }

        const data = await response.json()
        if (data.error) throw new Error(data.error)
        if (!data.token) throw new Error("No se recibió un token válido.")

        setToken(data.token)
        console.log(
          `Token obtenido para ${username} (isSpectator: ${isSpectator}, permissions: ${JSON.stringify(data.permissions)})`,
        )
      } catch (err) {
        console.error("Error fetching LiveKit token:", err)
        if (retryCount >= 2) {
          console.warn("Demasiados errores de LiveKit, usando modo fallback.")
          setUseFallback(true)
          setError("")
        } else {
          setError(err instanceof Error ? err.message : "Error desconocido al conectar.")
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchToken()
  }, [gameId, userId, username, retryCount, isSpectator])

  const handleRetry = () => setRetryCount((prev) => prev + 1)
  const handleUseFallback = () => {
    setUseFallback(true)
    setError("")
  }

  if (useFallback) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            🎥 Video Local <Badge variant="secondary">Modo offline</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <VideoFallback gameId={gameId} userId={userId} username={username} isSpectator={isSpectator} />
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            🎥 Video en Vivo <Badge variant="secondary">Conectando...</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-white/80 text-center">
            <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
            <p>Conectando al video...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            🎥 Video en Vivo <Badge variant="destructive">Error</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <div className="text-red-400 mb-2">Error de conexión</div>
            <p className="text-white/60 text-sm mb-4 max-w-xs">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" /> Reintentar
              </Button>
              <Button variant="secondary" size="sm" onClick={handleUseFallback}>
                Usar modo local
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!token) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">🎥 Video en Vivo</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="text-white/60 text-center">
            <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
            <p>Obteniendo token...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          🎥 Video en Vivo
          <Badge className={isConnected ? "bg-green-600" : "bg-yellow-600"}>
            {isConnected ? "Conectado" : "Conectando..."}
          </Badge>
          {isSpectator && <Badge variant="secondary">Espectador</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <LiveKitRoom
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          connect={true} // Asegurar que se conecte
          className="h-full"
          data-lk-theme="dark"
          options={{
            publishDefaults: {
              simulcast: false,
              dtx: true,
              audioBitrate: 64000,
              videoCodec: "h264", // H.264 es ampliamente compatible
            },
            audioDefaults: {
              autoGainControl: true,
              echoCancellation: true,
              noiseSuppression: true,
            },
            adaptiveStream: true, // Habilitar streaming adaptativo
            dynacast: true, // Habilitar Dynacast para optimizar el uso de ancho de banda
          }}
          connectOptions={{ autoSubscribe: true, maxRetries: 3 }}
          onConnected={() => {
            console.log("LiveKit: Conectado")
            setIsConnected(true)
          }}
          onDisconnected={() => {
            console.log("LiveKit: Desconectado")
            setIsConnected(false)
          }}
          onError={(err) => {
            console.error("LiveKit Error:", err)
            if (err.message.includes("DataChannel")) {
              console.warn("Error de DataChannel ignorado:", err.message)
              return
            }
            if (retryCount >= 1 && !useFallback) {
              console.warn("Usando modo fallback debido a error persistente de LiveKit.")
              setUseFallback(true)
            } else {
              setError(`Error de LiveKit: ${err.message}`)
            }
          }}
        >
          <CustomVideoConference userId={userId} username={username} isSpectator={isSpectator} />
          <RoomAudioRenderer />
          <ConnectionStateToast />
        </LiveKitRoom>
      </CardContent>
    </Card>
  )
}

function VideoFallback({
  gameId,
  userId,
  username,
  isSpectator,
}: {
  gameId: string
  userId: string
  username: string
  isSpectator?: boolean
}) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [micEnabled, setMicEnabled] = useState(!isSpectator)
  const [cameraEnabled, setCameraEnabled] = useState(!isSpectator)

  useEffect(() => {
    async function setupLocalStream() {
      if (isSpectator) return
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        })
        setStream(mediaStream)
        if (videoRef.current) videoRef.current.srcObject = mediaStream
      } catch (err) {
        console.error("Error accessing media devices for fallback:", err)
      }
    }
    setupLocalStream()
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop())
    }
  }, [isSpectator])

  const toggleMicrophone = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !micEnabled
      })
      setMicEnabled(!micEnabled)
    }
  }
  const toggleCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !cameraEnabled
      })
      setCameraEnabled(!cameraEnabled)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-600/20 border border-yellow-500/50 p-3 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-200">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">
            Modo local - {isSpectator ? "Espectador (sin video local)" : "Video sin conexión"}
          </span>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-white" />
          <span className="text-white text-sm">1 conectado (Tú)</span>
        </div>
      </div>
      {!isSpectator && (
        <div className="relative">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-48 bg-black rounded-lg object-cover" />
          <Badge className="absolute top-2 left-2 bg-black/50">{username} (Tú)</Badge>
          {!cameraEnabled && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <CameraOff className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      )}
      {isSpectator && (
        <div className="h-48 bg-black/20 rounded-lg flex items-center justify-center">
          <div className="text-center text-white/60">
            <Video className="h-8 w-8 mx-auto mb-2" />
            <p>Modo espectador - Sin cámara local.</p>
          </div>
        </div>
      )}
      {!isSpectator && (
        <div className="flex justify-center gap-2">
          <Button
            variant={micEnabled ? "default" : "destructive"}
            size="icon"
            className="h-8 w-8"
            onClick={toggleMicrophone}
          >
            {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button
            variant={cameraEnabled ? "default" : "destructive"}
            size="icon"
            className="h-8 w-8"
            onClick={toggleCamera}
          >
            {cameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          </Button>
        </div>
      )}
      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={() => {
          window.location.href = "/dashboard"
        }}
      >
        Salir de la Sala
      </Button>
    </div>
  )
}
