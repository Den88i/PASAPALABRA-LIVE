import { refundContent } from "@/content/legal/refund-template"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Reembolsos | PasalabraLive",
  description: "Información sobre nuestra política de reembolsos para PasalabraLive.",
}

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <article className="prose lg:prose-xl dark:prose-invert">{refundContent}</article>
    </div>
  )
}
