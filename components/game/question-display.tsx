"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HelpCircle } from "lucide-react"

export function QuestionDisplay() {
  const currentQuestion = {
    letter: "A",
    question: "Con la A. Fruto comestible de color rojo o verde que crece en el manzano",
    answer: "manzana",
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Pregunta Actual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Badge className="bg-yellow-600">Letra {currentQuestion.letter}</Badge>
          <p className="text-white text-sm">{currentQuestion.question}</p>
          <div className="text-xs text-white/60">💡 Debe empezar con la letra {currentQuestion.letter}</div>
        </div>
      </CardContent>
    </Card>
  )
}
