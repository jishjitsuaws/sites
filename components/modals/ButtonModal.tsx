'use client';

import { useState } from 'react';
import { X, Link as LinkIcon } from 'lucide-react';
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

export default function ButtonModal({ isOpen, onClose, onSave, initialProps }: ButtonModalProps) {
  const [text, setText] = useState(initialProps?.text || 'Click me');
  const [link, setLink] = useState(initialProps?.href || '#');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!text.trim()) {
      toast.error('Please enter button text');
      return;
    }

    onSave({
      text,
      href: link,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center" style={{ zIndex: 100 }} onClick={onClose}>
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
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 justify-end">
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
