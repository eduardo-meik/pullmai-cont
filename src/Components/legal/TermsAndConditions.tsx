import React from 'react'
import { Link } from 'react-router-dom'
import { DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <DocumentTextIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Términos y Condiciones
          </h1>
          <p className="text-neutral-600">
            Última actualización: {new Date().toLocaleDateString('es-CL')}
          </p>
        </div>

        {/* Back link */}
        <div className="mb-8">
          <Link 
            to="/signup" 
            className="inline-flex items-center text-primary-600 hover:text-primary-500 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver al registro
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-neutral-700 leading-relaxed">
              Al acceder y utilizar PullMai (el "Servicio"), usted acepta estar sujeto a estos Términos y Condiciones ("Términos"). 
              Si no está de acuerdo con alguna parte de estos términos, entonces no puede acceder al Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Descripción del Servicio</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              PullMai es una plataforma de gestión de contratos y organizaciones que permite:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4">
              <li>Gestión integral de contratos comerciales</li>
              <li>Administración de organizaciones asociadas (contrapartes)</li>
              <li>Gestión de proyectos y asociación con contratos</li>
              <li>Control de acceso basado en roles (RBAC)</li>
              <li>Importación y exportación de datos contractuales</li>
              <li>Almacenamiento seguro de documentos PDF</li>
              <li>Colaboración entre organizaciones</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. Registro y Cuentas de Usuario</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Para utilizar el Servicio, debe crear una cuenta proporcionando información precisa y completa. Usted es responsable de:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4">
              <li>Mantener la confidencialidad de sus credenciales de acceso</li>
              <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
              <li>Asegurar que toda la información proporcionada sea veraz y actualizada</li>
              <li>Cumplir con todas las leyes aplicables en el uso del Servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Uso Aceptable</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Usted se compromete a NO utilizar el Servicio para:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4">
              <li>Actividades ilegales o que violen derechos de terceros</li>
              <li>Cargar contenido malicioso, difamatorio o inapropiado</li>
              <li>Intentar acceder sin autorización a sistemas o datos</li>
              <li>Interferir con el funcionamiento del Servicio</li>
              <li>Usar el Servicio para competir directamente con nosotros</li>
              <li>Compartir información confidencial de otras organizaciones sin autorización</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Propiedad Intelectual</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              El Servicio y su contenido original, características y funcionalidad son propiedad de PullMai y están protegidos por 
              derechos de autor, marcas comerciales, patentes, secretos comerciales y otras leyes de propiedad intelectual.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              Usted conserva todos los derechos sobre el contenido que carga al Servicio, pero nos otorga una licencia limitada 
              para procesar, almacenar y mostrar dicho contenido según sea necesario para proporcionar el Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Privacidad y Protección de Datos</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Nos comprometemos a proteger su privacidad de acuerdo con:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4">
              <li>La Ley N° 19.628 sobre Protección de la Vida Privada (Chile)</li>
              <li>El Reglamento General de Protección de Datos (RGPD) para usuarios en Europa</li>
              <li>Nuestra Política de Privacidad detallada</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Consulte nuestra <Link to="/privacy" className="text-primary-600 hover:text-primary-500 underline">Política de Privacidad</Link> 
              para obtener información detallada sobre cómo recopilamos, utilizamos y protegemos sus datos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Seguridad de Datos</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger sus datos:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4">
              <li>Cifrado de datos en tránsito y en reposo</li>
              <li>Autenticación multifactor disponible</li>
              <li>Control de acceso basado en roles</li>
              <li>Auditoría y monitoreo de actividades</li>
              <li>Respaldos regulares y recuperación ante desastres</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Limitación de Responsabilidad</h2>
            <p className="text-neutral-700 leading-relaxed">
              El Servicio se proporciona "tal como está" sin garantías de ningún tipo. En la máxima medida permitida por la ley, 
              excluimos toda responsabilidad por daños directos, indirectos, incidentales, especiales o consecuentes que resulten 
              del uso o la imposibilidad de usar el Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. Terminación</h2>
            <p className="text-neutral-700 leading-relaxed">
              Podemos terminar o suspender su acceso inmediatamente, sin previo aviso, por cualquier motivo, incluyendo sin 
              limitación si usted incumple los Términos. Al terminar, su derecho a usar el Servicio cesará inmediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">10. Ley Aplicable</h2>
            <p className="text-neutral-700 leading-relaxed">
              Estos Términos se regirán e interpretarán de acuerdo con las leyes de Chile, sin dar efecto a ningún principio 
              de conflictos de leyes. Cualquier disputa se resolverá en los tribunales competentes de Santiago, Chile.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">11. Cambios a los Términos</h2>
            <p className="text-neutral-700 leading-relaxed">
              Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es 
              material, intentaremos proporcionar al menos 30 días de aviso antes de que entren en vigor los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">12. Contacto</h2>
            <p className="text-neutral-700 leading-relaxed">
              Si tiene alguna pregunta sobre estos Términos y Condiciones, póngase en contacto con nosotros en:
            </p>
            <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
              <p className="text-neutral-700">
                <strong>Email:</strong> legal@pullmai.com<br />
                <strong>Dirección:</strong> Santiago, Chile<br />
                <strong>Teléfono:</strong> +56 2 XXXX XXXX
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-neutral-500">
            Al utilizar PullMai, usted acepta estos términos y condiciones en su totalidad.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TermsAndConditions
