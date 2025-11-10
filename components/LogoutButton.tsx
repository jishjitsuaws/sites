'use client';

import { useState } from 'react';
import { logout } from '@/lib/auth';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'icon' | 'text';
  className?: string;
}

export default function LogoutButton({ variant = 'default', className = '' }: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    
    try {
      await logout();
      // Redirect happens in logout function
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
      alert('Logout failed. Please try again.');
    }
  };

  // Icon-only variant
  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
    );
  }

  // Text-only variant
  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    );
  }

  // Default variant (full button)
  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <LogOut className="w-4 h-4" />
      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
}
