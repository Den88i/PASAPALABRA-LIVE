// Servidor WebSocket independiente para desarrollo
const WebSocket = require("ws")
const http = require("http")

const server = http.createServer()
const wss = new WebSocket.Server({ server })

const rooms = new Map()
const users = new Map()

wss.on("connection", (ws) => {
  console.log("Nueva conexión WebSocket")

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString())
      handleMessage(ws, message)
    } catch (error) {
      console.error("Error parsing message:", error)
    }
  })

  ws.on("close", () => {
    handleDisconnection(ws)
  })
})

function handleMessage(ws, message) {
  switch (message.type) {
    case "join-room":
      handleJoinRoom(ws, message)
      break
    case "chat-message":
      handleChatMessage(ws, message)
      break
    case "webrtc-offer":
    case "webrtc-answer":
    case "webrtc-ice-candidate":
      handleWebRTCMessage(ws, message)
      break
  }
}

function handleJoinRoom(ws, message) {
  const { roomId, userId, username, isPlayer } = message

  ws.userId = userId
  ws.roomId = roomId
  ws.username = username
  ws.isPlayer = isPlayer

  if (!rooms.has(roomId)) {
    rooms.set(roomId, { players: [], spectators: [] })
  }

  const room = rooms.get(roomId)

  if (isPlayer && room.players.length < 2) {
    room.players.push(ws)
  } else {
    room.spectators.push(ws)
  }

  users.set(userId, ws)

  // Notificar a todos en la sala
  broadcastToRoom(roomId, {
    type: "user-joined",
    user: { id: userId, username, isPlayer },
  })

  // Enviar estado de la sala
  ws.send(
    JSON.stringify({
      type: "room-state",
      room: {
        players: room.players.map((p) => ({ id: p.userId, username: p.username })),
        spectators: room.spectators.map((s) => ({ id: s.userId, username: s.username })),
      },
    }),
  )
}

function handleChatMessage(ws, message) {
  const chatMessage = {
    type: "chat-message",
    id: Date.now().toString(),
    userId: ws.userId,
    username: ws.username,
    text: message.text,
    timestamp: new Date().toISOString(),
  }

  broadcastToRoom(ws.roomId, chatMessage)
}

function handleWebRTCMessage(ws, message) {
  const targetUser = users.get(message.targetUserId)
  if (targetUser) {
    message.fromUserId = ws.userId
    targetUser.send(JSON.stringify(message))
  }
}

function handleDisconnection(ws) {
  if (ws.roomId && ws.userId) {
    const room = rooms.get(ws.roomId)
    if (room) {
      room.players = room.players.filter((p) => p.userId !== ws.userId)
      room.spectators = room.spectators.filter((s) => s.userId !== ws.userId)

      broadcastToRoom(ws.roomId, {
        type: "user-left",
        userId: ws.userId,
      })
    }

    users.delete(ws.userId)
  }
}

function broadcastToRoom(roomId, message) {
  const room = rooms.get(roomId)
  if (!room) return

  const allUsers = [...room.players, ...room.spectators]
  allUsers.forEach((user) => {
    if (user.readyState === WebSocket.OPEN) {
      user.send(JSON.stringify(message))
    }
  })
}

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Servidor WebSocket ejecutándose en puerto ${PORT}`)
})
