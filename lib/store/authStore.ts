import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authStorage as oauthStorage, UserInfo, UserProfile } from '@/lib/oauth';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  oauthProvider?: string;
  uid?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userInfo: UserInfo | null;
  userProfile: UserProfile | null;
  
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setOAuthData: (accessToken: string, userInfo: UserInfo, userProfile?: UserProfile) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  initializeFromOAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      userInfo: null,
      userProfile: null,

      setUser: (user) => set({ user, isAuthenticated: true }),
      
      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('access_token', accessToken);
          if (refreshToken) {
            sessionStorage.setItem('refresh_token', refreshToken);
          }
        }
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      setOAuthData: (accessToken, userInfo, userProfile) => {
        // Store in sessionStorage using OAuth storage utility
        oauthStorage.setAuth(accessToken, userInfo, userProfile);
        
        // Convert OAuth data to User format
        const user: User = {
          id: userInfo.uid,
          name: userProfile 
            ? `${userProfile.first_name} ${userProfile.last_name}` 
            : userInfo.first_name && userInfo.last_name 
              ? `${userInfo.first_name} ${userInfo.last_name}`
              : userInfo.username || userInfo.email.split('@')[0],
          email: userInfo.email,
          subscriptionPlan: 'free',
          oauthProvider: 'ivp',
          uid: userInfo.uid,
        };
        
        set({ 
          user,
          accessToken,
          userInfo,
          userProfile,
          isAuthenticated: true 
        });
      },
      
      clearAuth: () => {
        // Clear OAuth storage
        oauthStorage.clearAuth();
        
        // Clear any remaining storage items
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_info');
          localStorage.removeItem('user_profile');
          localStorage.removeItem('auth_timestamp');
        }
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          userInfo: null,
          userProfile: null,
          isAuthenticated: false,
        });
      },

      initializeFromOAuth: () => {
        // Initialize from OAuth storage on app load
        if (oauthStorage.isAuthenticated()) {
          const accessToken = oauthStorage.getAccessToken();
          const userInfo = oauthStorage.getUserInfo();
          const userProfile = oauthStorage.getUserProfile();
          
          console.log('[AuthStore] Initializing from OAuth storage:', {
            hasToken: !!accessToken,
            hasUserInfo: !!userInfo,
            hasProfile: !!userProfile,
          });
          
          if (accessToken && userInfo) {
            const user: User = {
              id: userInfo.uid,
              name: userProfile 
                ? `${userProfile.first_name} ${userProfile.last_name}` 
                : userInfo.first_name && userInfo.last_name 
                  ? `${userInfo.first_name} ${userInfo.last_name}`
                  : userInfo.username || userInfo.email.split('@')[0],
              email: userInfo.email,
              subscriptionPlan: 'free',
              oauthProvider: 'ivp',
              uid: userInfo.uid,
            };
            
            set({ 
              user,
              accessToken,
              userInfo,
              userProfile,
              isAuthenticated: true 
            });
            
            console.log('[AuthStore] OAuth initialization complete, user authenticated');
          }
        } else {
          console.log('[AuthStore] No OAuth session found');
        }
      },
      
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist user and basic auth state
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
