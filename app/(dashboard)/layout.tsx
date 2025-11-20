'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authStorage } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure localStorage/sessionStorage is fully accessible
    const checkAuth = () => {
      // Check if this is an OAuth callback (has code and state in URL)
      const urlParams = new URLSearchParams(window.location.search);
      const hasOAuthParams = urlParams.has('code') && urlParams.has('state');
      
      if (hasOAuthParams && pathname === '/home') {
        console.log('[Dashboard Layout] OAuth callback detected on /home, allowing through...');
        setIsReady(true);
        setLoading(false);
        return;
      }
      
      console.log('[Dashboard Layout] Checking authentication...', {
        pathname,
        hasOAuthParams,
        timestamp: new Date().toISOString()
      });
      
      // Check if user is authenticated with OAuth
      const isAuthenticated = authStorage.isAuthenticated();
      const userInfo = authStorage.getUserInfo();
      const userProfile = authStorage.getUserProfile();
      const accessToken = authStorage.getAccessToken();
      
      console.log('[Dashboard Layout] Auth status:', {
        isAuthenticated,
        hasUserInfo: !!userInfo,
        hasUserProfile: !!userProfile,
        hasAccessToken: !!accessToken,
        accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : null,
        localStorage: typeof window !== 'undefined' ? {
          access_token: !!localStorage.getItem('access_token'),
          user_info: !!localStorage.getItem('user_info'),
          user_profile: !!localStorage.getItem('user_profile'),
        } : null,
        sessionStorage: typeof window !== 'undefined' ? {
          access_token: !!sessionStorage.getItem('access_token'),
          user_info: !!sessionStorage.getItem('user_info'),
          user_profile: !!sessionStorage.getItem('user_profile'),
        } : null
      });
      
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        console.log('[Dashboard Layout] User not authenticated, redirecting to login');
        window.location.href = '/login';
        return;
      }
      
      // Check user role for admin access
      const userRole = userInfo?.role || 'user'; // Default to 'user' if role is missing
      
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        console.log('[Dashboard Layout] User role not authorized:', userRole);
        router.push('/auth/unauthorized');
        return;
      }
      
      // OAuth userinfo contains all necessary user data
      // No need for separate profile completion step
      console.log('[Dashboard Layout] Authentication and authorization verified, rendering dashboard');
      console.log('[Dashboard Layout] User role:', userRole);
      setIsReady(true);
      setLoading(false);
    };

    // Run check after a small delay to ensure storage is ready
    const timer = setTimeout(checkAuth, 50);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  if (loading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
