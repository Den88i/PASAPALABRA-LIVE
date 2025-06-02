import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
// import type { CameraFilter } from "@/lib/database";

export async function GET() {
  try {
    const queryResult = await sql`
      SELECT 
        id, 
        name, 
        description, 
        thumbnail_url, 
        filter_identifier, 
        is_premium_only,
        created_at,
        updated_at
      FROM camera_filters;
    `

    const serializableFilters = queryResult.rows.map((filter: any) => {
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
