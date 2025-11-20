import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage, isAdmin } from '@/lib/auth';

interface UseRoleGuardOptions {
  requiredRole?: 'admin' | 'user' | 'super_admin';
  redirectTo?: string;
  allowRoles?: string[];
}

export function useRoleGuard(options: UseRoleGuardOptions = {}) {
  const {
    requiredRole = 'admin',
    redirectTo = '/auth/unauthorized',
    allowRoles = ['admin', 'super_admin']
  } = options;
  
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = () => {
      const userInfo = authStorage.getUserInfo();
      
      if (!userInfo) {
        console.log('[Role Guard] No user info found');
        setIsAuthorized(false);
        setIsLoading(false);
        router.push('/login');
        return;
      }

      const currentRole = userInfo.role || 'user';
      setUserRole(currentRole);

      // Check if user has required role
      const hasAccess = allowRoles.includes(currentRole) || currentRole === requiredRole;
      
      console.log('[Role Guard] Role check:', {
        currentRole,
        requiredRole,
        allowRoles,
        hasAccess
      });

      if (!hasAccess) {
        console.log('[Role Guard] Access denied - redirecting to:', redirectTo);
        setIsAuthorized(false);
        setIsLoading(false);
        router.push(redirectTo);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkRole();
  }, [router, requiredRole, redirectTo, allowRoles]);

  return {
    isAuthorized,
    isLoading,
    userRole,
    isAdmin: userRole === 'admin' || userRole === 'super_admin'
  };
}

export function useAdminGuard() {
  return useRoleGuard({
    requiredRole: 'admin',
    allowRoles: ['admin', 'super_admin']
  });
}

export function useAuthGuard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authStorage.isAuthenticated();
      
      if (!authenticated) {
        router.push('/login');
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  return {
    isAuthenticated,
    isLoading
  };
}