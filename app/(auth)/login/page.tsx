'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { redirectToLogin, authStorage } from '@/lib/auth';
import Button from '@/components/ui/Button';
import { Globe, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    // Don't redirect if we're coming from an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const isOAuthCallback = urlParams.has('code') || urlParams.has('state');
    
    if (isOAuthCallback) {
      console.log('[Login] OAuth callback detected, skipping redirect check');
      return;
    }
    
    if (authStorage.isAuthenticated()) {
      console.log('[Login] User already authenticated, redirecting to home');
      router.push('/home');
    }
  }, [router]);

  const handleLogin = () => {
    // STEP 1: Redirect to OAuth login page
    // Calls: https://ivp.isea.in/backend/loginRedirect?client_id=owl
    redirectToLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Globe className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Sites.ISEA</h1>
          <p className="text-gray-600">Sign in to continue building amazing websites</p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Lock className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Secure Authentication</p>
                <p>Sign in using IVP ISEA OAuth for secure and seamless access to your account.</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
          >
            Sign In with IVP ISEA OAuth
          </Button>

          <p className="text-center text-sm text-gray-600">
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              ← Back to home
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
