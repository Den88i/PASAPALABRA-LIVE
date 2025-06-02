"use server"

import { sql } from "@/lib/database"
import type { User, VipLevel } from "@/lib/database"

interface UpdateUserXpResult {
  success: boolean
  message?: string
  updatedUser?: Partial<User> // Devolver solo los campos actualizados relevantes
  newLevelReached?: boolean
  newVipLevel?: VipLevel
  error?: string
}

export async function updateUserXpAndLevel(userId: string, xpGained: number): Promise<UpdateUserXpResult> {
  if (!userId || xpGained <= 0) {
    return { success: false, error: "ID de usuario inválido o XP ganado no positivo." }
  }

  try {
    // Iniciar una transacción si es posible o manejar con cuidado múltiples queries
    // Para Neon Serverless, las transacciones explícitas BEGIN/COMMIT pueden no ser ideales para funciones serverless cortas.
    // Considera la atomicidad si es crítico. Por ahora, haremos queries secuenciales.

    // 1. Obtener el usuario actual
    const userResult = await sql<User[]>`
      SELECT id, xp, current_vip_level_number 
      FROM users 
      WHERE id = ${userId};
    `
    if (userResult.rows.length === 0) {
      return { success: false, error: "Usuario no encontrado." }
    }
    const currentUser = userResult.rows[0]
    const newTotalXp = (currentUser.xp || 0) + xpGained

    // 2. Obtener todos los niveles VIP, ordenados por required_xp
    const vipLevelsResult = await sql<VipLevel[]>`
      SELECT level_number, name, required_xp, description, badge_icon_url 
      FROM vip_levels 
      ORDER BY required_xp DESC; 
      -- DESC para encontrar el nivel más alto alcanzado fácilmente
    `
    const allVipLevels = vipLevelsResult.rows

    // 3. Determinar el nuevo nivel VIP
    let newPotentialVipLevelNumber = currentUser.current_vip_level_number
    let newVipLevelDetails: VipLevel | undefined = undefined

    for (const level of allVipLevels) {
      if (newTotalXp >= level.required_xp) {
        newPotentialVipLevelNumber = level.level_number
        newVipLevelDetails = level
        break // Encontramos el nivel más alto que cumple
      }
    }

    // Si no se encontró ningún nivel (ej. 0 XP y no hay nivel para 0 XP), mantener el actual o default 0
    if (newVipLevelDetails === undefined && allVipLevels.some((l) => l.required_xp === 0)) {
      const zeroLevel = allVipLevels.find((l) => l.required_xp === 0)
      if (zeroLevel) {
        newPotentialVipLevelNumber = zeroLevel.level_number
        newVipLevelDetails = zeroLevel
      }
    } else if (newVipLevelDetails === undefined) {
      // Fallback si no hay nivel 0 y el usuario tiene 0 XP, mantener el nivel actual.
      // O si el usuario tiene XP pero no alcanza ningún nivel definido (poco probable con un nivel 0).
      newPotentialVipLevelNumber = currentUser.current_vip_level_number
      newVipLevelDetails = allVipLevels.find((l) => l.level_number === currentUser.current_vip_level_number)
    }

    const newLevelReached = newPotentialVipLevelNumber !== currentUser.current_vip_level_number

    // 4. Actualizar el usuario en la base de datos
    const updateUserResult = await sql`
      UPDATE users
      SET 
        xp = ${newTotalXp},
        current_vip_level_number = ${newPotentialVipLevelNumber}
      WHERE id = ${userId}
      RETURNING xp, current_vip_level_number;
    `

    if (updateUserResult.rows.length === 0) {
      return { success: false, error: "No se pudo actualizar el usuario." }
    }

    return {
      success: true,
      updatedUser: {
        xp: updateUserResult.rows[0].xp,
        current_vip_level_number: updateUserResult.rows[0].current_vip_level_number,
      },
      newLevelReached,
      newVipLevel: newLevelReached ? newVipLevelDetails : undefined,
      message: newLevelReached
        ? `¡Felicidades! Has alcanzado el nivel VIP: ${newVipLevelDetails?.name}`
        : "XP actualizado.",
    }
  } catch (error) {
    console.error("Error updating user XP and level:", error)
    return { success: false, error: "Error interno del servidor al actualizar XP." }
  }
}
