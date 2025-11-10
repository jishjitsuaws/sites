'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage, updateUserProfile, UserProfile } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User } from 'lucide-react';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobileno: '',
  });

  useEffect(() => {
    // Check if user is authenticated
    const userInfo = authStorage.getUserInfo();
    if (!userInfo) {
      // Not authenticated, redirect to home
      router.push('/');
      return;
    }

    // Pre-fill email from userInfo if available
    if (userInfo.email) {
      setFormData(prev => ({ ...prev, email: userInfo.email || '' }));
    }
    if (userInfo.first_name) {
      setFormData(prev => ({ ...prev, first_name: userInfo.first_name || '' }));
    }
    if (userInfo.last_name) {
      setFormData(prev => ({ ...prev, last_name: userInfo.last_name || '' }));
    }
    if (userInfo.mobileno) {
      setFormData(prev => ({ ...prev, mobileno: userInfo.mobileno || '' }));
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userInfo = authStorage.getUserInfo();
    if (!userInfo) {
      alert('Authentication session expired. Please login again.');
      router.push('/');
      return;
    }

    // Validate form
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.mobileno) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Prepare profile data
      const profileData: UserProfile = {
        uid: userInfo.uid,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        mobileno: formData.mobileno,
        mode: 'ivp', // Hardcoded as per OAuth guide
      };

      // STEP 6: Update user profile
      // Calls: POST http://sites.isea.in/api/oauth/update-profile
      // Which calls: POST https://ivp.isea.in/backend/updateuserbyid
      await updateUserProfile(profileData);

      // Store profile in session
      const accessToken = authStorage.getAccessToken();
      if (accessToken) {
        authStorage.setAuth(accessToken, userInfo, profileData);
      }

      console.log('[CompleteProfile] Profile completed successfully');
      
      // Use window.location for a full page reload
      window.location.href = '/home';
    } catch (err) {
      console.error('[CompleteProfile] Error:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Please provide your information to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            label="First Name"
            name="first_name"
            type="text"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="John"
            required
          />

          <Input
            label="Last Name"
            name="last_name"
            type="text"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Doe"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />

          <Input
            label="Mobile Number"
            name="mobileno"
            type="tel"
            value={formData.mobileno}
            onChange={handleChange}
            placeholder="1234567890"
            required
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Saving Profile...' : 'Complete Profile'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            All fields are required to continue
          </p>
        </form>
      </div>
    </div>
  );
}
