'use client';

import { useState, useRef } from 'react';
import { X, Upload, Link as LinkIcon, Copy, Trash2, AlignLeft, AlignCenter, AlignRight, Crop } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import api from '@/lib/api';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (props: any) => void;
  initialProps?: any;
  onDelete?: () => void;
  onCopy?: () => void;
}

export default function ImageModal({ isOpen, onClose, onSave, initialProps, onDelete, onCopy }: ImageModalProps) {
  const [imageUrl, setImageUrl] = useState(initialProps?.src || '');
  const [altText, setAltText] = useState(initialProps?.alt || '');
  const [alignment, setAlignment] = useState(initialProps?.align || 'left');
  const [width, setWidth] = useState(parseInt(initialProps?.width) || 100);
  const [link, setLink] = useState(initialProps?.link || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/assets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const url = response.data.data.url;
      setImageUrl(url);
      toast.success('Image uploaded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!imageUrl) {
      toast.error('Please upload an image');
      return;
    }

    onSave({
      src: imageUrl,
      alt: altText,
      align: alignment,
      width: `${Math.round(width * 4)}px`, // Convert percentage to pixels (400px at 100%)
      link: link,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 100 }} onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Image Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {imageUrl ? (
                <div className="space-y-4">
                  <img src={imageUrl} alt="Preview" className="mx-auto max-h-64 rounded" />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </p>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    Select Image
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text (for accessibility)</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAlignment('left')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  alignment === 'left' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <AlignLeft className="h-4 w-4" />
                Left
              </button>
              <button
                onClick={() => setAlignment('center')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  alignment === 'center' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <AlignCenter className="h-4 w-4" />
                Center
              </button>
              <button
                onClick={() => setAlignment('right')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  alignment === 'right' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                <AlignRight className="h-4 w-4" />
                Right
              </button>
            </div>
          </div>

          {/* Width */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Width: {width}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="h-4 w-4 inline mr-1" />
              Link (optional)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com or /page-slug"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Link to another page or external URL</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          {initialProps?.src && (
            <>
              {onCopy && (
                <Button variant="outline" onClick={onCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </>
          )}
          <div className="flex-1"></div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {initialProps?.src ? 'Save Changes' : 'Insert Image'}
          </Button>
        </div>
      </div>
    </div>
  );
}
