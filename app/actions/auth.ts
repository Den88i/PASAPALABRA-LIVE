"use server"

import { authenticateUser, getUserByEmail, createUser } from "@/lib/auth"

export async function registerUser(username: string, email: string, password: string) {
  // Validaciones básicas
  if (!username || !email || !password) {
    return { error: "Todos los campos son obligatorios" }
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" }
  }

  // Verificar si el usuario ya existe
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return { error: "Ya existe una cuenta con este email" }
  }

  // Crear el usuario
  const user = await createUser(username, email, password) // Esta línea es la importante

  if (!user) {
    return { error: "Error al crear la cuenta. Inténtalo de nuevo." }
  }

  // Retornar el usuario para manejar en el cliente
  // Asegúrate que el objeto user que devuelves aquí coincida con la estructura esperada en el frontend
  // y con los campos que realmente devuelve tu función createUser.
  // El tipo User en lib/database.ts es la referencia.
  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      total_games: user.total_games || 0, // Asegurar valores por defecto si son opcionales
      total_wins: user.total_wins || 0,
      total_points: user.total_points || 0,
      // Agrega otros campos necesarios que devuelve createUser
    },
  }
}

export async function loginUser(email: string, password: string) {
  try {
    if (!email || !password) {
      return { error: "Email y contraseña son obligatorios" }
    }

    const user = await authenticateUser(email, password)
    if (!user) {
      return { error: "Email o contraseña incorrectos" }
    }

    // Retornar el usuario para manejar en el cliente
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        total_games: user.total_games,
        total_wins: user.total_wins,
        total_points: user.total_points,
      },
    }
  } catch (error) {
    console.error("Error en loginUser:", error)
    return { error: "Error interno al iniciar sesión" }
  }
}
