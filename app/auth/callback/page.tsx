'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  exchangeCodeForToken, 
  fetchUserInfo, 
  fetchUserProfile,
  authStorage 
} from '@/lib/auth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Verifying...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // STEP 2: Extract code and state from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code || !state) {
          setError('Missing authorization code or state');
          return;
        }

        // Verify state (CSRF protection)
        const savedState = sessionStorage.getItem('oauth_state');
        if (state !== savedState) {
          setError('Invalid state parameter. Possible CSRF attack.');
          return;
        }

        console.log('[Callback] Code and state verified');
        setStatus('Exchanging code for token...');

        // STEP 3: Exchange code for access token
        // Calls: POST http://sites.isea.in/api/oauth/token
        // Which calls: POST https://ivp.isea.in/backend/tokengen
        const tokenData = await exchangeCodeForToken(code, state);
        const accessToken = tokenData.access_token;

        console.log('[Callback] Access token received');
        setStatus('Fetching user information...');

        // Extract uid from token response or decode JWT
        // The IVP ISEA OAuth provider should return uid in the token or we need to decode it
        let uid = tokenData.uid;
        
        if (!uid) {
          // Try to decode the JWT token to get uid
          try {
            const base64Url = accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            uid = payload.uid || payload.sub || payload.user_id || payload.id;
            
            console.log('[Callback] Extracted uid from token:', uid);
          } catch (decodeError) {
            console.error('[Callback] Failed to decode token:', decodeError);
          }
        }
        
        if (!uid) {
          setError('Unable to extract user ID from authentication response. Please try again or contact support.');
          return;
        }

        // STEP 4: Fetch user info
        // Calls: POST http://sites.isea.in/api/oauth/userinfo
        // Which calls: POST https://ivp.isea.in/backend/userinfo
        const userInfo = await fetchUserInfo(accessToken, uid);
        
        console.log('[Callback] User info received:', userInfo);
        setStatus('Checking user profile...');

        // STEP 5: Check if user profile exists
        // Calls: POST http://sites.isea.in/api/oauth/profile
        // Which calls: POST https://ivp.isea.in/backend/ivp/profile/
        const userProfile = await fetchUserProfile(accessToken, userInfo.uid);

        if (!userProfile) {
          // Profile doesn't exist, redirect to complete profile
          console.log('[Callback] No profile found, redirecting to complete profile');
          authStorage.setAuth(accessToken, userInfo);
          router.push('/auth/complete-profile');
          return;
        }

        // Profile exists, store everything and redirect to home
        console.log('[Callback] Profile found, authentication complete');
        console.log('[Callback] Storing auth data:', {
          hasAccessToken: !!accessToken,
          hasUserInfo: !!userInfo,
          hasUserProfile: !!userProfile
        });
        
        authStorage.setAuth(accessToken, userInfo, userProfile);
        
        // Verify storage
        console.log('[Callback] Verification after storage:', {
          isAuthenticated: authStorage.isAuthenticated(),
          hasCompleteProfile: authStorage.hasCompleteProfile()
        });
        
        setStatus('Authentication successful! Redirecting...');
        
        // Redirect immediately
        router.push('/home');

      } catch (err) {
        console.error('[Callback] Error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleOAuthCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center p-6">
        <div className="bg-red-900/20 backdrop-blur-lg rounded-2xl p-8 border border-red-500/30 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center p-6">
      <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-600/30 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Authenticating...</h2>
        <p className="text-gray-400 mb-4">{status}</p>
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900/20 to-purple-900/20 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
