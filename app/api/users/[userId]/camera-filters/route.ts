import { NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const { userId } = params

  if (!userId) {
    return NextResponse.json({ error: "User ID es requerido" }, { status: 400 })
  }

  try {
    // Assuming sql returns the array of rows directly
    const rows = await sql`
      SELECT 
        cf.id, 
        cf.name, 
        cf.description, 
        cf.thumbnail_url, 
        cf.filter_identifier, 
        cf.is_premium_only,
        cf.created_at AS filter_created_at,
        uucf.unlocked_at
      FROM user_unlocked_camera_filters uucf
      JOIN camera_filters cf ON uucf.camera_filter_id = cf.id
      WHERE uucf.user_id = ${userId};
    `

    if (!Array.isArray(rows)) {
      console.error(`Error fetching camera filters for user ${userId}: Expected an array from SQL query, got:`, rows)
      return NextResponse.json(
        { error: "Error interno al obtener filtros de cámara del usuario: resultado de consulta inválido" },
        { status: 500 },
      )
    }

    const serializableUserFilters = rows.map((row: any) => {
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
      // Ensure all expected fields from CameraFilter & UserCameraFilter are present or defaulted
      return {
        id: newRow.id,
        name: newRow.name,
        description: newRow.description,
        thumbnail_url: newRow.thumbnail_url,
        filter_identifier: newRow.filter_identifier,
        is_premium_only: newRow.is_premium_only,
        created_at: newRow.filter_created_at, // from camera_filters table
        unlocked_at: newRow.unlocked_at, // from user_unlocked_camera_filters table
      }
    })

    return NextResponse.json(serializableUserFilters)
  } catch (error) {
    console.error(`Error fetching camera filters for user ${userId}:`, error)
    return NextResponse.json({ error: "Error interno al obtener filtros de cámara del usuario" }, { status: 500 })
  }
}
