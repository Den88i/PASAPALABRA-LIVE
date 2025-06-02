import { NextResponse } from "next/server"
import { sql } from "@/lib/database" // Assuming this is your Neon SQL client
// import type { CameraFilter } from "@/lib/database"; // Uncomment if you have this type

export async function GET() {
  try {
    // Assuming 'sql' returns the array of rows directly
    const filtersFromDb = await sql`
      SELECT 
        id, 
        name, 
        description, 
        thumbnail_url, 
        filter_identifier, 
        is_premium_only,
        created_at
        -- Add other relevant fields for camera_filters if any
      FROM camera_filters;
    `

    // Defensive check if filtersFromDb is not an array
    if (!Array.isArray(filtersFromDb)) {
      console.error("Error fetching camera filters: Expected an array from DB query, got:", filtersFromDb)
      return NextResponse.json(
        { error: "Error interno al obtener filtros de cámara: resultado de consulta inválido" },
        { status: 500 },
      )
    }

    const serializableFilters = filtersFromDb.map((filter: any) => {
      const newFilter: { [key: string]: any } = {}
      for (const key in filter) {
        if (Object.prototype.hasOwnProperty.call(filter, key)) {
          const value = filter[key]
          if (value instanceof Date) {
            newFilter[key] = value.toISOString()
          } else if (typeof value === "bigint") {
            newFilter[key] = value.toString()
          } else {
            newFilter[key] = value
          }
        }
      }
      return newFilter
    })

    return NextResponse.json(serializableFilters)
  } catch (error) {
    console.error("Error fetching camera filters:", error)
    return NextResponse.json({ error: "Error interno al obtener filtros de cámara" }, { status: 500 })
  }
}
