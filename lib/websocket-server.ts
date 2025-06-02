// Servidor WebSocket para Next.js (usando API Routes)
import { Server } from "ws"

interface ConnectedUser {
  id: string
  username: string
  roomId: string
  isPlayer: boolean
  ws: any
}

interface Room {
  id: string
  players: ConnectedUser[]
  spectators: ConnectedUser[]
  gameState: any
}

class WebSocketServer {
  private wss: Server | null = null
  private connectedUsers: Map<string, ConnectedUser> = new Map()
  private rooms: Map<string, Room> = new Map()

  initialize(server: any) {
    this.wss = new Server({ server })

    this.wss.on("connection", (ws, req) => {
      console.log("Nueva conexión WebSocket")

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString())
          this.handleMessage(ws, message)
        } catch (error) {
          console.error("Error parsing message:", error)
        }
      })

      ws.on("close", () => {
        this.handleDisconnection(ws)
      })

      ws.on("error", (error) => {
        console.error("WebSocket error:", error)
      })
    })
  }

  private handleMessage(ws: any, message: any) {
    switch (message.type) {
      case "join-room":
        this.handleJoinRoom(ws, message)
        break
      case "leave-room":
        this.handleLeaveRoom(ws, message)
        break
      case "chat-message":
        this.handleChatMessage(ws, message)
        break
      case "webrtc-offer":
        this.handleWebRTCOffer(ws, message)
        break
      case "webrtc-answer":
        this.handleWebRTCAnswer(ws, message)
        break
      case "webrtc-ice-candidate":
        this.handleWebRTCIceCandidate(ws, message)
        break
      case "game-action":
        this.handleGameAction(ws, message)
        break
      default:
        console.log("Mensaje no reconocido:", message.type)
    }
  }

  private handleJoinRoom(ws: any, message: any) {
    const { roomId, userId, username, isPlayer } = message

    const user: ConnectedUser = {
      id: userId,
      username,
      roomId,
      isPlayer,
      ws,
    }

    this.connectedUsers.set(userId, user)

    // Crear sala si no existe
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        players: [],
        spectators: [],
        gameState: {},
      })
    }

    const room = this.rooms.get(roomId)!

    if (isPlayer && room.players.length < 2) {
      room.players.push(user)
    } else {
      room.spectators.push(user)
    }

    // Notificar a todos en la sala
    this.broadcastToRoom(roomId, {
      type: "user-joined",
      user: {
        id: userId,
        username,
        isPlayer,
      },
      roomStats: {
        players: room.players.length,
        spectators: room.spectators.length,
      },
    })

    // Enviar estado actual de la sala al usuario que se une
    ws.send(
      JSON.stringify({
        type: "room-state",
        room: {
          id: roomId,
          players: room.players.map((p) => ({ id: p.id, username: p.username })),
          spectators: room.spectators.map((s) => ({ id: s.id, username: s.username })),
        },
      }),
    )
  }

  private handleLeaveRoom(ws: any, message: any) {
    const { userId, roomId } = message
    this.removeUserFromRoom(userId, roomId)
  }

  private handleChatMessage(ws: any, message: any) {
    const { roomId, userId, text, username } = message

    const chatMessage = {
      type: "chat-message",
      id: Date.now().toString(),
      userId,
      username,
      text,
      timestamp: new Date().toISOString(),
    }

    this.broadcastToRoom(roomId, chatMessage)
  }

  private handleWebRTCOffer(ws: any, message: any) {
    const { roomId, targetUserId, offer } = message
    const targetUser = this.connectedUsers.get(targetUserId)

    if (targetUser) {
      targetUser.ws.send(
        JSON.stringify({
          type: "webrtc-offer",
          offer,
          fromUserId: this.getUserIdByWs(ws),
        }),
      )
    }
  }

  private handleWebRTCAnswer(ws: any, message: any) {
    const { roomId, targetUserId, answer } = message
    const targetUser = this.connectedUsers.get(targetUserId)

    if (targetUser) {
      targetUser.ws.send(
        JSON.stringify({
          type: "webrtc-answer",
          answer,
          fromUserId: this.getUserIdByWs(ws),
        }),
      )
    }
  }

  private handleWebRTCIceCandidate(ws: any, message: any) {
    const { roomId, targetUserId, candidate } = message
    const targetUser = this.connectedUsers.get(targetUserId)

    if (targetUser) {
      targetUser.ws.send(
        JSON.stringify({
          type: "webrtc-ice-candidate",
          candidate,
          fromUserId: this.getUserIdByWs(ws),
        }),
      )
    }
  }

  private handleGameAction(ws: any, message: any) {
    const { roomId, action, data } = message

    // Procesar acciones del juego (respuestas, pasar turno, etc.)
    this.broadcastToRoom(roomId, {
      type: "game-update",
      action,
      data,
      userId: this.getUserIdByWs(ws),
    })
  }

  private handleDisconnection(ws: any) {
    const userId = this.getUserIdByWs(ws)
    if (userId) {
      const user = this.connectedUsers.get(userId)
      if (user) {
        this.removeUserFromRoom(userId, user.roomId)
        this.connectedUsers.delete(userId)
      }
    }
  }

  private removeUserFromRoom(userId: string, roomId: string) {
    const room = this.rooms.get(roomId)
    if (!room) return

    room.players = room.players.filter((p) => p.id !== userId)
    room.spectators = room.spectators.filter((s) => s.id !== userId)

    // Si no quedan usuarios, eliminar la sala
    if (room.players.length === 0 && room.spectators.length === 0) {
      this.rooms.delete(roomId)
    } else {
      // Notificar a los demás usuarios
      this.broadcastToRoom(roomId, {
        type: "user-left",
        userId,
        roomStats: {
          players: room.players.length,
          spectators: room.spectators.length,
        },
      })
    }
  }

  private broadcastToRoom(roomId: string, message: any) {
    const room = this.rooms.get(roomId)
    if (!room) return

    const allUsers = [...room.players, ...room.spectators]
    allUsers.forEach((user) => {
      if (user.ws.readyState === 1) {
        // WebSocket.OPEN
        user.ws.send(JSON.stringify(message))
      }
    })
  }

  private getUserIdByWs(ws: any): string | null {
    for (const [userId, user] of this.connectedUsers) {
      if (user.ws === ws) {
        return userId
      }
    }
    return null
  }
}

export const wsServer = new WebSocketServer()
