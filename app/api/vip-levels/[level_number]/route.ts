import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET(request: Request, { params }: { params: { level_number: string } }) {
  const level_number = params.level_number

  try {
    const result = await sql`SELECT * FROM vip_levels WHERE level = ${level_number};`

    const rawVipLevel = result.rows[0] // Assuming result is the query result
    if (!rawVipLevel) {
      return NextResponse.json({ error: "Nivel VIP no encontrado" }, { status: 404 })
    }

    const serializableVipLevel: { [key: string]: any } = {}
    for (const key in rawVipLevel) {
      if (Object.prototype.hasOwnProperty.call(rawVipLevel, key)) {
        const value = rawVipLevel[key]
        if (value instanceof Date) {
          serializableVipLevel[key] = value.toISOString()
        } else if (typeof value === "bigint") {
          serializableVipLevel[key] = value.toString()
        } else {
          serializableVipLevel[key] = value
        }
      }
    }
    return NextResponse.json(serializableVipLevel)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
