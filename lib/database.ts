import { neon } from "@neondatabase/serverless"

// Verificar que DATABASE_URL esté disponible
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no está configurada en las variables de entorno")
  throw new Error("DATABASE_URL is required")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

// Tipos de datos para TypeScript
export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  avatar_url?: string
  role: "player" | "admin" | "moderator"
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  last_login?: string
  total_games: number
  total_wins: number
  total_points: number
}

export interface Game {
  id: string
  game_type: "real_time" | "tournament" | "practice"
  status: "waiting" | "in_progress" | "finished" | "cancelled"
  max_players: number
  current_round: number
  total_rounds: number
  created_at: string
  started_at?: string
  finished_at?: string
  winner_id?: string
  created_by: string
}

export interface Tournament {
  id: string
  name: string
  description?: string
  max_participants: number
  entry_fee: number
  prize_pool: number
  status: "upcoming" | "registration" | "in_progress" | "finished"
  start_date?: string
  end_date?: string
  created_at: string
  created_by: string
}
