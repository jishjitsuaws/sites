'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('user123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username !== 'user' || password !== 'user123') {
      toast.error('Invalid credentials. Use username: user, password: user123');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: 'user@sitebuilder.com',
        password: 'user123',
      });

      setUser(response.data.user);
      setTokens(response.data.accessToken, response.data.refreshToken);
      
      toast.success('Welcome back!');
      router.push('/home');
    } catch (err: any) {
      // If user doesn't exist, create them automatically
      try {
        const registerResponse = await api.post('/auth/register', {
          name: 'User',
          email: 'user@sitebuilder.com',
          password: 'user123',
        });

        setUser(registerResponse.data.user);
        setTokens(registerResponse.data.accessToken, registerResponse.data.refreshToken);
        
        toast.success('Welcome!');
        router.push('/home');
      } catch (registerErr: any) {
        toast.error('Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Globe className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to SiteBuilder</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="user"
            required
            helperText="Username: user"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="user123"
            required
            helperText="Password: user123"
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
              ← Back to home
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
