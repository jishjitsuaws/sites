'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function UnauthorizedPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isReturningHome, setIsReturningHome] = useState(false);

  useEffect(() => {
    const info = authStorage.getUserInfo();
    setUserInfo(info);
  }, []);

  const handleReturnHome = async () => {
    setIsReturningHome(true);
    try {
      console.log('[Unauthorized] Starting logout process for return home...');
      
      // Get user info for logout API call
      const userInfo = authStorage.getUserInfo();
      
      if (userInfo?.uid) {
        console.log('[Unauthorized] Calling OAuth logout API...');
        // Call OAuth logout API directly
        const response = await fetch(`${BACKEND_URL}/api/oauth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            user_id: userInfo.uid,
          }),
        });
        
        if (response.ok) {
          console.log('[Unauthorized] OAuth logout successful');
        } else {
          console.warn('[Unauthorized] OAuth logout failed, continuing with local clear');
        }
      }
      
      // Always clear local storage
      authStorage.clearAuth();
      console.log('[Unauthorized] Auth storage cleared');
      
    } catch (error) {
      console.error('[Unauthorized] Logout error on return home:', error);
      // Force logout by clearing storage
      authStorage.clearAuth();
    } finally {
      // Always redirect to home page after logout
      console.log('[Unauthorized] Redirecting to home page...');
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-red-200 max-w-md w-full text-center">
        {/* Warning Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Access Denied</h1>
        
        {/* Message */}
        <p className="text-red-600 mb-4 leading-relaxed">
          You do not have permission to access this application. Only administrators are allowed to use this platform.
        </p>
        
        <p className="text-slate-600 mb-6 text-sm">
          If you have an administrator account, please logout and sign in with your admin credentials.
        </p>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleReturnHome}
            disabled={isReturningHome}
            className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg transition-colors font-medium"
          >
            {isReturningHome ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Logging out...</span>
              </div>
            ) : (
              'Logout & Return to Home'
            )}
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-red-200">
          <p className="text-xs text-slate-500">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}