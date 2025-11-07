'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

// Force dynamic rendering for dashboard
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[Dashboard Layout] Checking authentication, isAuthenticated:', isAuthenticated);
    
    // Give a moment for initialization to complete
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        console.log('[Dashboard Layout] Not authenticated, redirecting to login');
        router.push('/login');
      } else {
        console.log('[Dashboard Layout] Authenticated, showing dashboard');
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
