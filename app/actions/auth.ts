"use server"

import { sql } from "@/lib/database"
import { v4 as uuidv4 } from "uuid" // Consider crypto.randomUUID() if Node.js version supports it well in this env
import { hash } from "bcryptjs"
import { authenticateUser, getUserByEmail } from "@/lib/auth"
import type { User } from "@/lib/database" // Ensure User type includes all necessary fields

// Define a more specific type for the user data returned to the client
interface ClientUser {
  id: string
  username: string
  email: string
  role: string
  avatar_url: string | null
  is_active: boolean
  is_verified: boolean
  total_games: number
  total_wins: number
  total_points: number
  trial_ends_at: string | null // ISO string
  xp: number
  current_vip_level_number: number
  is_premium: boolean
  premium_expires_at: string | null // ISO string
  created_at: string // ISO string
}

function toClientUser(dbUser: User): ClientUser {
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    role: dbUser.role,
    avatar_url: dbUser.avatar_url,
    is_active: dbUser.is_active,
    is_verified: dbUser.is_verified,
    total_games: dbUser.total_games || 0,
    total_wins: dbUser.total_wins || 0,
    total_points: dbUser.total_points || 0,
    trial_ends_at: dbUser.trial_ends_at ? new Date(dbUser.trial_ends_at).toISOString() : null,
    xp: dbUser.xp || 0,
    current_vip_level_number: dbUser.current_vip_level_number || 0,
    is_premium: dbUser.is_premium || false,
    premium_expires_at: dbUser.premium_expires_at ? new Date(dbUser.premium_expires_at).toISOString() : null,
    created_at: new Date(dbUser.created_at).toISOString(),
  }
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "Todos los campos son obligatorios.", field: "general" }
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres.", field: "password" }
  }
  // Basic email validation
  if (!/\S+@\S+\.\S+/.test(email)) {
    return { error: "Por favor, introduce un email válido.", field: "email" }
  }

  try {
    const existingUser = await getUserByEmail(email) // getUserByEmail from lib/auth
    if (existingUser) {
      return { error: "Ya existe una cuenta con este email.", field: "email" }
    }

    const userId = uuidv4() // Or crypto.randomUUID()
    const hashedPassword = await hash(password, 12) // Increased rounds slightly
    const defaultRole = "user"
    const defaultXp = 0
    const defaultVipLevel = 0

    // The RETURNING clause should give us back the row as it was inserted.
    // Date/timestamp fields from Postgres via `sql` template literal might be Date objects or strings.
    // It's safer to explicitly convert them to ISO strings for the client.
    const result = await sql`
    INSERT INTO users (
      id, username, email, password_hash, 
      avatar_url, role, is_active, is_verified, 
      created_at, updated_at, last_login, 
      total_games, total_wins, total_points, 
      trial_ends_at, xp, current_vip_level_number,
      is_premium, premium_expires_at 
    )
    VALUES (
      ${userId}, ${name}, ${email}, ${hashedPassword}, 
      NULL, -- avatar_url
      ${defaultRole}, -- role
      true, -- is_active (activate on register, verify via email later if needed)
      false, -- is_verified (email verification pending)
      NOW(), -- created_at
      NOW(), -- updated_at
      NULL, -- last_login
      0, -- total_games
      0, -- total_wins
      0, -- total_points
      NOW() + INTERVAL '7 days', -- trial_ends_at
      ${defaultXp}, -- xp
      ${defaultVipLevel}, -- current_vip_level_number
      FALSE, -- is_premium (default)
      NULL -- premium_expires_at (default)
    )
    RETURNING 
      id, username, email, role, avatar_url, 
      is_active, is_verified, total_games, total_wins, total_points, 
      trial_ends_at, xp, current_vip_level_number,
      is_premium, premium_expires_at, 
      created_at, updated_at, last_login; 
  `

    const newUserFromDb = result.rows[0]

    if (!newUserFromDb) {
      // This case should be rare if the INSERT was successful and RETURNING was used.
      console.error("Registration failed: No user data returned after insert.")
      return { error: "Error al crear la cuenta. Inténtalo de nuevo más tarde.", field: "general" }
    }

    return {
      success: true,
      user: toClientUser(newUserFromDb as User), // Use the utility function
    }
  } catch (e: any) {
    console.error("Error registering user:", e.message, e.stack)
    if (e.code === "23505") {
      // PostgreSQL unique violation error code
      if (e.constraint_name && e.constraint_name.includes("email")) {
        return { error: "Ya existe una cuenta con este email.", field: "email" }
      }
      if (e.constraint_name && e.constraint_name.includes("username")) {
        return { error: "Este nombre de usuario ya está en uso.", field: "name" }
      }
      return { error: "Ya existe una cuenta con estos datos (email o nombre de usuario).", field: "general" }
    }
    return { error: "Error de base de datos: No se pudo registrar el usuario.", field: "general" }
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: true; user: ClientUser } | { error: string; field?: string }> {
  try {
    if (!email || !password) {
      return { error: "Email y contraseña son obligatorios.", field: "general" }
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return { error: "Por favor, introduce un email válido.", field: "email" }
    }

    const userFromDb = await authenticateUser(email, password) // From lib/auth

    if (!userFromDb) {
      // Check if user exists but password was wrong, or if user doesn't exist at all
      const potentialUser = await getUserByEmail(email)
      if (potentialUser) {
        return { error: "Contraseña incorrecta.", field: "password" }
      }
      return { error: "No se encontró una cuenta con ese email.", field: "email" }
    }

    // userFromDb from authenticateUser should now include all necessary fields
    // and have dates as ISO strings if User type in lib/auth is handled correctly.
    return {
      success: true,
      user: toClientUser(userFromDb), // Use the utility function
    }
  } catch (error) {
    console.error("Error en loginUser action:", error)
    return { error: "Error interno del servidor al iniciar sesión.", field: "general" }
  }
}
