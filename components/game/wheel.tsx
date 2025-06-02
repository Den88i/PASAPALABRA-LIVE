"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Wheel() {
  const [currentLetter, setCurrentLetter] = useState("A")
  const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("")

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-sm">🎯 Rueda del Pasapalabra</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-1">
          {letters.map((letter) => (
            <div
              key={letter}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                letter === currentLetter ? "bg-yellow-500 text-black" : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              {letter}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center">
          <Badge className="bg-yellow-600">Letra actual: {currentLetter}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
