'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';

export default function UnauthorizedPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const info = authStorage.getUserInfo();
    setUserInfo(info);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authStorage.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout by clearing storage and redirecting
      authStorage.clearAuth();
      window.location.href = '/login';
    }
  };

  const handleReturnHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-red-900/20 to-purple-900/20 flex items-center justify-center p-6">
      <div className="bg-red-900/20 backdrop-blur-lg rounded-2xl p-8 border border-red-500/30 max-w-md w-full text-center">
        {/* Warning Icon */}
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
        
        {/* Message */}
        <p className="text-red-300 mb-6 leading-relaxed">
          You do not have permission to access this application. Only administrators are allowed to use this platform.
        </p>

        {/* User Info */}
        {userInfo && (
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Account Information:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{userInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role:</span>
                <span className="text-yellow-400 font-medium">{userInfo.role || 'user'}</span>
              </div>
              {userInfo.uid && (
                <div className="flex justify-between">
                  <span className="text-gray-400">ID:</span>
                  <span className="text-gray-300 font-mono text-xs">{userInfo.uid.substring(0, 8)}...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg transition-colors font-medium"
          >
            {isLoggingOut ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Logging out...</span>
              </div>
            ) : (
              'Logout'
            )}
          </button>
          
          <button
            onClick={handleReturnHome}
            className="w-full px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-red-500/20">
          <p className="text-xs text-gray-400">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}