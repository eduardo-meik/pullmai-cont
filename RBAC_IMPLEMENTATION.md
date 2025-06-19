# Sistema de Control de Acceso Basado en Roles (RBAC)

## Jerarquía Implementada: Organización → Proyectos → Contratos

### Resumen de Cambios

Se ha implementado un sistema completo de permisos basado en roles que respeta la jerarquía **Organización → Proyectos → Contratos**. Los roles pueden **Ver** o **Editar** según su información de permisos específica.

### Roles y Permisos

#### 1. Super Administrador (`super_admin`)
- **Alcance**: Global - Acceso completo a todas las organizaciones
- **Permisos**:
  - ✅ Todas las operaciones en organizaciones, proyectos y contratos
  - ✅ Gestión completa de usuarios
  - ✅ Configuración del sistema
  - ✅ Reportes globales

#### 2. Administrador de Organización (`org_admin`)
- **Alcance**: Organización específica
- **Permisos**:
  - ✅ Acceso completo a su organización
  - ✅ Todos los proyectos y contratos de su organización
  - ✅ Gestión de usuarios de su organización
  - ✅ Reportes de su organización

#### 3. Gerente (`manager`)
- **Alcance**: Proyectos asignados
- **Permisos**:
  - ✅ Acceso a proyectos asignados específicamente
  - ✅ Todos los contratos de sus proyectos asignados
  - ✅ Crear y editar contratos en sus proyectos
  - ✅ Ver información de usuarios de sus proyectos
  - 📖 Solo lectura de reportes de sus proyectos

#### 4. Usuario (`user`)
- **Alcance**: Proyectos y contratos asignados específicamente
- **Permisos**:
  - 📖/✏️ Ver o editar proyectos según asignación específica
  - 📖/✏️ Ver o editar contratos según asignación específica
  - Los permisos de **ver** o **editar** se definen individualmente por recurso

### Estructura de Datos Actualizada

#### Tipos Principales Modificados

1. **Usuario**: Ahora incluye `asignaciones` para permisos específicos
2. **Contrato**: Incluye `proyectoId` para establecer la relación jerárquica
3. **FormularioContrato**: Actualizado con `proyectoId`

#### Nuevas Interfaces

```typescript
interface UserAssignment {
  userId: string
  organizationId?: string
  projectIds?: string[]
  contractIds?: string[]
  permissions: AssignmentPermission[]
}

interface AssignmentPermission {
  resource: 'projects' | 'contracts'
  resourceId: string
  actions: ('view' | 'edit')[]
}
```

### Funciones de Control de Acceso

#### Funciones Principales Implementadas

1. **`canAccessOrganization()`**: Verifica acceso a organizaciones
2. **`canAccessProject()`**: Verifica acceso a proyectos específicos
3. **`canAccessContract()`**: Verifica acceso a contratos específicos
4. **`canPerformAction()`**: Verifica si puede realizar una acción específica
5. **`getUserSpecificPermissions()`**: Obtiene permisos específicos del usuario

### Hook de Permisos (`usePermissions`)

El hook proporciona funciones fáciles de usar en los componentes:

```typescript
const {
  canViewContract,
  canEditContract,
  canCreateContract,
  canDeleteContract,
  canViewProject,
  canEditProject,
  // ... más funciones
} = usePermissions()
```

### Componentes Actualizados

#### 1. ContractModule
- ✅ Botón "Nuevo Contrato" solo visible para usuarios con permisos de creación
- ✅ Verificación de permisos basada en la organización del usuario

#### 2. ContractTable
- ✅ Filtrado automático de contratos según permisos del usuario
- ✅ Botones de acción (editar/eliminar) condicionados por permisos
- ✅ Verificación de permisos por contrato individual

#### 3. ContractForm
- ✅ Soporte para el nuevo campo `proyectoId`
- ✅ Mantiene compatibilidad con formularios de edición

### Ejemplos de Uso

#### Verificar si un usuario puede ver un contrato:
```typescript
const canView = canViewContract(
  contract.organizacionId, 
  contract.proyectoId, 
  contract.id
)
```

#### Verificar si un usuario puede editar un proyecto:
```typescript
const canEdit = canEditProject(
  project.organizacionId, 
  project.id
)
```

### Datos de Ejemplo Actualizados

- ✅ Todos los contratos incluyen `proyectoId`
- ✅ 7 proyectos de ejemplo con IDs únicos
- ✅ Contratos organizados por proyecto
- ✅ Relaciones jerárquicas correctas

### Flujo de Verificación de Permisos

1. **Nivel 1**: ¿El usuario está en la misma organización?
2. **Nivel 2**: ¿El rol del usuario permite la acción básica?
3. **Nivel 3**: ¿El usuario tiene acceso al proyecto/contrato específico?
4. **Nivel 4**: ¿Las asignaciones específicas permiten la acción?

### Casos de Uso Soportados

1. **Super Admin**: Ve y gestiona todo
2. **Org Admin**: Gestiona toda su organización
3. **Gerente**: Gestiona proyectos asignados y sus contratos
4. **Usuario con permisos de vista**: Solo ve recursos asignados
5. **Usuario con permisos de edición**: Ve y edita recursos asignados

### Notas de Implementación

- El sistema es extensible para agregar más roles
- Las asignaciones específicas permiten granularidad fina
- Compatible con el sistema de autenticación existente
- Mantiene compatibilidad hacia atrás con datos existentes

### Próximos Pasos Recomendados

1. Implementar interfaz de gestión de asignaciones de usuarios
2. Agregar auditoría de acceso y cambios de permisos
3. Implementar notificaciones por cambios de permisos
4. Crear dashboard de permisos para administradores
