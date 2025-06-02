// content/legal/privacy-template.tsx
// PLANTILLA - CONSULTAR A UN ABOGADO
export const privacyContent = (
  <>
    <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
    <p className="mb-4">
      Última actualización: {new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
    </p>

    <p className="mb-4">
      PasalabraLive ("nosotros", "nuestro", o "nos") opera el sitio web [TU_URL_COMPLETA_AQUI] (en adelante, el
      "Servicio").
    </p>
    <p className="mb-4">
      Esta página te informa de nuestras políticas en cuanto a la recopilación, uso y divulgación de datos personales
      cuando utilizas nuestro Servicio y las opciones que has asociado con esos datos.
    </p>
    <p className="mb-4">
      Utilizamos tus datos para proporcionar y mejorar el Servicio. Al utilizar el Servicio, aceptas la recopilación y
      el uso de información de acuerdo con esta política.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">1. Recopilación y Uso de Información</h2>
    <p className="mb-4">
      Recopilamos varios tipos diferentes de información para diversos propósitos para proporcionar y mejorar nuestro
      Servicio para ti.
    </p>
    <h3 className="text-xl font-semibold mt-4 mb-2">Tipos de Datos Recopilados</h3>
    <h4 className="text-lg font-medium mt-3 mb-1">Datos Personales</h4>
    <p className="mb-4">
      Mientras utilizas nuestro Servicio, podemos pedirte que nos proporciones cierta información de identificación
      personal que se puede utilizar para contactarte o identificarte ("Datos Personales"). La información de
      identificación personal puede incluir, entre otros:
    </p>
    <ul className="list-disc list-inside mb-4 pl-4">
      <li>Dirección de correo electrónico</li>
      <li>Nombre de usuario</li>
      <li>Datos de uso y cookies</li>
      <li>Información de pago (procesada por terceros como PayPal)</li>
    </ul>
    <h4 className="text-lg font-medium mt-3 mb-1">Datos de Uso</h4>
    <p className="mb-4">
      También podemos recopilar información sobre cómo se accede y utiliza el Servicio ("Datos de Uso"). Estos Datos de
      Uso pueden incluir información como la dirección del Protocolo de Internet de tu computadora (por ejemplo,
      dirección IP), tipo de navegador, versión del navegador, las páginas de nuestro Servicio que visitas, la hora y
      fecha de tu visita, el tiempo dedicado a esas páginas, identificadores únicos de dispositivos y otros datos de
      diagnóstico.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">2. Uso de Datos</h2>
    <p className="mb-4">PasalabraLive utiliza los datos recopilados para diversos fines:</p>
    <ul className="list-disc list-inside mb-4 pl-4">
      <li>Para proporcionar y mantener nuestro Servicio</li>
      <li>Para notificarte sobre cambios en nuestro Servicio</li>
      <li>Para permitirte participar en funciones interactivas de nuestro Servicio cuando elijas hacerlo</li>
      <li>Para proporcionar atención al cliente</li>
      <li>Para recopilar análisis o información valiosa para que podamos mejorar nuestro Servicio</li>
      <li>Para monitorear el uso de nuestro Servicio</li>
      <li>Para detectar, prevenir y abordar problemas técnicos</li>
      <li>Para procesar tus pagos de suscripción (a través de terceros)</li>
    </ul>

    <h2 className="text-2xl font-semibold mt-6 mb-3">3. Proveedores de Servicios de Pago</h2>
    <p className="mb-4">
      Utilizamos servicios de terceros para el procesamiento de pagos (por ejemplo, procesadores de pago como PayPal).
      No almacenaremos ni recopilaremos los detalles de tu tarjeta de pago. Esa información se proporciona directamente
      a nuestros procesadores de pago externos cuyo uso de tu información personal se rige por su Política de
      Privacidad. Estos procesadores de pago se adhieren a los estándares establecidos por PCI-DSS según lo gestionado
      por el PCI Security Standards Council.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">4. Seguridad de los Datos</h2>
    <p className="mb-4">
      La seguridad de tus datos es importante para nosotros, pero recuerda que ningún método de transmisión por Internet
      o método de almacenamiento electrónico es 100% seguro. Si bien nos esforzamos por utilizar medios comercialmente
      aceptables para proteger tus Datos Personales, no podemos garantizar su seguridad absoluta.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">5. Tus Derechos de Protección de Datos</h2>
    <p className="mb-4">
      Dependiendo de tu jurisdicción, puedes tener ciertos derechos de protección de datos. PasalabraLive tiene como
      objetivo tomar medidas razonables para permitirte corregir, modificar, eliminar o limitar el uso de tus Datos
      Personales.
    </p>
    <p className="mb-4">
      Si deseas ser informado sobre qué Datos Personales tenemos sobre ti y si deseas que se eliminen de nuestros
      sistemas, contáctanos.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">6. Cambios a Esta Política de Privacidad</h2>
    <p className="mb-4">
      Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando
      la nueva Política de Privacidad en esta página.
    </p>
    <p className="mb-4">
      Se te aconseja revisar esta Política de Privacidad periódicamente para cualquier cambio. Los cambios a esta
      Política de Privacidad son efectivos cuando se publican en esta página.
    </p>

    <h2 className="text-2xl font-semibold mt-6 mb-3">7. Contáctanos</h2>
    <p className="mb-4">
      Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos en [TU_EMAIL_DE_CONTACTO].
    </p>
    <p className="mt-8 text-sm text-red-600">
      <strong>
        Descargo de responsabilidad: Esta es una plantilla. Consulta a un profesional legal para asegurar el
        cumplimiento.
      </strong>
    </p>
  </>
)
