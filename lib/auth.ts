import { sql } from "./database"
import bcrypt from "bcryptjs"
import type { User } from "./database" // Ensure User type includes is_premium and premium_expires_at

export async function createUser(username: string, email: string, password: string): Promise<User | null> {
  // This function seems to be a more direct DB interaction, potentially used by an admin panel or tests.
  // The main registration logic is in app/actions/auth.ts which is more complete.
  // For consistency, ensure this also handles all relevant fields if used directly.
  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const userId = crypto.randomUUID() // Using crypto.randomUUID() for modern Node.js

    // Assuming default values similar to app/actions/auth.ts for a basic user
    const result = await sql`
      INSERT INTO users (
        id, username, email, password_hash, 
        role, is_active, is_verified, 
        created_at, updated_at, 
        total_games, total_wins, total_points, 
        trial_ends_at, xp, current_vip_level_number,
        is_premium, premium_expires_at
      )
      VALUES (
        ${userId}, ${username}, ${email}, ${hashedPassword}, 
        'user', true, false, 
        NOW(), NOW(), 
        0, 0, 0, 
        NOW() + INTERVAL '7 days', 0, 0,
        FALSE, NULL
      )
      RETURNING *; 
    `
    // Ensure all fields, including is_premium and premium_expires_at, are part of the User type
    // and correctly cast if necessary (e.g., dates to string if your User type expects that)
    const dbUser = result.rows[0]
    return {
      ...dbUser,
      trial_ends_at: dbUser.trial_ends_at ? new Date(dbUser.trial_ends_at).toISOString() : null,
      premium_expires_at: dbUser.premium_expires_at ? new Date(dbUser.premium_expires_at).toISOString() : null,
      created_at: new Date(dbUser.created_at).toISOString(),
      updated_at: new Date(dbUser.updated_at).toISOString(),
      last_login: dbUser.last_login ? new Date(dbUser.last_login).toISOString() : null,
    } as User
  } catch (error) {
    console.error("Error creating user in lib/auth:", error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT 
        id, username, email, password_hash, role, avatar_url, 
        is_active, is_verified, total_games, total_wins, total_points, 
        trial_ends_at, xp, current_vip_level_number,
        is_premium, premium_expires_at, 
        created_at, updated_at, last_login
      FROM users 
      WHERE email = ${email} AND is_active = true;
    `

    if (result.rows.length === 0) {
      return null // User not found or not active
    }

    const userFromDb = result.rows[0]

    const isValidPassword = await bcrypt.compare(password, userFromDb.password_hash)

    if (!isValidPassword) {
      return null // Invalid password
    }

    // Update last login timestamp
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${userFromDb.id};
    `
    // Ensure all fields, including is_premium and premium_expires_at, are part of the User type
    // and correctly cast if necessary (e.g., dates to string if your User type expects that)
    return {
      ...userFromDb,
      trial_ends_at: userFromDb.trial_ends_at ? new Date(userFromDb.trial_ends_at).toISOString() : null,
      premium_expires_at: userFromDb.premium_expires_at ? new Date(userFromDb.premium_expires_at).toISOString() : null,
      created_at: new Date(userFromDb.created_at).toISOString(),
      updated_at: new Date(userFromDb.updated_at).toISOString(),
      last_login: new Date().toISOString(), // Reflecting the NOW() update
    } as User
  } catch (error) {
    console.error("Error authenticating user in lib/auth:", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT 
        id, username, email, password_hash, role, avatar_url, 
        is_active, is_verified, total_games, total_wins, total_points, 
        trial_ends_at, xp, current_vip_level_number,
        is_premium, premium_expires_at, 
        created_at, updated_at, last_login
      FROM users 
      WHERE email = ${email};
    `
    if (result.rows.length === 0) {
      return null
    }
    const userFromDb = result.rows[0]
    // Ensure all fields, including is_premium and premium_expires_at, are part of the User type
    // and correctly cast if necessary (e.g., dates to string if your User type expects that)
    return {
      ...userFromDb,
      trial_ends_at: userFromDb.trial_ends_at ? new Date(userFromDb.trial_ends_at).toISOString() : null,
      premium_expires_at: userFromDb.premium_expires_at ? new Date(userFromDb.premium_expires_at).toISOString() : null,
      created_at: new Date(userFromDb.created_at).toISOString(),
      updated_at: new Date(userFromDb.updated_at).toISOString(),
      last_login: userFromDb.last_login ? new Date(userFromDb.last_login).toISOString() : null,
    } as User
  } catch (error) {
    console.error("Error getting user by email in lib/auth:", error)
    return null
  }
}
