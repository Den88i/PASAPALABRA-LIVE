"use client"

// No Image import needed for now
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Eye, EyeOff, GamepadIcon, Trophy, Users, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginUser } from "./actions/auth"

if (typeof window === "undefined") {
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

  useEffect(() => {
    const timer = setTimeout(() => setIsConnecting(false), 1000)
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

    const result = await loginUser(email, password)
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-4 pt-6">
          {/* Logo temporal como texto */}
          <Link href="/" aria-label="Pasapalabra Live Home">
            <h1 className="text-3xl font-bold text-indigo-600">PasapalabraLive</h1>
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            El juego de palabras más emocionante en tiempo real
          </p>
          {isConnecting && (
            <div className="flex items-center gap-2 text-xs text-amber-500">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Conectando...</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email-login" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email-login" // ID único para el input de email en login
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password-login" className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password-login" // ID único para el input de contraseña en login
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading || isConnecting}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link href="/register" className="text-blue-600 hover:underline">
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4 mt-4">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
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
      <footer className="py-8 mt-8 text-center text-sm text-muted-foreground">
        <div className="container flex flex-col md:flex-row justify-center items-center gap-x-4 gap-y-2">
          <Link href="/legal/terms-of-service" className="hover:text-primary">
            Términos de Servicio
          </Link>
          <Link href="/legal/privacy-policy" className="hover:text-primary">
            Política de Privacidad
          </Link>
          <Link href="/legal/refund-policy" className="hover:text-primary">
            Política de Reembolsos
          </Link>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} PasalabraLive. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
