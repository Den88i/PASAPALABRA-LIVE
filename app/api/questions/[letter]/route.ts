import { sql } from "@/lib/database"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { letter: string } }) {
  try {
    const { letter } = params

    // Obtener una pregunta aleatoria para la letra especificada
    const result = await sql`
      SELECT id, letter, question_text, correct_answer
      FROM questions 
      WHERE letter = ${letter.toUpperCase()} 
      AND is_active = true
      ORDER BY RANDOM()
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "No se encontraron preguntas para esta letra" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
