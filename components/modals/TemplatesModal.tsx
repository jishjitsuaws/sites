'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { templates, Template } from '@/lib/templates';
import { X } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplatesModal({ isOpen, onClose }: TemplatesModalProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreateFromTemplate = async (template: Template) => {
    setCreating(true);
    try {
      // Create site with template name - keep subdomain short
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits
      const siteData = {
        siteName: template.name,
        subdomain: `${template.id}-${timestamp}`,
      };
      
      console.log('Creating site with data:', siteData);
      const siteResponse = await api.post('/sites', siteData);
      console.log('Site created successfully:', siteResponse.data);

      const siteId = siteResponse.data.data._id;

      // Fetch existing pages (site creation auto-creates a default home page)
      const pagesResponse = await api.get(`/sites/${siteId}/pages`);
      const existingPages = pagesResponse.data.data || [];
      const existingHomePage = existingPages.find((p: any) => p.isHome);

      if (existingHomePage) {
        // Update the existing home page with template sections
        console.log('Updating existing home page with template sections');
        await api.put(`/pages/${existingHomePage._id}`, {
          sections: template.sections
        });
        console.log('Home page updated successfully');
      } else {
        // Create home page if it doesn't exist (shouldn't happen, but fallback)
        console.log('Creating new home page with sections count:', template.sections.length);
        await api.post(`/sites/${siteId}/pages`, {
          pageName: 'Home',
          slug: '',
          isHome: true,
          sections: template.sections
        });
        console.log('Page created successfully');
      }

      toast.success('Site created from template!');
      router.push(`/editor/${siteId}`);
    } catch (err: any) {
      console.error('Template creation error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.response?.data?.message);
      console.error('Validation errors:', err.response?.data?.errors);
      toast.error(err.response?.data?.message || 'Failed to create site from template');
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Template Preview */}
                <div className="aspect-video bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <h3 className="text-3xl font-bold mb-2">{template.name}</h3>
                    <p className="text-blue-100">Template Preview</p>
                  </div>
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  
                  <button
                    onClick={() => handleCreateFromTemplate(template)}
                    disabled={creating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating...' : 'Use This Template'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
