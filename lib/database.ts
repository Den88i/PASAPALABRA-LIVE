import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no está configurada en las variables de entorno")
  throw new Error("DATABASE_URL is required")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

export interface User {
  id: string
  username: string
  email: string
  password_hash: string // This field is for DB representation, avoid sending to client.
  avatar_url: string | null // Based on schema, likely nullable
  role: "player" | "admin" | "moderator" | "user" // Matches defaultRole, adjust if your roles differ
  is_active: boolean
  is_verified: boolean
  created_at: string // Assuming text representation (e.g., from ::text cast)
  updated_at: string // Assuming text representation
  last_login: string | null // Based on schema, likely nullable
  total_games: number
  total_wins: number
  total_points: number
  trial_ends_at: string | null // Based on schema and ::text cast
  xp: number // Nuevo campo
  current_vip_level_number: number // Nuevo campo (referencia a VipLevel.level_number)
  is_premium: boolean // Nuevo campo
  premium_expires_at: string | null // Nuevo campo
  // Consider adding a direct vip_level object if fetched with a JOIN
  // current_vip_level?: VipLevel;
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

// Interfaces para las nuevas entidades
export interface Skin {
  id: string
  name: string
  description: string | null
  image_url: string | null
  type: "game_board" | "avatar_frame" | "ui_theme"
  rarity: "common" | "rare" | "epic" | "legendary"
  is_premium_only: boolean
  cost_coins: number
  created_at: string
  updated_at: string
}

export interface UserSkin {
  user_id: string
  skin_id: string
  unlocked_at: string
  is_equipped: boolean
}

export interface VipLevel {
  level_number: number
  name: string
  description: string | null
  required_xp: number
  badge_icon_url: string | null
  created_at: string
}

export interface CameraFilter {
  id: string
  name: string
  description: string | null
  thumbnail_url: string | null
  filter_identifier: string
  is_premium_only: boolean
  created_at: string
}

export interface UserCameraFilter {
  user_id: string
  filter_id: string
  unlocked_at: string
}
