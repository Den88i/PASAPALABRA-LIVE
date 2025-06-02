"use client"

export class WebRTCManager {
  private localStream: MediaStream | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private socket: WebSocket | null = null
  private roomId: string | null = null

  constructor() {
    this.initializeSocket()
  }

  private initializeSocket() {
    // En producción, usar wss://tu-dominio.com/ws
    this.socket = new WebSocket("ws://localhost:3001/ws")

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleSocketMessage(data)
    }
  }

  async initializeMedia(video = true, audio = true) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 640, height: 480 } : false,
        audio: audio,
      })
      return this.localStream
    } catch (error) {
      console.error("Error accessing media devices:", error)
      throw error
    }
  }

  async joinRoom(roomId: string, isPlayer = false) {
    this.roomId = roomId

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: "join-room",
          roomId,
          isPlayer,
        }),
      )
    }
  }

  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const configuration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
    }

    const peerConnection = new RTCPeerConnection(configuration)
    this.peerConnections.set(peerId, peerConnection)

    // Agregar stream local
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Manejar stream remoto
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0]
      this.onRemoteStream?.(peerId, remoteStream)
    }

    // Manejar candidatos ICE
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.send(
          JSON.stringify({
            type: "ice-candidate",
            candidate: event.candidate,
            peerId,
          }),
        )
      }
    }

    return peerConnection
  }

  private async handleSocketMessage(data: any) {
    switch (data.type) {
      case "user-joined":
        await this.handleUserJoined(data.peerId)
        break
      case "offer":
        await this.handleOffer(data.offer, data.peerId)
        break
      case "answer":
        await this.handleAnswer(data.answer, data.peerId)
        break
      case "ice-candidate":
        await this.handleIceCandidate(data.candidate, data.peerId)
        break
      case "user-left":
        this.handleUserLeft(data.peerId)
        break
    }
  }

  private async handleUserJoined(peerId: string) {
    const peerConnection = await this.createPeerConnection(peerId)
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    if (this.socket) {
      this.socket.send(
        JSON.stringify({
          type: "offer",
          offer,
          peerId,
        }),
      )
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, peerId: string) {
    const peerConnection = await this.createPeerConnection(peerId)
    await peerConnection.setRemoteDescription(offer)

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    if (this.socket) {
      this.socket.send(
        JSON.stringify({
          type: "answer",
          answer,
          peerId,
        }),
      )
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit, peerId: string) {
    const peerConnection = this.peerConnections.get(peerId)
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer)
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit, peerId: string) {
    const peerConnection = this.peerConnections.get(peerId)
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate)
    }
  }

  private handleUserLeft(peerId: string) {
    const peerConnection = this.peerConnections.get(peerId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(peerId)
    }
    this.onUserLeft?.(peerId)
  }

  sendChatMessage(message: string) {
    if (this.socket && this.roomId) {
      this.socket.send(
        JSON.stringify({
          type: "chat-message",
          message,
          roomId: this.roomId,
        }),
      )
    }
  }

  disconnect() {
    this.peerConnections.forEach((pc) => pc.close())
    this.peerConnections.clear()

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
    }

    if (this.socket) {
      this.socket.close()
    }
  }

  // Callbacks que se pueden configurar desde el componente
  onRemoteStream?: (peerId: string, stream: MediaStream) => void
  onUserLeft?: (peerId: string) => void
  onChatMessage?: (message: any) => void
}
