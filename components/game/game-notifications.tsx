"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, Clock, Users } from "lucide-react"

interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number
}

interface GameNotificationsProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export function GameNotifications({ notifications, onRemove }: GameNotificationsProps) {
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration !== 0) {
        const timer = setTimeout(() => {
          onRemove(notification.id)
        }, notification.duration || 5000)

        return () => clearTimeout(timer)
      }
    })
  }, [notifications, onRemove])

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Users className="h-5 w-5 text-blue-500" />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-600/20 border-green-500/50"
      case "error":
        return "bg-red-600/20 border-red-500/50"
      case "warning":
        return "bg-yellow-600/20 border-yellow-500/50"
      default:
        return "bg-blue-600/20 border-blue-500/50"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`p-4 rounded-lg border backdrop-blur-md ${getBackgroundColor(notification.type)} max-w-sm`}
          >
            <div className="flex items-start gap-3">
              {getIcon(notification.type)}
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
                <p className="text-white/80 text-xs mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => onRemove(notification.id)}
                className="text-white/60 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
