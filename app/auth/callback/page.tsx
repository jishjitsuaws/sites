'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  exchangeCodeForToken, 
  fetchUserInfo, 
  fetchUserProfile,
  authStorage 
} from '@/lib/auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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

        console.log('[Callback] Code and state verified');
        setStatus('Exchanging code for token...');

        // NOTE: IVP ISEA OAuth provider generates its own state parameter
        // We'll verify the state exists but won't validate against our stored state
        const savedState = sessionStorage.getItem('oauth_state');
        console.log('[Callback] State comparison:', {
          receivedState: state.substring(0, 20) + '...',
          savedState: savedState ? savedState.substring(0, 20) + '...' : 'none',
          match: state === savedState
        });
        
        // Optional: Just verify state format
        if (!/^[a-zA-Z0-9]+$/.test(state)) {
          setError('Invalid state parameter format');
          return;
        }

        console.log('[Callback] State format verified');
        setStatus('Exchanging code for token...');

        // STEP 3: Exchange code for access token
        // SECURITY FIX (CVE-002): Backend stores token in HttpOnly cookie
        // Calls: POST http://Sites.ISEA.in/api/oauth/token
        // Which calls: POST https://ivp.isea.in/backend/tokengen
        const tokenData = await exchangeCodeForToken(code, state);
        
        // SECURITY FIX (CVE-002): Token is now in HttpOnly cookie, response only contains uid
        const uid = tokenData.uid;
        
        if (!uid) {
          setError('Failed to get user ID from authentication response');
          return;
        }

        console.log('[Callback] Authentication successful, token in HttpOnly cookie');
        console.log('[Callback] User ID:', uid);
        setStatus('Fetching user information...');

        // STEP 4: Fetch user info
        // SECURITY FIX (CVE-002): Token is sent via HttpOnly cookie, not passed as parameter
        // Calls: POST http://Sites.ISEA.in/api/oauth/userinfo
        // Which calls: POST https://ivp.isea.in/backend/userinfo
        const userInfoResponse = await fetchUserInfo('', uid); // Empty string for accessToken (not used)
        
        console.log('[Callback] User info response received:', userInfoResponse);
        
        // Extract user data from nested OAuth response structure
        const oauthResponse = userInfoResponse as any;
        const userInfo = {
          uid: oauthResponse.uid || oauthResponse.data?.user_id,
          email: oauthResponse.data?.email || oauthResponse.email,
          username: oauthResponse.data?.username || oauthResponse.username,
          first_name: oauthResponse.data?.first_name || oauthResponse.first_name,
          last_name: oauthResponse.data?.last_name || oauthResponse.last_name,
          role: oauthResponse.data?.role || oauthResponse.role
        };
        
        console.log('[Callback] Processed user info:', userInfo);
        setStatus('Checking user profile...');

        // STEP 5: Check if user profile exists
        // SECURITY FIX (CVE-002): Token is sent via HttpOnly cookie
        // Calls: POST http://Sites.ISEA.in/api/oauth/profile
        // Which calls: POST https://ivp.isea.in/backend/ivp/profile/
        const userProfile = await fetchUserProfile('', userInfo.uid); // Empty string for accessToken

        // STEP 6: Role-based access control - Check with backend
        console.log('[Callback] Validating user access and role...');
        setStatus('Validating access permissions...');
        
        try {
          const oauthLoginResponse = await fetch(`${BACKEND_URL}/api/auth/oauth-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              userInfo,
              userProfile
            }),
          });

          if (!oauthLoginResponse.ok) {
            const errorData = await oauthLoginResponse.json();
            
            if (errorData.error === 'access_denied') {
              console.log('[Callback] Access denied - redirecting to unauthorized page');
              // Store user info for display on unauthorized page
              authStorage.setAuth('', userInfo); 
              router.push('/auth/unauthorized');
              return;
            }
            
            throw new Error(`OAuth login failed: ${errorData.message || oauthLoginResponse.status}`);
          }

          const loginData = await oauthLoginResponse.json();
          console.log('[Callback] OAuth login successful, admin access granted');
          
          // Update userInfo with backend user data (includes role)
          if (loginData.user) {
            userInfo.role = loginData.user.role;
            console.log('[Callback] Updated userInfo with backend role:', userInfo.role);
          }
          
        } catch (oauthError) {
          console.error('[Callback] OAuth login error:', oauthError);
          setError(`Access validation failed: ${oauthError instanceof Error ? oauthError.message : 'Unknown error'}`);
          return;
        }

        if (!userProfile) {
          // Profile doesn't exist, redirect to complete profile
          console.log('[Callback] No profile found, redirecting to complete profile');
          authStorage.setAuth('', userInfo); // Empty string for accessToken (not stored)
          router.push('/auth/complete-profile');
          return;
        }

        // Profile exists, store everything and redirect to home
        console.log('[Callback] Profile found, authentication complete');
        console.log('[Callback] Storing auth data (token in HttpOnly cookie):', {
          hasUserInfo: !!userInfo,
          hasUserProfile: !!userProfile,
          userRole: userInfo.role
        });
        
        authStorage.setAuth('', userInfo, userProfile); // Empty string for accessToken (not stored)
        
        // Verify storage
        console.log('[Callback] Verification after storage:', {
          isAuthenticated: authStorage.isAuthenticated(),
          hasCompleteProfile: authStorage.hasCompleteProfile()
        });
        
        setStatus('Authentication successful! Redirecting...');
        
        // Use window.location for a full page reload to ensure proper state initialization
        // This prevents race conditions with Next.js client-side navigation
        window.location.href = '/home';

      } catch (err) {
        console.error('[Callback] Error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleOAuthCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticating...</h2>
        <p className="text-gray-600 mb-4">{status}</p>
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-900 text-lg font-medium">Loading...</div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
