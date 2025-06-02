"use client"

import { useState, useCallback } from "react"

interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { ...notification, id }])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Métodos de conveniencia
  const notifySuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({ type: "success", title, message, duration })
    },
    [addNotification],
  )

  const notifyError = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({ type: "error", title, message, duration })
    },
    [addNotification],
  )

  const notifyInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({ type: "info", title, message, duration })
    },
    [addNotification],
  )

  const notifyWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      addNotification({ type: "warning", title, message, duration })
    },
    [addNotification],
  )

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  }
}
