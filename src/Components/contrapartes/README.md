# Módulo de Contrapartes

## Descripción

El módulo de contrapartes permite gestionar todas las personas y organizaciones que tienen contratos con tu organización. Proporciona una interfaz completa para crear, visualizar, editar y administrar la información de contacto y detalles de cada contraparte.

## Características

### 🏢 Gestión de Contrapartes
- **Tipos de Contraparte**: Soporte para personas y organizaciones
- **Información Completa**: Datos de contacto, ubicación, información legal
- **Vista Dual**: Tabla detallada y vista de cartas
- **Búsqueda Avanzada**: Filtrado por nombre, email y contacto

### 📊 Estadísticas y Análisis
- **Métricas por Contraparte**: Total de contratos, montos, estados
- **Estadísticas Financieras**: Monto total y promedio por contraparte
- **Seguimiento Temporal**: Último contrato y próximos vencimientos
- **Distribución de Estados**: Contratos activos, vencidos y por vencer

### 🔗 Integración con Contratos
- **Asociación Automática**: Vinculación con contratos existentes
- **Vista de Contratos**: Lista completa de contratos por contraparte
- **Sincronización**: Actualización automática de nombres en contratos

## Estructura de Datos

### Contraparte
```typescript
interface Contraparte {
  id: string
  nombre: string
  tipo: 'persona' | 'organizacion'
  email?: string
  telefono?: string
  direccion?: string
  pais?: string
  ciudad?: string
  rut?: string // Para Chile
  nit?: string // Para otros países
  giro?: string // Actividad económica
  sitioWeb?: string
  contactoPrincipal?: string
  emailContacto?: string
  telefonoContacto?: string
  organizacionId: string
  fechaCreacion: Date
  creadoPor: string
  fechaModificacion?: Date
  modificadoPor?: string
  activo: boolean
  notas?: string
}
```

## Componentes

### 1. ContraparteModule
Componente principal que maneja la navegación entre vistas:
- Vista de tabla
- Vista de cartas  
- Formulario de creación/edición
- Vista de detalles

### 2. ContraparteTable
Tabla responsiva con:
- Información básica de cada contraparte
- Iconos diferenciados por tipo
- Acciones de visualizar, editar y eliminar
- Ordenamiento y filtrado

### 3. ContraparteCards
Vista en cartas que muestra:
- Información de contacto destacada
- Enlaces clicables (email, teléfono, sitio web)
- Diseño responsivo
- Acciones rápidas

### 4. ContraparteForm
Formulario completo para:
- Crear nuevas contrapartes
- Editar contrapartes existentes
- Validación de datos
- Campos específicos por tipo

### 5. ContraparteDetail
Vista detallada que incluye:
- Información completa de la contraparte
- Estadísticas de contratos asociados
- Lista de todos los contratos
- Acciones de edición

## Servicios

### ContraparteService
Servicio que maneja todas las operaciones CRUD:
- `getContrapartesByOrganization()`: Obtener todas las contrapartes
- `getContraparteById()`: Obtener una contraparte específica
- `createContraparte()`: Crear nueva contraparte
- `updateContraparte()`: Actualizar contraparte existente
- `deleteContraparte()`: Eliminación lógica (soft delete)
- `getContratosByContraparte()`: Contratos asociados
- `getContraparteEstadisticas()`: Estadísticas y métricas
- `searchContrapartes()`: Búsqueda por texto
- `updateContraparteNameInContracts()`: Sincronización con contratos

## Hooks Personalizados

### useContrapartes
Hook principal para gestión de contrapartes:
```typescript
const {
  contrapartes,
  isLoading,
  error,
  refetch,
  createContraparte,
  updateContraparte,
  deleteContraparte
} = useContrapartes()
```

### useContraparteDetail
Hook para vista detallada:
```typescript
const {
  contratos,
  estadisticas,
  isLoadingContratos,
  isLoadingEstadisticas
} = useContraparteDetail(contraparteNombre)
```

### useContraparteSearch
Hook para búsqueda:
```typescript
const {
  data: resultados,
  isLoading,
  error
} = useContraparteSearch(searchTerm)
```

## Navegación

El módulo se integra automáticamente en el sistema de navegación:
- **Ruta**: `/contrapartes`
- **Icono**: BuildingOfficeIcon
- **Sidebar**: Aparece entre "Contratos" y "Plantillas"

## Estados y Validaciones

### Validaciones del Formulario
- **Nombre**: Obligatorio
- **Email**: Formato válido si se proporciona
- **Sitio Web**: Debe incluir protocolo (http/https)
- **Tipo**: Selección obligatoria entre persona/organización

### Estados de Carga
- **Loading**: Indicadores mientras se cargan datos
- **Empty State**: Mensaje cuando no hay contrapartes
- **Error State**: Manejo de errores con opción de reintentar
- **No Results**: Mensaje cuando no hay resultados de búsqueda

## Permisos y Seguridad

### Reglas de Firestore
Las contrapartes están protegidas a nivel de organización:
```javascript
// Solo usuarios de la misma organización pueden acceder
match /contrapartes/{contraparteId} {
  allow read, write: if isAuthenticated() && 
    isSameOrganization(resource.data.organizacionId);
}
```

### Roles de Usuario
- **Todos los roles**: Pueden ver contrapartes
- **Manager+**: Pueden crear y editar contrapartes
- **Admin**: Pueden eliminar contrapartes

## Uso

### Acceder al Módulo
1. Navegar a `/contrapartes` desde el sidebar
2. Alternativamente, hacer clic en "Contrapartes" en la navegación

### Crear Nueva Contraparte
1. Hacer clic en "Nueva Contraparte"
2. Llenar el formulario con la información requerida
3. Seleccionar tipo (Persona u Organización)
4. Guardar cambios

### Buscar Contrapartes
1. Usar el campo de búsqueda en la parte superior
2. El filtrado es en tiempo real
3. Busca en nombre, email y contacto principal

### Ver Detalles
1. Hacer clic en el ícono de ojo en cualquier contraparte
2. Ver estadísticas completas de contratos
3. Acceder a lista de contratos asociados

### Cambiar Vista
1. Usar los botones de vista en la toolbar
2. Alternar entre tabla (detallada) y cartas (visual)

## Datos de Ejemplo

El módulo incluye un script para poblar contrapartes de ejemplo:
```bash
python populate_contrapartes_v2.py
```

Este script crea contrapartes de ejemplo como:
- Microsoft Chile
- AWS Chile  
- Juan Carlos Pérez (Consultor)

## Integración con Contratos

Las contrapartes se vinculan automáticamente con los contratos a través del campo `contraparte` en el documento de contrato. Cuando se actualiza el nombre de una contraparte, todos los contratos asociados se actualizan automáticamente.

## Próximas Mejoras

- [ ] Importación masiva desde CSV/Excel
- [ ] Exportación de datos de contrapartes
- [ ] Integración con APIs externas (RUT, NIT validation)
- [ ] Historial de cambios y auditoría
- [ ] Campos personalizados por organización
- [ ] Sincronización con sistemas CRM externos
