import type React from "react"
import Link from "next/link"
import Image from "next/image"
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
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Image
                  src="/images/logo-pro.png" // Usando el SVG
                  alt="PasapalabraLive Logo"
                  width={180}
                  height={41}
                  priority
                />
              </Link>
              {/* Aquí iría el resto de tu navegación si la tienes en el layout */}
              {/* <nav>...</nav> */}
            </div>
          </header>
          <main className="flex-1 flex flex-col">{children}</main> {/* Asegura que main pueda crecer */}
          <footer className="py-6 md:px-8 border-t bg-muted/40">
            {" "}
            {/* Fondo sutil para el footer */}
            <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row md:justify-between">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                © {new Date().getFullYear()} PasalabraLive. Todos los derechos reservados.
              </p>
              <nav className="flex gap-4 sm:gap-6">
                <Link href="/legal/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">
                  Términos
                </Link>
                <Link href="/legal/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacidad
                </Link>
                <Link href="/legal/refund-policy" className="text-sm text-muted-foreground hover:text-primary">
                  Reembolsos
                </Link>
              </nav>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
