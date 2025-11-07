// OAuth Configuration
const CLIENT_ID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID || 'owl';
const OAUTH_LOGIN_URL = process.env.NEXT_PUBLIC_OAUTH_LOGIN_URL || 'https://ivp.isea.in/backend/loginRedirect';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://sites.isea.in';

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
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

// Generate secure random state for CSRF protection
export function generateSecureState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// STEP 1: Redirect to OAuth login page
export function redirectToLogin() {
  const state = generateSecureState();
  
  // Store state in sessionStorage for CSRF verification
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_state_timestamp', Date.now().toString());
  }
  
  // Construct OAuth login URL
  // EXACT ENDPOINT: https://ivp.isea.in/backend/loginRedirect?client_id=owl
  const loginUrl = `${OAUTH_LOGIN_URL}?client_id=${CLIENT_ID}`;
  
  console.log('[OAuth] Redirecting to OAuth login:', loginUrl);
  window.location.href = loginUrl;
}

// STEP 3: Exchange authorization code for access token
export async function exchangeCodeForToken(
  code: string,
  state: string
): Promise<TokenResponse> {
  try {
    console.log('[OAuth] Exchanging code for token...');
    
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
      console.error('[OAuth] Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[OAuth] Token received successfully');
    return data;
  } catch (error) {
    console.error('[OAuth] Error exchanging code for token:', error);
    throw error;
  }
}

// STEP 4: Fetch user info using access token
export async function fetchUserInfo(accessToken: string, uid: string): Promise<UserInfo> {
  try {
    console.log('[OAuth] Fetching user info...');
    
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
      console.error('[OAuth] User info fetch failed:', errorText);
      throw new Error(`User info fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[OAuth] User info received successfully');
    return data;
  } catch (error) {
    console.error('[OAuth] Error fetching user info:', error);
    throw error;
  }
}

// STEP 5: Fetch user profile
export async function fetchUserProfile(accessToken: string, uid: string): Promise<UserProfile | null> {
  try {
    console.log('[OAuth] Fetching user profile...');
    
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
      console.log('[OAuth] User profile not found (needs to be created)');
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OAuth] User profile fetch failed:', errorText);
      throw new Error(`User profile fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[OAuth] User profile received successfully');
    return data;
  } catch (error) {
    console.error('[OAuth] Error fetching user profile:', error);
    throw error;
  }
}

// STEP 6: Update user profile
export async function updateUserProfile(profileData: UserProfile): Promise<void> {
  try {
    console.log('[OAuth] Updating user profile...');
    
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
      console.error('[OAuth] Profile update failed:', errorText);
      throw new Error(`Profile update failed: ${response.status}`);
    }

    console.log('[OAuth] Profile updated successfully');
  } catch (error) {
    console.error('[OAuth] Error updating profile:', error);
    throw error;
  }
}

// Auth storage utilities
export const authStorage = {
  setAuth: (accessToken: string, userInfo: UserInfo, userProfile?: UserProfile) => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    if (userProfile) {
      localStorage.setItem('user_profile', JSON.stringify(userProfile));
    }
    localStorage.setItem('auth_timestamp', Date.now().toString());
    
    console.log('[OAuth] Authentication data stored in localStorage');
  },

  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },

  getUserInfo: (): UserInfo | null => {
    if (typeof window === 'undefined') return null;
    const userInfoStr = localStorage.getItem('user_info');
    if (!userInfoStr) return null;
    try {
      return JSON.parse(userInfoStr);
    } catch {
      return null;
    }
  },

  getUserProfile: (): UserProfile | null => {
    if (typeof window === 'undefined') return null;
    const userProfileStr = localStorage.getItem('user_profile');
    if (!userProfileStr) return null;
    try {
      return JSON.parse(userProfileStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token') && !!localStorage.getItem('user_info');
  },

  hasCompleteProfile: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('user_profile');
  },

  clearAuth: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('user_profile');
    localStorage.removeItem('auth_timestamp');
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_state_timestamp');
    console.log('[OAuth] Authentication data cleared');
  },

  logout: () => {
    authStorage.clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
};

// Check if user has admin role
export function isAdmin(userInfo: UserInfo | null): boolean {
  if (!userInfo) return false;
  return userInfo.role === 'admin' || userInfo.role === 'super_admin';
}

// Get user display name
export function getUserDisplayName(userInfo: UserInfo | null, userProfile: UserProfile | null): string {
  if (userProfile?.first_name && userProfile?.last_name) {
    return `${userProfile.first_name} ${userProfile.last_name}`;
  }
  if (userInfo?.first_name && userInfo?.last_name) {
    return `${userInfo.first_name} ${userInfo.last_name}`;
  }
  if (userInfo?.username) {
    return userInfo.username;
  }
  if (userInfo?.email) {
    return userInfo.email.split('@')[0];
  }
  return 'User';
}
