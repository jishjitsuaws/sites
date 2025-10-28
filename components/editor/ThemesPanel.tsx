'use client';

import { toast } from 'sonner';
import api from '@/lib/api';

interface Theme {
  _id: string;
  name: string;
  description?: string;
  colors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts?: {
    heading: string;
    body: string;
  };
  effects?: any;
}

interface Site {
  _id: string;
  siteName: string;
  subdomain: string;
  themeId?: string;
  theme?: Theme;
  logo?: string;
  logoWidth?: string;
  isPublished: boolean;
}

interface ThemesPanelProps {
  themes: Theme[];
  site: Site | null;
  siteId: string;
  onThemeChange: (updatedSite: Site) => void;
}

export default function ThemesPanel({ themes, site, siteId, onThemeChange }: ThemesPanelProps) {
  const handleThemeSelect = async (theme: Theme) => {
    try {
      const response = await api.put(`/sites/${siteId}`, { themeId: theme._id });
      toast.success(`Theme changed to ${theme.name}`);
      if (site) {
        const updatedSite = { ...site, themeId: theme._id, theme: theme };
        onThemeChange(updatedSite);
      }
    } catch (err) {
      toast.error('Failed to update theme');
    }
  };

  return (
    <div className="space-y-2">
      {themes && themes.length > 0 ? (
        themes.map((theme) => (
          <div
            key={theme._id}
            onClick={() => handleThemeSelect(theme)}
            className={`border-2 rounded-lg p-2.5 cursor-pointer transition-all ${
              site?.themeId === theme._id || site?.theme?._id === theme._id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className="font-semibold text-sm text-gray-900">{theme.name}</h4>
            <p className="text-xs text-gray-600 mt-0.5">{theme.description}</p>
            {theme.colors && (
              <div className="flex gap-1.5 mt-2">
                <div 
                  className="w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: theme.colors.primary }}
                  title="Primary color"
                />
                <div 
                  className="w-5 h-5 rounded border border-gray-300"
                  style={{ backgroundColor: theme.colors.secondary }}
                  title="Secondary color"
                />
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-xs">Loading themes...</p>
      )}
    </div>
  );
}
