import { NextResponse } from "next/server"
import { sql } from "@/lib/database"
// Ensure Skin type is imported if you use it for type-checking `newSkin`
// import type { Skin } from "@/lib/database";

export async function GET() {
  try {
    const queryResult = await sql`
      SELECT 
        id, 
        name, 
        description, 
        image_url, 
        type, 
        rarity, 
        is_premium_only, 
        cost_coins, 
        created_at,
        updated_at
      FROM skins;
    `

    const serializableSkins = queryResult.rows.map((skin: any) => {
      const newSkin: { [key: string]: any } = {}
      for (const key in skin) {
        if (Object.prototype.hasOwnProperty.call(skin, key)) {
          const value = skin[key]
          if (value instanceof Date) {
            newSkin[key] = value.toISOString()
          } else if (typeof value === "bigint") {
            newSkin[key] = value.toString()
          } else {
            newSkin[key] = value
          }
        }
      }
      return newSkin
      // Or, if you know the specific date fields:
      // return {
      //   ...skin,
      //   created_at: skin.created_at instanceof Date ? skin.created_at.toISOString() : skin.created_at,
      //   updated_at: skin.updated_at instanceof Date ? skin.updated_at.toISOString() : skin.updated_at,
      // };
    })

    return NextResponse.json(serializableSkins)
  } catch (error) {
    console.error("Error fetching skins:", error)
    // The error object itself might be the serialization error.
    // Log it for server-side debugging.
    return NextResponse.json({ error: "Error interno al obtener skins" }, { status: 500 })
  }
}
