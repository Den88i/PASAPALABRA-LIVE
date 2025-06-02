"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation" // useParams para obtener el ID
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Clock, Eye, Volume2, VolumeX, Loader2 } from "lucide-react"
import { PasapalabraWheel } from "@/components/game/pasapalabra-wheel"
import { LiveVideoCall } from "@/components/game/live-video-call"
import { ConnectionStatus } from "@/components/game/connection-status"
import { SimpleChat } from "@/components/game/simple-chat"

interface LetterState {
  letter: string
  status: "pending" | "correct" | "incorrect" | "passed"
}

interface GameState {
  currentLetter: string
  playerScore: number
  opponentScore: number
  timeLeft: number
  isPlayer1Turn: boolean
  gamePhase: "waiting" | "playing" | "finished"
  round: number
  isRoscoRound: boolean
  roscoTimeLeft: number
  currentQuestion: string
  letters: LetterState[]
  player1Name: string
  player2Name: string
  spectatorCount: number
}

export default function SpectatePage() {
  const router = useRouter()
  const params = useParams()
  const gameId = params.id as string // Obtener gameId de los parámetros de la URL

  const [user, setUser] = useState<any>(null) // Datos del espectador actual
  const [gameState, setGameState] = useState<GameState>({
    currentLetter: "A",
    playerScore: 45,
    opponentScore: 38,
    timeLeft: 67,
    isPlayer1Turn: true,
    gamePhase: "playing",
    round: 2,
    isRoscoRound: false,
    roscoTimeLeft: 150,
    currentQuestion: "Con la A. Fruto comestible de color rojo o verde que crece en el manzano",
    player1Name: "JugadorAlfa",
    player2Name: "JugadorBeta",
    letters: "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("").map((letter, index) => ({
      letter,
      status: index < 8 ? (Math.random() > 0.3 ? "correct" : "incorrect") : "pending",
    })),
    spectatorCount: 12, // Simulación de espectadores
  })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "fair" | "poor">("good")
  const [loadingUser, setLoadingUser] = useState(true)

  // Generar ID y nombre de espectador únicos al montar el componente
  const [spectatorId] = useState(() => `spectator-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`)
  const [spectatorName] = useState(() => `👁️ Espectador ${Math.floor(Math.random() * 1000)}`)

  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    if (!userData) {
      // Si no hay datos de usuario, podría ser un acceso directo.
      // Creamos un usuario espectador temporal.
      setUser({
        id: spectatorId,
        username: spectatorName,
        role: "spectator",
      })
    } else {
      // Si hay datos, los usamos y añadimos el prefijo de espectador al nombre
      const parsedUser = JSON.parse(userData)
      setUser({
        ...parsedUser,
        id: spectatorId, // Usar el ID de espectador único
        username: `👁️ ${parsedUser.username}`.substring(0, 50), // Asegurar que el nombre no sea muy largo
      })
    }
    setLoadingUser(false)
  }, [spectatorId, spectatorName])

  // Simular actualizaciones del juego en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState((prev) => {
        if (prev.gamePhase !== "playing") return prev

        const newTimeLeft = prev.timeLeft > 0 ? prev.timeLeft - 1 : 90
        const shouldChangeTurn = prev.timeLeft <= 0

        if (shouldChangeTurn) {
          const questions = [
            "Con la B. Mamífero marino de gran tamaño",
            "Con la C. Automóvil, vehículo de motor",
            "Con la D. Cada una de las piezas duras en la boca",
            "Con la E. Mamífero africano de gran tamaño con trompa",
            "Con la F. Deporte que se juega con los pies",
          ]
          return {
            ...prev,
            timeLeft: newTimeLeft,
            isPlayer1Turn: !prev.isPlayer1Turn,
            currentQuestion: questions[Math.floor(Math.random() * questions.length)],
            currentLetter: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
          }
        }
        return { ...prev, timeLeft: newTimeLeft }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Simular cambios en el marcador y espectadores
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        setGameState((prev) => ({
          ...prev,
          playerScore: prev.isPlayer1Turn ? prev.playerScore + (Math.random() > 0.7 ? 10 : 0) : prev.playerScore,
          opponentScore: !prev.isPlayer1Turn ? prev.opponentScore + (Math.random() > 0.7 ? 10 : 0) : prev.opponentScore,
          spectatorCount: Math.max(5, prev.spectatorCount + (Math.random() > 0.5 ? 1 : -1)),
        }))
      }
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const handleLeaveSpectate = () => {
    router.push("/dashboard")
  }

  if (loadingUser || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white animate-spin mr-2" />
        <div className="text-white text-xl">Cargando modo espectador...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleLeaveSpectate}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Salir
            </Button>
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold text-white">👁️ ESPECTADOR - PASAPALABRA LIVE</h1>
              <p className="text-white/60 text-sm">
                {gameState.isRoscoRound ? "ROSCO FINAL" : `Ronda ${gameState.round}/3`} • Sala #{gameId}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <Badge variant="secondary" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Modo Espectador
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {gameState.spectatorCount} viendo
            </Badge>
            <ConnectionStatus isConnected={true} quality={connectionQuality} />
            {gameState.gamePhase === "playing" && (
              <>
                <Badge className={gameState.isPlayer1Turn ? "bg-green-600" : "bg-orange-600"}>
                  Turno: {gameState.isPlayer1Turn ? gameState.player1Name : gameState.player2Name}
                </Badge>
                <Badge className="bg-blue-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {gameState.isRoscoRound
                    ? `${Math.floor(gameState.roscoTimeLeft / 60)}:${(gameState.roscoTimeLeft % 60)
                        .toString()
                        .padStart(2, "0")}`
                    : `${gameState.timeLeft}s`}
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Panel principal del juego */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {gameState.gamePhase === "waiting" ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-center text-lg md:text-xl">
                    ⏳ Esperando que comience la partida...
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-white/80 text-sm md:text-base">
                    Los jugadores se están preparando para comenzar el Pasapalabra.
                  </p>
                  <div className="bg-white/5 p-3 md:p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2 text-sm md:text-base">👥 Jugadores:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white">{gameState.player1Name}</span>
                        <Badge className="bg-green-600">Listo</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">{gameState.player2Name}</span>
                        <Badge className="bg-yellow-600">Conectando...</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4 md:p-8">
                  <PasapalabraWheel
                    currentLetter={gameState.currentLetter}
                    letters={gameState.letters.map((l) => ({
                      letter: l.letter,
                      answered: l.status !== "pending",
                      correct: l.status === "correct" ? true : l.status === "incorrect" ? false : undefined,
                    }))}
                    onLetterClick={() => {}} // Los espectadores no pueden interactuar
                    isSpinning={false}
                  />
                </CardContent>
              </Card>
            )}

            {gameState.gamePhase === "playing" && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                    <span className="text-lg md:text-xl">
                      {gameState.isRoscoRound ? "🎯 ROSCO" : `Ronda ${gameState.round}`} - Letra{" "}
                      {gameState.currentLetter}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={gameState.isPlayer1Turn ? "bg-green-600" : "bg-orange-600"}>
                        Turno: {gameState.isPlayer1Turn ? gameState.player1Name : gameState.player2Name}
                      </Badge>
                      {gameState.isRoscoRound && (
                        <Badge className="bg-purple-600">
                          {Math.floor(gameState.roscoTimeLeft / 60)}:
                          {(gameState.roscoTimeLeft % 60).toString().padStart(2, "0")}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/20 p-3 md:p-4 rounded-lg mb-4">
                    <p className="text-white text-base md:text-lg">{gameState.currentQuestion}</p>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mt-2">
                      <p className="text-white/60 text-xs md:text-sm">💡 Debe empezar con {gameState.currentLetter}</p>
                      {gameState.isRoscoRound && (
                        <Badge variant="outline" className="text-xs">
                          +25 puntos
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-blue-600/20 rounded-lg">
                    <p className="text-white">
                      👁️ Observando como espectador -{" "}
                      {gameState.isPlayer1Turn ? gameState.player1Name : gameState.player2Name} está pensando...
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      {gameState.isRoscoRound
                        ? `Tiempo restante: ${Math.floor(gameState.roscoTimeLeft / 60)}:${(gameState.roscoTimeLeft % 60)
                            .toString()
                            .padStart(2, "0")}`
                        : `${gameState.timeLeft} segundos restantes`}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant={soundEnabled ? "default" : "outline"}
                      size="icon"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      title={soundEnabled ? "Desactivar sonidos" : "Activar sonidos"}
                    >
                      {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Button>

                    <div className="text-xs text-white/60">Espectador • Sala: {gameId}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {gameState.gamePhase === "finished" && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6 md:p-8 text-center">
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">🏆 ¡PARTIDA FINALIZADA!</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`p-4 rounded-lg ${
                          gameState.playerScore > gameState.opponentScore
                            ? "bg-green-600/20 border border-green-500/50"
                            : "bg-red-600/20"
                        }`}
                      >
                        <h3 className="text-white font-semibold">{gameState.player1Name}</h3>
                        <p className="text-2xl md:text-3xl font-bold text-white">{gameState.playerScore}</p>
                        {gameState.playerScore > gameState.opponentScore && (
                          <Badge className="bg-green-600 mt-2">¡GANADOR!</Badge>
                        )}
                      </div>
                      <div
                        className={`p-4 rounded-lg ${
                          gameState.opponentScore > gameState.playerScore
                            ? "bg-green-600/20 border border-green-500/50"
                            : "bg-red-600/20"
                        }`}
                      >
                        <h3 className="text-white font-semibold">{gameState.player2Name}</h3>
                        <p className="text-2xl md:text-3xl font-bold text-white">{gameState.opponentScore}</p>
                        {gameState.opponentScore > gameState.playerScore && (
                          <Badge className="bg-green-600 mt-2">¡GANADOR!</Badge>
                        )}
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <p className="text-white/80">
                        Letras correctas: {gameState.letters.filter((l) => l.status === "correct").length}/27
                      </p>
                      <p className="text-white/80">Rondas completadas: 3/3</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel lateral */}
          <div className="space-y-4 md:space-y-6">
            {/* Video en vivo */}
            <LiveVideoCall
              gameId={gameId}
              userId={user.id} // Usar el ID del espectador
              username={user.username} // Usar el nombre del espectador
              isPlayer={false}
              isSpectator={true}
            />

            {/* Estadísticas del juego */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">📊 Marcador en Vivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div
                    className={`flex items-center justify-between p-3 rounded ${
                      gameState.isPlayer1Turn ? "bg-green-600/20 border border-green-500/50" : "bg-white/5"
                    }`}
                  >
                    <span className="text-white font-semibold text-sm">
                      {gameState.player1Name}
                      {gameState.isPlayer1Turn && <span className="ml-2 text-green-400">🎯</span>}
                    </span>
                    <Badge className="bg-green-600 text-lg px-3 py-1">{gameState.playerScore}</Badge>
                  </div>
                  <div
                    className={`flex items-center justify-between p-3 rounded ${
                      !gameState.isPlayer1Turn ? "bg-orange-600/20 border border-orange-500/50" : "bg-white/5"
                    }`}
                  >
                    <span className="text-white font-semibold text-sm">
                      {gameState.player2Name}
                      {!gameState.isPlayer1Turn && <span className="ml-2 text-orange-400">🎯</span>}
                    </span>
                    <Badge className="bg-orange-600 text-lg px-3 py-1">{gameState.opponentScore}</Badge>
                  </div>
                </div>

                {gameState.isRoscoRound && (
                  <div className="mt-4 p-3 bg-purple-600/20 rounded-lg">
                    <h4 className="text-white font-semibold mb-2 text-sm">🎯 Progreso del Rosco</h4>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="text-green-400">
                        ✅ {gameState.letters.filter((l) => l.status === "correct").length}
                      </div>
                      <div className="text-red-400">
                        ❌ {gameState.letters.filter((l) => l.status === "incorrect").length}
                      </div>
                      <div className="text-yellow-400">
                        ⏭️ {gameState.letters.filter((l) => l.status === "passed").length}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 bg-blue-600/20 rounded-lg">
                  <h4 className="text-white font-semibold mb-2 text-sm">📈 Estadísticas</h4>
                  <div className="text-xs text-white/80 space-y-1">
                    <div className="flex justify-between">
                      <span>Tiempo transcurrido:</span>
                      <span>{3 - gameState.round + 1} rondas</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Espectadores:</span>
                      <span>{gameState.spectatorCount} viendo</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat del juego */}
            <SimpleChat gameId={gameId} userId={user.id} username={user.username} />

            {/* Información de espectador */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">👁️ Modo Espectador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-white/80">
                  <p>• Estás viendo la partida en tiempo real</p>
                  <p>• Puedes usar el chat para comentar</p>
                  <p>• No puedes influir en el juego</p>
                  <p>• Disfruta del espectáculo 🍿</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => router.push("/dashboard")}>
                  Volver al Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
