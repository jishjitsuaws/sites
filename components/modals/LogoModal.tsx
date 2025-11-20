'use client';

import { useState } from 'react';
import { X, Upload, Image } from 'lucide-react';
import Button from '@/components/ui/Button';

interface LogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logoData: { logo: string; logoWidth: string }) => void;
  currentLogo?: string;
  currentWidth?: string;
}

export default function LogoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentLogo = '', 
  currentWidth = '120px' 
}: LogoModalProps) {
  const [logo, setLogo] = useState(currentLogo);
  const [uploading, setUploading] = useState(false);
  
  // Use original uploaded logo dimensions
  const logoWidth = 'auto';

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({ logo, logoWidth });
  };

  const handleRemoveLogo = () => {
    setLogo('');
    onSave({ logo: '', logoWidth });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      style={{ zIndex: 100 }}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Site Logo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Logo Preview */}
        <div className="mb-6">
          {logo ? (
            <div className="border-2 border-gray-200 rounded-lg p-4 text-center">
              <img 
                src={logo} 
                alt="Logo preview" 
                style={{ maxWidth: '100%', maxHeight: '120px' }}
                className="mx-auto"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No logo uploaded</p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Logo
          </label>
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-center">
                <Upload className="h-5 w-5 inline mr-2" />
                Choose File
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {logo && (
              <button
                onClick={handleRemoveLogo}
                className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Logo
          </Button>
        </div>
      </div>
    </div>
  );
}
