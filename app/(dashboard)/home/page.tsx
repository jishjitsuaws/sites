'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  authStorage, 
  getUserDisplayName,
  exchangeCodeForToken,
  fetchUserInfo,
  fetchUserProfile
} from '@/lib/auth';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Plus, Globe, Settings, Search, ExternalLink, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import TemplatesModal from '@/components/modals/TemplatesModal';
import LogoutButton from '@/components/LogoutButton';
import { Suspense } from 'react';

interface Site {
  _id: string;
  siteName: string;
  subdomain: string;
  customDomain?: string;
  isPublished: boolean;
  lastEditedAt: string;
  description?: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [processingOAuth, setProcessingOAuth] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  
  // Get user info from OAuth
  const userInfo = authStorage.getUserInfo();
  const userProfile = authStorage.getUserProfile();
  const displayName = getUserDisplayName(userInfo, userProfile);

  // Track if sites have been fetched in this session (reset on component mount)
  const [hasFetchedSites, setHasFetchedSites] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('[Home] useEffect OAuth handler called');
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      
      console.log('[Home] OAuth params check:', {
        hasCode: !!code,
        hasState: !!state,
        isAuthenticated: authStorage.isAuthenticated(),
        shouldProcess: !!(code && state && !authStorage.isAuthenticated())
      });

      // Only process if we have code and state and we're not already authenticated
      if (code && state && !authStorage.isAuthenticated()) {
        // Check if we're already processing to prevent duplicate requests
        const isProcessing = sessionStorage.getItem('oauth_processing');
        const processingTimestamp = sessionStorage.getItem('oauth_processing_timestamp');
        
        // If processing flag is set, check if it's been more than 30 seconds (stale)
        if (isProcessing === 'true' && processingTimestamp) {
          const elapsed = Date.now() - parseInt(processingTimestamp);
          if (elapsed < 30000) { // 30 seconds
            console.log('[Home] OAuth already being processed, skipping duplicate');
            return;
          } else {
            console.log('[Home] OAuth processing flag is stale, clearing and retrying');
            sessionStorage.removeItem('oauth_processing');
            sessionStorage.removeItem('oauth_processing_timestamp');
          }
        }

        console.log('[Home] OAuth callback detected, processing...');
        sessionStorage.setItem('oauth_processing', 'true');
        sessionStorage.setItem('oauth_processing_timestamp', Date.now().toString());
        setProcessingOAuth(true);
        
        try {
          // NOTE: IVP ISEA OAuth provider generates its own state parameter
          // and doesn't use the state we send in the authorization request.
          // We'll verify that a state exists but won't validate against our stored state
          // since the provider doesn't return our state back to us.
          
          console.log('[Home] OAuth parameters received:', {
            code: code.substring(0, 20) + '...',
            state: state.substring(0, 20) + '...',
            hasCode: !!code,
            hasState: !!state
          });
          
          // Optional: Verify state format (should be alphanumeric)
          if (!/^[a-zA-Z0-9]+$/.test(state)) {
            console.error('[Home] State has invalid format');
            toast.error('Authentication failed: Invalid state format');
            router.push('/login');
            return;
          }

          console.log('[Home] State format verified, exchanging code for token...');
          
          // Exchange code for token. Backend sets token in HttpOnly cookie and returns uid.
          const tokenData = await exchangeCodeForToken(code, state);
          console.log('[Home] Token exchange response:', tokenData);
          console.log('[Home] Token exchange response keys:', Object.keys(tokenData));
          console.log('[Home] Token data full:', JSON.stringify(tokenData, null, 2));

          // Backend now returns uid (token stored in HttpOnly cookie). Prefer tokenData.uid.
          const uid = tokenData.uid || tokenData.data?.uid;

          if (!uid) {
            console.error('[Home] No uid returned from token exchange:', tokenData);
            console.error('[Home] tokenData.uid:', tokenData.uid);
            console.error('[Home] tokenData.data:', tokenData.data);
            console.error('[Home] tokenData.data?.uid:', tokenData.data?.uid);
            toast.error('Failed to authenticate (missing user id)');
            sessionStorage.removeItem('oauth_processing');
            sessionStorage.removeItem('oauth_processing_timestamp');
            router.push('/login');
            return;
          }

          console.log('[Home] UID obtained from token exchange:', uid);

          // Fetch user info using cookie-based auth; token is sent automatically via cookie
          const userInfoData = await fetchUserInfo('', uid);
          console.log('[Home] User info received:', userInfoData);

          // Store auth (no access token stored in JS) and continue
          authStorage.setAuth('', userInfoData);
          
          // Clear processing flag
          sessionStorage.removeItem('oauth_processing');
          sessionStorage.removeItem('oauth_processing_timestamp');
          
          toast.success('Successfully logged in!');
          
          // Redirect to clean /home URL with full page reload to ensure storage is synced
          console.log('[Home] Redirecting to home...');
          // Instead of full redirect (causes another cycle) just clean URL and proceed
          window.history.replaceState({}, '', '/home');
          setProcessingOAuth(false);
          setLoading(false);
          // Fetch sites once
          if (!hasFetchedSites) {
            setHasFetchedSites(true);
            fetchSites();
          }
          return;
          
        } catch (error: any) {
          // Clear processing flag on error
          sessionStorage.removeItem('oauth_processing');
          sessionStorage.removeItem('oauth_processing_timestamp');
          
          console.error('[Home] OAuth error:', error);
          console.error('[Home] Error response:', error.response?.data);
          
          const errorMessage = error.response?.data?.details?.error || 
                              error.response?.data?.message || 
                              error.message || 
                              'Authentication failed';
          
          const errorDetails = error.response?.data?.details;
          
          if (errorDetails) {
            console.error('[Home] Detailed error from OAuth provider:', errorDetails);
          }
          
          toast.error(`Authentication failed: ${errorMessage}`);
          
          // If it's a token error, clear any stored state and retry
          if (errorMessage.includes('token') || errorMessage.includes('expired')) {
            sessionStorage.clear();
            localStorage.clear();
          }
          
          setTimeout(() => router.push('/login'), 2000);
        }
      } else {
        // No OAuth params. If authenticated, load sites once else redirect.
        console.log('[Home] No OAuth params in URL');
        if (authStorage.isAuthenticated()) {
          console.log('[Home] User is authenticated, setting loading to false');
          setProcessingOAuth(false);
          setLoading(false);
          if (!hasFetchedSites) {
            setHasFetchedSites(true);
            console.log('[Home] Fetching sites...');
            fetchSites();
          }
        } else {
          console.log('[Home] Not authenticated and no OAuth params → redirect to login');
          router.push('/login');
        }
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  useEffect(() => {
    console.log('[Home] Second useEffect - processingOAuth:', processingOAuth, 'isAuthenticated:', authStorage.isAuthenticated());
    if (authStorage.isAuthenticated() && !processingOAuth && loading) {
      console.log('[Home] Setting loading to false in second useEffect');
      setLoading(false);
    }
    if (authStorage.isAuthenticated() && !processingOAuth && !hasFetchedSites) {
      setHasFetchedSites(true);
      console.log('[Home] Fetching sites from second useEffect...');
      fetchSites();
    }
  }, [processingOAuth, loading, hasFetchedSites]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const handleCreateWebsite = async () => {
    setCreating(true);
    try {
      // Create a default site with minimal data
      const response = await api.post('/sites', {
        siteName: 'Untitled Site',
        subdomain: `site-${Date.now()}`,
        description: '',
        themeId: '68fb2f8037ef121e39638be5', // Default to first theme (Modern Blue)
      });

      toast.success('Website created! Start editing...');
      router.push(`/editor/${response.data.data._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create website');
      setCreating(false);
    }
  };

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sites');
      setSites(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching sites:', err);
      toast.error('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    try {
      await api.delete(`/sites/${siteId}`);
      setSites(sites.filter(site => site._id !== siteId));
      toast.success('Site deleted successfully');
      setSiteToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete site');
    }
  };

  const filteredSites = (sites || []).filter(site =>
    site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('[Home] Render state:', { loading, processingOAuth, isAuthenticated: authStorage.isAuthenticated(), sitesCount: sites.length });

  if (loading || processingOAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{processingOAuth ? 'Authenticating...' : 'Loading your websites...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SiteBuilder</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {displayName}
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {userInfo?.role === 'admin' ? 'Administrator' : 
                   userInfo?.role === 'super_admin' ? 'Super Administrator' : 
                   userInfo?.role || 'User'}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <LogoutButton variant="icon" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Create */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search websites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowTemplates(true)} variant="outline" className="gap-2">
              View Templates
            </Button>
            <Button onClick={handleCreateWebsite} className="gap-2" disabled={creating}>
              <Plus className="h-5 w-5" />
              {creating ? 'Creating...' : 'Create New Website'}
            </Button>
          </div>
        </div>

        {/* Sites Grid */}
        {!sites || sites.length === 0 ? (
          <Card className="text-center py-12">
            <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No websites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first website to get started
            </p>
            <Button onClick={handleCreateWebsite} disabled={creating}>
              {creating ? 'Creating...' : 'Create Website'}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site) => (
              <Card 
                key={site._id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (site.isPublished) {
                    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                    window.open(`${siteUrl}/site/${site.subdomain}`, '_blank');
                  } else {
                    router.push(`/editor/${site._id}`);
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{site.siteName}</CardTitle>
                      <CardDescription>
                        {site.customDomain}
                      </CardDescription>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === site._id ? null : site._id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </button>
                      
                      {openDropdown === site._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/editor/${site._id}`);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-black"
                          >
                            <Settings className="h-4 w-4" />
                            Open Editor
                          </button>
                          {site.isPublished && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                                window.open(`${siteUrl}/site/${site.subdomain}`, '_blank');
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-black"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Site
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSiteToDelete(site._id);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-gray-200"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      site.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {site.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-black">
                      {new Date(site.lastEditedAt || site.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{filteredSites.length}</p>
                <p className="text-black mt-1">Total Websites</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {filteredSites.filter(s => s.isPublished).length}
                </p>
                <p className="text-black mt-1">Published</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">
                  {filteredSites.filter(s => !s.isPublished).length}
                </p>
                <p className="text-black mt-1">Drafts</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Templates Modal */}
      <TemplatesModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} />

      {/* Delete Confirmation Modal */}
      {siteToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSiteToDelete(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Website</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this website? This action cannot be undone and all associated data will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setSiteToDelete(null)}>
                Cancel
              </Button>
              <Button 
                variant="default" 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDeleteSite(siteToDelete)}
              >
                Delete Website
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
