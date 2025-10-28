'use client';

import { Layers, Plus } from 'lucide-react';

interface ComponentType {
  id: string;
  name: string;
  icon: any;
  description: string;
}

interface ComponentsPanelProps {
  insertComponentTypes: ComponentType[];
  onInsertComponent: (type: string) => void;
  onOpenBlockModal: () => void;
  onAddEmptySection?: () => void;
}

export default function ComponentsPanel({ 
  insertComponentTypes, 
  onInsertComponent,
  onOpenBlockModal,
  onAddEmptySection
}: ComponentsPanelProps) {
  return (
    <div>
      {/* Add Empty Section Button */}
      {onAddEmptySection && (
        <div className="mb-6">
          <button
            onClick={onAddEmptySection}
            className="w-full p-4 rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group bg-white"
          >
            <Plus className="h-6 w-6 mx-auto mb-2 text-blue-400 group-hover:text-blue-600" />
            <div className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">Add Empty Section</div>
            <div className="text-xs text-gray-500 mt-1">Create a flexible container</div>
          </button>
        </div>
      )}

      {/* Content Block Templates Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Content Blocks</h3>
          <Layers className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={onOpenBlockModal}
            className="p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group"
          >
            <Plus className="h-5 w-5 mx-auto mb-1 text-gray-400 group-hover:text-blue-600" />
            <div className="text-xs font-medium text-gray-600 group-hover:text-blue-600">Browse Templates</div>
          </button>
          <div className="p-3 rounded-lg bg-linear-to-br from-blue-50 to-purple-50 border border-blue-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg mb-1">📦</div>
              <div className="text-xs font-medium text-gray-700">9 Layouts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Individual Components Section */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Components</h3>
        <div className="space-y-2">
          {insertComponentTypes.map((component) => (
            <button
              key={component.id}
              onClick={() => onInsertComponent(component.id)}
              className="w-full flex items-start gap-3 p-2.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
            >
              <component.icon className="h-4 w-4 text-gray-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="font-medium text-sm text-gray-900">{component.name}</div>
                <div className="text-xs text-gray-500 truncate">{component.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
