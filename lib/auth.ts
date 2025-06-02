import { sql } from "./database" // This sql function seems to return rows[] directly
import bcrypt from "bcryptjs"
import type { User } from "./database"

export async function createUser(username: string, email: string, password: string): Promise<User | null> {
  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const userId = crypto.randomUUID()

    // Assuming `sql` returns the array of rows directly for RETURNING clauses
    const rows = await sql`
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
    // If `sql` returns rows directly, `rows` is the array.
    if (!rows || rows.length === 0) {
      console.error("Error creating user in lib/auth: Insert query did not return user data.", {
        username,
        email,
        queryResultRows: rows,
      })
      return null
    }

    const dbUser = rows[0]
    return {
      ...dbUser,
      trial_ends_at: dbUser.trial_ends_at ? new Date(dbUser.trial_ends_at).toISOString() : null,
      premium_expires_at: dbUser.premium_expires_at ? new Date(dbUser.premium_expires_at).toISOString() : null,
      created_at: new Date(dbUser.created_at).toISOString(),
      updated_at: new Date(dbUser.updated_at).toISOString(),
      last_login: dbUser.last_login ? new Date(dbUser.last_login).toISOString() : null,
    } as User
  } catch (error) {
    console.error("Error creating user in lib/auth (catch block):", error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    // Assuming `sql` returns the array of rows directly
    const rows = await sql`
      SELECT 
        id, username, email, password_hash, role, avatar_url, 
        is_active, is_verified, total_games, total_wins, total_points, 
        trial_ends_at, xp, current_vip_level_number,
        is_premium, premium_expires_at, 
        created_at, updated_at, last_login
      FROM users 
      WHERE email = ${email} AND is_active = true;
    `

    // `rows` is now expected to be the array of users or undefined/null if error
    if (!rows) {
      console.error("Error authenticating user in lib/auth: Query result (rows array) is undefined.", {
        email,
        queryResultRows: rows, // Will log undefined if rows is undefined
      })
      return null // Indicates a problem with the query or DB connection
    }

    if (rows.length === 0) {
      return null // User not found or not active
    }

    const userFromDb = rows[0]
    const isValidPassword = await bcrypt.compare(password, userFromDb.password_hash)

    if (!isValidPassword) {
      return null // Invalid password
    }

    // For UPDATE, the return might be different (e.g., rowCount or an object with rowCount)
    // Let's assume the `sql` for UPDATE doesn't need its result processed here, or it also returns rows if RETURNING was used.
    // If it's just an UPDATE without RETURNING, the result might be a count or similar.
    // For simplicity, we'll assume the UPDATE is successful if it doesn't throw.
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${userFromDb.id};
    `
    return {
      ...userFromDb,
      trial_ends_at: userFromDb.trial_ends_at ? new Date(userFromDb.trial_ends_at).toISOString() : null,
      premium_expires_at: userFromDb.premium_expires_at ? new Date(userFromDb.premium_expires_at).toISOString() : null,
      created_at: new Date(userFromDb.created_at).toISOString(),
      updated_at: new Date(userFromDb.updated_at).toISOString(),
      last_login: new Date().toISOString(), // Reflecting the NOW() update
    } as User
  } catch (error) {
    console.error("Error authenticating user in lib/auth (catch block):", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // Assuming `sql` returns the array of rows directly
    const rows = await sql`
      SELECT 
        id, username, email, password_hash, role, avatar_url, 
        is_active, is_verified, total_games, total_wins, total_points, 
        trial_ends_at, xp, current_vip_level_number,
        is_premium, premium_expires_at, 
        created_at, updated_at, last_login
      FROM users 
      WHERE email = ${email};
    `
    // `rows` is now expected to be the array of users or undefined/null if error
    if (!rows) {
      console.error("Error getting user by email in lib/auth: Query result (rows array) is undefined.", {
        email,
        queryResultRows: rows, // Will log undefined if rows is undefined
      })
      return null
    }

    if (rows.length === 0) {
      return null // User not found
    }
    const userFromDb = rows[0]
    return {
      ...userFromDb,
      trial_ends_at: userFromDb.trial_ends_at ? new Date(userFromDb.trial_ends_at).toISOString() : null,
      premium_expires_at: userFromDb.premium_expires_at ? new Date(userFromDb.premium_expires_at).toISOString() : null,
      created_at: new Date(userFromDb.created_at).toISOString(),
      updated_at: new Date(userFromDb.updated_at).toISOString(),
      last_login: userFromDb.last_login ? new Date(userFromDb.last_login).toISOString() : null,
    } as User
  } catch (error) {
    console.error("Error getting user by email in lib/auth (catch block):", error)
    return null
  }
}
