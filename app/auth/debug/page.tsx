'use client';

import { useState, useEffect } from 'react';
import { authStorage } from '@/lib/auth';
import Button from '@/components/ui/Button';

export default function AuthDebugPage() {
  const [authState, setAuthState] = useState<any>(null);

  const checkAuth = () => {
    const state = {
      isAuthenticated: authStorage.isAuthenticated(),
      hasCompleteProfile: authStorage.hasCompleteProfile(),
      accessToken: authStorage.getAccessToken(),
      userInfo: authStorage.getUserInfo(),
      userProfile: authStorage.getUserProfile(),
      sessionStorageKeys: typeof window !== 'undefined' ? {
        access_token: sessionStorage.getItem('access_token')?.substring(0, 20) + '...',
        user_info: sessionStorage.getItem('user_info'),
        user_profile: sessionStorage.getItem('user_profile'),
      } : null,
    };
    setAuthState(state);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">OAuth Authentication Debug</h1>
          
          <div className="space-y-4">
            <Button onClick={checkAuth}>Refresh Auth State</Button>
            
            <div className="bg-gray-100 p-4 rounded">
              <h2 className="font-semibold mb-2">Authentication State:</h2>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(authState, null, 2)}
              </pre>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
              <Button onClick={() => window.location.href = '/home'}>
                Go to Home
              </Button>
              <Button onClick={() => authStorage.clearAuth()} variant="outline">
                Clear Auth
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
