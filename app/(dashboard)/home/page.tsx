'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Plus, Globe, Settings, LogOut, Search, ExternalLink, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Site {
  _id: string;
  siteName: string;
  subdomain: string;
  customDomain?: string;
  isPublished: boolean;
  lastEditedAt: string;
  description?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

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
      console.log('Fetched sites response:', response.data);
      console.log('Sites array:', response.data.data);
      setSites(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching sites:', err);
      toast.error('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      clearAuth();
      router.push('/');
      toast.success('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
      clearAuth();
      router.push('/');
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return;
    
    try {
      await api.delete(`/sites/${siteId}`);
      setSites(sites.filter(site => site._id !== siteId));
      toast.success('Site deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete site');
    }
  };

  const filteredSites = (sites || []).filter(site =>
    site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.subdomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your websites...</p>
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
              <span className="text-sm text-gray-600">
                {user?.name || user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
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
          <Button onClick={handleCreateWebsite} className="gap-2" disabled={creating}>
            <Plus className="h-5 w-5" />
            {creating ? 'Creating...' : 'Create New Website'}
          </Button>
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
            {filteredSites.map((site) => {
              console.log('=== Rendering site card ===');
              console.log('Site ID:', site._id);
              console.log('Site Name:', site.siteName);
              console.log('Full site object:', site);
              return (
              <Card 
                key={site._id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  if (site.isPublished) {
                    window.open(`http://localhost:3000/site/${site.subdomain}`, '_blank');
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
                        {site.customDomain || `localhost:3000/site/${site.subdomain}`}
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
                              console.log('Opening editor for site:', site._id);
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
                                window.open(`http://localhost:3000/site/${site.subdomain}`, '_blank');
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
                              handleDeleteSite(site._id);
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
            );
            })}
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
    </div>
  );
}
