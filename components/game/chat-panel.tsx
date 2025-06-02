"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: string
  type: "text" | "system"
}

interface ChatPanelProps {
  gameId: string
  userId: string
}

export function ChatPanel({ gameId, userId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simular mensajes iniciales
    setMessages([
      {
        id: "1",
        username: "Sistema",
        message: "¡Bienvenidos al chat en vivo!",
        timestamp: new Date().toISOString(),
        type: "system",
      },
    ])

    // Aquí conectarías con WebSocket para chat en tiempo real
    // const ws = new WebSocket('ws://localhost:3001/chat')
    // ws.onmessage = (event) => {
    //   const message = JSON.parse(event.data)
    //   setMessages(prev => [...prev, message])
    // }
  }, [gameId])

  useEffect(() => {
    // Auto-scroll al último mensaje
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      username: "Tú", // En producción, obtener del usuario actual
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: "text",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Enviar mensaje via WebSocket
    // ws.send(JSON.stringify(message))
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20 h-96">
      <CardHeader>
        <CardTitle className="text-white">Chat en Vivo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-80">
        {/* Área de mensajes */}
        <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded-lg ${
                  message.type === "system" ? "bg-blue-600/20 text-blue-200" : "bg-white/10 text-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{message.username}</span>
                  <span className="text-xs text-white/60">{new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-sm">{message.message}</p>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input de mensaje */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1"
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
