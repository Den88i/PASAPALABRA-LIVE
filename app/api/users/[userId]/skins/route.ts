import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
// import type { Skin } from "@/lib/database"; // For joined data

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const { userId } = params

  if (!userId) {
    return NextResponse.json({ error: "User ID es requerido" }, { status: 400 })
  }

  try {
    // This query should now work without the "relation does not exist" error
    const queryResult = await sql`
      SELECT 
        s.id, 
        s.name, 
        s.description, 
        s.image_url, 
        s.type, 
        s.rarity, 
        s.is_premium_only, 
        s.cost_coins, 
        s.created_at AS skin_created_at, -- Alias to avoid name collision
        s.updated_at AS skin_updated_at, -- Alias to avoid name collision
        uus.unlocked_at,
        uus.is_equipped
      FROM user_unlocked_skins uus
      JOIN skins s ON uus.skin_id = s.id
      WHERE uus.user_id = ${userId};
    `

    // Ensure queryResult and queryResult.rows are valid before proceeding
    if (!queryResult || !Array.isArray(queryResult)) {
      // Adjusted based on previous findings that sql might return array directly
      console.error(`Error fetching skins for user ${userId}: Invalid query result structure. Expected array.`, {
        queryResult,
      })
      return NextResponse.json({ error: "Error interno al procesar datos de skins del usuario" }, { status: 500 })
    }

    const serializableUserSkins = queryResult.map((row: any) => {
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

    return NextResponse.json(serializableUserSkins)
  } catch (error) {
    console.error(`Error fetching skins for user ${userId}:`, error)
    // Check if the error is due to a specific known issue, e.g., table not found (though this should be resolved)
    if (error instanceof Error && error.message.includes("relation") && error.message.includes("does not exist")) {
      return NextResponse.json({ error: `Error de base de datos: ${error.message}` }, { status: 500 })
    }
    return NextResponse.json({ error: "Error interno al obtener skins del usuario" }, { status: 500 })
  }
}
