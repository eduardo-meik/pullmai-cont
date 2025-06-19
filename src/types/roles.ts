// Sistema de roles y permisos con jerarquía Organization -> Projects -> Contracts

export interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions: Permission[];
  level: number; // Para jerarquía de roles (menor número = mayor jerarquía)
  scope: RoleScope; // Alcance del rol
}

export interface Permission {
  resource: 'organizations' | 'projects' | 'contracts' | 'users' | 'reports' | 'settings';
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
  scope?: 'global' | 'organization' | 'project' | 'assigned'; // Alcance de la acción
}

export interface RoleScope {
  type: 'global' | 'organization' | 'project' | 'assigned';
  description: string;
}

// Interfaz para asignaciones específicas de usuarios
export interface UserAssignment {
  userId: string;
  organizationId?: string;
  projectIds?: string[];
  contractIds?: string[];
  permissions: AssignmentPermission[];
}

export interface AssignmentPermission {
  resource: 'projects' | 'contracts';
  resourceId: string;
  actions: ('view' | 'edit')[];
}

export const ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'super_admin',
    displayName: 'Super Administrador',
    level: 1,
    scope: {
      type: 'global',
      description: 'Acceso completo a todas las organizaciones, proyectos y contratos'
    },
    permissions: [
      { resource: 'organizations', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'global' },
      { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'global' },
      { resource: 'contracts', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'global' },
      { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'global' },
      { resource: 'reports', actions: ['create', 'read'], scope: 'global' },
      { resource: 'settings', actions: ['read', 'update'], scope: 'global' },
    ],
  },
  {
    id: 'org_admin',
    name: 'org_admin',
    displayName: 'Administrador de Organización',
    level: 2,
    scope: {
      type: 'organization',
      description: 'Acceso completo a una organización específica, todos sus proyectos y contratos'
    },
    permissions: [
      { resource: 'organizations', actions: ['read', 'update'], scope: 'organization' },
      { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'organization' },
      { resource: 'contracts', actions: ['create', 'read', 'update', 'delete', 'manage'], scope: 'organization' },
      { resource: 'users', actions: ['create', 'read', 'update'], scope: 'organization' },
      { resource: 'reports', actions: ['create', 'read'], scope: 'organization' },
      { resource: 'settings', actions: ['read', 'update'], scope: 'organization' },
    ],
  },
  {
    id: 'manager',
    name: 'manager',
    displayName: 'Gerente',
    level: 3,
    scope: {
      type: 'project',
      description: 'Acceso a proyectos y contratos asignados'
    },
    permissions: [
      { resource: 'projects', actions: ['read', 'update'], scope: 'assigned' },
      { resource: 'contracts', actions: ['create', 'read', 'update'], scope: 'assigned' },
      { resource: 'users', actions: ['read'], scope: 'assigned' },
      { resource: 'reports', actions: ['read'], scope: 'assigned' },
    ],
  },
  {
    id: 'user',
    name: 'user',
    displayName: 'Usuario',
    level: 4,
    scope: {
      type: 'assigned',
      description: 'Acceso de solo lectura o edición a proyectos y contratos asignados específicamente'
    },
    permissions: [
      { resource: 'projects', actions: ['read'], scope: 'assigned' },
      { resource: 'contracts', actions: ['read'], scope: 'assigned' },
    ],
  },
];

// Funciones utilitarias para roles
export const getRoleById = (roleId: string): Role | undefined => {
  return ROLES.find(role => role.id === roleId);
};

export const getRoleDisplayName = (roleId: string): string => {
  const role = getRoleById(roleId);
  return role?.displayName || roleId;
};

export const hasPermission = (
  roleId: string, 
  resource: 'organizations' | 'projects' | 'contracts' | 'users' | 'reports' | 'settings', 
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
): boolean => {
  const role = getRoleById(roleId);
  if (!role) return false;
  
  const permission = role.permissions.find(p => p.resource === resource);
  return permission ? permission.actions.includes(action) : false;
};

// Nuevas funciones para el sistema de permisos jerárquico
export const canAccessOrganization = (
  userRole: string,
  userOrganizationId: string,
  targetOrganizationId: string
): boolean => {
  // Super admin puede acceder a todas las organizaciones
  if (userRole === 'super_admin') return true;
  
  // Otros roles solo pueden acceder a su propia organización
  return userOrganizationId === targetOrganizationId;
};

export const canAccessProject = (
  userRole: string,
  userOrganizationId: string,
  projectOrganizationId: string,
  userAssignments?: UserAssignment[],
  projectId?: string
): boolean => {
  // Super admin puede acceder a todos los proyectos
  if (userRole === 'super_admin') return true;
  
  // Debe estar en la misma organización
  if (userOrganizationId !== projectOrganizationId) return false;
  
  // Org admin puede acceder a todos los proyectos de su organización
  if (userRole === 'org_admin') return true;
  
  // Gerentes y usuarios necesitan asignación específica
  if (userRole === 'manager' || userRole === 'user') {
    if (!userAssignments || !projectId) return false;
    
    return userAssignments.some(assignment => 
      assignment.projectIds?.includes(projectId)
    );
  }
  
  return false;
};

export const canAccessContract = (
  userRole: string,
  userOrganizationId: string,
  contractOrganizationId: string,
  contractProjectId?: string,
  userAssignments?: UserAssignment[],
  contractId?: string
): boolean => {
  // Super admin puede acceder a todos los contratos
  if (userRole === 'super_admin') return true;
  
  // Debe estar en la misma organización
  if (userOrganizationId !== contractOrganizationId) return false;
  
  // Org admin puede acceder a todos los contratos de su organización
  if (userRole === 'org_admin') return true;
  
  // Gerentes y usuarios necesitan asignación específica
  if (userRole === 'manager' || userRole === 'user') {
    if (!userAssignments) return false;
    
    // Verificar si tiene acceso directo al contrato
    const hasDirectAccess = Boolean(contractId && userAssignments.some(assignment =>
      assignment.contractIds?.includes(contractId)
    ));
    
    // Verificar si tiene acceso al proyecto que contiene el contrato
    const hasProjectAccess = Boolean(contractProjectId && userAssignments.some(assignment =>
      assignment.projectIds?.includes(contractProjectId)
    ));
    
    return hasDirectAccess || hasProjectAccess;
  }
  
  return false;
};

export const canPerformAction = (
  userRole: string,
  resource: 'organizations' | 'projects' | 'contracts' | 'users' | 'reports' | 'settings',
  action: 'create' | 'read' | 'update' | 'delete' | 'manage',
  userOrganizationId: string,
  targetOrganizationId: string,
  userAssignments?: UserAssignment[],
  resourceId?: string
): boolean => {
  // Verificar si el rol tiene el permiso básico
  if (!hasPermission(userRole, resource, action)) return false;
  
  // Verificar el acceso contextual según el recurso
  switch (resource) {
    case 'organizations':
      return canAccessOrganization(userRole, userOrganizationId, targetOrganizationId);
    
    case 'projects':
      return canAccessProject(userRole, userOrganizationId, targetOrganizationId, userAssignments, resourceId);
    
    case 'contracts':
      // Para contratos, necesitamos información adicional sobre el proyecto
      return canAccessContract(userRole, userOrganizationId, targetOrganizationId, undefined, userAssignments, resourceId);
    
    default:
      return canAccessOrganization(userRole, userOrganizationId, targetOrganizationId);
  }
};

// Nueva función para verificar permisos específicos de usuario en contratos/proyectos
export const getUserSpecificPermissions = (
  userAssignments: UserAssignment[],
  resourceType: 'projects' | 'contracts',
  resourceId: string
): ('view' | 'edit')[] => {
  const assignment = userAssignments.find(assignment =>
    assignment.permissions.some(permission =>
      permission.resource === resourceType && permission.resourceId === resourceId
    )
  );
  
  if (!assignment) return [];
  
  const permission = assignment.permissions.find(permission =>
    permission.resource === resourceType && permission.resourceId === resourceId
  );
  
  return permission?.actions || [];
};

export const getRoleOptions = (): Array<{ value: string; label: string }> => {
  return ROLES.map(role => ({
    value: role.id,
    label: role.displayName
  }));
};