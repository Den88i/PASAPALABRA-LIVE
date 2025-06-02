"use client"

interface WebRTCConfig {
  iceServers: RTCIceServer[]
}

export class EnhancedWebRTCManager {
  private localStream: MediaStream | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private socket: WebSocket | null = null
  private roomId: string | null = null
  private userId: string | null = null
  private username: string | null = null

  // Configuración de STUN/TURN servers para producción
  private rtcConfig: WebRTCConfig = {
    iceServers: [
      // Servidores STUN gratuitos de Google
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },

      // Servidores TURN para producción (reemplazar con tus credenciales)
      {
        urls: "turn:relay1.expressturn.com:3478",
        username: "ef4RCWLNQP2PQZQHKZ",
        credential: "Ue7xMRAcqJZjrqXL",
      },

      // Servidor TURN alternativo (Twilio)
      {
        urls: "turn:relay1.expressturn.com:3478",
        username: "ef4RCWLNQP2PQZQHKZ",
        credential: "Ue7xMRAcqJZjrqXL",
      },
    ],
  }

  constructor() {
    this.initializeSocket()
  }

  private initializeSocket() {
    // Usar WebSocket seguro en producción
    const wsUrl =
      process.env.NODE_ENV === "production" ? `wss://${window.location.host}/api/websocket` : "ws://localhost:3001"

    try {
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log("Conectado al servidor WebSocket")
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleSocketMessage(data)
        } catch (error) {
          console.error("Error parsing WebSocket message:", error)
        }
      }

      this.socket.onclose = () => {
        console.log("Conexión WebSocket cerrada")
        // Intentar reconectar después de 3 segundos
        setTimeout(() => this.initializeSocket(), 3000)
      }

      this.socket.onerror = (error) => {
        console.error("Error en WebSocket:", error)
      }
    } catch (error) {
      console.error("Error inicializando WebSocket:", error)
    }
  }

  async initializeMedia(videoEnabled = true, audioEnabled = true) {
    try {
      const constraints: MediaStreamConstraints = {
        video: videoEnabled
          ? {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30, max: 60 },
              facingMode: "user",
            }
          : false,
        audio: audioEnabled
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 44100,
            }
          : false,
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      return this.localStream
    } catch (error) {
      console.error("Error accessing media devices:", error)

      // Fallback: intentar con configuración más básica
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: videoEnabled,
          audio: audioEnabled,
        })
        return this.localStream
      } catch (fallbackError) {
        console.error("Error en fallback de media:", fallbackError)
        throw fallbackError
      }
    }
  }

  async joinRoom(roomId: string, userId: string, username: string, isPlayer = false) {
    this.roomId = roomId
    this.userId = userId
    this.username = username

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: "join-room",
          roomId,
          userId,
          username,
          isPlayer,
        }),
      )
    } else {
      // Esperar a que se conecte el WebSocket
      setTimeout(() => this.joinRoom(roomId, userId, username, isPlayer), 1000)
    }
  }

  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection(this.rtcConfig)
    this.peerConnections.set(peerId, peerConnection)

    // Agregar tracks locales
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Manejar stream remoto
    peerConnection.ontrack = (event) => {
      console.log("Recibido stream remoto de:", peerId)
      const remoteStream = event.streams[0]
      this.onRemoteStream?.(peerId, remoteStream)
    }

    // Manejar candidatos ICE
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.send(
          JSON.stringify({
            type: "webrtc-ice-candidate",
            roomId: this.roomId,
            targetUserId: peerId,
            candidate: event.candidate,
          }),
        )
      }
    }

    // Manejar cambios de estado de conexión
    peerConnection.onconnectionstatechange = () => {
      console.log(`Estado de conexión con ${peerId}:`, peerConnection.connectionState)

      if (peerConnection.connectionState === "connected") {
        this.onPeerConnected?.(peerId)
      } else if (peerConnection.connectionState === "disconnected" || peerConnection.connectionState === "failed") {
        this.onPeerDisconnected?.(peerId)
      }
    }

    // Manejar cambios de estado ICE
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`Estado ICE con ${peerId}:`, peerConnection.iceConnectionState)
    }

    return peerConnection
  }

  private async handleSocketMessage(data: any) {
    switch (data.type) {
      case "room-state":
        this.onRoomStateUpdate?.(data.room)
        break
      case "user-joined":
        await this.handleUserJoined(data)
        break
      case "user-left":
        this.handleUserLeft(data.userId)
        break
      case "webrtc-offer":
        await this.handleWebRTCOffer(data)
        break
      case "webrtc-answer":
        await this.handleWebRTCAnswer(data)
        break
      case "webrtc-ice-candidate":
        await this.handleWebRTCIceCandidate(data)
        break
      case "chat-message":
        this.onChatMessage?.(data)
        break
      case "game-update":
        this.onGameUpdate?.(data)
        break
    }
  }

  private async handleUserJoined(data: any) {
    const { user } = data

    if (user.id !== this.userId && user.isPlayer) {
      // Crear conexión peer-to-peer con el nuevo jugador
      const peerConnection = await this.createPeerConnection(user.id)

      try {
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        })

        await peerConnection.setLocalDescription(offer)

        if (this.socket) {
          this.socket.send(
            JSON.stringify({
              type: "webrtc-offer",
              roomId: this.roomId,
              targetUserId: user.id,
              offer,
            }),
          )
        }
      } catch (error) {
        console.error("Error creando offer:", error)
      }
    }

    this.onUserJoined?.(user)
  }

  private async handleWebRTCOffer(data: any) {
    const { offer, fromUserId } = data

    try {
      const peerConnection = await this.createPeerConnection(fromUserId)
      await peerConnection.setRemoteDescription(offer)

      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      if (this.socket) {
        this.socket.send(
          JSON.stringify({
            type: "webrtc-answer",
            roomId: this.roomId,
            targetUserId: fromUserId,
            answer,
          }),
        )
      }
    } catch (error) {
      console.error("Error manejando offer:", error)
    }
  }

  private async handleWebRTCAnswer(data: any) {
    const { answer, fromUserId } = data
    const peerConnection = this.peerConnections.get(fromUserId)

    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(answer)
      } catch (error) {
        console.error("Error manejando answer:", error)
      }
    }
  }

  private async handleWebRTCIceCandidate(data: any) {
    const { candidate, fromUserId } = data
    const peerConnection = this.peerConnections.get(fromUserId)

    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(candidate)
      } catch (error) {
        console.error("Error agregando ICE candidate:", error)
      }
    }
  }

  private handleUserLeft(userId: string) {
    const peerConnection = this.peerConnections.get(userId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(userId)
    }
    this.onUserLeft?.(userId)
  }

  sendChatMessage(message: string) {
    if (this.socket && this.roomId && this.userId && this.username) {
      this.socket.send(
        JSON.stringify({
          type: "chat-message",
          roomId: this.roomId,
          userId: this.userId,
          username: this.username,
          text: message,
        }),
      )
    }
  }

  sendGameAction(action: string, data: any) {
    if (this.socket && this.roomId) {
      this.socket.send(
        JSON.stringify({
          type: "game-action",
          roomId: this.roomId,
          action,
          data,
        }),
      )
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  disconnect() {
    // Cerrar todas las conexiones peer
    this.peerConnections.forEach((pc) => pc.close())
    this.peerConnections.clear()

    // Detener stream local
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    // Cerrar WebSocket
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  // Callbacks configurables
  onRemoteStream?: (peerId: string, stream: MediaStream) => void
  onUserJoined?: (user: any) => void
  onUserLeft?: (userId: string) => void
  onChatMessage?: (message: any) => void
  onGameUpdate?: (data: any) => void
  onRoomStateUpdate?: (room: any) => void
  onPeerConnected?: (peerId: string) => void
  onPeerDisconnected?: (peerId: string) => void
}
