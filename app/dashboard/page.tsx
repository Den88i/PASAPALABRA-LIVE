"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  GamepadIcon,
  Trophy,
  Users,
  LogOut,
  Play,
  Eye,
  Search,
  UserCircle,
  Copy,
  Star,
  Clock4,
  ShieldCheck,
  Palette,
  Film,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import ConnectionStatus from "@/components/ConnectionStatus" // Assuming this is the correct path
import { PayPalSubscribeButton } from "@/components/paypal-subscribe-button"
import type { User as UserData, VipLevel, Skin, CameraFilter } from "@/lib/database"

interface UserSkinDetails extends Skin {
  unlocked_at: string
  is_equipped: boolean
}
interface UserCameraFilterDetails extends CameraFilter {
  unlocked_at: string
  // is_equipped: boolean; // If filters can be equipped
}

interface DashboardUser extends UserData {
  current_vip_level_details?: VipLevel
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [joinGameId, setJoinGameId] = useState("")
  const [spectateGameId, setSpectateGameId] = useState("")
  const [createdGameId, setCreatedGameId] = useState<string | null>(null)
  const [trialTimeLeft, setTrialTimeLeft] = useState<string | null>(null)

  const [vipLevelName, setVipLevelName] = useState<string>("") // Initialize as empty
  const [loadingVipName, setLoadingVipName] = useState<boolean>(false)
  const [vipNameError, setVipNameError] = useState<string | null>(null)

  const [availableSkins, setAvailableSkins] = useState<Skin[]>([])
  const [userSkins, setUserSkins] = useState<UserSkinDetails[]>([]) // Assuming you'll fetch these
  const [loadingSkins, setLoadingSkins] = useState(false)
  const [skinsError, setSkinsError] = useState<string | null>(null)

  const [availableFilters, setAvailableFilters] = useState<CameraFilter[]>([])
  const [userFilters, setUserFilters] = useState<UserCameraFilterDetails[]>([]) // Assuming you'll fetch these
  const [loadingFilters, setLoadingFilters] = useState(false)
  const [filtersError, setFiltersError] = useState<string | null>(null)

  const router = useRouter()

  const fetchVipLevelDetails = useCallback(async (levelNumber: number) => {
    if (levelNumber === 0) {
      setVipLevelName("Novato")
      setVipNameError(null)
      return
    }
    setLoadingVipName(true)
    setVipNameError(null)
    try {
      const response = await fetch(`/api/vip-levels/${levelNumber}`)
      if (response.ok) {
        const vipData: VipLevel = await response.json()
        setVipLevelName(vipData.name)
      } else {
        const errorText = await response.text()
        console.error("Failed to fetch VIP level details:", response.statusText, errorText)
        setVipNameError(`Error ${response.status} al cargar nombre VIP`)
        setVipLevelName(`Nivel ${levelNumber}`)
      }
    } catch (error) {
      console.error("Error fetching VIP level details:", error)
      setVipNameError("Error de red al cargar nombre VIP")
      setVipLevelName(`Nivel ${levelNumber}`)
    } finally {
      setLoadingVipName(false)
    }
  }, [])

  const fetchUserCustomizations = useCallback(async (userId: string) => {
    // Fetch user's unlocked skins
    setLoadingSkins(true)
    setSkinsError(null)
    try {
      const res = await fetch(`/api/users/${userId}/skins`)
      if (res.ok) {
        const data = await res.json()
        setUserSkins(data)
      } else {
        setSkinsError("No se pudieron cargar tus skins.")
        console.error("Failed to fetch user skins", await res.text())
      }
    } catch (e) {
      setSkinsError("Error de red al cargar skins.")
      console.error("Error fetching user skins", e)
    }
    setLoadingSkins(false)

    // Fetch user's unlocked camera filters
    setLoadingFilters(true)
    setFiltersError(null)
    try {
      const res = await fetch(`/api/users/${userId}/camera-filters`)
      if (res.ok) {
        const data = await res.json()
        setUserFilters(data)
      } else {
        setFiltersError("No se pudieron cargar tus filtros.")
        console.error("Failed to fetch user camera filters", await res.text())
      }
    } catch (e) {
      setFiltersError("Error de red al cargar filtros.")
      console.error("Error fetching user camera filters", e)
    }
    setLoadingFilters(false)
  }, [])

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const rawUserData = localStorage.getItem("user_data")

    if (!userId || !rawUserData) {
      router.push("/")
      return
    }

    try {
      const parsedUser: DashboardUser = JSON.parse(rawUserData)
      setUser(parsedUser)

      if (parsedUser.trial_ends_at && !parsedUser.is_premium) {
        const trialEndDate = new Date(parsedUser.trial_ends_at)
        const now = new Date()
        const diff = trialEndDate.getTime() - now.getTime()
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          setTrialTimeLeft(`${days}d ${hours}h restantes`)
        } else {
          setTrialTimeLeft("Periodo de prueba finalizado")
        }
      } else if (parsedUser.is_premium) {
        setTrialTimeLeft(null) // No trial time if premium
      }

      if (parsedUser.current_vip_level_number !== undefined) {
        fetchVipLevelDetails(parsedUser.current_vip_level_number)
      }

      // Fetch all available skins and filters for shop display (if needed later)
      // For now, we'll just fetch user's unlocked items
      const fetchShopData = async () => {
        try {
          const skinsRes = await fetch("/api/skins")
          if (skinsRes.ok) setAvailableSkins(await skinsRes.json())
        } catch (e) {
          console.error("Error fetching available skins data", e)
        }

        try {
          const filtersRes = await fetch("/api/camera-filters")
          if (filtersRes.ok) setAvailableFilters(await filtersRes.json())
        } catch (e) {
          console.error("Error fetching available filters data", e)
        }
      }

      fetchShopData()
      fetchUserCustomizations(parsedUser.id)
    } catch (error) {
      console.error("Error parsing user data:", error)
      localStorage.removeItem("user_id")
      localStorage.removeItem("user_data")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }, [router, fetchVipLevelDetails, fetchUserCustomizations])

  const handleLogout = () => {
    localStorage.removeItem("user_id")
    localStorage.removeItem("user_data")
    router.push("/")
  }

  const handleCreateGame = () => {
    const gameId = `game-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    setCreatedGameId(gameId)
    // Optionally, navigate immediately or show a modal
  }

  const handleJoinGame = () => {
    if (joinGameId.trim()) {
      router.push(`/game/${joinGameId.trim()}`)
    } else {
      alert("Por favor, ingresa un ID de partida para unirte.")
    }
  }

  const handleSpectateGame = () => {
    if (spectateGameId.trim()) {
      router.push(`/game/spectate/${spectateGameId.trim()}`)
    } else {
      alert("Por favor, ingresa un ID de partida para espectar.")
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert(`${type} "${text}" copiado al portapapeles.`)) // More specific alert
      .catch((err) => {
        console.error(`Error al copiar ${type}: `, err)
        alert(`No se pudo copiar ${type}. Intenta manualmente.`)
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-white text-xl flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin" />
          Cargando panel...
        </div>
      </div>
    )
  }

  if (!user) {
    // This case should ideally be handled by the redirect in useEffect,
    // but as a fallback:
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center p-4">
        <div className="text-white text-xl text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
          Error al cargar datos del usuario.
          <Button onClick={() => router.push("/")} className="mt-4">
            Volver al Inicio
          </Button>
        </div>
      </div>
    )
  }

  const isTrialActive = user.trial_ends_at && new Date(user.trial_ends_at) > new Date() && !user.is_premium
  const isPremiumActuallyActive =
    user.is_premium && (!user.premium_expires_at || new Date(user.premium_expires_at) > new Date())
  const canPlayGames = isPremiumActuallyActive || isTrialActive
  const canAccessPremiumCustomization = isPremiumActuallyActive

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Pasapalabra Live</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80">¡Hola, {user.username}!</span>
            {user.role === "admin" && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">ADMIN</span>}
            {isPremiumActuallyActive && (
              <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> PREMIUM
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-blue-200 text-black border-blue-300 hover:bg-blue-300" // Modified
            >
              <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8 bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <UserCircle className="h-6 w-6" /> Tu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="text-white/90 space-y-3">
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <div className="flex items-center gap-2">
              <strong>ID de Usuario:</strong>
              <span className="font-mono bg-black/20 px-2 py-1 rounded text-sm">{user.id}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(user.id, "ID de Usuario")}
                className="h-7 w-7 text-white/70 hover:text-white"
                aria-label="Copiar ID de Usuario"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p>
              <strong>XP:</strong> {user.xp}
            </p>
            <p>
              <strong>Nivel VIP:</strong>{" "}
              {loadingVipName ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
                </span>
              ) : vipNameError ? (
                <span className="text-red-400">{vipNameError}</span>
              ) : (
                `${vipLevelName} (Nivel ${user.current_vip_level_number})`
              )}
            </p>
            {isPremiumActuallyActive ? (
              <p className="text-yellow-300 font-semibold flex items-center gap-1">
                <Star className="h-4 w-4" /> Cuenta Premium Activa
                {user.premium_expires_at && ` (Expira: ${new Date(user.premium_expires_at).toLocaleDateString()})`}
              </p>
            ) : isTrialActive && trialTimeLeft ? (
              <p className="font-semibold flex items-center gap-1 text-green-400">
                <Clock4 className="h-4 w-4" /> Prueba gratuita: {trialTimeLeft}
              </p>
            ) : trialTimeLeft && trialTimeLeft.includes("finalizado") ? (
              <p className="font-semibold flex items-center gap-1 text-red-400">
                <Clock4 className="h-4 w-4" /> Periodo de prueba finalizado
              </p>
            ) : (
              <p className="text-gray-400">Cuenta Gratuita</p>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Partidas Jugadas</CardTitle>
              <GamepadIcon className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{user.total_games || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Partidas Ganadas</CardTitle>
              <Trophy className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{user.total_wins || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Puntos Totales</CardTitle>
              <Users className="h-4 w-4 text-white/60" /> {/* Icon might need adjustment for "Points" */}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{user.total_points || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Trial Ended / Limited Access Message */}
        {!canPlayGames && (
          <Card className="mb-8 bg-red-700/30 backdrop-blur-md border-red-500/50 text-center">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-300">
                {trialTimeLeft && trialTimeLeft.includes("finalizado")
                  ? "¡Tu periodo de prueba ha finalizado!"
                  : "Acceso Limitado"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 mb-4">
                Suscríbete a Premium para seguir jugando y disfrutar de todos los beneficios.
              </p>
              {/* PayPal button will be shown in the Premium card if not premium */}
            </CardContent>
          </Card>
        )}

        {/* Game Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className={`bg-white/10 backdrop-blur-md border-white/20 ${!canPlayGames ? "opacity-60" : ""}`}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GamepadIcon className="h-5 w-5" /> Crear Partida Nueva
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">Inicia una nueva partida y comparte el ID.</p>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-black disabled:bg-green-600/50" // Modified
                onClick={handleCreateGame}
                disabled={!canPlayGames}
              >
                <Play className="h-4 w-4 mr-2" /> Crear Partida
              </Button>
            </CardContent>
          </Card>
          <Card className={`bg-white/10 backdrop-blur-md border-white/20 ${!canPlayGames ? "opacity-60" : ""}`}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="h-5 w-5" /> Buscar Partida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="joinGameId" className="text-sm font-medium text-white/80 block mb-1">
                  ID para Unirse:
                </label>
                <div className="flex gap-2">
                  <Input
                    id="joinGameId"
                    type="text"
                    placeholder="Ingresa ID"
                    value={joinGameId}
                    onChange={(e) => setJoinGameId(e.target.value)}
                    className="bg-black/20 border-white/30 text-white placeholder-white/50 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-70"
                    disabled={!canPlayGames}
                  />
                  <Button
                    variant="outline"
                    onClick={handleJoinGame}
                    className="bg-indigo-200 text-black border-indigo-300 hover:bg-indigo-300 disabled:opacity-70 disabled:hover:bg-transparent" // Modified
                    disabled={!canPlayGames || !joinGameId.trim()}
                  >
                    <Play className="h-4 w-4 mr-1" /> Unirse
                  </Button>
                </div>
              </div>
              <div>
                <label htmlFor="spectateGameId" className="text-sm font-medium text-white/80 block mb-1">
                  ID para Espectar:
                </label>
                <div className="flex gap-2">
                  <Input
                    id="spectateGameId"
                    type="text"
                    placeholder="Ingresa ID"
                    value={spectateGameId}
                    onChange={(e) => setSpectateGameId(e.target.value)}
                    className="bg-black/20 border-white/30 text-white placeholder-white/50 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <Button
                    variant="outline"
                    onClick={handleSpectateGame}
                    className="bg-purple-200 text-black border-purple-300 hover:bg-purple-300 disabled:opacity-70" // Modified
                    disabled={!spectateGameId.trim()}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Espectar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Created Game ID Info */}
        {createdGameId && (
          <Card className="mt-6 mb-8 bg-green-700/20 backdrop-blur-md border-green-500/40">
            <CardHeader>
              <CardTitle className="text-green-300">¡Partida Creada Exitosamente!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3">
              <p className="text-black/90">El ID de tu partida es:</p>
              <div className="bg-black/30 p-3 rounded-md inline-block">
                <strong className="text-xl text-yellow-300 font-mono tracking-wider">{createdGameId}</strong>
              </div>
              <p className="text-white/70 text-sm">Compártelo con tus amigos.</p>
              <div className="flex gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-yellow-200 text-black border-yellow-300 hover:bg-yellow-300 hover:text-black" // Modified
                  onClick={() => copyToClipboard(createdGameId, "ID de Partida")}
                  aria-label="Copiar ID de Partida Creada"
                >
                  <Copy className="h-4 w-4 mr-2" /> Copiar ID
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-black" // Modified
                  onClick={() => router.push(`/game/${createdGameId}`)}
                >
                  <Play className="h-4 w-4 mr-2" /> Ir a la Partida
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Premium & Customization Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {!isPremiumActuallyActive && (
            <Card className="bg-yellow-100 backdrop-blur-md border-yellow-400 md:col-span-1"> {/* Modified background and border */}
              <CardHeader>
                <CardTitle className="text-2xl text-yellow-800 flex items-center gap-2"> {/* Modified text color */}
                  <Star className="h-7 w-7" /> ¡Hazte Premium!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-black"> {/* Modified text color */}
                <p className="mb-3 text-lg">Disfruta de la experiencia completa:</p>
                <ul className="list-disc list-inside space-y-2 mb-6 pl-2 text-yellow-800"> {/* Modified text color */}
                  <li>✨ Acceso Exclusivo a Skins Divertidos.</li>
                  <li>🏆 Niveles VIP con recompensas y reconocimiento.</li>
                  <li>📸 Filtros de Cámara únicos para tus videollamadas.</li>
                  <li>🚀 "Pasapalabra, hazte Popular": ¡Destaca!</li>
                  <li>♾️ Acceso Ilimitado a todas las funciones de juego.</li>
                </ul>
                {isTrialActive && trialTimeLeft && (
                  <p className="mb-4 text-center text-green-700 bg-green-200 p-2 rounded-md"> {/* Modified text and background */}
                    ¡Aún tienes {trialTimeLeft} de tu prueba gratuita!
                  </p>
                )}
                {trialTimeLeft && trialTimeLeft.includes("finalizado") && (
                  <p className="mb-4 text-center text-red-700 bg-red-200 p-2 rounded-md"> {/* Modified text and background */}
                    Tu prueba ha terminado. ¡Suscríbete para seguir disfrutando!
                  </p>
                )}
                <PayPalSubscribeButton userId={user.id} />
                <p className="text-xs text-black bg-yellow-200 p-1 rounded mt-3 text-center"> {/* Modified */}
                  La activación de la suscripción es gestionada por el backend.
                </p>
              </CardContent>
            </Card>
          )}

          <Card
            className={`bg-white/10 backdrop-blur-md border-white/20 ${!isPremiumActuallyActive ? "md:col-span-1" : "md:col-span-2"}`}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="h-6 w-6" /> Personalización
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/80 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-400" /> Mis Skins
                </h3>
                {loadingSkins ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Cargando skins...
                  </div>
                ) : skinsError ? (
                  <p className="text-sm text-red-400">{skinsError}</p>
                ) : userSkins.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {userSkins.map((skin) => (
                      <div key={skin.id} className="p-2 bg-black/20 rounded-md text-center">
                        <img
                          src={
                            skin.image_url ||
                            `/placeholder.svg?width=80&height=80&query=${encodeURIComponent(skin.name)}`
                          }
                          alt={skin.name}
                          className="w-16 h-16 mx-auto mb-1 rounded object-cover aspect-square"
                        />
                        <p className="text-xs truncate" title={skin.name}>
                          {skin.name}
                        </p>
                        {skin.is_equipped && <span className="text-xxs text-green-400">(Equipado)</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">
                    {canAccessPremiumCustomization
                      ? "No tienes skins desbloqueados."
                      : "¡Hazte Premium para desbloquear skins!"}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Film className="h-5 w-5 text-purple-400" /> Mis Filtros de Cámara
                </h3>
                {loadingFilters ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Cargando filtros...
                  </div>
                ) : filtersError ? (
                  <p className="text-sm text-red-400">{filtersError}</p>
                ) : userFilters.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {userFilters.map((filter) => (
                      <div key={filter.id} className="p-2 bg-black/20 rounded-md text-center">
                        <img
                          src={
                            filter.thumbnail_url ||
                            `/placeholder.svg?width=80&height=80&query=${encodeURIComponent(filter.name)}`
                          }
                          alt={filter.name}
                          className="w-16 h-16 mx-auto mb-1 rounded object-cover aspect-square"
                        />
                        <p className="text-xs truncate" title={filter.name}>
                          {filter.name}
                        </p>
                        {/* Add equipped status if applicable */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">
                    {canAccessPremiumCustomization
                      ? "No tienes filtros desbloqueados."
                      : "¡Hazte Premium para desbloquear filtros!"}
                  </p>
                )}
              </div>

              {!canAccessPremiumCustomization && (userSkins.length === 0 || userFilters.length === 0) && (
                <p className="text-center mt-4 bg-yellow-300 p-1 rounded text-black">
                  {/* MODIFIED PART: Removed onClick and changed to <span> */}
                  <span className="underline">¡Hazte Premium</span>{" "}
                  para desbloquear más opciones de personalización!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Games (Placeholder) */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">🔴 Partidas en Vivo (Próximamente)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70">Aquí se mostrará una lista de partidas públicas.</p>
          </CardContent>
        </Card>

        <div className="mt-8">
          <ConnectionStatus />
        </div>
      </div>
    </div>
  )
}
