// Sistema de roles y permisos

export interface Role {
  id: string;
  name: string;
  displayName: string;
  permissions: Permission[];
  level: number; // Para jerarquía de roles (menor número = mayor jerarquía)
}

export interface Permission {
  resource: string;
  actions: string[];
}

export const ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'super_admin',
    displayName: 'Super Administrador',
    level: 1,
    permissions: [
      { resource: 'contracts', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'organizations', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'reports', actions: ['create', 'read'] },
      { resource: 'settings', actions: ['read', 'update'] },
    ],
  },
  {
    id: 'org_admin',
    name: 'org_admin',
    displayName: 'Administrador de Organización',
    level: 2,
    permissions: [
      { resource: 'contracts', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'users', actions: ['create', 'read', 'update'] },
      { resource: 'reports', actions: ['create', 'read'] },
      { resource: 'settings', actions: ['read', 'update'] },
    ],
  },
  {
    id: 'manager',
    name: 'manager',
    displayName: 'Gerente',
    level: 3,
    permissions: [
      { resource: 'contracts', actions: ['create', 'read', 'update'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'reports', actions: ['read'] },
    ],
  },
  {
    id: 'user',
    name: 'user',
    displayName: 'Usuario',
    level: 4,
    permissions: [
      { resource: 'contracts', actions: ['read'] },
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

export const hasPermission = (roleId: string, resource: string, action: string): boolean => {
  const role = getRoleById(roleId);
  if (!role) return false;
  
  const permission = role.permissions.find(p => p.resource === resource);
  return permission ? permission.actions.includes(action) : false;
};

export const canAccessContract = (
  userRole: string,
  userOrganization: string,
  contractOrganization: string,
  userDepartment?: string,
  contractDepartment?: string
): boolean => {
  // Super admin puede ver todos los contratos
  if (userRole === 'super_admin') return true;
  
  // Los usuarios solo pueden ver contratos de su organización
  if (userOrganization !== contractOrganization) return false;
  
  // Org admin puede ver todos los contratos de su organización
  if (userRole === 'org_admin') return true;
  
  // Manager puede ver contratos de su departamento y departamentos subordinados
  if (userRole === 'manager') {
    return userDepartment === contractDepartment;
  }
  
  // Usuario regular solo puede ver contratos de su departamento
  if (userRole === 'user') {
    return userDepartment === contractDepartment;
  }
  
  return false;
};

export const getRoleOptions = (): Array<{ value: string; label: string }> => {
  return ROLES.map(role => ({
    value: role.id,
    label: role.displayName
  }));
};