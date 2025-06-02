"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GamepadIcon, Trophy, Users, LogOut, Play, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ConnectionStatus from "@/components/ConnectionStatus"

interface User {
  id: string
  username: string
  email: string
  role: string
  total_games: number
  total_wins: number
  total_points: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const userData = localStorage.getItem("user_data")

    if (!userId || !userData) {
      router.push("/")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/") // Redirigir si hay error en los datos
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user_id")
    localStorage.removeItem("user_data")
    router.push("/")
  }

  const handleCreateGame = () => {
    const gameId = `game-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    router.push(`/game/${gameId}`)
  }

  const handleJoinGame = (gameId = "demo-game-123") => {
    router.push(`/game/${gameId}`)
  }

  const handleSpectateGame = (gameId = "demo-game-123") => {
    router.push(`/game/spectate/${gameId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando panel...</div>
      </div>
    )
  }

  if (!user) {
    // Esto no debería pasar si la lógica de useEffect es correcta, pero es un fallback
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Error al cargar datos de usuario. Por favor, inicia sesión de nuevo.</div>
        <Button onClick={() => router.push("/")} className="mt-4">
          Volver al Login
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-indigo-500" />
            <h1 className="text-3xl font-bold text-white">Pasapalabra Live</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/80">¡Hola, {user.username}!</span>
            {user.role === "admin" && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">ADMIN</span>}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Partidas Jugadas</CardTitle>
              <GamepadIcon className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{user.total_games}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Partidas Ganadas</CardTitle>
              <Trophy className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{user.total_wins}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Puntos Totales</CardTitle>
              <Users className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{user.total_points}</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GamepadIcon className="h-5 w-5" />
                Crear Partida Nueva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">Inicia una nueva partida y espera a que se unan otros jugadores</p>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleCreateGame}>
                <Play className="h-4 w-4 mr-2" />
                Crear Partida
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Unirse o Espectar Partida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">Únete a una partida existente o mira como espectador</p>
              <Button className="w-full" variant="outline" onClick={() => handleJoinGame()}>
                <Play className="h-4 w-4 mr-1" />
                Unirse a Partida Demo
              </Button>
              <Button className="w-full mt-2" variant="outline" onClick={() => handleSpectateGame()}>
                <Eye className="h-4 w-4 mr-1" />
                Espectar Partida Demo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Partidas en Vivo */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">🔴 Partidas en Vivo (Simulado)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Partida Demo 1 */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Partida Demo - Sala #demo-game-123</p>
                  <p className="text-white/60 text-sm">2 jugadores • En progreso</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleJoinGame("demo-game-123")}>
                    <Play className="h-4 w-4 mr-1" />
                    Unirse
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSpectateGame("demo-game-123")}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </div>
              </div>
              {/* Partida Demo 2 */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Torneo Semanal - Sala #tournament-live</p>
                  <p className="text-white/60 text-sm">8 jugadores • Esperando</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleJoinGame("tournament-live")}>
                    <Play className="h-4 w-4 mr-1" />
                    Unirse
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleSpectateGame("tournament-live")}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <div className="mt-8">
          <ConnectionStatus />
        </div>
      </div>
    </div>
  )
}
