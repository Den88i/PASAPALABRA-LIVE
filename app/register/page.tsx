"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Eye, EyeOff, GamepadIcon, Trophy, Users, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerUser } from "../actions/auth" // Importar la Server Action

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      setIsLoading(false)
      return
    }

    const result = await registerUser(username, email, password)
    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else if (result.success && result.user) {
      setSuccessMessage("¡Cuenta creada exitosamente! Redirigiendo al dashboard...")

      // Simular guardado en localStorage para la demo y redirigir
      // En una app real, esto se manejaría con sesiones/cookies o un estado global post-login
      localStorage.setItem("user_id", result.user.id)
      localStorage.setItem("user_data", JSON.stringify(result.user))

      setTimeout(() => {
        router.push("/dashboard")
      }, 1500) // Dar tiempo para leer el mensaje de éxito
    } else {
      setError("Error desconocido durante el registro. Inténtalo de nuevo.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-500" />
            <h1 className="text-2xl font-bold text-indigo-500">Pasalabra Live</h1>
          </div>
          <p className="text-center text-muted-foreground">Crea una cuenta para jugar</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm">
                Nombre de usuario
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm">
                Contraseña (mín. 6 caracteres)
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}</span>
                </Button>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded">{error}</div>}
            {successMessage && (
              <div className="text-green-600 text-sm text-center p-2 bg-green-50 rounded">{successMessage}</div>
            )}

            <Button type="submit" className="w-full bg-blue-400 hover:bg-blue-500" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Registrarse"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <Link href="/" className="text-blue-500 hover:underline">
              ¿Ya tienes cuenta? Iniciar sesión
            </Link>
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
