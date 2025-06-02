"use client"

import { useEffect, useRef } from "react"

interface SoundEffectsProps {
  enabled: boolean
  onSoundPlay?: (sound: string) => void
}

export function SoundEffects({ enabled, onSoundPlay }: SoundEffectsProps) {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [enabled])

  const playTone = (frequency: number, duration: number, type: OscillatorType = "sine") => {
    if (!enabled || !audioContextRef.current) return

    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime)
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)

    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + duration)

    onSoundPlay?.(type)
  }

  const playCorrectSound = () => {
    // Sonido de respuesta correcta (acorde mayor)
    playTone(523.25, 0.2) // C5
    setTimeout(() => playTone(659.25, 0.2), 100) // E5
    setTimeout(() => playTone(783.99, 0.3), 200) // G5
  }

  const playIncorrectSound = () => {
    // Sonido de respuesta incorrecta (tono descendente)
    playTone(400, 0.3, "sawtooth")
    setTimeout(() => playTone(300, 0.3, "sawtooth"), 150)
  }

  const playTimeWarningSound = () => {
    // Sonido de advertencia de tiempo
    playTone(800, 0.1)
    setTimeout(() => playTone(800, 0.1), 200)
  }

  const playGameStartSound = () => {
    // Sonido de inicio de juego (escala ascendente)
    const notes = [261.63, 293.66, 329.63, 349.23, 392.0] // C4 a G4
    notes.forEach((note, index) => {
      setTimeout(() => playTone(note, 0.2), index * 100)
    })
  }

  const playGameEndSound = () => {
    // Sonido de fin de juego (fanfarria)
    const melody = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    melody.forEach((note, index) => {
      setTimeout(() => playTone(note, 0.4), index * 200)
    })
  }

  const playPassSound = () => {
    // Sonido neutral para pasar
    playTone(440, 0.2, "triangle")
  }

  // Exponer las funciones para uso externo
  useEffect(() => {
    ;(window as any).gameSounds = {
      correct: playCorrectSound,
      incorrect: playIncorrectSound,
      timeWarning: playTimeWarningSound,
      gameStart: playGameStartSound,
      gameEnd: playGameEndSound,
      pass: playPassSound,
    }

    return () => {
      delete (window as any).gameSounds
    }
  }, [enabled])

  return null // Este componente no renderiza nada
}
