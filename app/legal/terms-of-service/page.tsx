import { termsContent } from "@/content/legal/terms-template"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos y Condiciones de Uso | PasalabraLive",
  description: "Lee nuestros términos y condiciones de uso para PasalabraLive.",
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <article className="prose lg:prose-xl dark:prose-invert">{termsContent}</article>
    </div>
  )
}
