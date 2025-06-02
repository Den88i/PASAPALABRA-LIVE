// content/legal/terms-template.tsx
// PLANTILLA - CONSULTAR A UN ABOGADO
export const termsContent = (
  <>
    <h1 className="text-3xl font-bold mb-6">Términos y Condiciones de Uso</h1>
    <p className="mb-4">
      Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
    </p>

    <p className="mb-4">
      Bienvenido a PasalabraLive (en adelante, "el Sitio Web", "nosotros", "nuestro"). Estos términos y condiciones
      describen las reglas y regulaciones para el uso del Sitio Web de PasalabraLive, ubicado en [TU_URL_COMPLETA_AQUI].
    </p>
    <p className="mb-4">
      Al acceder a este Sitio Web, asumimos que aceptas estos términos y condiciones. No continúes usando PasalabraLive
      si no estás de acuerdo con todos los términos y condiciones establecidos en esta página.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">1. Cuentas de Usuario</h2>
    <p className="mb-4">
      Para acceder a ciertas funciones del Sitio Web, como participar en partidas o acceder a contenido premium, es
      posible que debas registrarte para obtener una cuenta. Eres responsable de mantener la confidencialidad de tu
      cuenta y contraseña y de restringir el acceso a tu computadora. Aceptas la responsabilidad de todas las
      actividades que ocurran bajo tu cuenta o contraseña.
    </p>
    <p className="mb-4">
      Nos reservamos el derecho de suspender o cancelar tu cuenta a nuestra entera discreción, sin previo aviso ni
      responsabilidad, por cualquier motivo, incluido, entre otros, el incumplimiento de los Términos.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">2. Suscripciones y Pagos (si aplica)</h2>
    <p className="mb-4">
      Ofrecemos características o contenido premium a través de suscripciones. Si eliges suscribirte, aceptas pagar
      todas las tarifas e impuestos aplicables. Los pagos se procesarán a través de nuestros proveedores de pago
      externos (ej. PayPal).
    </p>
    <p className="mb-4">
      Las suscripciones pueden renovarse automáticamente a menos que se cancelen. Puedes gestionar tu suscripción y
      cancelarla según los términos especificados en el momento de la compra o en la configuración de tu cuenta.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">3. Conducta del Usuario</h2>
    <p className="mb-4">Aceptas no utilizar el Sitio Web para:</p>
    <ul className="list-disc list-inside mb-4 pl-4">
      <li>
        Publicar o transmitir cualquier contenido que sea ilegal, amenazante, abusivo, difamatorio, obsceno o de
        cualquier otra manera objetable.
      </li>
      <li>Hacer trampa o usar software no autorizado para obtener una ventaja en los juegos.</li>
      <li>Suplantar a cualquier persona o entidad.</li>
      <li>Violar cualquier ley o regulación aplicable.</li>
    </ul>

    <h2 className="text-2xl font-semibold mt-6 mb-3">4. Propiedad Intelectual</h2>
    <p className="mb-4">
      El Sitio Web y su contenido original (excluyendo el contenido proporcionado por los usuarios), características y
      funcionalidad son y seguirán siendo propiedad exclusiva de PasalabraLive y sus licenciantes. El Sitio Web está
      protegido por derechos de autor, marcas registradas y otras leyes tanto de [TU_PAIS] como de países extranjeros.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">5. Limitación de Responsabilidad</h2>
    <p className="mb-4">
      En la máxima medida permitida por la ley aplicable, en ningún caso PasalabraLive, ni sus directores, empleados,
      socios, agentes, proveedores o afiliados, serán responsables de daños indirectos, incidentales, especiales,
      consecuentes o punitivos, incluyendo, sin limitación, pérdida de beneficios, datos, uso, buena voluntad u otras
      pérdidas intangibles, resultantes de (i) tu acceso o uso o incapacidad para acceder o usar el Sitio Web; (ii)
      cualquier conducta o contenido de terceros en el Sitio Web; (iii) cualquier contenido obtenido del Sitio Web; y
      (iv) acceso no autorizado, uso o alteración de tus transmisiones o contenido, ya sea basado en garantía, contrato,
      agravio (incluida negligencia) o cualquier otra teoría legal, ya sea que hayamos sido informados o no de la
      posibilidad de dicho daño.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">6. Cambios a los Términos</h2>
    <p className="mb-4">
      Nos reservamos el derecho, a nuestra entera discreción, de modificar o reemplazar estos Términos en cualquier
      momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que entren
      en vigor los nuevos términos. Lo que constituye un cambio material se determinará a nuestra entera discreción.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">7. Contáctanos</h2>
    <p className="mb-4">
      Si tienes alguna pregunta sobre estos Términos, por favor contáctanos en [TU_EMAIL_DE_CONTACTO].
    </p>
    <p className="mt-8 text-sm text-red-600">
      <strong>
        Descargo de responsabilidad: Esta es una plantilla. Consulta a un profesional legal para asegurar el
        cumplimiento.
      </strong>
    </p>
  </>
)
