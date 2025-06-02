"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Eye, EyeOff, GamepadIcon, Trophy, Users, Loader2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerUser } from "../actions/auth"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  // const [username, setUsername] = useState("") // No longer needed as individual state for form submission
  // const [email, setEmail] = useState("")    // No longer needed
  // const [password, setPassword] = useState("") // No longer needed
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Type the event for form
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    const formData = new FormData(e.currentTarget) // Create FormData from the form
    const password = formData.get("password") as string

    if (password && password.length < 6) {
      // Client-side check still useful
      setError("La contraseña debe tener al menos 6 caracteres.")
      setIsLoading(false)
      return
    }

    const result = await registerUser(formData) // Pass FormData to the Server Action
    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else if (result.success && result.user) {
      setSuccessMessage("¡Cuenta creada exitosamente! Redirigiendo al dashboard...")
      localStorage.setItem("user_id", result.user.id)
      localStorage.setItem("user_data", JSON.stringify(result.user))
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } else {
      setError("Error desconocido durante el registro. Inténtalo de nuevo.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-2 pt-6">
          {/* Logo temporal como texto */}
          <Link href="/" aria-label="Pasapalabra Live Home">
            <h1 className="text-3xl font-bold text-indigo-600">PasapalabraLive</h1>
          </Link>
          <p className="text-center text-muted-foreground">Crea una cuenta para jugar</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name-register" className="text-sm">
                {" "}
                {/* Changed from username to name */}
                Nombre de usuario
              </label>
              <Input
                id="name-register" // ID único
                name="name" // IMPORTANT: This must be "name" to match formData.get("name") in Server Action
                type="text"
                placeholder="Tu nombre de usuario"
                // value={username} // Controlled component no longer strictly necessary for FormData
                // onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email-register" className="text-sm">
                Email
              </label>
              <Input
                id="email-register" // ID único
                name="email"
                type="email"
                placeholder="tu@email.com"
                // value={email}
                // onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password-register" className="text-sm">
                Contraseña (mín. 6 caracteres)
              </label>
              <div className="relative">
                <Input
                  id="password-register" // ID único
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Tu contraseña"
                  // value={password}
                  // onChange={(e) => setPassword(e.target.value)}
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
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
