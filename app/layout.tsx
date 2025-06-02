import type React from "react"
import Link from "next/link" // Asegúrate de importar Link
import Image from "next/image" // Asegúrate de importar Image
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "Pasalabra Live",
  description: "El juego de palabras más emocionante en tiempo real",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Image
                  src="/images/logo-pro.png"
                  alt="PasapalabraLive Logo"
                  width={180} // Ajusta según el tamaño deseado, manteniendo la proporción del SVG
                  height={41} // width 220, height 50 -> 180 / (220/50) = 180 / 4.4 = ~40.9
                  priority
                />
              </Link>
              {/* Aquí iría el resto de tu navegación si la tienes en el layout */}
              {/* <nav>...</nav> */}
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="py-6 md:px-8 md:py-0 border-t">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                © {new Date().getFullYear()} PasalabraLive. Todos los derechos reservados.
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
