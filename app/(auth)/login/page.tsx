'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { redirectToLogin } from '@/lib/oauth';
import Button from '@/components/ui/Button';
import { Globe } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthLogin = () => {
    setIsLoading(true);
    // Redirect to OAuth provider
    redirectToLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Globe className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to SiteBuilder</h1>
          <p className="text-gray-600">Sign in with your IVP ISEA account</p>
        </div>

        <div className="mt-8 space-y-6">
          <Button
            onClick={handleOAuthLogin}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Redirecting...' : 'Sign in with IVP ISEA OAuth'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Secure OAuth 2.0 Authentication</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
