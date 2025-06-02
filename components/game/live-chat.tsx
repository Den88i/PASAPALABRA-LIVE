"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Send, Users } from "lucide-react"
import { useDataChannel, useLocalParticipant, useParticipants } from "@livekit/components-react"

interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: string
  type: "user" | "system"
}

interface LiveChatProps {
  gameId: string
  userId: string
  username: string
}

export function LiveChat({ gameId, userId, username }: LiveChatProps) {
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

  // LiveKit Data Channel para mensajes
  const { send, receive } = useDataChannel()

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  // Recibir mensajes
  useEffect(() => {
    receive("chat", (payload: string) => {
      try {
        const data = JSON.parse(payload)
        if (data.type === "chat-message") {
          setMessages((prev) => [...prev, data.message])
        } else if (data.type === "system-message") {
          addSystemMessage(data.text)
        }
      } catch (error) {
        console.error("Error parsing chat message:", error)
      }
    })
  }, [receive])

  // Notificar cuando un participante se une o se va
  useEffect(() => {
    const handleParticipantJoined = (participant: any) => {
      if (participant.identity !== userId) {
        addSystemMessage(`${participant.name || participant.identity} se unió al chat`)
      }
    }

    participants.forEach((participant) => {
      participant.on("connected", () => handleParticipantJoined(participant))
    })

    return () => {
      participants.forEach((participant) => {
        participant.off("connected", () => handleParticipantJoined(participant))
      })
    }
  }, [participants, userId])

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

  const handleSendMessage = () => {
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

    // Enviar mensaje a otros participantes
    send(
      "chat",
      JSON.stringify({
        type: "chat-message",
        message,
      }),
    )

    setNewMessage("")
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>💬 Chat en Vivo</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {participants.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 mb-4" ref={chatScrollRef}>
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
      </CardContent>
    </Card>
  )
}
