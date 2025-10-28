'use client';

import { useState } from 'react';
import { X, Link as LinkIcon, Copy, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

interface ButtonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (props: any) => void;
  initialProps?: any;
  onDelete?: () => void;
  onCopy?: () => void;
  themeColors?: any;
}

export default function ButtonModal({ isOpen, onClose, onSave, initialProps, onDelete, onCopy, themeColors }: ButtonModalProps) {
  const [text, setText] = useState(initialProps?.text || 'Click me');
  const [link, setLink] = useState(initialProps?.href || '#');
  const [variant, setVariant] = useState(initialProps?.variant || 'primary');
  const [alignment, setAlignment] = useState(initialProps?.align || 'left');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!text.trim()) {
      toast.error('Please enter button text');
      return;
    }

    onSave({
      text,
      href: link,
      variant,
      align: alignment,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 100 }} onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Button Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Button Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Click me"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <LinkIcon className="h-4 w-4 inline mr-1" />
              Link
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

          {/* Button Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
            <div className="flex gap-2">
              <button
                onClick={() => setVariant('primary')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  variant === 'primary'
                    ? 'ring-2 ring-blue-600 ring-offset-2'
                    : ''
                }`}
                style={{
                  backgroundColor: themeColors?.primary || '#3b82f6',
                  color: '#ffffff'
                }}
              >
                Primary
              </button>
              <button
                onClick={() => setVariant('secondary')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  variant === 'secondary'
                    ? 'ring-2 ring-blue-600 ring-offset-2'
                    : ''
                }`}
                style={{
                  backgroundColor: themeColors?.secondary || '#8b5cf6',
                  color: '#ffffff'
                }}
              >
                Secondary
              </button>
            </div>
          </div>

          {/* Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
            <select
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {initialProps && (
            <>
              {onCopy && (
                <Button variant="outline" onClick={onCopy} size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" onClick={onDelete} size="sm">
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
            {initialProps ? 'Save' : 'Insert'}
          </Button>
        </div>
      </div>
    </div>
  );
}
