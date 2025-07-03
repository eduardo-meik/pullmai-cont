# 🧪 Checklist de Testing - PullMai

Guía completa para testear todas las funcionalidades de la aplicación PullMai, incluyendo workflows principales, casos edge y validaciones de seguridad.

**Versión**: 1.0  
**Fecha**: 2 de Julio, 2025  
**Proyecto**: PullMai - Sistema de Gestión de Contratos

---

## 🔐 Autenticación y Registro

### ✅ Registro de Usuario (Signup)

#### Casos de Éxito
- [ ] **Registro con email/contraseña válidos**
  - Ingresar email válido (formato correcto)
  - Contraseña que cumpla requisitos (8+ caracteres, mayúscula, minúscula, número)
  - Confirmar contraseña idéntica
  - Aceptar términos y condiciones
  - Verificar redirección a dashboard después del registro

- [ ] **Registro con Google**
  - Hacer clic en "Continuar con Google"
  - Completar flujo OAuth de Google
  - Verificar creación automática de cuenta
  - Verificar redirección a dashboard

- [ ] **Registro con GitHub**
  - Hacer clic en "Continuar con GitHub"
  - Completar flujo OAuth de GitHub
  - Verificar creación automática de cuenta
  - Verificar redirección a dashboard

#### Validaciones y Errores
- [ ] **Email inválido**
  - Probar formato incorrecto: `test@`, `@test.com`, `test.com`
  - Verificar mensaje de error específico

- [ ] **Contraseña débil**
  - Probar contraseña < 8 caracteres
  - Probar sin mayúsculas, minúsculas o números
  - Verificar indicador de fortaleza de contraseña

- [ ] **Contraseñas no coinciden**
  - Ingresar contraseñas diferentes
  - Verificar mensaje de error específico

- [ ] **Email ya registrado**
  - Intentar registrar email existente
  - Verificar mensaje de error apropiado

- [ ] **Términos no aceptados**
  - Intentar registrar sin marcar checkbox
  - Verificar que botón esté deshabilitado

#### Navegación
- [ ] **Enlaces legales**
  - Hacer clic en "términos y condiciones" → verificar ruta `/terms`
  - Hacer clic en "política de privacidad" → verificar ruta `/privacy`
  - Verificar botón "Volver al registro" en páginas legales

- [ ] **Link a Login**
  - Hacer clic en "Inicia sesión aquí"
  - Verificar redirección a `/login`

### ✅ Inicio de Sesión (Login)

#### Casos de Éxito
- [ ] **Login con credenciales válidas**
  - Email y contraseña correctos
  - Verificar redirección a dashboard
  - Verificar persistencia de sesión

- [ ] **Login con Google**
  - Completar flujo OAuth
  - Verificar redirección correcta

- [ ] **Login con GitHub**
  - Completar flujo OAuth
  - Verificar redirección correcta

#### Validaciones y Errores
- [ ] **Credenciales incorrectas**
  - Email válido con contraseña incorrecta
  - Email inexistente
  - Verificar mensajes de error apropiados

- [ ] **Campos vacíos**
  - Intentar login sin email
  - Intentar login sin contraseña
  - Verificar validaciones

#### Navegación
- [ ] **Forgot Password**
  - Hacer clic en "¿Olvidaste tu contraseña?"
  - Verificar ruta `/forgot-password`
  - Probar flujo de recuperación

- [ ] **Link a Signup**
  - Hacer clic en enlace de registro
  - Verificar redirección a `/signup`

### ✅ Recuperación de Contraseña

- [ ] **Email válido registrado**
  - Ingresar email existente
  - Verificar envío de email de recuperación
  - Verificar mensaje de confirmación

- [ ] **Email no registrado**
  - Ingresar email no existente
  - Verificar manejo de error apropiado

---

## 🏠 Dashboard Principal

### ✅ Carga Inicial
- [ ] **Visualización de métricas**
  - Verificar carga de estadísticas principales
  - Contratos activos, proyectos, organizaciones
  - Métricas financieras (montos totales)

- [ ] **Navegación principal**
  - Verificar menú lateral funcional
  - Links a Contratos, Proyectos, Contrapartes
  - Perfil de usuario accesible

- [ ] **Estados de carga**
  - Verificar spinners durante carga de datos
  - Manejo de errores de conexión

---

## 📋 Gestión de Contratos

### ✅ Visualización de Contratos

#### Lista de Contratos
- [ ] **Carga inicial**
  - Verificar tabla con contratos existentes
  - Campos visibles: título, contraparte, monto, estado, fechas
  - Paginación funcional si hay muchos contratos

- [ ] **Filtros y búsqueda**
  - Buscar por título/descripción
  - Filtrar por estado (activo, borrador, etc.)
  - Filtrar por contraparte
  - Filtrar por rango de fechas

- [ ] **Ordenamiento**
  - Ordenar por fecha de creación
  - Ordenar por monto
  - Ordenar por estado
  - Verificar indicadores visuales de ordenamiento

#### Detalle de Contrato
- [ ] **Visualización completa**
  - Hacer clic en contrato específico
  - Verificar todos los campos visibles
  - PDF del contrato (si existe)
  - Información de la contraparte

### ✅ Creación de Contratos

#### Formulario Nuevo Contrato
- [ ] **Campos obligatorios**
  - Título del contrato
  - Descripción
  - Contraparte (selección)
  - Monto
  - Fechas (inicio, fin)
  - Estado inicial

- [ ] **Validaciones**
  - Título no puede estar vacío
  - Monto debe ser numérico y positivo
  - Fecha de fin posterior a fecha de inicio
  - Selección válida de contraparte

- [ ] **Proyecto asociado**
  - Verificar dropdown de proyectos disponibles
  - Permitir crear contrato sin proyecto
  - Asignación automática según permisos

#### Casos de Éxito
- [ ] **Contrato básico**
  - Llenar campos mínimos requeridos
  - Guardar y verificar aparición en lista
  - Verificar generación de ID único

- [ ] **Contrato con PDF**
  - Subir documento PDF válido
  - Verificar almacenamiento seguro
  - Verificar visualización posterior

- [ ] **Contrato asociado a proyecto**
  - Seleccionar proyecto existente
  - Verificar relación establecida
  - Verificar aparición en vista de proyecto

#### Casos de Error
- [ ] **Datos inválidos**
  - Monto negativo o no numérico
  - Fechas inválidas
  - Archivo PDF corrupto
  - Verificar mensajes de error específicos

### ✅ Edición de Contratos

- [ ] **Modificar campos básicos**
  - Editar título, descripción, monto
  - Cambiar fechas
  - Verificar guardado automático/manual

- [ ] **Cambio de estado**
  - Borrador → Activo
  - Activo → Vencido
  - Verificar transiciones válidas

- [ ] **Cambio de proyecto**
  - Mover contrato entre proyectos
  - Verificar restricciones (si las hay)
  - Auditoría de cambios

### ✅ Eliminación de Contratos

- [ ] **Confirmación de eliminación**
  - Modal de confirmación aparece
  - Confirmar eliminación
  - Verificar desaparición de lista

- [ ] **Permisos de eliminación**
  - Verificar que solo usuarios autorizados puedan eliminar
  - Verificar restricciones por estado

---

## 📁 Gestión de Proyectos

### ✅ Lista de Proyectos

- [ ] **Visualización de cards**
  - Nombre del proyecto
  - Estado y prioridad
  - Métricas (contratos asociados, presupuesto)
  - Barra de progreso presupuestario

- [ ] **Navegación**
  - Hacer clic en proyecto lleva a detalle
  - Botón "Nuevo Proyecto" visible y funcional

### ✅ Creación de Proyectos

#### Formulario Nuevo Proyecto
- [ ] **Campos requeridos**
  - Nombre del proyecto
  - Descripción
  - Estado inicial
  - Prioridad
  - Presupuesto (opcional)

- [ ] **Validaciones**
  - Nombre único dentro de la organización
  - Presupuesto numérico si se proporciona
  - Estado válido seleccionado

#### Casos de Éxito
- [ ] **Proyecto básico**
  - Crear con campos mínimos
  - Verificar aparición en lista
  - Verificar métricas iniciales (0 contratos)

- [ ] **Proyecto completo**
  - Incluir todos los campos opcionales
  - Verificar guardado correcto
  - Verificar cálculos de presupuesto

### ✅ Detalle de Proyecto

- [ ] **Información general**
  - Todos los datos del proyecto visibles
  - Métricas actualizadas
  - Lista de contratos asociados

- [ ] **Gestión de contratos**
  - Ver contratos asociados
  - Enlazar contratos existentes
  - Crear nuevo contrato desde proyecto
  - Desenlazar contratos

#### Asociación de Contratos
- [ ] **Enlazar contrato existente**
  - Modal de selección de contratos
  - Filtrar contratos disponibles
  - Confirmar asociación
  - Verificar actualización de métricas

- [ ] **Restricciones**
  - No permitir enlazar contrato ya asociado a otro proyecto
  - Verificar mensaje de error apropiado

### ✅ Edición de Proyectos

- [ ] **Modificar información básica**
  - Cambiar nombre, descripción
  - Modificar estado y prioridad
  - Actualizar presupuesto

- [ ] **Validaciones de edición**
  - Nombre sigue siendo único
  - Estados válidos
  - Presupuesto numérico

### ✅ Eliminación de Proyectos

- [ ] **Confirmación**
  - Modal de confirmación clara
  - Advertencia sobre contratos asociados
  - Confirmar eliminación

- [ ] **Contratos huérfanos**
  - Verificar qué pasa con contratos asociados
  - Deben quedar sin proyecto o transferirse

---

## 🏢 Gestión de Contrapartes/Organizaciones

### ✅ Lista de Organizaciones

- [ ] **Visualización**
  - Nombre de la organización
  - Información de contacto básica
  - Número de contratos asociados
  - Estado de la relación

- [ ] **Búsqueda y filtros**
  - Buscar por nombre
  - Filtrar por tipo de organización
  - Filtrar por estado de relación

### ✅ Detalle de Organización

- [ ] **Información completa**
  - Datos básicos de la organización
  - Historial de contratos
  - Métricas de relación
  - Información financiera agregada

- [ ] **Gestión de acceso**
  - Ver usuarios con acceso
  - Otorgar/revocar permisos
  - Niveles de acceso diferentes

### ✅ Funcionalidades Avanzadas

#### Importación de Contratos
- [ ] **Solicitar importación**
  - Seleccionar usuario fuente
  - Elegir contratos específicos
  - Agregar notas de solicitud
  - Enviar solicitud

- [ ] **Aprobar importación**
  - Ver solicitudes pendientes
  - Revisar contratos a importar
  - Aprobar/rechazar con comentarios
  - Verificar importación exitosa

#### Compartir Información
- [ ] **Templates y mejores prácticas**
  - Subir templates de contratos
  - Compartir mejores prácticas
  - Guidelines de precios
  - Tips de negociación

---

## 👤 Gestión de Usuarios y Permisos (RBAC)

### ✅ Roles y Permisos

#### Super Admin
- [ ] **Acceso total**
  - Ver todas las organizaciones
  - Gestionar todos los usuarios
  - Acceso a todas las funcionalidades

#### Organization Admin
- [ ] **Gestión organizacional**
  - Ver toda su organización
  - Gestionar usuarios de su org
  - Crear/editar/eliminar proyectos y contratos
  - Gestionar contrapartes

#### Manager
- [ ] **Proyectos asignados**
  - Ver solo proyectos asignados
  - Gestionar contratos de sus proyectos
  - Ver información de usuarios relevantes

#### User
- [ ] **Recursos específicos**
  - Ver solo contratos/proyectos asignados
  - Permisos de lectura/escritura según asignación
  - No puede gestionar usuarios

### ✅ Control de Acceso

- [ ] **Navegación restringida**
  - Menús/botones aparecen según permisos
  - Redirección en acceso no autorizado
  - Mensajes de error apropiados

- [ ] **API y datos**
  - Filtrado automático de datos según permisos
  - Bloqueo de operaciones no autorizadas
  - Auditoría de intentos de acceso

---

## 🔒 Seguridad y Validaciones

### ✅ Autenticación
- [ ] **Sesiones**
  - Expiración automática de sesión
  - Logout correcto (limpia tokens)
  - Protección de rutas privadas

- [ ] **Passwords**
  - Hashing seguro (no visible en frontend)
  - Validación de fortaleza
  - Cambio de contraseña funcional

### ✅ Autorización
- [ ] **Verificación de permisos**
  - En cada acción sensible
  - Tanto en frontend como backend
  - Mensajes claros de acceso denegado

### ✅ Datos Sensibles
- [ ] **Protección de información**
  - Datos personales no expuestos
  - Información financiera protegida
  - PDFs con acceso controlado

---

## 📄 Gestión de Documentos

### ✅ Subida de PDFs
- [ ] **Tipos de archivo**
  - Solo PDFs permitidos
  - Tamaño máximo respetado
  - Verificar rechazo de otros tipos

- [ ] **Almacenamiento**
  - Subida exitosa a Firebase Storage
  - URLs seguras generadas
  - Metadatos correctos

### ✅ Visualización
- [ ] **Visor integrado**
  - PDF se muestra correctamente
  - Navegación entre páginas
  - Zoom funcional
  - Descarga permitida según permisos

---

## 🌐 Aspectos Técnicos

### ✅ Performance
- [ ] **Carga inicial**
  - Tiempo de carga < 3 segundos
  - Lazy loading de componentes pesados
  - Caching apropiado

- [ ] **Navegación**
  - Transiciones suaves
  - Sin bloqueos de UI
  - Estados de carga visibles

### ✅ Responsive Design
- [ ] **Móvil (320px - 768px)**
  - Menú colapsable
  - Formularios utilizables
  - Tablas con scroll horizontal

- [ ] **Tablet (768px - 1024px)**
  - Layout adaptado
  - Navegación optimizada

- [ ] **Desktop (1024px+)**
  - Uso completo del espacio
  - Sidebar fijo
  - Múltiples columnas

### ✅ Estados de Error
- [ ] **Sin conexión**
  - Mensaje claro al usuario
  - Reintentos automáticos
  - Funcionalidad offline básica

- [ ] **Errores de servidor**
  - Mensajes comprensibles
  - No exposición de errores técnicos
  - Opciones de recuperación

### ✅ Compatibilidad
- [ ] **Navegadores**
  - Chrome (último)
  - Firefox (último)
  - Safari (último)
  - Edge (último)

---

## 📊 Testing de Integración

### ✅ Flujos Completos

#### Nuevo Usuario → Primer Contrato
- [ ] **Flujo completo**
  1. Registro exitoso
  2. Login automático
  3. Tour/onboarding (si existe)
  4. Crear primera organización (si aplica)
  5. Crear primer proyecto
  6. Crear primer contrato
  7. Subir PDF
  8. Verificar dashboard actualizado

#### Colaboración entre Organizaciones
- [ ] **Flujo de colaboración**
  1. Usuario A otorga acceso a Usuario B
  2. Usuario B ve nueva organización disponible
  3. Usuario B solicita importar contratos
  4. Usuario A aprueba solicitud
  5. Contratos aparecen en cuenta de Usuario B
  6. Auditoría registra todas las acciones

### ✅ Casos Edge

#### Datos Corruptos
- [ ] **Resilencia**
  - Contratos sin PDF
  - Proyectos sin contratos
  - Organizaciones sin contacto
  - Referencias rotas en BD

#### Concurrencia
- [ ] **Múltiples usuarios**
  - Edición simultánea de contratos
  - Eliminación mientras otro usuario ve
  - Cambios de permisos en tiempo real

---

## 🚀 Testing de Deployment

### ✅ Ambiente de Producción
- [ ] **Variables de entorno**
  - Firebase config correcta
  - URLs de producción
  - Claves API válidas

- [ ] **Build de producción**
  - Compilación sin errores
  - Optimización de assets
  - Source maps deshabilitados

### ✅ Monitoring
- [ ] **Logs y errores**
  - Error tracking configurado
  - Performance monitoring
  - Analytics básico

---

## ✅ Checklist Final Pre-Launch

### Funcionalidad Core
- [ ] Registro y login funcionan perfectamente
- [ ] CRUD completo de contratos
- [ ] CRUD completo de proyectos
- [ ] Gestión básica de organizaciones
- [ ] Sistema de permisos operativo
- [ ] Subida y visualización de PDFs

### Seguridad
- [ ] Autenticación robusta
- [ ] Autorización en todas las rutas
- [ ] Protección de datos sensibles
- [ ] Páginas legales publicadas

### UX/UI
- [ ] Diseño responsive verificado
- [ ] Navegación intuitiva
- [ ] Mensajes de error claros
- [ ] Estados de carga apropiados

### Técnico
- [ ] Performance aceptable
- [ ] Sin errores de consola
- [ ] Build de producción optimizado
- [ ] Monitoring configurado

---

## 📝 Notas de Testing

### Datos de Prueba Sugeridos
```
Usuarios:
- admin@test.com / Admin123!
- manager@test.com / Manager123!
- user@test.com / User123!

Organizaciones:
- TechCorp Solutions
- Innovate Labs
- Digital Ventures

Contratos:
- Desarrollo de Software (50.000 USD)
- Consultoría IT (25.000 USD)
- Soporte Técnico (10.000 USD/mes)
```

### Herramientas Recomendadas
- **Manual Testing**: Checklist impreso
- **Automated Testing**: Cypress/Playwright para E2E
- **Performance**: Lighthouse audits
- **Security**: OWASP ZAP scanning
- **Mobile**: BrowserStack para dispositivos reales

---

**Última actualización**: 2 de Julio, 2025  
**Responsable**: Equipo de QA PullMai  
**Próxima revisión**: Antes de cada release
