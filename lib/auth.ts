import { sql } from "./database"
import bcrypt from "bcryptjs"
import type { User } from "./database"

export async function createUser(username: string, email: string, password: string): Promise<User | null> {
  try {
    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING *
    `

    return result[0] as User
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${email} AND is_active = true
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0] as User

    // Verificar la contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) return null

    // Actualizar último login
    await sql`
      UPDATE users 
      SET last_login = NOW() 
      WHERE id = ${user.id}
    `

    return user
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
    return (result[0] as User) || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}
