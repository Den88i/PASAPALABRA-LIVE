import { privacyContent } from "@/content/legal/privacy-template"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad | PasalabraLive",
  description: "Conoce cómo PasalabraLive maneja tu información personal.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <article className="prose lg:prose-xl dark:prose-invert">{privacyContent}</article>
    </div>
  )
}
