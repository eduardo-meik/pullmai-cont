import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            Política de Privacidad
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
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Introducción</h2>
            <p className="text-neutral-700 leading-relaxed">
              En PullMai, valoramos su privacidad y nos comprometemos a proteger sus datos personales. Esta Política de Privacidad 
              explica cómo recopilamos, utilizamos, almacenamos y protegemos su información cuando utiliza nuestro servicio de 
              gestión de contratos y organizaciones.
            </p>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Esta política cumple con la Ley N° 19.628 sobre Protección de la Vida Privada de Chile y el Reglamento General 
              de Protección de Datos (RGPD) de la Unión Europea.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Responsable del Tratamiento</h2>
            <div className="bg-primary-50 p-4 rounded-lg">
              <p className="text-neutral-700">
                <strong>Empresa:</strong> PullMai SpA<br />
                <strong>Dirección:</strong> Santiago, Chile<br />
                <strong>Email de contacto:</strong> privacy@pullmai.com<br />
                <strong>Delegado de Protección de Datos:</strong> dpo@pullmai.com
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. Información que Recopilamos</h2>
            
            <h3 className="text-xl font-medium text-neutral-900 mb-3">3.1 Datos de Identificación Personal</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4 mb-4">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Información de la organización (nombre, dirección, datos de contacto)</li>
              <li>Cargo o posición dentro de la organización</li>
              <li>Número de teléfono (opcional)</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-900 mb-3">3.2 Datos de Uso y Técnicos</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4 mb-4">
              <li>Dirección IP y ubicación geográfica aproximada</li>
              <li>Información del navegador y dispositivo</li>
              <li>Páginas visitadas y tiempo de permanencia</li>
              <li>Acciones realizadas en la plataforma</li>
              <li>Registros de actividad y auditoría</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-900 mb-3">3.3 Contenido de Contratos y Documentos</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4">
              <li>Información contractual (partes, montos, fechas, términos)</li>
              <li>Documentos PDF cargados al sistema</li>
              <li>Metadatos de proyectos y organizaciones asociadas</li>
              <li>Comentarios y notas internas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Finalidades del Tratamiento</h2>
            
            <h3 className="text-xl font-medium text-neutral-900 mb-3">4.1 Prestación del Servicio</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4 mb-4">
              <li>Gestionar cuentas de usuario y autenticación</li>
              <li>Permitir la gestión de contratos y proyectos</li>
              <li>Facilitar la colaboración entre organizaciones</li>
              <li>Proporcionar control de acceso basado en roles</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-900 mb-3">4.2 Seguridad y Cumplimiento</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4 mb-4">
              <li>Prevenir fraudes y actividades maliciosas</li>
              <li>Mantener registros de auditoría</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Investigar y resolver problemas técnicos</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-900 mb-3">4.3 Mejora del Servicio</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4">
              <li>Analizar el uso para mejorar funcionalidades</li>
              <li>Desarrollar nuevas características</li>
              <li>Optimizar el rendimiento de la plataforma</li>
              <li>Proporcionar soporte técnico</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">5. Base Legal del Tratamiento</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Procesamos sus datos personales basándonos en las siguientes bases legales:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4">
              <li><strong>Consentimiento:</strong> Para procesar datos específicos que requieren su autorización explícita</li>
              <li><strong>Ejecución contractual:</strong> Para cumplir con nuestros términos de servicio</li>
              <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y garantizar la seguridad</li>
              <li><strong>Cumplimiento legal:</strong> Para cumplir con obligaciones legales y regulatorias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">6. Compartición de Datos</h2>
            
            <h3 className="text-xl font-medium text-neutral-900 mb-3">6.1 Dentro de la Plataforma</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Los datos se comparten dentro de la plataforma según los permisos configurados:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4 mb-4">
              <li>Miembros de su organización según roles asignados</li>
              <li>Organizaciones asociadas con permisos específicos</li>
              <li>Usuarios autorizados para proyectos compartidos</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-900 mb-3">6.2 Terceros Proveedores</h3>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Compartimos datos limitados con proveedores de servicios de confianza:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4 mb-4">
              <li><strong>Google Firebase:</strong> Para autenticación y almacenamiento en la nube</li>
              <li><strong>Proveedores de CDN:</strong> Para entrega eficiente de contenido</li>
              <li><strong>Servicios de análisis:</strong> Para métricas agregadas y anónimas</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-900 mb-3">6.3 Obligaciones Legales</h3>
            <p className="text-neutral-700 leading-relaxed">
              Podemos divulgar información cuando sea requerido por ley, orden judicial o autoridades competentes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">7. Transferencias Internacionales</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Sus datos pueden ser transferidos y procesados en países fuera de Chile/UE a través de nuestros proveedores 
              de servicios. Garantizamos que estas transferencias cumplen con:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4">
              <li>Decisiones de adecuación de la Comisión Europea</li>
              <li>Cláusulas contractuales tipo aprobadas</li>
              <li>Certificaciones de privacidad reconocidas</li>
              <li>Medidas de seguridad adicionales cuando sea necesario</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">8. Seguridad de los Datos</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Implementamos medidas técnicas y organizativas robustas:
            </p>
            
            <h3 className="text-xl font-medium text-neutral-900 mb-3">8.1 Medidas Técnicas</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4 mb-4">
              <li>Cifrado AES-256 para datos en reposo</li>
              <li>Cifrado TLS 1.3 para datos en tránsito</li>
              <li>Autenticación multifactor disponible</li>
              <li>Monitoreo continuo de seguridad</li>
              <li>Respaldos automáticos cifrados</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-900 mb-3">8.2 Medidas Organizativas</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4">
              <li>Acceso basado en principio de menor privilegio</li>
              <li>Capacitación regular en seguridad del personal</li>
              <li>Políticas de seguridad documentadas</li>
              <li>Auditorías de seguridad periódicas</li>
              <li>Plan de respuesta a incidentes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">9. Conservación de Datos</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Conservamos sus datos personales solo durante el tiempo necesario para cumplir con las finalidades descritas:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4">
              <li><strong>Datos de cuenta:</strong> Mientras mantenga una cuenta activa</li>
              <li><strong>Contenido contractual:</strong> Según los requisitos legales de conservación (mínimo 7 años)</li>
              <li><strong>Registros de auditoría:</strong> 3 años desde la última actividad</li>
              <li><strong>Datos de uso:</strong> 2 años para análisis agregados</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mt-4">
              Después de estos períodos, los datos se eliminan de forma segura o se anonimizan irreversiblemente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">10. Sus Derechos</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Bajo la legislación aplicable, usted tiene los siguientes derechos:
            </p>
            
            <h3 className="text-xl font-medium text-neutral-900 mb-3">10.1 Derechos Fundamentales</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4 mb-4">
              <li><strong>Acceso:</strong> Obtener información sobre qué datos procesamos</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
              <li><strong>Limitación:</strong> Restringir ciertos tipos de procesamiento</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-900 mb-3">10.2 Derechos Específicos (RGPD)</h3>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4 mb-4">
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> Oponerse al procesamiento por intereses legítimos</li>
              <li><strong>Decisiones automatizadas:</strong> No estar sujeto a decisiones totalmente automatizadas</li>
            </ul>

            <h3 className="text-xl font-medium text-neutral-900 mb-3">10.3 Ejercicio de Derechos</h3>
            <p className="text-neutral-700 leading-relaxed">
              Para ejercer sus derechos, contáctenos en <strong>privacy@pullmai.com</strong>. 
              Responderemos dentro de 30 días (1 mes bajo RGPD) y verificaremos su identidad antes de procesar la solicitud.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">11. Cookies y Tecnologías Similares</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="list-disc list-inside text-neutral-700 space-y-2 ml-4 mb-4">
              <li><strong>Esenciales:</strong> Mantener su sesión y preferencias</li>
              <li><strong>Funcionalidad:</strong> Recordar configuraciones personalizadas</li>
              <li><strong>Análisis:</strong> Entender cómo se usa la plataforma</li>
              <li><strong>Seguridad:</strong> Detectar y prevenir actividades maliciosas</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed">
              Puede gestionar sus preferencias de cookies a través de la configuración de su navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">12. Cambios a esta Política</h2>
            <p className="text-neutral-700 leading-relaxed">
              Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos cambios significativos 
              por correo electrónico o mediante un aviso prominente en nuestro servicio. Le recomendamos revisar 
              esta política periódicamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">13. Autoridades de Control</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Si considera que el tratamiento de sus datos no se ajusta a la normativa, puede presentar una reclamación ante:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-2">Chile</h4>
                <p className="text-sm text-neutral-700">
                  <strong>Consejo para la Transparencia</strong><br />
                  Huérfanos 1117, piso 1<br />
                  Santiago, Chile<br />
                  Tel: +56 2 2746 9200
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-2">Unión Europea</h4>
                <p className="text-sm text-neutral-700">
                  <strong>Autoridad de control competente</strong><br />
                  Según su país de residencia<br />
                  Consulte: ec.europa.eu/justice/<br />data-protection/bodies/authorities
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">14. Contacto</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Para cualquier consulta sobre esta Política de Privacidad o el tratamiento de sus datos:
            </p>
            <div className="bg-primary-50 p-4 rounded-lg">
              <p className="text-neutral-700">
                <strong>Email:</strong> privacy@pullmai.com<br />
                <strong>Delegado de Protección de Datos:</strong> dpo@pullmai.com<br />
                <strong>Dirección postal:</strong> Santiago, Chile<br />
                <strong>Teléfono:</strong> +56 2 XXXX XXXX
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-neutral-500">
            Esta política de privacidad cumple con la normativa de protección de datos de Chile y la Unión Europea.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
