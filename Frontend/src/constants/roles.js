export const ADMIN_ROLES = ['Admin', 'Főadmin'];

export function isAdminRole(role) {
  if (!role) return false;
  return ADMIN_ROLES.includes(role.trim());
}