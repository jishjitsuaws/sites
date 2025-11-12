// OAuth Configuration
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'owl';
const OAUTH_LOGIN_URL = process.env.NEXT_PUBLIC_OAUTH_LOGIN_URL || 'https://ivp.isea.in/backend/loginRedirect';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sites.isea.in';

export interface UserInfo {
  uid: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  mobileno?: string;
  role?: string;
}

export interface UserProfile {
  uid: string;
  first_name: string;
  last_name: string;
  email: string;
  mobileno: string;
  mode: string;
}

export interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  uid?: string;
  data?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
    token_type?: string;
    session_state?: string;
    scope?: string;
    uid?: string;
  };
  requested_client?: any;
  params?: any;
  media_token?: string;
}

// Generate secure random state for CSRF protection
export function generateSecureState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Generate secure random nonce for replay attack prevention
export function generateSecureNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// STEP 1: Redirect to OAuth login page
export function redirectToLogin() {
  const state = generateSecureState();
  const nonce = generateSecureNonce();
  
  // Store state, nonce, and timestamp in sessionStorage for CSRF verification
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_nonce', nonce);
    sessionStorage.setItem('oauth_timestamp', Date.now().toString());
    
    // Backup in localStorage
    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_nonce', nonce);
    localStorage.setItem('oauth_timestamp', Date.now().toString());
    
    console.log('[Auth] Generated and stored state:', state.substring(0, 20) + '...');
    console.log('[Auth] Generated and stored nonce:', nonce.substring(0, 20) + '...');
    console.log('[Auth] OAuth timestamp:', Date.now());
  }
  
  // Construct OAuth login URL with state and nonce parameters
  // NOTE: IVP ISEA OAuth provider may generate its own state
  // We include ours for CSRF protection
  const loginUrl = `${OAUTH_LOGIN_URL}?client_id=${CLIENT_ID}&state=${state}&nonce=${nonce}`;
  
  console.log('[Auth] Redirecting to OAuth login with state and nonce parameters');
  window.location.href = loginUrl;
}

// STEP 2: Validate OAuth callback state (CSRF protection)
export function validateOAuthCallback(returnedState: string): { valid: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { valid: false, error: 'Window not available' };
  }

  // Get stored state from sessionStorage or fallback to localStorage
  const storedState = sessionStorage.getItem('oauth_state') || localStorage.getItem('oauth_state');
  const storedNonce = sessionStorage.getItem('oauth_nonce') || localStorage.getItem('oauth_nonce');
  const storedTimestamp = sessionStorage.getItem('oauth_timestamp') || localStorage.getItem('oauth_timestamp');

  // Validate returned state exists
  if (!returnedState) {
    return { valid: false, error: 'Missing state parameter in OAuth callback' };
  }

  // Validate state format (should be hex string)
  if (!/^[a-f0-9]{64}$/.test(returnedState)) {
    return { valid: false, error: 'Invalid state parameter format - possible CSRF attack' };
  }

  // Validate stored state exists
  if (!storedState) {
    return { valid: false, error: 'No stored state found - OAuth flow may have been tampered with' };
  }

  // Validate state matches
  if (returnedState !== storedState) {
    console.error('[Auth] State mismatch:', {
      returned: returnedState.substring(0, 20) + '...',
      stored: storedState.substring(0, 20) + '...'
    });
    return { valid: false, error: 'State parameter mismatch - possible CSRF attack' };
  }

  // Validate nonce exists (additional protection)
  if (!storedNonce) {
    return { valid: false, error: 'No stored nonce found - OAuth flow may have been tampered with' };
  }

  // Validate timestamp to prevent replay attacks
  if (storedTimestamp) {
    const timestamp = parseInt(storedTimestamp);
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    if (now - timestamp > maxAge) {
      return { valid: false, error: 'OAuth flow expired - please try again' };
    }
  }

  console.log('[Auth] OAuth callback validation successful');
  return { valid: true };
}

// STEP 2.5: Clear OAuth state after successful validation (prevent reuse)
export function clearOAuthState(): void {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_nonce');
  sessionStorage.removeItem('oauth_timestamp');
  localStorage.removeItem('oauth_state');
  localStorage.removeItem('oauth_nonce');
  localStorage.removeItem('oauth_timestamp');
  
  console.log('[Auth] OAuth state cleared after successful validation');
}

// STEP 3: Exchange authorization code for access token
export async function exchangeCodeForToken(
  code: string,
  state: string
): Promise<TokenResponse> {
  try {
    console.log('[Auth] Exchanging code for token...');
    
    // Call backend proxy which calls:
    // POST https://ivp.isea.in/backend/tokengen
    const response = await fetch(`${BACKEND_URL}/api/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
        client_id: CLIENT_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Auth] Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Auth] Token received successfully');
    return data;
  } catch (error) {
    console.error('[Auth] Error exchanging code for token:', error);
    throw error;
  }
}

// STEP 4: Fetch user info using access token
export async function fetchUserInfo(accessToken: string, uid: string): Promise<UserInfo> {
  try {
    console.log('[Auth] Fetching user info...');
    
    // Call backend proxy which calls:
    // POST https://ivp.isea.in/backend/userinfo
    const response = await fetch(`${BACKEND_URL}/api/oauth/userinfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        uid,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Auth] User info fetch failed:', errorText);
      throw new Error(`User info fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Auth] User info received successfully');
    return data;
  } catch (error) {
    console.error('[Auth] Error fetching user info:', error);
    throw error;
  }
}

// STEP 5: Fetch user profile
export async function fetchUserProfile(accessToken: string, uid: string): Promise<UserProfile | null> {
  try {
    console.log('[Auth] Fetching user profile...');
    
    // Call backend proxy which calls:
    // POST https://ivp.isea.in/backend/ivp/profile/
    const response = await fetch(`${BACKEND_URL}/api/oauth/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        uid,
      }),
    });

    if (response.status === 404) {
      console.log('[Auth] User profile not found (needs to be created)');
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Auth] User profile fetch failed:', errorText);
      throw new Error(`User profile fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Auth] User profile received successfully');
    return data;
  } catch (error) {
    console.error('[Auth] Error fetching user profile:', error);
    throw error;
  }
}

// STEP 6: Update user profile
export async function updateUserProfile(profileData: UserProfile): Promise<void> {
  try {
    console.log('[Auth] Updating user profile...');
    
    // Call backend proxy which calls:
    // POST https://ivp.isea.in/backend/updateuserbyid
    const response = await fetch(`${BACKEND_URL}/api/oauth/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Auth] Profile update failed:', errorText);
      throw new Error(`Profile update failed: ${response.status}`);
    }

    console.log('[Auth] Profile updated successfully');
  } catch (error) {
    console.error('[Auth] Error updating profile:', error);
    throw error;
  }
}

/**
 * LOGOUT: Call OAuth provider logout endpoint and clear session
 * Calls: POST https://ivp.isea.in/backend/logout
 */
export async function logout(): Promise<void> {
  try {
    const userInfo = authStorage.getUserInfo();
    const accessToken = authStorage.getAccessToken();
    
    // Try to get user_id from multiple sources
    let userId = (userInfo as any)?.uid || (userInfo as any)?.sub;
    
    // If not in userInfo, decode from access token
    if (!userId && accessToken) {
      try {
        const parts = accessToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          userId = payload.sub || payload.uid || payload.user_id;
          console.log('[Auth] Extracted user_id from token for logout:', userId);
        }
      } catch (decodeError) {
        console.error('[Auth] Failed to decode token for logout:', decodeError);
      }
    }
    
    if (!userId) {
      console.warn('[Auth] No user ID found, clearing local session only');
      authStorage.clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return;
    }

    console.log('[Auth] Logging out user:', userId);

    // Call backend which calls OAuth provider logout
    // POST http://sites.isea.in/api/oauth/logout
    // Which calls: POST https://ivp.isea.in/backend/logout
    const response = await fetch(`${BACKEND_URL}/api/oauth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    });

    if (!response.ok) {
      console.error('[Auth] Logout API call failed:', response.status);
      const errorData = await response.json().catch(() => ({}));
      console.error('[Auth] Logout error details:', errorData);
      // Continue with local logout even if API call fails
    } else {
      const data = await response.json();
      console.log('[Auth] Logout successful:', data.message);
    }

  } catch (error) {
    console.error('[Auth] Logout error:', error);
    // Continue with local logout even if error occurs
  } finally {
    // Always clear local session
    authStorage.clearAuth();
    
    // Redirect to login page (not home page)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

// Auth storage utilities
export const authStorage = {
  setAuth: (accessToken: string, userInfo: UserInfo, userProfile?: UserProfile) => {
    if (typeof window === 'undefined') return;
    
    console.log('[Auth Storage] Setting auth data:', {
      hasToken: !!accessToken,
      hasUserInfo: !!userInfo,
      hasUserProfile: !!userProfile,
      userInfo: userInfo,
      userProfile: userProfile
    });
    
    // Store in BOTH sessionStorage AND localStorage for reliability
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('user_info', JSON.stringify(userInfo));
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    
    if (userProfile) {
      sessionStorage.setItem('user_profile', JSON.stringify(userProfile));
      localStorage.setItem('user_profile', JSON.stringify(userProfile));
    }
    
    const timestamp = Date.now().toString();
    sessionStorage.setItem('auth_timestamp', timestamp);
    localStorage.setItem('auth_timestamp', timestamp);
    
    // Verify it was stored
    const storedToken = sessionStorage.getItem('access_token');
    const storedUserInfo = sessionStorage.getItem('user_info');
    const storedUserProfile = sessionStorage.getItem('user_profile');
    
    console.log('[Auth Storage] Verification after storage:', {
      tokenStored: !!storedToken,
      userInfoStored: !!storedUserInfo,
      userProfileStored: !!storedUserProfile,
      tokenMatches: storedToken === accessToken
    });
    
    console.log('[Auth Storage] Authentication data stored successfully');
  },

  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
  },

  getUserInfo: (): UserInfo | null => {
    if (typeof window === 'undefined') return null;
    const userInfoStr = sessionStorage.getItem('user_info') || localStorage.getItem('user_info');
    if (!userInfoStr) return null;
    try {
      return JSON.parse(userInfoStr);
    } catch {
      return null;
    }
  },

  getUserProfile: (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    const userProfileStr = sessionStorage.getItem('user_profile') || localStorage.getItem('user_profile');
    if (!userProfileStr) return null;
    try {
      return JSON.parse(userProfileStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    const hasSession = !!(sessionStorage.getItem('access_token') && sessionStorage.getItem('user_info'));
    const hasLocal = !!(localStorage.getItem('access_token') && localStorage.getItem('user_info'));
    return hasSession || hasLocal;
  },

  hasCompleteProfile: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(sessionStorage.getItem('user_profile') || localStorage.getItem('user_profile'));
  },

  clearAuth: () => {
    if (typeof window === 'undefined') return;
    // Clear both storages
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user_info');
    sessionStorage.removeItem('user_profile');
    sessionStorage.removeItem('auth_timestamp');
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_nonce');
    sessionStorage.removeItem('oauth_timestamp');
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('auth_timestamp');
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_nonce');
    localStorage.removeItem('oauth_timestamp');
    
    console.log('[Auth] Authentication data cleared');
  },

  logout: async () => {
    await logout();
  },
};

// Check if user has admin role
export function isAdmin(userInfo: UserInfo | null): boolean {
  if (!userInfo) return false;
  return userInfo.role === 'admin' || userInfo.role === 'super_admin';
}

// Get user display name
export function getUserDisplayName(userInfo: UserInfo | null, userProfile: UserProfile | null): string {
  // Check userProfile first (if available)
  if (userProfile?.first_name && userProfile?.last_name) {
    return `${userProfile.first_name} ${userProfile.last_name}`;
  }
  
  // Check userInfo for name fields
  if (userInfo?.first_name && userInfo?.last_name) {
    return `${userInfo.first_name} ${userInfo.last_name}`;
  }
  
  // OAuth token fields: Try 'name' field from JWT (Keycloak standard)
  const userInfoAny = userInfo as any;
  if (userInfoAny?.name) {
    return userInfoAny.name;
  }
  
  // Try given_name + family_name (Keycloak fields)
  if (userInfoAny?.given_name && userInfoAny?.family_name) {
    return `${userInfoAny.given_name} ${userInfoAny.family_name}`;
  }
  
  // Try preferred_username (Keycloak field)
  if (userInfoAny?.preferred_username) {
    return userInfoAny.preferred_username;
  }
  
  // Try username field
  if (userInfo?.username) {
    return userInfo.username;
  }
  
  // Fallback to email username
  if (userInfo?.email) {
    return userInfo.email.split('@')[0];
  }
  
  // Last resort
  return 'User';
}
