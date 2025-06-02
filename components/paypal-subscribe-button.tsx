"use client"

import { PayPalScriptProvider, PayPalButtons, type ReactPayPalScriptOptions } from "@paypal/react-paypal-js"
import { useState } from "react"

interface PayPalSubscribeButtonProps {
  userId: string // Para asociar la suscripción al usuario en tu backend
}

// Usamos los IDs que proporcionaste.
// Es MEJOR práctica usar variables de entorno para estos.
const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  "BAAPN_AkHtnPI-L0JvjJDF300P5SR66YpsuyrQo7mZcCgH6H_w05iq8RxR1JQcN8XxiCD2NHOfJnnfyVS8"
const PREMIUM_PLAN_ID = process.env.PAYPAL_PLAN_ID_PREMIUM || "P-5EE36423EY107204ANA6RDUQ"

export function PayPalSubscribeButton({ userId }: PayPalSubscribeButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const paypalScriptOptions: ReactPayPalScriptOptions = {
    clientId: PAYPAL_CLIENT_ID,
    vault: true, // Requerido para suscripciones
    intent: "subscription",
  }

  if (PAYPAL_CLIENT_ID === "BAAPN_AkHtnPI-L0JvjJDF300P5SR66YpsuyrQo7mZcCgH6H_w05iq8RxR1JQcN8XxiCD2NHOfJnnfyVS8") {
    console.warn(
      "Estás usando el Client ID de PayPal directamente en el código. Considera moverlo a variables de entorno (NEXT_PUBLIC_PAYPAL_CLIENT_ID).",
    )
  }
  if (PREMIUM_PLAN_ID === "P-5EE36423EY107204ANA6RDUQ") {
    console.warn(
      "Estás usando el Plan ID de PayPal directamente en el código. Considera moverlo a variables de entorno (PAYPAL_PLAN_ID_PREMIUM).",
    )
  }

  return (
    <PayPalScriptProvider options={paypalScriptOptions}>
      {success && (
        <div className="text-green-600 p-3 bg-green-100 border border-green-300 rounded-md mb-3 text-sm">{success}</div>
      )}
      {error && (
        <div className="text-red-600 p-3 bg-red-100 border border-red-300 rounded-md mb-3 text-sm">{error}</div>
      )}

      <PayPalButtons
        style={{
          shape: "pill", // Como en tu ejemplo
          color: "gold", // Como en tu ejemplo
          layout: "vertical",
          label: "subscribe",
        }}
        createSubscription={async (data, actions) => {
          setError(null)
          setSuccess(null)
          console.log("Attempting to create subscription for plan:", PREMIUM_PLAN_ID)

          if (!PREMIUM_PLAN_ID) {
            const errMsg = "Error: El ID del Plan de PayPal (PREMIUM_PLAN_ID) no está configurado."
            console.error(errMsg)
            setError(errMsg)
            throw new Error(errMsg)
          }

          // Esto llama directamente a la API de PayPal desde el cliente para crear la suscripción.
          // Para mayor control y seguridad, podrías llamar a un endpoint de tu backend aquí,
          // y que tu backend cree la suscripción con PayPal.
          return actions.subscription.create({
            plan_id: PREMIUM_PLAN_ID,
            // custom_id: userId, // Puedes usar custom_id para pasar tu ID de usuario interno
          })
        }}
        onApprove={async (data, actions) => {
          // Esta función se llama cuando el usuario aprueba la suscripción en la ventana de PayPal.
          // 'data' contiene información como subscriptionID, orderID, etc.
          console.log("Subscription approved by user:", data)
          setSuccess(`¡Suscripción aprobada! ID de Suscripción: ${data.subscriptionID}. Procesando...`)

          // **ACCIÓN CRÍTICA DEL BACKEND REQUERIDA AQUÍ:**
          // Ahora debes enviar data.subscriptionID (y el userId) a tu backend.
          // Tu backend debe:
          // 1. Verificar el estado de la suscripción con la API de PayPal (opcional pero recomendado).
          // 2. Guardar el subscriptionID y el estado premium para el usuario en tu base de datos.
          // 3. Manejar cualquier lógica post-suscripción (ej. dar acceso a funciones premium).

          // Ejemplo de cómo podrías llamar a tu backend:
          /*
          try {
            const response = await fetch('/api/paypal/activate-premium', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                paypalSubscriptionId: data.subscriptionID,
                userId: userId 
              }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
              throw new Error(result.message || "Error al activar la suscripción en el servidor.");
            }
            setSuccess(`¡Suscripción Premium Activada! ID: ${data.subscriptionID}. ¡Gracias!`);
            // Aquí podrías actualizar el estado local del usuario para reflejar el estado premium.
          } catch (err: any) {
            console.error("Error activating premium subscription on backend:", err);
            setError(`Error al activar: ${err.message}. ID Suscripción: ${data.subscriptionID}. Por favor, contacta a soporte.`);
          }
          */
          // Por ahora, solo mostramos el mensaje de éxito en el frontend.
          alert(`Suscripción aprobada con ID: ${data.subscriptionID}. (Backend pendiente para activación real)`)
        }}
        onError={(err: any) => {
          console.error("PayPal Button Error:", err)
          setError(
            "Ocurrió un error con PayPal durante la suscripción. Por favor, inténtalo de nuevo o contacta a soporte.",
          )
        }}
        onCancel={() => {
          console.log("Subscription cancelled by user.")
          setError("La suscripción fue cancelada.")
        }}
      />
    </PayPalScriptProvider>
  )
}
