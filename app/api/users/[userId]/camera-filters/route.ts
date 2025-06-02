import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
// import type { CameraFilter } from "@/lib/database"; // For joined data

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const { userId } = params

  if (!userId) {
    return NextResponse.json({ error: "User ID es requerido" }, { status: 400 })
  }

  try {
    const queryResult = await sql`
      SELECT 
        cf.id, 
        cf.name, 
        cf.description, 
        cf.thumbnail_url, 
        cf.filter_identifier, 
        cf.is_premium_only,
        cf.created_at AS filter_created_at, -- Alias to avoid name collision
        cf.updated_at AS filter_updated_at, -- Alias to avoid name collision
        uucf.unlocked_at
        -- Assuming user_unlocked_camera_filters doesn't have is_equipped, add if it does
      FROM user_unlocked_camera_filters uucf
      JOIN camera_filters cf ON uucf.camera_filter_id = cf.id
      WHERE uucf.user_id = ${userId};
    `

    const serializableUserFilters = queryResult.rows.map((row: any) => {
      const newRow: { [key: string]: any } = {}
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          const value = row[key]
          if (value instanceof Date) {
            newRow[key] = value.toISOString()
          } else if (typeof value === "bigint") {
            newRow[key] = value.toString()
          } else {
            newRow[key] = value
          }
        }
      }
      return newRow
    })

    return NextResponse.json(serializableUserFilters)
  } catch (error) {
    console.error(`Error fetching camera filters for user ${userId}:`, error)
    return NextResponse.json({ error: "Error interno al obtener filtros de cámara del usuario" }, { status: 500 })
  }
}
