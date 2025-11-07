'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
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

  // Initialize auth state from OAuth storage on app load
  useEffect(() => {
    initializeFromOAuth();
  }, [initializeFromOAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
