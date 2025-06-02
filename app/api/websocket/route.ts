import type { NextRequest } from "next/server"

// Configuración para WebSocket en Vercel Edge Runtime
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  // En desarrollo local
  if (process.env.NODE_ENV === "development") {
    return new Response("WebSocket server running on port 3001", { status: 200 })
  }

  // En producción, usar Vercel WebSocket o servicio externo
  return new Response("WebSocket endpoint", { status: 200 })
}
