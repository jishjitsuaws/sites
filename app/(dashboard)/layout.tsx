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

  useEffect(() => {
    // Check if user is authenticated with OAuth
    const isAuthenticated = authStorage.isAuthenticated();
    
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      console.log('[Dashboard] User not authenticated, redirecting to login');
      router.push('/login');
    } else {
      // Check if user has completed their profile
      const hasProfile = authStorage.hasCompleteProfile();
      if (!hasProfile) {
        console.log('[Dashboard] User profile incomplete, redirecting to complete profile');
        router.push('/auth/complete-profile');
      } else {
        setLoading(false);
      }
    }
  }, [router]);

  if (loading) {
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
