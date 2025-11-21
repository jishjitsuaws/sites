'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Globe, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Theme {
  _id: string;
  name: string;
  description: string;
  thumbnail?: string;
  category: string;
  isPremium: boolean;
}

export default function CreateSitePage() {
  const router = useRouter();
  const [siteName, setSiteName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  useEffect(() => {
    const checkAvailability = async () => {
      if (subdomain.length >= 3) {
        setCheckingSubdomain(true);
        try {
          const isValid = /^[a-z0-9-]+$/.test(subdomain);
          setSubdomainAvailable(isValid);
        } catch {
          setSubdomainAvailable(false);
        } finally {
          setCheckingSubdomain(false);
        }
      } else {
        setSubdomainAvailable(null);
      }
    };
    
    checkAvailability();
  }, [subdomain]);

  const fetchThemes = async () => {
    try {
      const response = await api.get('/themes');
      const themesData = response.data.data || response.data.themes || [];
      setThemes(themesData);
      if (themesData.length > 0) {
        setSelectedTheme(themesData[0]._id);
      }
    } catch {
      console.error('Failed to load themes');
      toast.error('Failed to load themes');
    }
  };

  const handleSiteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setSiteName(name);
    
    // Auto-generate subdomain from site name
    if (!subdomain || subdomain === generateSubdomain(siteName)) {
      setSubdomain(generateSubdomain(name));
    }
  };

  const generateSubdomain = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double submission
    if (loading) {
      return;
    }
    
    if (!siteName || !subdomain || !selectedTheme) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!subdomainAvailable) {
      toast.error('Please choose a valid subdomain');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/sites', {
        siteName,
        subdomain,
        description,
        themeId: selectedTheme,
      });

      toast.success('Website created successfully!');
      router.push(`/editor/${response.data.data._id}`);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create website');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Globe className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Create New Website</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit}>
          {/* Site Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Website Details</CardTitle>
              <CardDescription>
                Basic information about your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input
                label="Site Name"
                value={siteName}
                onChange={handleSiteNameChange}
                placeholder="My Awesome Website"
                required
                helperText="This will be the name of your website"
              />

              <div>
                <Input
                  label="Subdomain"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                  placeholder="my-awesome-site"
                  required
                  helperText={
                    checkingSubdomain
                      ? 'Checking availability...'
                      : subdomainAvailable === true
                      ? '✓ This subdomain is available'
                      : subdomainAvailable === false
                      ? '✗ This subdomain is not valid'
                      : 'Your website will be available at this address'
                  }
                  error={subdomainAvailable === false ? 'Invalid subdomain format' : undefined}
                />
                <p className="text-sm text-black opacity-70 mt-1">
                  {subdomain}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your website..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  maxLength={500}
                />
                <p className="text-sm text-black opacity-70 mt-1">
                  {description.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Theme Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Choose a Theme</CardTitle>
              <CardDescription>
                Select a starting theme for your website (you can customize it later)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes && themes.length > 0 ? themes.map((theme) => (
                  <div
                    key={theme._id}
                    onClick={() => setSelectedTheme(theme._id)}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTheme === theme._id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {selectedTheme === theme._id && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    {theme.thumbnail && (
                      <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={theme.thumbnail}
                          alt={theme.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-black">{theme.name}</h3>
                    <p className="text-sm text-black opacity-85 mt-1">{theme.description}</p>
                    {theme.isPremium && (
                      <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                )) : (
                  <div className="col-span-full text-center py-8 text-black opacity-70">
                    Loading themes...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !subdomainAvailable || !selectedTheme}
            >
              {loading ? 'Creating...' : 'Create Website'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
