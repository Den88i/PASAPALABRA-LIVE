import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificar que las variables de entorno críticas estén disponibles
    const requiredEnvVars = ["DATABASE_URL"]
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          status: "error",
          message: `Missing environment variables: ${missingVars.join(", ")}`,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Verificar conexión a la base de datos
    try {
      const { sql } = await import("@/lib/database")
      await sql`SELECT 1`
    } catch (dbError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "ok",
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        livekit: process.env.NEXT_PUBLIC_LIVEKIT_URL ? "configured" : "not_configured",
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function HEAD() {
  // Versión simplificada para verificaciones rápidas
  try {
    return new Response(null, { status: 200 })
  } catch {
    return new Response(null, { status: 500 })
  }
}
