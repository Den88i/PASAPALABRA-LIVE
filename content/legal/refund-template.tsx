// content/legal/refund-template.tsx
// PLANTILLA - CONSULTAR A UN ABOGADO
export const refundContent = (
  <>
    <h1 className="text-3xl font-bold mb-6">Política de Reembolsos</h1>
    <p className="mb-4">
      Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
    </p>

    <p className="mb-4">Gracias por comprar en PasalabraLive.</p>
    <p className="mb-4">
      Esta política se aplica a las suscripciones premium o cualquier otro bien digital vendido en PasalabraLive (el
      "Sitio Web").
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">1. Suscripciones Premium</h2>
    <p className="mb-4">
      Debido a la naturaleza digital de nuestros servicios de suscripción premium, que otorgan acceso inmediato a
      características y contenido mejorados, generalmente no ofrecemos reembolsos por los períodos de suscripción una
      vez que el pago ha sido procesado y el servicio ha sido activado.
    </p>
    <p className="mb-4">
      Puedes cancelar tu suscripción premium en cualquier momento desde la configuración de tu cuenta. La cancelación
      detendrá los cargos de renovación futuros, pero no se proporcionarán reembolsos prorrateados por el período de
      suscripción actual no utilizado.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">2. Circunstancias Excepcionales</h2>
    <p className="mb-4">Podemos considerar reembolsos caso por caso bajo circunstancias excepcionales, tales como:</p>
    <ul className="list-disc list-inside mb-4 pl-4">
      <li>
        Errores técnicos significativos por nuestra parte que impidieron el acceso al servicio premium durante un
        período prolongado.
      </li>
      <li>Cargos incorrectos o no autorizados.</li>
    </ul>
    <p className="mb-4">
      Si crees que tu situación califica para un reembolso bajo circunstancias excepcionales, por favor contáctanos en
      [TU_EMAIL_DE_SOPORTE_O_REEMBOLSOS] dentro de los [X, ej. 7 o 14] días posteriores a la transacción, proporcionando
      todos los detalles relevantes.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">3. Bienes Digitales (si aplica, ej. skins, filtros)</h2>
    <p className="mb-4">
      Para los bienes digitales como skins o filtros de cámara comprados directamente (no como parte de una
      suscripción), todas las ventas son finales y no reembolsables una vez que el artículo ha sido entregado o activado
      en tu cuenta, a menos que la ley aplicable exija lo contrario.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">4. Proceso de Solicitud de Reembolso</h2>
    <p className="mb-4">
      Para solicitar un reembolso bajo las circunstancias excepcionales descritas anteriormente, envía un correo
      electrónico a [TU_EMAIL_DE_SOPORTE_O_REEMBOLSOS] con la siguiente información:
    </p>
    <ul className="list-disc list-inside mb-4 pl-4">
      <li>Tu nombre de usuario y dirección de correo electrónico asociada a tu cuenta.</li>
      <li>Fecha de la transacción y monto.</li>
      <li>ID de la transacción (si está disponible, ej. de PayPal).</li>
      <li>Una descripción detallada del motivo de tu solicitud de reembolso.</li>
    </ul>
    <p className="mb-4">Revisaremos tu solicitud y nos comunicaremos contigo lo antes posible.</p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">5. Cambios a Esta Política</h2>
    <p className="mb-4">
      Nos reservamos el derecho de modificar esta política de reembolsos en cualquier momento. Cualquier cambio será
      efectivo inmediatamente después de su publicación en el Sitio Web.
    </p>
    <p className="mt-8 text-sm text-red-600">
      <strong>
        Descargo de responsabilidad: Esta es una plantilla. Consulta a un profesional legal para asegurar el
        cumplimiento.
      </strong>
    </p>
  </>
)
