'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure sessionStorage is populated
    const checkAuth = () => {
      console.log('[Dashboard Layout] Checking authentication...');
      
      // Check if user is authenticated with OAuth
      const isAuthenticated = authStorage.isAuthenticated();
      const userInfo = authStorage.getUserInfo();
      const userProfile = authStorage.getUserProfile();
      
      console.log('[Dashboard Layout] Auth status:', {
        isAuthenticated,
        hasUserInfo: !!userInfo,
        hasUserProfile: !!userProfile,
        sessionStorage: {
          access_token: !!sessionStorage.getItem('access_token'),
          user_info: !!sessionStorage.getItem('user_info'),
          user_profile: !!sessionStorage.getItem('user_profile'),
        }
      });
      
      if (!isAuthenticated) {
        // Not authenticated, redirect to login
        console.log('[Dashboard Layout] User not authenticated, redirecting to login');
        router.push('/login');
        return;
      }
      
      // Check if user has completed their profile
      const hasProfile = authStorage.hasCompleteProfile();
      if (!hasProfile) {
        console.log('[Dashboard Layout] User profile incomplete, redirecting to complete profile');
        router.push('/auth/complete-profile');
        return;
      }
      
      // All checks passed
      console.log('[Dashboard Layout] Authentication verified, rendering dashboard');
      setIsReady(true);
      setLoading(false);
    };

    // Check immediately
    checkAuth();
    
    // Also check after a short delay to handle race conditions
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  if (loading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
