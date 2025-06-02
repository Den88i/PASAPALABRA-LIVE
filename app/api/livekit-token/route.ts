import { type NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const room = searchParams.get("room")
    const username = searchParams.get("username")
    const userId = searchParams.get("userId")

    if (!room || !username || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verificar que las variables de entorno estén disponibles
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      console.error("LiveKit API key or secret is missing")
      return NextResponse.json({ error: "LiveKit configuration missing" }, { status: 500 })
    }

    // Determinar si es espectador basado en múltiples factores
    const spectatorParam = searchParams.get("spectator")
    const isSpectator =
      spectatorParam === "true" ||
      username.includes("👁️") ||
      username.toLowerCase().includes("spectator") ||
      request.nextUrl.pathname.includes("/spectate/")

    console.log("Spectator detection:", {
      spectatorParam,
      username,
      pathname: request.nextUrl.pathname,
      isSpectator,
    })

    // Crear el token JWT manualmente
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 3600 // Token válido por 1 hora

    const header = {
      alg: "HS256",
      typ: "JWT",
    }

    const payload = {
      iss: apiKey,
      sub: userId,
      iat: now,
      exp: exp,
      nbf: now,
      video: {
        roomJoin: true,
        room: room,
        // Permisos basados en el tipo de usuario
        canPublish: !isSpectator, // Espectadores no pueden publicar
        canSubscribe: true, // Todos pueden suscribirse
        canPublishData: true, // Todos pueden usar chat
        canUpdateOwnMetadata: true,
      },
      metadata: JSON.stringify({
        username: username,
        userId: userId,
        isSpectator: isSpectator,
      }),
    }

    // Función para codificar en base64url
    const base64urlEncode = (obj: any) => {
      return Buffer.from(JSON.stringify(obj))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "")
    }

    // Crear las partes del JWT
    const encodedHeader = base64urlEncode(header)
    const encodedPayload = base64urlEncode(payload)

    // Crear la firma
    const signature = createHmac("sha256", apiSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")

    const token = `${encodedHeader}.${encodedPayload}.${signature}`

    return NextResponse.json({
      token,
      isSpectator,
      permissions: {
        canPublish: !isSpectator,
        canSubscribe: true,
        canPublishData: true,
      },
    })
  } catch (error) {
    console.error("Error generating LiveKit token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
