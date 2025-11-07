'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage, updateUserProfile, UserInfo, UserProfile } from '@/lib/oauth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'sonner';
import { Globe } from 'lucide-react';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobileno: '',
  });

  useEffect(() => {
    // Check if user is authenticated
    const info = authStorage.getUserInfo();
    if (!info) {
      toast.error('Not authenticated');
      router.push('/login');
      return;
    }

    setUserInfo(info);

    // Pre-fill form with available data
    setFormData({
      first_name: info.first_name || '',
      last_name: info.last_name || '',
      email: info.email || '',
      mobileno: info.mobileno || '',
    });
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInfo) {
      toast.error('User information not found');
      return;
    }

    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim() || 
        !formData.email.trim() || !formData.mobileno.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate mobile number (basic validation)
    if (!/^\d{10}$/.test(formData.mobileno)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const profileData: UserProfile = {
        uid: userInfo.uid,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        mobileno: formData.mobileno.trim(),
        mode: 'ivp', // Hardcoded as per documentation
      };

      // Update profile on OAuth provider
      await updateUserProfile(profileData);

      // Update local storage with complete profile
      const accessToken = authStorage.getAccessToken();
      if (accessToken) {
        authStorage.setAuth(accessToken, userInfo, profileData);
      }

      toast.success('Profile completed successfully!');
      router.push('/home');
    } catch (error: any) {
      console.error('[Complete Profile] Error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Globe className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Please provide the following information to complete your registration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            label="First Name"
            name="first_name"
            type="text"
            value={formData.first_name}
            onChange={handleInputChange}
            placeholder="John"
            required
          />

          <Input
            label="Last Name"
            name="last_name"
            type="text"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder="Doe"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john.doe@example.com"
            required
          />

          <Input
            label="Mobile Number"
            name="mobileno"
            type="tel"
            value={formData.mobileno}
            onChange={handleInputChange}
            placeholder="1234567890"
            required
            helperText="Enter 10-digit mobile number"
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            <button
              type="button"
              onClick={() => {
                authStorage.clearAuth();
                router.push('/login');
              }}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ← Back to login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
