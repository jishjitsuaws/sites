'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  const initializeFromOAuth = useAuthStore((state) => state.initializeFromOAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize auth state from storage
  useEffect(() => {
    initializeFromOAuth();
  }, [initializeFromOAuth]);

  // If code & state appear (landing from OAuth provider) redirect to callback handler
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (code && state) {
      // Avoid staying on /login with stale code parameters
      if (window.location.pathname !== '/auth/callback') {
        router.replace(`/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
      }
    }
  }, [searchParams, router]);

  // Prefetch home when authenticated (explains network requests) & avoid confusion
  useEffect(() => {
    if (isAuthenticated) {
      router.prefetch('/home');
    }
  }, [isAuthenticated, router]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
