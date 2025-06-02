"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Users } from "lucide-react"
import type { EnhancedWebRTCManager } from "@/lib/webrtc-enhanced"

interface ChatMessage {
  id: string
  userId: string
  username: string
  text: string
  timestamp: string
  type: "text" | "system" | "game"
}

interface EnhancedChatPanelProps {
  gameId: string
  userId: string
  username: string
  webrtcManager: EnhancedWebRTCManager | null
}

export function EnhancedChatPanel({ gameId, userId, username, webrtcManager }: EnhancedChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [isTyping, setIsTyping] = useState<string[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (webrtcManager) {
      webrtcManager.onChatMessage = (message: any) => {
        setMessages((prev) => [
          ...prev,
          {
            id: message.id,
            userId: message.userId,
            username: message.username,
            text: message.text,
            timestamp: message.timestamp,
            type: "text",
          },
        ])
      }

      webrtcManager.onRoomStateUpdate = (room: any) => {
        const allUsers = [...(room.players || []), ...(room.spectators || [])]
        setOnlineUsers(allUsers)
      }

      webrtcManager.onUserJoined = (user: any) => {
        addSystemMessage(`${user.username} se unió al juego`)
      }

      webrtcManager.onUserLeft = (userId: string) => {
        const user = onlineUsers.find((u) => u.id === userId)
        if (user) {
          addSystemMessage(`${user.username} abandonó el juego`)
        }
      }
    }

    // Mensaje de bienvenida
    addSystemMessage("¡Bienvenido al chat en vivo!")
  }, [webrtcManager])

  useEffect(() => {
    // Auto-scroll al último mensaje
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const addSystemMessage = (text: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: "system",
      username: "Sistema",
      text,
      timestamp: new Date().toISOString(),
      type: "system",
    }
    setMessages((prev) => [...prev, message])
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !webrtcManager) return

    webrtcManager.sendChatMessage(newMessage)
    setNewMessage("")

    // Limpiar indicador de escritura
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)

    // Simular indicador de "escribiendo..."
    if (value.length > 0) {
      // En una implementación real, enviarías esto via WebSocket
      // webrtcManager?.sendTypingIndicator(true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        // webrtcManager?.sendTypingIndicator(false)
      }, 1000)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMessageStyle = (message: ChatMessage) => {
    if (message.type === "system") {
      return "bg-blue-600/20 text-blue-200 border-l-4 border-blue-400"
    }
    if (message.type === "game") {
      return "bg-green-600/20 text-green-200 border-l-4 border-green-400"
    }
    if (message.userId === userId) {
      return "bg-purple-600/20 text-purple-100 ml-8"
    }
    return "bg-white/10 text-white"
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 h-96">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Chat en Vivo</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {onlineUsers.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-80">
        {/* Área de mensajes */}
        <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {messages.map((message) => (
              <div key={message.id} className={`p-3 rounded-lg ${getMessageStyle(message)}`}>
                {message.type !== "system" && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{message.username}</span>
                    {message.userId === userId && (
                      <Badge variant="outline" className="text-xs">
                        Tú
                      </Badge>
                    )}
                    <span className="text-xs opacity-60">{formatTime(message.timestamp)}</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            ))}

            {/* Indicador de escritura */}
            {isTyping.length > 0 && (
              <div className="text-white/60 text-sm italic">
                {isTyping.join(", ")} {isTyping.length === 1 ? "está" : "están"} escribiendo...
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input de mensaje */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1"
              maxLength={200}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Contador de caracteres */}
          <div className="text-xs text-white/60 text-right">{newMessage.length}/200</div>
        </div>
      </CardContent>
    </Card>
  )
}
