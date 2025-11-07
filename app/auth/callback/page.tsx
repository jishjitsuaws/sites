'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  exchangeCodeForToken, 
  fetchUserInfo, 
  fetchUserProfile,
  authStorage,
  UserInfo,
  UserProfile
} from '@/lib/oauth';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setOAuthData } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Get code and state from URL parameters
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        throw new Error('Missing authorization code or state parameter');
      }

      console.log('[OAuth Callback] Received code and state');

      // Verify state (CSRF protection)
      const storedState = sessionStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      setMessage('Exchanging authorization code for access token...');

      // STEP 3: Exchange code for access token
      const tokenResponse = await exchangeCodeForToken(code, state);
      const { access_token } = tokenResponse;

      if (!access_token) {
        throw new Error('No access token received');
      }

      console.log('[OAuth Callback] Access token received');

      // Decode the access token to get uid (JWT payload)
      // The token format is typically: header.payload.signature
      const tokenParts = access_token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const uid = payload.uid || payload.id || payload.sub;

      if (!uid) {
        throw new Error('No UID found in access token');
      }

      console.log('[OAuth Callback] UID extracted from token:', uid);

      setMessage('Fetching user information...');

      // STEP 4: Fetch user info
      const userInfo: UserInfo = await fetchUserInfo(access_token, uid);
      console.log('[OAuth Callback] User info received:', userInfo);

      setMessage('Checking user profile...');

      // STEP 5: Fetch user profile
      const userProfile: UserProfile | null = await fetchUserProfile(access_token, uid);

      if (!userProfile) {
        console.log('[OAuth Callback] Profile incomplete, redirecting to complete profile page');
        
        // Store auth data temporarily
        authStorage.setAuth(access_token, userInfo);
        
        // Redirect to complete profile page
        toast.info('Please complete your profile');
        router.push('/auth/complete-profile');
        return;
      }

      console.log('[OAuth Callback] User profile complete:', userProfile);

      // STEP 7: Sync user with backend database
      setMessage('Syncing user with backend...');
      
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://sites.isea.in';
        const syncResponse = await fetch(`${BACKEND_URL}/api/oauth/sync-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: userInfo.uid,
            email: userInfo.email,
            first_name: userProfile.first_name,
            last_name: userProfile.last_name,
            username: userInfo.username,
            role: userInfo.role,
            mobileno: userProfile.mobileno,
            access_token: access_token,
            oauth_provider: 'ivp'
          }),
        });

        if (!syncResponse.ok) {
          console.warn('[OAuth Callback] User sync failed, continuing anyway');
        } else {
          console.log('[OAuth Callback] User synced with backend successfully');
        }
      } catch (syncError) {
        console.warn('[OAuth Callback] User sync error, continuing anyway:', syncError);
      }

      // Store authentication data
      authStorage.setAuth(access_token, userInfo, userProfile);
      setOAuthData(access_token, userInfo, userProfile);

      setStatus('success');
      setMessage('Login successful! Redirecting...');
      toast.success('Welcome back!');

      // Redirect to home page
      setTimeout(() => {
        router.push('/home');
      }, 1000);

    } catch (error: any) {
      console.error('[OAuth Callback] Error:', error);
      setStatus('error');
      setMessage(error.message || 'Authentication failed');
      toast.error(error.message || 'Authentication failed');

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Authenticating
            </h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Success!
            </h1>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
