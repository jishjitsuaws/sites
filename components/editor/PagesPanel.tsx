'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Page {
  _id: string;
  pageName: string;
  slug: string;
  isHome: boolean;
  content: any[];
}

interface PagesPanelProps {
  pages: Page[];
  currentPage: Page | null;
  siteId: string;
  onPageSwitch: (page: Page) => void;
  onPagesUpdate: (pages: Page[]) => void;
}

export default function PagesPanel({ 
  pages, 
  currentPage, 
  siteId, 
  onPageSwitch,
  onPagesUpdate 
}: PagesPanelProps) {
  const [showAddPageForm, setShowAddPageForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editedPageName, setEditedPageName] = useState('');

  const handleAddPage = async () => {
    if (!newPageName.trim()) {
      toast.error('Please enter a page name');
      return;
    }

    try {
      const response = await api.post(`/sites/${siteId}/pages`, {
        pageName: newPageName.trim(),
      });
      toast.success(`Page "${newPageName}" created`);
      onPagesUpdate([...pages, response.data.data]);
      setNewPageName('');
      setShowAddPageForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create page');
    }
  };

  const handleDeletePage = async (pageId: string, pageName: string) => {
    if (!confirm(`Are you sure you want to delete "${pageName}"?`)) return;

    try {
      await api.delete(`/sites/${siteId}/pages/${pageId}`);
      toast.success(`Page "${pageName}" deleted`);
      const updatedPages = pages.filter(p => p._id !== pageId);
      onPagesUpdate(updatedPages);
      
      // Switch to first page if current page was deleted
      if (currentPage?._id === pageId && updatedPages.length > 0) {
        onPageSwitch(updatedPages[0]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete page');
    }
  };

  const handleRenamePage = async (pageId: string) => {
    if (!editedPageName.trim() || editedPageName === pages.find(p => p._id === pageId)?.pageName) {
      setEditingPageId(null);
      return;
    }

    try {
      const response = await api.put(`/pages/${pageId}`, {
        pageName: editedPageName.trim(),
      });
      
      toast.success('Page renamed successfully');
      const updatedPages = pages.map(p => 
        p._id === pageId ? { ...p, pageName: editedPageName.trim() } : p
      );
      onPagesUpdate(updatedPages);
      setEditingPageId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to rename page');
    }
  };

  return (
    <div>
      <div className="space-y-1.5">
        {pages && pages.length > 0 ? pages.map((page) => (
          <div
            key={page._id}
            className={`p-2.5 rounded-lg transition-colors group ${
              currentPage?._id === page._id
                ? 'bg-blue-50 border-2 border-blue-600'
                : 'border-2 border-transparent hover:bg-gray-50'
            }`}
          >
            <div 
              className="cursor-pointer flex items-center justify-between"
              onClick={() => {
                if (editingPageId !== page._id) {
                  onPageSwitch(page);
                }
              }}
            >
              <div className="flex-1 min-w-0">
                {editingPageId === page._id ? (
                  <input
                    type="text"
                    value={editedPageName}
                    onChange={(e) => setEditedPageName(e.target.value)}
                    onBlur={() => handleRenamePage(page._id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenamePage(page._id);
                      } else if (e.key === 'Escape') {
                        setEditingPageId(null);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="w-full px-2 py-1 border border-blue-500 rounded text-sm font-medium text-black mb-1"
                  />
                ) : (
                  <div className="font-medium text-sm truncate">{page.pageName}</div>
                )}
                <div className="text-xs text-black">
                  {page.isHome ? '/' : `/${page.slug}`}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {page.isHome && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                    Home
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditedPageName(page.pageName);
                    setEditingPageId(page._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded transition-opacity"
                  title="Rename page"
                >
                  <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePage(page._id, page.pageName);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                  title="Delete page"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-3 text-gray-500 text-xs">
            No pages yet
          </div>
        )}
        
        {/* New Page Card */}
        {!showAddPageForm ? (
          <div
            onClick={() => setShowAddPageForm(true)}
            className="p-2.5 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-center gap-2 text-gray-500 group-hover:text-blue-600">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">New Page</span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50">
            <input
              type="text"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              placeholder="Enter page name..."
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-black mb-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddPage();
                if (e.key === 'Escape') {
                  setShowAddPageForm(false);
                  setNewPageName('');
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddPage} className="flex-1 h-7 text-xs">
                Create
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setShowAddPageForm(false);
                  setNewPageName('');
                }}
                className="flex-1 h-7 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
