"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Users, Clock, User, RotateCcw } from "lucide-react"
import { PasapalabraWheel } from "@/components/game/pasapalabra-wheel"
import { LiveVideoCall } from "@/components/game/live-video-call"
import { ConnectionStatus } from "@/components/game/connection-status"
import { GameNotifications } from "@/components/game/game-notifications"
import { SoundEffects } from "@/components/game/sound-effects"
import { useNotifications } from "@/hooks/use-notifications"
import { SimpleChat } from "@/components/game/simple-chat"

interface GamePageProps {
  params: { id: string }
}

interface Question {
  letter: string
  question: string
  answer: string
}

interface LetterState {
  letter: string
  status: "pending" | "correct" | "incorrect" | "passed"
  playerAnswer?: string
  opponentAnswer?: string
}

// Banco de preguntas principal - Cada letra tiene múltiples opciones
const QUESTION_BANK: Record<string, Question[]> = {
  A: [
    {
      letter: "A",
      question: "Con la A. Fruto comestible de color rojo o verde que crece en el manzano",
      answer: "manzana",
    },
    { letter: "A", question: "Con la A. Líquido que cae del cielo cuando llueve", answer: "agua" },
    { letter: "A", question: "Con la A. Insecto pequeño que vive en colonias y es muy trabajador", answer: "abeja" },
    { letter: "A", question: "Con la A. Órgano del cuerpo que bombea la sangre", answer: "arteria" },
  ],
  B: [
    {
      letter: "B",
      question: "Con la B. Mamífero marino de gran tamaño que puede llegar a medir 30 metros",
      answer: "ballena",
    },
    {
      letter: "B",
      question: "Con la B. Objeto que sirve para transportar a personas o mercancías por el agua",
      answer: "barco",
    },
    { letter: "B", question: "Con la B. Establecimiento donde se sirven bebidas y aperitivos", answer: "bar" },
    { letter: "B", question: "Con la B. Instrumento musical de viento con teclas", answer: "bombardino" },
  ],
  C: [
    { letter: "C", question: "Con la C. Automóvil, vehículo de motor con cuatro ruedas", answer: "coche" },
    { letter: "C", question: "Con la C. Mamífero rumiante con joroba", answer: "camello" },
    { letter: "C", question: "Con la C. Vivienda pequeña, generalmente en el campo", answer: "cabaña" },
    { letter: "C", question: "Con la C. Parte del cuerpo que une la cabeza con el tronco", answer: "cuello" },
  ],
  D: [
    {
      letter: "D",
      question: "Con la D. Cada una de las piezas duras que están en la boca y sirven para masticar",
      answer: "diente",
    },
    {
      letter: "D",
      question: "Con la D. Actividad física que se baila siguiendo el ritmo de la música",
      answer: "danza",
    },
    { letter: "D", question: "Con la D. Período de diez días", answer: "década" },
    { letter: "D", question: "Con la D. Persona que practica algún deporte", answer: "deportista" },
  ],
  E: [
    { letter: "E", question: "Con la E. Mamífero africano de gran tamaño con trompa", answer: "elefante" },
    { letter: "E", question: "Con la E. Objeto que refleja las imágenes", answer: "espejo" },
    {
      letter: "E",
      question: "Con la E. Aparato que sirve para subir y bajar personas en los edificios",
      answer: "elevador",
    },
    { letter: "E", question: "Con la E. Estación del año que viene después de la primavera", answer: "estío" },
  ],
  F: [
    { letter: "F", question: "Con la F. Deporte que se juega con los pies y un balón", answer: "fútbol" },
    { letter: "F", question: "Con la F. Celebración o día festivo", answer: "fiesta" },
    { letter: "F", question: "Con la F. Aparato que produce luz artificial", answer: "faro" },
    { letter: "F", question: "Con la F. Instrumento musical de viento hecho de madera", answer: "flauta" },
  ],
  G: [
    { letter: "G", question: "Con la G. Animal doméstico felino que maúlla", answer: "gato" },
    { letter: "G", question: "Con la G. Ave de corral que pone huevos", answer: "gallina" },
    { letter: "G", question: "Con la G. Prenda de vestir que cubre las manos", answer: "guante" },
    { letter: "G", question: "Con la G. Insecto que produce miel", answer: "gusano" },
  ],
  H: [
    { letter: "H", question: "Con la H. Casa, lugar donde vive una familia", answer: "hogar" },
    { letter: "H", question: "Con la H. Planta aromática que se usa como condimento", answer: "hierbabuena" },
    { letter: "H", question: "Con la H. Persona que hace reír en los circos", answer: "humorista" },
    { letter: "H", question: "Con la H. Fruto seco comestible", answer: "higo" },
  ],
  I: [
    { letter: "I", question: "Con la I. Centro de enseñanza secundaria", answer: "instituto" },
    { letter: "I", question: "Con la I. Estación del año entre otoño y primavera", answer: "invierno" },
    { letter: "I", question: "Con la I. Aparato que sirve para iluminar", answer: "iluminador" },
    { letter: "I", question: "Con la I. Lugar donde se guardan libros", answer: "imprenta" },
  ],
  J: [
    { letter: "J", question: "Con la J. Piedra preciosa de color verde", answer: "jade" },
    { letter: "J", question: "Con la J. Persona que dirige un juicio", answer: "juez" },
    { letter: "J", question: "Con la J. Actividad que se realiza por diversión", answer: "juego" },
    { letter: "J", question: "Con la J. Líquido que se extrae de frutas o verduras", answer: "jugo" },
  ],
  K: [
    { letter: "K", question: "Con la K. Arte marcial japonés de defensa personal", answer: "karate" },
    { letter: "K", question: "Con la K. Unidad de medida de peso equivalente a mil gramos", answer: "kilo" },
    { letter: "K", question: "Con la K. Fruto tropical de color verde por fuera y marrón por dentro", answer: "kiwi" },
    { letter: "K", question: "Con la K. Instrumento musical de origen africano", answer: "kora" },
  ],
  L: [
    { letter: "L", question: "Con la L. Satélite natural de la Tierra que vemos por la noche", answer: "luna" },
    { letter: "L", question: "Con la L. Instrumento óptico para ver objetos lejanos", answer: "lupa" },
    { letter: "L", question: "Con la L. Felino salvaje conocido como el rey de la selva", answer: "león" },
    { letter: "L", question: "Con la L. Aparato que produce luz artificial", answer: "lámpara" },
  ],
  M: [
    { letter: "M", question: "Con la M. Fruto tropical amarillo y dulce", answer: "mango" },
    { letter: "M", question: "Con la M. Mueble para dormir", answer: "mesa" },
    { letter: "M", question: "Con la M. Prenda de vestir que se pone en las manos para abrigarlas", answer: "mitón" },
    { letter: "M", question: "Con la M. Instrumento musical de percusión", answer: "marimba" },
  ],
  N: [
    { letter: "N", question: "Con la N. Agua helada que cae del cielo en invierno", answer: "nieve" },
    { letter: "N", question: "Con la N. Hijo de tu hijo", answer: "nieto" },
    { letter: "N", question: "Con la N. Fruto seco comestible", answer: "nuez" },
    { letter: "N", question: "Con la N. Persona que nada", answer: "nadador" },
  ],
  Ñ: [
    { letter: "Ñ", question: "Con la Ñ. Antílope africano de gran tamaño", answer: "ñu" },
    { letter: "Ñ", question: "Con la Ñ. Planta de la que se extrae una fibra textil", answer: "ñandutí" },
    { letter: "Ñ", question: "Con la Ñ. Persona que es muy meticulosa o quisquillosa", answer: "ñoño" },
    { letter: "Ñ", question: "Contiene la Ñ. Ave que no vuela y es símbolo de Argentina", answer: "ñandú" },
  ],
  O: [
    { letter: "O", question: "Con la O. Metal precioso de color amarillo", answer: "oro" },
    { letter: "O", question: "Con la O. Sentido del cuerpo con el que percibimos los olores", answer: "olfato" },
    { letter: "O", question: "Con la O. Verdura de forma redonda que hace llorar", answer: "olla" },
    { letter: "O", question: "Con la O. Estación del año que viene después del verano", answer: "otoño" },
  ],
  P: [
    { letter: "P", question: "Con la P. Ave que no vuela y vive en la Antártida", answer: "pingüino" },
    { letter: "P", question: "Con la P. Fruta tropical de color amarillo", answer: "piña" },
    { letter: "P", question: "Con la P. Instrumento que sirve para escribir", answer: "pluma" },
    { letter: "P", question: "Con la P. Mamífero marino inteligente", answer: "pulpo" },
  ],
  Q: [
    { letter: "Q", question: "Con la Q. Alimento lácteo sólido que se hace con leche cuajada", answer: "queso" },
    { letter: "Q", question: "Con la Q. Sustancia que estudian los químicos", answer: "química" },
    { letter: "Q", question: "Con la Q. Utensilio de cocina para preparar alimentos", answer: "quesadilla" },
    { letter: "Q", question: "Con la Q. Instrumento musical de cuerda pulsada", answer: "quena" },
  ],
  R: [
    { letter: "R", question: "Con la R. Color de la sangre y del fuego", answer: "rojo" },
    { letter: "R", question: "Con la R. Mamífero roedor de cola larga", answer: "rata" },
    { letter: "R", question: "Con la R. Mueble para sentarse", answer: "reclinatorio" },
    { letter: "R", question: "Con la R. Instrumento musical de percusión", answer: "redoblante" },
  ],
  S: [
    { letter: "S", question: "Con la S. Estrella que nos da luz y calor durante el día", answer: "sol" },
    { letter: "S", question: "Con la S. Mueble para sentarse", answer: "silla" },
    { letter: "S", question: "Con la S. Condimento blanco que se usa en las comidas", answer: "sal" },
    { letter: "S", question: "Con la S. Instrumento musical de viento", answer: "saxofón" },
  ],
  T: [
    { letter: "T", question: "Con la T. Felino salvaje de rayas negras y naranjas", answer: "tigre" },
    { letter: "T", question: "Con la T. Instrumento musical de percusión", answer: "tambor" },
    { letter: "T", question: "Con la T. Aparato que sirve para ver imágenes", answer: "televisor" },
    { letter: "T", question: "Con la T. Prenda de vestir que cubre el torso", answer: "traje" },
  ],
  U: [
    { letter: "U", question: "Con la U. Fruto pequeño y redondo que crece en racimos", answer: "uva" },
    { letter: "U", question: "Con la U. Objeto que sirve para protegerse de la lluvia", answer: "umbrela" },
    { letter: "U", question: "Con la U. Lugar donde se imparten estudios superiores", answer: "universidad" },
    { letter: "U", question: "Con la U. Instrumento musical de cuerda pulsada", answer: "ukelele" },
  ],
  V: [
    { letter: "V", question: "Con la V. Animal que da leche y hace 'mu'", answer: "vaca" },
    { letter: "V", question: "Con la V. Medio de transporte de dos ruedas sin motor", answer: "velocípedo" },
    { letter: "V", question: "Con la V. Estación del año que viene después de la primavera", answer: "verano" },
    { letter: "V", question: "Con la V. Instrumento musical de cuerda frotada", answer: "violín" },
  ],
  W: [
    { letter: "W", question: "Con la W. Bebida alcohólica escocesa de malta", answer: "whisky" },
    {
      letter: "W",
      question: "Con la W. Deporte acuático que consiste en deslizarse sobre las olas",
      answer: "windsurf",
    },
    { letter: "W", question: "Con la W. Red informática mundial", answer: "web" },
    { letter: "W", question: "Con la W. Unidad de potencia eléctrica", answer: "watio" },
  ],
  X: [
    { letter: "X", question: "Con la X. Instrumento musical de percusión con láminas de madera", answer: "xilófono" },
    { letter: "X", question: "Con la X. Técnica de diagnóstico médico", answer: "xerografía" },
    { letter: "X", question: "Con la X. Planta con hojas punzantes", answer: "xantoma" },
    { letter: "X", question: "Contiene la X. Prueba médica que usa radiación", answer: "radiografía" },
  ],
  Y: [
    { letter: "Y", question: "Con la Y. Embarcación de recreo y lujo", answer: "yate" },
    { letter: "Y", question: "Con la Y. Mineral de color verdoso", answer: "yeso" },
    { letter: "Y", question: "Con la Y. Planta con flores amarillas", answer: "yuca" },
    { letter: "Y", question: "Con la Y. Producto lácteo fermentado", answer: "yogur" },
  ],
  Z: [
    { letter: "Z", question: "Con la Z. Verdura alargada de color naranja que comen los conejos", answer: "zanahoria" },
    { letter: "Z", question: "Con la Z. Calzado que cubre el pie", answer: "zapato" },
    { letter: "Z", question: "Con la Z. Fruta cítrica de color amarillo", answer: "zamboa" },
    { letter: "Z", question: "Con la Z. Animal rayado parecido al caballo", answer: "zebra" },
  ],
}

// Preguntas alternativas que contienen la letra
const CONTAINS_QUESTIONS: Record<string, Question[]> = {
  H: [
    { letter: "H", question: "Contiene la H. Líquido transparente e incoloro esencial para la vida", answer: "agua" },
    { letter: "H", question: "Contiene la H. Persona que vive en un lugar", answer: "habitante" },
    { letter: "H", question: "Contiene la H. Fruto seco comestible", answer: "cacahuete" },
  ],
  K: [
    { letter: "K", question: "Contiene la K. Bebida alcohólica rusa transparente", answer: "vodka" },
    {
      letter: "K",
      question: "Contiene la K. Personaje de dibujos animados que vive en una piña",
      answer: "bob esponja",
    },
    { letter: "K", question: "Contiene la K. Deporte de equipo que se juega en una pista de hielo", answer: "hockey" },
  ],
  Ñ: [
    { letter: "Ñ", question: "Contiene la Ñ. Tela pequeña que se usa para limpiarse la nariz", answer: "pañuelo" },
    { letter: "Ñ", question: "Contiene la Ñ. Golpe dado con el puño", answer: "puñetazo" },
    { letter: "Ñ", question: "Contiene la Ñ. Pieza pequeña que se usa para sujetar papeles", answer: "piñón" },
  ],
  W: [
    { letter: "W", question: "Contiene la W. Plataforma digital para navegar por internet", answer: "web" },
    { letter: "W", question: "Contiene la W. Conjunto de ordenadores conectados entre sí", answer: "network" },
    { letter: "W", question: "Contiene la W. Tipo de sándwich", answer: "sandwich" },
  ],
  X: [
    { letter: "X", question: "Contiene la X. Deporte de combate en un ring", answer: "boxeo" },
    { letter: "X", question: "Contiene la X. Prueba médica que usa radiación", answer: "radiografía" },
    { letter: "X", question: "Contiene la X. Sensación de mucho cansancio", answer: "extenuación" },
  ],
  Y: [
    { letter: "Y", question: "Contiene la Y. Prenda de vestir que se pone en los pies", answer: "calcetín" },
    {
      letter: "Y",
      question: "Contiene la Y. Parte del cuerpo donde se unen las piernas con el tronco",
      answer: "ingle",
    },
    { letter: "Y", question: "Contiene la Y. Objeto que se usa para abrir puertas", answer: "llave" },
  ],
}

export default function GamePage({ params }: GamePageProps) {
  const [user, setUser] = useState<any>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [currentLetter, setCurrentLetter] = useState("A")
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(90) // 90 segundos por ronda
  const [isMyTurn, setIsMyTurn] = useState(true)
  const [gamePhase, setGamePhase] = useState<"waiting" | "playing" | "finished">("waiting")
  const [round, setRound] = useState(1)
  const [maxRounds] = useState(3) // 3 rondas como en TV
  const [currentPlayer, setCurrentPlayer] = useState<"player" | "opponent">("player")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<Record<string, number>>({})

  // Estados específicos del Pasapalabra
  const [isRoscoRound, setIsRoscoRound] = useState(false)
  const [roscoTimeLeft, setRoscoTimeLeft] = useState(150) // 2.5 minutos para el rosco
  const [hasPassedInRound, setHasPassedInRound] = useState(false)
  const [consecutivePasses, setConsecutivePasses] = useState(0)
  const [roundHistory, setRoundHistory] = useState<any[]>([])

  const [letters, setLetters] = useState<LetterState[]>(() =>
    "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("").map((letter) => ({
      letter,
      status: "pending",
    })),
  )

  const { notifications, removeNotification, notifySuccess, notifyError, notifyInfo, notifyWarning } =
    useNotifications()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "fair" | "poor">("good")

  const router = useRouter()
  const answerInputRef = useRef<HTMLInputElement>(null)

  // Función para obtener una pregunta aleatoria para una letra
  const getRandomQuestion = (letter: string): Question => {
    // Verificar si ya hay un índice para esta letra
    if (currentQuestionIndex[letter] === undefined) {
      // Si no hay índice, crear uno aleatorio
      const questions = QUESTION_BANK[letter] || []
      const randomIndex = Math.floor(Math.random() * questions.length)
      setCurrentQuestionIndex((prev) => ({ ...prev, [letter]: randomIndex }))
    }

    // Usar el índice guardado para esta letra
    const index = currentQuestionIndex[letter]

    // Intentar obtener la pregunta del banco principal
    if (QUESTION_BANK[letter] && QUESTION_BANK[letter][index]) {
      return QUESTION_BANK[letter][index]
    }

    // Si no hay preguntas en el banco principal, intentar con las alternativas
    if (CONTAINS_QUESTIONS[letter] && CONTAINS_QUESTIONS[letter].length > 0) {
      const randomContainsIndex = Math.floor(Math.random() * CONTAINS_QUESTIONS[letter].length)
      return CONTAINS_QUESTIONS[letter][randomContainsIndex]
    }

    // Si no hay ninguna pregunta disponible, crear una genérica
    return {
      letter,
      question: `Con la ${letter}. Palabra que empieza por ${letter}`,
      answer: "desconocida",
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  // Timer principal del juego
  useEffect(() => {
    if (gamePhase === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gamePhase === "playing") {
      handleTimeUp()
    }
  }, [timeLeft, gamePhase])

  // Timer del rosco
  useEffect(() => {
    if (isRoscoRound && roscoTimeLeft > 0 && isMyTurn) {
      const timer = setTimeout(() => setRoscoTimeLeft(roscoTimeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (roscoTimeLeft === 0 && isRoscoRound && isMyTurn) {
      handleRoscoTimeUp()
    }
  }, [roscoTimeLeft, isRoscoRound, isMyTurn])

  // Auto-focus en el input cuando es mi turno
  useEffect(() => {
    if (isMyTurn && answerInputRef.current) {
      answerInputRef.current.focus()
    }
  }, [isMyTurn, currentLetter])

  // Simular turnos del oponente
  useEffect(() => {
    if (gamePhase === "playing" && !isMyTurn) {
      const opponentTime = Math.random() * 4000 + 2000 // 2-6 segundos
      const timer = setTimeout(() => {
        handleOpponentTurn()
      }, opponentTime)

      return () => clearTimeout(timer)
    }
  }, [isMyTurn, gamePhase, currentLetter])

  const handleStartGame = () => {
    setGameStarted(true)
    setGamePhase("playing")
    setTimeLeft(90)
    setIsMyTurn(true)
    setCurrentPlayer("player")
    setRound(1)
    setIsRoscoRound(false)

    // Inicializar índices de preguntas aleatorias para cada letra
    const initialIndices: Record<string, number> = {}
    "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("").forEach((letter) => {
      const questions = QUESTION_BANK[letter] || []
      initialIndices[letter] = Math.floor(Math.random() * questions.length)
    })
    setCurrentQuestionIndex(initialIndices)

    notifyInfo("¡Ronda 1 iniciada!", "Responde correctamente para ganar puntos 🎮")
    if (soundEnabled && (window as any).gameSounds) {
      ;(window as any).gameSounds.gameStart()
    }
  }

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return

    const question = getRandomQuestion(currentLetter)
    if (!question) {
      notifyError("Error", "No hay pregunta para esta letra")
      return
    }

    // Validar que la respuesta empiece con la letra (excepto para preguntas "contiene")
    if (!question.question.includes("Contiene")) {
      const answerFirstLetter = currentAnswer.charAt(0).toLowerCase()
      const expectedLetter = currentLetter.toLowerCase()

      if (answerFirstLetter !== expectedLetter) {
        notifyError("Error", `La respuesta debe empezar con la letra ${currentLetter}`)
        setCurrentAnswer("")
        return
      }
    }

    const isCorrect = currentAnswer.toLowerCase().trim() === question.answer.toLowerCase()

    // Actualizar estado de la letra
    setLetters((prev) =>
      prev.map((l) =>
        l.letter === currentLetter
          ? { ...l, status: isCorrect ? "correct" : "incorrect", playerAnswer: currentAnswer }
          : l,
      ),
    )

    if (isCorrect) {
      const points = isRoscoRound ? 25 : 10 // Más puntos en el rosco
      setPlayerScore((prev) => prev + points)
      notifySuccess("¡Correcto!", `+${points} puntos. La respuesta era: ${question.answer}`)
      if (soundEnabled && (window as any).gameSounds) {
        ;(window as any).gameSounds.correct()
      }
      setConsecutivePasses(0)
    } else {
      notifyError("Incorrecto", `La respuesta correcta era: ${question.answer}`)
      if (soundEnabled && (window as any).gameSounds) {
        ;(window as any).gameSounds.incorrect()
      }
    }

    setCurrentAnswer("")
    setHasPassedInRound(false)

    // Continuar con la siguiente letra o cambiar turno
    if (isRoscoRound) {
      handleRoscoNext(isCorrect)
    } else {
      handleNextTurn()
    }
  }

  const handlePassTurn = () => {
    if (isRoscoRound) {
      // En el rosco, pasar significa marcar la letra como pasada y continuar
      setLetters((prev) => prev.map((l) => (l.letter === currentLetter ? { ...l, status: "passed" } : l)))

      setConsecutivePasses((prev) => prev + 1)
      setHasPassedInRound(true)

      // Si pasa 3 veces consecutivas, pierde el turno
      if (consecutivePasses >= 2) {
        notifyWarning("Demasiados pases", "Perdiste el turno por pasar 3 veces seguidas")
        switchPlayer()
        return
      }

      notifyInfo("Letra pasada", "Continuando con la siguiente letra")
      handleRoscoNext(false)
    } else {
      // En rondas normales, pasar cambia el turno
      notifyInfo("Turno pasado", "El oponente toma el control")
      switchPlayer()
    }

    if (soundEnabled && (window as any).gameSounds) {
      ;(window as any).gameSounds.pass()
    }
  }

  const handleOpponentTurn = () => {
    const question = getRandomQuestion(currentLetter)
    if (!question) return

    // Simular respuesta del oponente (75% de probabilidad de acertar en rondas normales, 60% en rosco)
    const successRate = isRoscoRound ? 0.6 : 0.75
    const willPass = Math.random() < 0.15 // 15% probabilidad de pasar

    if (willPass && isRoscoRound) {
      // Oponente pasa en el rosco
      setLetters((prev) => prev.map((l) => (l.letter === currentLetter ? { ...l, status: "passed" } : l)))
      notifyInfo("Oponente pasó", `Pasó la letra ${currentLetter}`)
      handleRoscoNext(false)
      return
    }

    const isCorrect = Math.random() < successRate

    setLetters((prev) =>
      prev.map((l) =>
        l.letter === currentLetter
          ? { ...l, status: isCorrect ? "correct" : "incorrect", opponentAnswer: question.answer }
          : l,
      ),
    )

    if (isCorrect) {
      const points = isRoscoRound ? 25 : 10
      setOpponentScore((prev) => prev + points)
      notifyInfo("Oponente respondió", `✅ Correcto: ${question.answer} (+${points} pts)`)
    } else {
      notifyInfo("Oponente respondió", `❌ Incorrecto. Era: ${question.answer}`)
    }

    if (isRoscoRound) {
      handleRoscoNext(isCorrect)
    } else {
      handleNextTurn()
    }
  }

  const handleRoscoNext = (wasCorrect: boolean) => {
    const nextLetter = getNextRoscoLetter()

    if (nextLetter) {
      setCurrentLetter(nextLetter)
    } else {
      // Rosco completado
      if (hasAllLettersAnswered()) {
        // Todas las letras respondidas, fin del rosco
        handleRoscoComplete()
      } else {
        // Volver a las letras pasadas
        const passedLetter = getFirstPassedLetter()
        if (passedLetter) {
          setCurrentLetter(passedLetter)
          notifyInfo("Volviendo a letras pasadas", `Ahora la letra ${passedLetter}`)
        } else {
          handleRoscoComplete()
        }
      }
    }
  }

  const getNextRoscoLetter = () => {
    const currentIndex = letters.findIndex((l) => l.letter === currentLetter)

    // Buscar la siguiente letra pendiente o pasada
    for (let i = currentIndex + 1; i < letters.length; i++) {
      if (letters[i].status === "pending" || letters[i].status === "passed") {
        return letters[i].letter
      }
    }

    // Si no hay más adelante, buscar desde el principio
    for (let i = 0; i < currentIndex; i++) {
      if (letters[i].status === "pending" || letters[i].status === "passed") {
        return letters[i].letter
      }
    }

    return null
  }

  const getFirstPassedLetter = () => {
    return letters.find((l) => l.status === "passed")?.letter || null
  }

  const hasAllLettersAnswered = () => {
    return letters.every((l) => l.status === "correct" || l.status === "incorrect")
  }

  const handleRoscoComplete = () => {
    const correctAnswers = letters.filter((l) => l.status === "correct").length
    const totalPoints = correctAnswers * 25

    notifySuccess("¡Rosco completado!", `${correctAnswers}/27 correctas = ${totalPoints} puntos`)

    // Determinar ganador
    if (playerScore > opponentScore) {
      notifySuccess("¡Ganaste!", `${playerScore} vs ${opponentScore} puntos`)
    } else if (opponentScore > playerScore) {
      notifyError("Perdiste", `${opponentScore} vs ${playerScore} puntos`)
    } else {
      notifyInfo("¡Empate!", `Ambos con ${playerScore} puntos`)
    }

    setGamePhase("finished")
    if (soundEnabled && (window as any).gameSounds) {
      ;(window as any).gameSounds.gameEnd()
    }
  }

  const handleNextTurn = () => {
    if (round < maxRounds) {
      // Continuar con la siguiente ronda
      setRound((prev) => prev + 1)
      setTimeLeft(90)
      switchPlayer()

      if (round + 1 === maxRounds) {
        // Última ronda = Rosco
        setIsRoscoRound(true)
        setRoscoTimeLeft(150)
        resetLettersForRosco()
        notifyInfo("¡ROSCO FINAL!", "2.5 minutos para completar el alfabeto")
      } else {
        notifyInfo(`Ronda ${round + 1}`, "Nueva ronda comenzando")
      }
    } else {
      // Fin del juego
      handleGameEnd()
    }
  }

  const resetLettersForRosco = () => {
    setLetters((prev) => prev.map((l) => ({ ...l, status: "pending" as const })))
    setCurrentLetter("A")
  }

  const switchPlayer = () => {
    setIsMyTurn(!isMyTurn)
    setCurrentPlayer(currentPlayer === "player" ? "opponent" : "player")
    setConsecutivePasses(0)
  }

  const handleTimeUp = () => {
    if (isRoscoRound) {
      handleRoscoTimeUp()
    } else {
      notifyWarning("¡Tiempo agotado!", "Cambiando de ronda")
      handleNextTurn()
    }
  }

  const handleRoscoTimeUp = () => {
    notifyWarning("¡Tiempo del rosco agotado!", "Fin del juego")
    handleRoscoComplete()
  }

  const handleGameEnd = () => {
    setGamePhase("finished")

    // Calcular ganador final
    if (playerScore > opponentScore) {
      notifySuccess("¡GANASTE EL PASAPALABRA!", `${playerScore} vs ${opponentScore} puntos`)
    } else if (opponentScore > playerScore) {
      notifyError("Perdiste el Pasapalabra", `${opponentScore} vs ${playerScore} puntos`)
    } else {
      notifyInfo("¡Empate en el Pasapalabra!", `Ambos con ${playerScore} puntos`)
    }

    if (soundEnabled && (window as any).gameSounds) {
      ;(window as any).gameSounds.gameEnd()
    }
  }

  const handleLeaveGame = () => {
    if (confirm("¿Estás seguro de que quieres abandonar la partida?")) {
      if (typeof window !== "undefined") {
        const streams = document.querySelectorAll("video")
        streams.forEach((video) => {
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream
            stream.getTracks().forEach((track) => track.stop())
          }
        })
      }
      router.push("/dashboard")
    }
  }

  const currentQuestion = getRandomQuestion(currentLetter)

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleLeaveGame}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Salir
            </Button>
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold text-white">🎯 PASAPALABRA LIVE</h1>
              <p className="text-white/60 text-sm">{isRoscoRound ? "ROSCO FINAL" : `Ronda ${round}/${maxRounds}`}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />2 jugadores
            </Badge>
            <ConnectionStatus isConnected={true} quality={connectionQuality} />
            {gamePhase === "playing" && (
              <>
                <Badge className={isMyTurn ? "bg-green-600" : "bg-orange-600"}>
                  <User className="h-3 w-3 mr-1" />
                  {isMyTurn ? "Tu turno" : "Oponente"}
                </Badge>
                <Badge className="bg-blue-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {isRoscoRound
                    ? `${Math.floor(roscoTimeLeft / 60)}:${(roscoTimeLeft % 60).toString().padStart(2, "0")}`
                    : `${timeLeft}s`}
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Panel principal del juego */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {!gameStarted ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-center text-lg md:text-xl">
                    ¡Bienvenido al PASAPALABRA!
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-white/80 text-sm md:text-base">
                    El juego de palabras más famoso de la televisión, ahora en vivo.
                  </p>
                  <div className="bg-white/5 p-3 md:p-4 rounded-lg text-left">
                    <h3 className="text-white font-semibold mb-2 text-sm md:text-base">📋 Reglas del Pasapalabra:</h3>
                    <ul className="text-white/70 text-xs md:text-sm space-y-1">
                      <li>
                        • <strong>3 Rondas:</strong> 2 rondas normales + 1 rosco final
                      </li>
                      <li>
                        • <strong>Rondas 1-2:</strong> 90 segundos, 10 puntos por respuesta
                      </li>
                      <li>
                        • <strong>Rosco final:</strong> 2.5 minutos, 25 puntos por respuesta
                      </li>
                      <li>
                        • <strong>Pasar:</strong> En rosco puedes pasar y volver después
                      </li>
                      <li>
                        • <strong>3 pases seguidos:</strong> Pierdes el turno
                      </li>
                      <li>
                        • <strong>Objetivo:</strong> Completar el alfabeto en el rosco
                      </li>
                    </ul>
                  </div>
                  <Button onClick={handleStartGame} className="bg-green-600 hover:bg-green-700" size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    ¡Comenzar Pasapalabra!
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4 md:p-8">
                  <PasapalabraWheel
                    currentLetter={currentLetter}
                    letters={letters.map((l) => ({
                      letter: l.letter,
                      answered: l.status !== "pending",
                      correct: l.status === "correct" ? true : l.status === "incorrect" ? false : undefined,
                    }))}
                    onLetterClick={(letter) => {
                      if (isMyTurn && isRoscoRound) {
                        const letterState = letters.find((l) => l.letter === letter)
                        if (letterState && (letterState.status === "pending" || letterState.status === "passed")) {
                          setCurrentLetter(letter)
                        }
                      }
                    }}
                    isSpinning={!isMyTurn}
                  />
                </CardContent>
              </Card>
            )}

            {gameStarted && gamePhase === "playing" && currentQuestion && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                    <span className="text-lg md:text-xl">
                      {isRoscoRound ? "🎯 ROSCO" : `Ronda ${round}`} - Letra {currentLetter}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {isMyTurn ? (
                        <Badge className="bg-green-600">Tu turno</Badge>
                      ) : (
                        <Badge className="bg-orange-600">Turno del oponente</Badge>
                      )}
                      {isRoscoRound && (
                        <Badge className="bg-purple-600">
                          {Math.floor(roscoTimeLeft / 60)}:{(roscoTimeLeft % 60).toString().padStart(2, "0")}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/20 p-3 md:p-4 rounded-lg mb-4">
                    <p className="text-white text-base md:text-lg">{currentQuestion.question}</p>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 mt-2">
                      <p className="text-white/60 text-xs md:text-sm">
                        💡{" "}
                        {currentQuestion.question.includes("Contiene")
                          ? `Debe contener la letra ${currentLetter}`
                          : `Debe empezar con ${currentLetter}`}
                      </p>
                      {isRoscoRound && (
                        <Badge variant="outline" className="text-xs">
                          +25 puntos
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isMyTurn ? (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-2">
                        <Input
                          ref={answerInputRef}
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          placeholder={`Palabra que ${currentQuestion.question.includes("Contiene") ? "contenga" : "empiece con"} ${currentLetter}...`}
                          className="flex-1 bg-white/10 text-white placeholder-white/50 border-white/20"
                          onKeyPress={(e) => e.key === "Enter" && handleSubmitAnswer()}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSubmitAnswer}
                            disabled={!currentAnswer.trim()}
                            className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
                          >
                            Responder
                          </Button>
                          <Button variant="outline" onClick={handlePassTurn} className="flex-1 md:flex-none">
                            {isRoscoRound ? "Pasar" : "Pasar turno"}
                          </Button>
                        </div>
                      </div>

                      {isRoscoRound && consecutivePasses > 0 && (
                        <div className="bg-yellow-600/20 p-2 rounded text-center">
                          <span className="text-yellow-200 text-sm">⚠️ Pases consecutivos: {consecutivePasses}/3</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-orange-600/20 rounded-lg">
                      <p className="text-white">⏳ Esperando respuesta del oponente...</p>
                      <p className="text-white/60 text-sm mt-1">
                        {isRoscoRound
                          ? `Tiempo restante: ${Math.floor(roscoTimeLeft / 60)}:${(roscoTimeLeft % 60).toString().padStart(2, "0")}`
                          : `${timeLeft} segundos restantes`}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant={soundEnabled ? "default" : "outline"}
                      size="icon"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      title={soundEnabled ? "Desactivar sonidos" : "Activar sonidos"}
                    >
                      {soundEnabled ? "🔊" : "🔇"}
                    </Button>

                    {process.env.NODE_ENV === "development" && (
                      <div className="text-xs text-white/60">
                        Debug: {currentLetter} | Ronda: {round} | Rosco: {isRoscoRound ? "Sí" : "No"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {gamePhase === "finished" && (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6 md:p-8 text-center">
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                    {playerScore > opponentScore
                      ? "🏆 ¡GANASTE!"
                      : playerScore < opponentScore
                        ? "😔 Perdiste"
                        : "🤝 ¡EMPATE!"}
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-600/20 p-4 rounded-lg">
                        <h3 className="text-white font-semibold">Tu puntuación</h3>
                        <p className="text-2xl md:text-3xl font-bold text-white">{playerScore}</p>
                      </div>
                      <div className="bg-red-600/20 p-4 rounded-lg">
                        <h3 className="text-white font-semibold">Oponente</h3>
                        <p className="text-2xl md:text-3xl font-bold text-white">{opponentScore}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <p className="text-white/80">
                        Letras correctas: {letters.filter((l) => l.status === "correct").length}/27
                      </p>
                      <p className="text-white/80">
                        Rondas completadas: {round}/{maxRounds}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 mt-6">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Jugar de Nuevo
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel lateral */}
          <div className="space-y-4 md:space-y-6">
            {/* Video en vivo */}
            <LiveVideoCall
              gameId={params.id}
              userId={user.id}
              username={user.username}
              isPlayer={true}
              isSpectator={false}
            />

            {/* Estadísticas del juego */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">📊 Marcador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div
                    className={`flex items-center justify-between p-3 rounded ${
                      isMyTurn ? "bg-green-600/20 border border-green-500/50" : "bg-white/5"
                    }`}
                  >
                    <span className="text-white font-semibold text-sm">
                      {user.username} (Tú)
                      {isMyTurn && <span className="ml-2 text-green-400">🎯</span>}
                    </span>
                    <Badge className="bg-green-600 text-lg px-3 py-1">{playerScore}</Badge>
                  </div>
                  <div
                    className={`flex items-center justify-between p-3 rounded ${
                      !isMyTurn ? "bg-orange-600/20 border border-orange-500/50" : "bg-white/5"
                    }`}
                  >
                    <span className="text-white font-semibold text-sm">
                      Oponente
                      {!isMyTurn && <span className="ml-2 text-orange-400">🎯</span>}
                    </span>
                    <Badge className="bg-orange-600 text-lg px-3 py-1">{opponentScore}</Badge>
                  </div>
                </div>

                {isRoscoRound && (
                  <div className="mt-4 p-3 bg-purple-600/20 rounded-lg">
                    <h4 className="text-white font-semibold mb-2 text-sm">🎯 Progreso del Rosco</h4>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="text-green-400">✅ {letters.filter((l) => l.status === "correct").length}</div>
                      <div className="text-red-400">❌ {letters.filter((l) => l.status === "incorrect").length}</div>
                      <div className="text-yellow-400">⏭️ {letters.filter((l) => l.status === "passed").length}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat del juego */}
            <SimpleChat gameId={params.id} userId={user.id} username={user.username} />
          </div>
        </div>

        {/* Componentes de efectos */}
        <SoundEffects enabled={soundEnabled} />
        <GameNotifications notifications={notifications} onRemove={removeNotification} />
      </div>
    </div>
  )
}
