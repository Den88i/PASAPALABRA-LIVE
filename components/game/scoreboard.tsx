"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, User } from "lucide-react"

export function Scoreboard() {
  const players = [
    { id: "1", name: "Jugador 1", score: 150, isActive: true },
    { id: "2", name: "Jugador 2", score: 120, isActive: false },
  ]

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Marcador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-2 rounded ${
                player.isActive ? "bg-green-600/20 border border-green-500/50" : "bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-white" />
                <span className="text-white text-sm">{player.name}</span>
                {player.isActive && <Badge className="bg-green-600 text-xs">Turno</Badge>}
              </div>
              <Badge className="bg-blue-600">{player.score}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
