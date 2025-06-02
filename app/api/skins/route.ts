import { NextResponse } from "next/server"
import { sql } from "@/lib/database" // Assuming this is your Neon SQL client
// import type { Skin } from "@/lib/database"; // Uncomment if you have this type

export async function GET() {
  try {
    // Assuming 'sql' returns the array of rows directly
    const skinsFromDb = await sql`
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

    // Defensive check if skinsFromDb is not an array (e.g., null or undefined from an error)
    if (!Array.isArray(skinsFromDb)) {
      console.error("Error fetching skins: Expected an array from DB query, got:", skinsFromDb)
      return NextResponse.json(
        { error: "Error interno al obtener skins: resultado de consulta inválido" },
        { status: 500 },
      )
    }

    const serializableSkins = skinsFromDb.map((skin: any) => {
      const newSkin: { [key: string]: any } = {}
      for (const key in skin) {
        if (Object.prototype.hasOwnProperty.call(skin, key)) {
          const value = skin[key]
          if (value instanceof Date) {
            newSkin[key] = value.toISOString()
          } else if (typeof value === "bigint") {
            // Handle BigInt if any columns are BigInt
            newSkin[key] = value.toString()
          } else {
            newSkin[key] = value
          }
        }
      }
      return newSkin
    })

    return NextResponse.json(serializableSkins)
  } catch (error) {
    console.error("Error fetching skins:", error)
    return NextResponse.json({ error: "Error interno al obtener skins" }, { status: 500 })
  }
}
