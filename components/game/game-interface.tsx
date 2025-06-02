"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PasapalabraWheel } from "./pasapalabra-wheel"
import { LiveVideoCall } from "./live-video-call"
import { Timer } from "./timer"
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Trophy, Star } from "lucide-react"

interface Question {
  id: string
  letter: string
  question_text: string
  correct_answer: string
}

interface GameInterfaceProps {
  gameId: string
  userId: string
  username: string
  isPlayer: boolean
}

export function GameInterface({ gameId, userId, username, isPlayer }: GameInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [currentLetter, setCurrentLetter] = useState("A")
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos
  const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "finished">("waiting")
  const [isSpinning, setIsSpinning] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  const [letters, setLetters] = useState(() =>
    "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("").map((letter) => ({
      letter,
      answered: false,
      correct: undefined,
    })),
  )

  const answerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (gameStatus === "playing" && currentQuestion) {
      answerInputRef.current?.focus()
    }
  }, [currentQuestion, gameStatus])

  const startGame = async () => {
    setGameStatus("playing")
    setIsSpinning(true)

    // Reproducir sonido de inicio si está habilitado
    if (soundEnabled) {
      playSound("start")
    }

    // Simular carga de pregunta
    setTimeout(() => {
      setIsSpinning(false)
      loadQuestion(currentLetter)
    }, 3000)
  }

  const loadQuestion = async (letter: string) => {
    try {
      const response = await fetch(`/api/questions/${letter}`)
      const question = await response.json()
      setCurrentQuestion(question)
    } catch (error) {
      console.error("Error loading question:", error)
    }
  }

  const submitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return

    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.correct_answer.toLowerCase()

    // Actualizar estado de la letra
    setLetters((prev) =>
      prev.map((l) => (l.letter === currentLetter ? { ...l, answered: true, correct: isCorrect } : l)),
    )

    if (isCorrect) {
      const points = 10 + streak * 2 // Bonus por racha
      setScore((prev) => prev + points)
      setStreak((prev) => {
        const newStreak = prev + 1
        setMaxStreak((max) => Math.max(max, newStreak))
        return newStreak
      })

      if (soundEnabled) {
        playSound("correct")
      }
    } else {
      setStreak(0)
      if (soundEnabled) {
        playSound("incorrect")
      }
    }

    // Limpiar respuesta
    setUserAnswer("")

    // Pasar a la siguiente letra
    const nextLetter = getNextUnansweredLetter()
    if (nextLetter) {
      setCurrentLetter(nextLetter)
      setTimeout(() => loadQuestion(nextLetter), 1000)
    } else {
      // Juego terminado
      setGameStatus("finished")
      if (soundEnabled) {
        playSound("finish")
      }
    }
  }

  const getNextUnansweredLetter = () => {
    const unanswered = letters.filter((l) => !l.answered)
    return unanswered.length > 0 ? unanswered[0].letter : null
  }

  const passTurn = () => {
    setStreak(0) // Resetear racha al pasar
    const nextLetter = getNextUnansweredLetter()
    if (nextLetter) {
      setCurrentLetter(nextLetter)
      loadQuestion(nextLetter)
    }
  }

  const playSound = (type: "start" | "correct" | "incorrect" | "finish") => {
    // Implementar sonidos del juego
    const audio = new Audio(`/sounds/${type}.mp3`)
    audio.volume = 0.3
    audio.play().catch(() => {}) // Ignorar errores de autoplay
  }

  const getScoreColor = () => {
    if (score >= 200) return "text-yellow-400"
    if (score >= 100) return "text-green-400"
    return "text-white"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel principal del juego */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header del juego */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  🎯 Pasapalabra Live
                  {isPlayer && <Badge variant="secondary">Jugador</Badge>}
                  {!isPlayer && <Badge variant="outline">Espectador</Badge>}
                </CardTitle>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className={`text-lg px-4 py-2 ${getScoreColor()}`}>
                    <Trophy className="h-4 w-4 mr-1" />
                    {score} pts
                  </Badge>
                  {streak > 0 && (
                    <Badge className="bg-orange-600 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Racha: {streak}
                    </Badge>
                  )}
                  <Timer timeLeft={timeLeft} onTimeUp={() => setGameStatus("finished")} />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Rueda de Pasapalabra */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8">
              <PasapalabraWheel
                currentLetter={currentLetter}
                letters={letters}
                isSpinning={isSpinning}
                onLetterClick={(letter) => {
                  if (gameStatus === "playing" && !isSpinning && isPlayer) {
                    setCurrentLetter(letter)
                    loadQuestion(letter)
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Pregunta y respuesta */}
          {gameStatus === "playing" && currentQuestion && isPlayer && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center justify-between">
                  <span>Letra {currentLetter}</span>
                  <Badge className="bg-blue-600">
                    {letters.filter((l) => l.answered && l.correct).length}/{letters.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="text-white text-lg leading-relaxed">{currentQuestion.question_text}</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    ref={answerInputRef}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1 text-lg"
                    onKeyPress={(e) => e.key === "Enter" && submitAnswer()}
                  />
                  <Button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Responder
                  </Button>
                  <Button variant="outline" onClick={passTurn}>
                    Pasar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vista para espectadores */}
          {gameStatus === "playing" && currentQuestion && !isPlayer && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-xl">Pregunta Actual - Letra {currentLetter}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black/20 p-4 rounded-lg">
                  <p className="text-white text-lg">{currentQuestion.question_text}</p>
                </div>
                <div className="mt-4 text-center text-white/60">Esperando respuesta del jugador...</div>
              </CardContent>
            </Card>
          )}

          {/* Controles del juego */}
          {gameStatus === "waiting" && isPlayer && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-white text-xl mb-4">¿Listo para jugar?</h3>
                <p className="text-white/80 mb-6">Responde palabras que empiecen con cada letra del alfabeto</p>
                <Button onClick={startGame} size="lg" className="bg-green-600 hover:bg-green-700">
                  🎮 Comenzar Juego
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pantalla de espera para espectadores */}
          {gameStatus === "waiting" && !isPlayer && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-white text-xl mb-4">Modo Espectador</h3>
                <p className="text-white/80">Esperando a que los jugadores inicien la partida...</p>
              </CardContent>
            </Card>
          )}

          {/* Pantalla de juego terminado */}
          {gameStatus === "finished" && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-white text-2xl mb-4">🎉 ¡Juego Terminado!</h3>
                <div className="space-y-2 mb-6">
                  <p className="text-white text-xl">Puntuación Final: {score} puntos</p>
                  <p className="text-white/80">Racha Máxima: {maxStreak}</p>
                  <p className="text-white/80">
                    Respuestas Correctas: {letters.filter((l) => l.answered && l.correct).length}/
                    {letters.filter((l) => l.answered).length}
                  </p>
                </div>
                <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                  Jugar de Nuevo
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Controles de audio/video para jugadores */}
          {isPlayer && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <div className="flex justify-center gap-4">
                  <Button
                    variant={audioEnabled ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    title="Micrófono"
                  >
                    {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={videoEnabled ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    title="Cámara"
                  >
                    {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={soundEnabled ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title="Sonidos del juego"
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel lateral - LiveKit Room */}
        <div className="space-y-6">
          <LiveVideoCall
            gameId={gameId}
            userId={userId}
            username={username}
            isPlayer={isPlayer}
            isSpectator={!isPlayer}
          />
        </div>
      </div>
    </div>
  )
}
