"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Eye, EyeOff, GamepadIcon, Trophy, Users } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginUser } from "./actions/auth"

// Verificar si estamos en el servidor y si hay variables de entorno críticas
if (typeof window === "undefined") {
  // Solo verificar en el servidor
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL no está configurada")
  }
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Simulate connection status
  useEffect(() => {
    const timer = setTimeout(() => setIsConnecting(false), 1500) // Reducido tiempo de conexión

    // Check if already logged in
    const userId = localStorage.getItem("user_id")
    if (userId) {
      router.push("/dashboard")
    }
    return () => clearTimeout(timer)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await loginUser(email, password) // Llama a la Server Action
    setIsLoading(false)

    if (result.error) {
      setError(result.error)
      console.error("Login error:", result.error)
    } else if (result.success && result.user) {
      localStorage.setItem("user_id", result.user.id)
      localStorage.setItem("user_data", JSON.stringify(result.user))
      router.push("/dashboard")
    } else {
      setError("Error desconocido durante el inicio de sesión.")
      console.error("Unknown login error:", result)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-500" />
            <h1 className="text-2xl font-bold text-indigo-500">Pasapalabra Live</h1>
          </div>
          <p className="text-center text-muted-foreground">El juego de palabras más emocionante en tiempo real</p>
          {isConnecting && (
            <div className="flex items-center gap-2 text-sm text-amber-500">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Conectando...</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pasapalabra.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                </Button>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <Button type="submit" className="w-full bg-blue-400 hover:bg-blue-500" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link href="/register" className="text-blue-500 hover:underline">
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>

          {/* Credenciales de prueba */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-semibold text-blue-800 mb-2">Credenciales de prueba:</p>
            <div className="space-y-1">
              <p className="text-blue-700">👑 Admin: admin@pasapalabra.com / admin123</p>
              <p className="text-blue-700">🎮 Jugador 1: jugador1@test.com / admin123</p>
              <p className="text-blue-700">🎮 Jugador 2: jugador2@test.com / admin123</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <GamepadIcon className="h-4 w-4" />
              <span>Partidas en tiempo real</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>Torneos</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Modo espectador</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
