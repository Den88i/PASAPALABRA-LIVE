"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Letter {
  letter: string
  answered: boolean
  correct?: boolean
}

interface PasapalabraWheelProps {
  currentLetter: string
  letters: Letter[]
  onLetterClick?: (letter: string) => void
  isSpinning?: boolean
}

export function PasapalabraWheel({ currentLetter, letters, onLetterClick, isSpinning = false }: PasapalabraWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [pulseAnimation, setPulseAnimation] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isSpinning) {
      const randomRotation = Math.floor(Math.random() * 360) + 720
      setRotation((prev) => prev + randomRotation)
    }
  }, [isSpinning])

  useEffect(() => {
    // Pulse animation for current letter
    setPulseAnimation(true)
    const timer = setTimeout(() => setPulseAnimation(false), 1000)
    return () => clearTimeout(timer)
  }, [currentLetter])

  // Responsive sizing
  const wheelSize = isMobile ? 280 : 400
  const radius = isMobile ? 100 : 150
  const centerX = wheelSize / 2
  const centerY = wheelSize / 2
  const letterSize = isMobile ? 32 : 48

  const getLetterStyle = (letterData: Letter, index: number) => {
    const isActive = letterData.letter === currentLetter
    const baseClasses =
      "absolute rounded-full border-3 font-bold text-sm md:text-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer select-none flex items-center justify-center"

    if (isActive) {
      return `${baseClasses} bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-yellow-300 text-black scale-110 md:scale-125 shadow-2xl ring-4 ring-yellow-300/50 z-20`
    }
    if (letterData.answered) {
      return letterData.correct
        ? `${baseClasses} bg-gradient-to-br from-green-500 via-green-600 to-green-700 border-green-400 text-white shadow-lg z-10`
        : `${baseClasses} bg-gradient-to-br from-red-500 via-red-600 to-red-700 border-red-400 text-white shadow-lg z-10`
    }
    return `${baseClasses} bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-blue-400 text-white hover:from-blue-400 hover:via-blue-500 hover:to-blue-600 hover:scale-105 shadow-lg z-10`
  }

  const getLetterPosition = (index: number) => {
    const angle = (index * 360) / letters.length
    const radian = (angle * Math.PI) / 180
    const x = centerX + radius * Math.cos(radian - Math.PI / 2)
    const y = centerY + radius * Math.sin(radian - Math.PI / 2)
    return { x, y }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Título de la ruleta */}
      <div className="text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">🎯 PASAPALABRA</h2>
        <div className="flex items-center justify-center gap-4 text-sm md:text-base">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-white/80">Correctas: {letters.filter((l) => l.answered && l.correct).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-white/80">Incorrectas: {letters.filter((l) => l.answered && !l.correct).length}</span>
          </div>
        </div>
      </div>

      {/* Contenedor principal de la ruleta */}
      <div className="relative" style={{ width: wheelSize, height: wheelSize }}>
        {/* Círculo exterior decorativo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 shadow-2xl">
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 shadow-inner">
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"></div>
          </div>
        </div>

        {/* Efectos de brillo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-bl from-transparent via-white/5 to-transparent"></div>

        {/* Ruleta giratoria */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: "easeOut" }}
        >
          {/* Letras en círculo */}
          {letters.map((letterData, index) => {
            const { x, y } = getLetterPosition(index)

            return (
              <motion.button
                key={letterData.letter}
                className={getLetterStyle(letterData, index)}
                style={{
                  left: x,
                  top: y,
                  width: letterSize,
                  height: letterSize,
                }}
                onClick={() => onLetterClick?.(letterData.letter)}
                disabled={isSpinning || letterData.answered}
                whileHover={{ scale: letterData.letter === currentLetter ? 1.15 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={
                  letterData.letter === currentLetter && pulseAnimation
                    ? {
                        scale: [1.1, 1.3, 1.1],
                        boxShadow: [
                          "0 0 0 0 rgba(255, 193, 7, 0.7)",
                          "0 0 0 15px rgba(255, 193, 7, 0)",
                          "0 0 0 0 rgba(255, 193, 7, 0)",
                        ],
                      }
                    : {}
                }
                transition={{ duration: 0.6 }}
              >
                {letterData.letter}

                {/* Indicador de estado */}
                <AnimatePresence>
                  {letterData.answered && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        letterData.correct ? "bg-green-600 text-white" : "bg-red-600 text-white"
                      }`}
                    >
                      {letterData.correct ? "✓" : "✗"}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Efecto de brillo para letra activa */}
                {letterData.letter === currentLetter && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-300/30 to-transparent"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  />
                )}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Centro de la rueda mejorado */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center shadow-2xl z-30"
          style={{
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
          }}
          animate={isSpinning ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: isSpinning ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
        >
          {/* Círculo exterior del centro */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl">
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500">
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 flex items-center justify-center">
                <span className="text-blue-900 font-bold text-xl md:text-2xl">P</span>
              </div>
            </div>
          </div>

          {/* Efectos de brillo en el centro */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 via-transparent to-transparent"></div>
        </motion.div>

        {/* Efectos de partículas cuando se responde correctamente */}
        <AnimatePresence>
          {letters.some((l) => l.letter === currentLetter && l.answered && l.correct) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-40"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  style={{
                    left: centerX,
                    top: centerY,
                  }}
                  animate={{
                    x: Math.cos((i * Math.PI) / 6) * 120,
                    y: Math.sin((i * Math.PI) / 6) * 120,
                    opacity: [1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{ duration: 1.5, delay: i * 0.1 }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador/flecha mejorada */}
        <motion.div
          className="absolute top-2 left-1/2 transform -translate-x-1/2 z-40"
          animate={pulseAnimation ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            {/* Sombra de la flecha */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-black/30"></div>
            {/* Flecha principal */}
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600 drop-shadow-lg"></div>
            {/* Brillo en la flecha */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-red-400"></div>
          </div>
        </motion.div>
      </div>

      {/* Progreso del juego mejorado */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-sm font-medium">Progreso del Alfabeto</span>
          <span className="text-white text-sm">
            {letters.filter((l) => l.answered && l.correct).length}/{letters.length}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 via-green-400 to-green-300 rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{
              width: `${(letters.filter((l) => l.answered && l.correct).length / letters.length) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {/* Estadísticas detalladas */}
        <div className="flex justify-between mt-2 text-xs text-white/70">
          <span>Pendientes: {letters.filter((l) => !l.answered).length}</span>
          <span>Incorrectas: {letters.filter((l) => l.answered && !l.correct).length}</span>
        </div>
      </div>

      {/* Letra actual destacada para móviles */}
      {isMobile && (
        <motion.div
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-full shadow-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <span className="font-bold text-lg">Letra actual: {currentLetter}</span>
        </motion.div>
      )}
    </div>
  )
}
