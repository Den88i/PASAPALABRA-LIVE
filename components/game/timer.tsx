"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

interface TimerProps {
  timeLeft: number
  onTimeUp: () => void
}

export function Timer({ timeLeft: initialTime, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onTimeUp])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (timeLeft > 60) return "bg-green-600"
    if (timeLeft > 30) return "bg-yellow-600"
    return "bg-red-600"
  }

  return (
    <Badge className={`${getTimerColor()} text-white text-lg px-4 py-2`}>
      <Clock className="h-4 w-4 mr-2" />
      {formatTime(timeLeft)}
    </Badge>
  )
}
