"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Users } from "lucide-react"
import { useLocalParticipant, useParticipants } from "@livekit/components-react"

interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: string
  type: "user" | "system"
}

interface LiveKitChatProps {
  userId: string
  username: string
}

export function LiveKitChat({ userId, username }: LiveKitChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      userId: "system",
      username: "Sistema",
      message: "¡Bienvenidos al chat en vivo! 🎮",
      timestamp: new Date().toISOString(),
      type: "system",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  // Simular recepción de mensajes
  useEffect(() => {
    if (!localParticipant) return

    // Simular mensajes del sistema cuando cambian los participantes
    const handleParticipantChange = () => {
      // Este es un placeholder - en una implementación real usarías el data channel
    }

    handleParticipantChange()
  }, [localParticipant, participants])

  const addSystemMessage = (text: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: "system",
      username: "Sistema",
      message: text,
      timestamp: new Date().toISOString(),
      type: "system",
    }
    setMessages((prev) => [...prev, systemMessage])
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !localParticipant) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId,
      username,
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: "user",
    }

    // Agregar mensaje localmente
    setMessages((prev) => [...prev, message])

    // En una implementación real, aquí enviarías el mensaje via data channel
    try {
      // Placeholder para envío de datos
      console.log("Enviando mensaje:", message)
    } catch (error) {
      console.error("Error sending message:", error)
    }

    setNewMessage("")

    // Simular respuesta automática
    setTimeout(
      () => {
        const responses = ["¡Excelente jugada! 👏", "Esa era complicada 🤔", "¡Sigue así! 💪", "Buena estrategia 🎯"]
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]

        const autoMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          userId: "bot",
          username: "Oponente",
          message: randomResponse,
          timestamp: new Date().toISOString(),
          type: "user",
        }
        setMessages((prev) => [...prev, autoMessage])
      },
      1000 + Math.random() * 2000,
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4 text-white" />
        <span className="text-white text-sm">{participants.length} conectados</span>
      </div>

      <ScrollArea className="flex-1 mb-4" ref={chatScrollRef}>
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded text-sm ${
                message.type === "system"
                  ? "bg-blue-600/20 text-blue-200"
                  : message.userId === userId
                    ? "bg-green-600/20 text-green-200 ml-4"
                    : "bg-white/10 text-white"
              }`}
            >
              {message.type !== "system" && (
                <div className="font-semibold text-xs mb-1">
                  {message.username}
                  <span className="text-white/50 ml-2">{new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
              )}
              <p>{message.message}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-white/10 text-white placeholder-white/50 border-white/20"
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          maxLength={100}
        />
        <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-xs text-white/50 mt-1 text-right">{newMessage.length}/100</div>
    </div>
  )
}
