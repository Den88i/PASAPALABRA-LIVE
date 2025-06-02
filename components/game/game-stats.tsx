"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Clock, Target } from "lucide-react"

export function GameStats() {
  const stats = {
    timeElapsed: "5:30",
    correctAnswers: 12,
    totalQuestions: 15,
    accuracy: 80,
    streak: 3,
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Estadísticas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-white/60" />
              <span className="text-white text-xs">Tiempo:</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {stats.timeElapsed}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-white/60" />
              <span className="text-white text-xs">Precisión:</span>
            </div>
            <Badge className="bg-green-600 text-xs">{stats.accuracy}%</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white text-xs">Racha:</span>
            <Badge className="bg-orange-600 text-xs">{stats.streak}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white text-xs">Respuestas:</span>
            <Badge variant="outline" className="text-xs">
              {stats.correctAnswers}/{stats.totalQuestions}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
