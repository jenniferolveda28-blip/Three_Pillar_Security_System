import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";

export const usePermissions = () => {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => base44.auth.me(),
  });

  const role = currentUser?.custom_role || 'viewer';
  const isAdmin = currentUser?.role === 'admin' || role === 'admin';
  const isEditor = isAdmin || role === 'editor';
  const isViewer = true; // Everyone can view

  return {
    currentUser,
    role,
    isAdmin,
    isEditor,
    isViewer,
    canCreate: isEditor,
    canUpdate: isEditor,
    canDelete: isEditor,
    canManageUsers: isAdmin,
  };
};

export const PermissionGuard = ({ children, require, fallback = null }) => {
  const permissions = usePermissions();
  
  const hasPermission = () => {
    if (require === 'admin') return permissions.isAdmin;
    if (require === 'editor') return permissions.isEditor;
    if (require === 'create') return permissions.canCreate;
    if (require === 'update') return permissions.canUpdate;
    if (require === 'delete') return permissions.canDelete;
    return true;
  };

  if (!hasPermission()) {
    return fallback;
  }

  return children;
};