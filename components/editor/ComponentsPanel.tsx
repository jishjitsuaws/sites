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
}

export default function ComponentsPanel({ 
  insertComponentTypes, 
  onInsertComponent,
  onOpenBlockModal
}: ComponentsPanelProps) {
  return (
    <div className="pt-4">
      {/* Content Block Templates Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Content Blocks</h3>
          <Layers className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <button
          onClick={onOpenBlockModal}
          className="w-full p-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group"
        >
          <Plus className="h-5 w-5 mx-auto mb-1 text-gray-400 group-hover:text-blue-600" />
          <div className="text-xs font-medium text-gray-600 group-hover:text-blue-600">Browse Templates</div>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Individual Components Section */}
      <div className="pb-4">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Components</h3>
        <div className="grid grid-cols-2 gap-2">
          {insertComponentTypes.map((component) => (
            <button
              key={component.id}
              onClick={() => onInsertComponent(component.id)}
              className="flex flex-col items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
            >
              <component.icon className="h-5 w-5 text-gray-600 shrink-0" />
              <div className="min-w-0 w-full">
                <div className="font-medium text-xs text-gray-900 truncate">{component.name}</div>
                <div className="text-xs text-gray-500 truncate">{component.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
