'use client';

import { Layers, Plus, Sparkles } from 'lucide-react';

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
    <div className="pt-4 px-1">
      {/* Content Block Templates Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Content Blocks</h3>
            <p className="text-xs text-gray-500">Pre-built sections</p>
          </div>
        </div>
        <button
          onClick={onOpenBlockModal}
          className="w-full p-4 rounded-xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 transition-all text-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Sparkles className="h-6 w-6 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-semibold text-purple-700">Browse Templates</div>
          <div className="text-xs text-purple-600 mt-1">Hero, Features, Gallery & more</div>
        </button>
      </div>

      {/* Gradient Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium text-gray-500">Building Blocks</span>
        </div>
      </div>

      {/* Individual Components Section */}
      <div className="pb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Components</h3>
            <p className="text-xs text-gray-500">Drag & drop elements</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {insertComponentTypes.map((component) => {
            // Assign gradient colors based on component type
            const gradients: Record<string, string> = {
              'text': 'from-blue-500 to-blue-600',
              'heading': 'from-indigo-500 to-purple-600',
              'image': 'from-pink-500 to-rose-600',
              'button': 'from-green-500 to-emerald-600',
              'video': 'from-red-500 to-orange-600',
              'divider': 'from-gray-400 to-gray-500',
              'card': 'from-violet-500 to-purple-600',
              'carousel': 'from-amber-500 to-yellow-600',
              'bullet-list': 'from-teal-500 to-cyan-600',
              'collapsible-list': 'from-sky-500 to-blue-600',
              'timer': 'from-fuchsia-500 to-pink-600',
              'social': 'from-rose-500 to-pink-500',
              'faqs': 'from-lime-500 to-green-600',
              'banner-full': 'from-purple-600 to-indigo-600',
              'banner-minimal': 'from-slate-600 to-gray-700',
              'footer': 'from-gray-700 to-slate-800',
            };
            
            const gradient = gradients[component.id] || 'from-blue-500 to-cyan-500';
            
            return (
              <button
                key={component.id}
                onClick={() => onInsertComponent(component.id)}
                className="group relative flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-200 bg-white overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
                
                {/* Icon with Gradient Background */}
                <div className={`relative h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                  <component.icon className="h-5 w-5 text-white" />
                </div>
                
                {/* Component Name */}
                <div className="relative font-semibold text-xs text-gray-900 group-hover:text-gray-900 transition-colors text-center leading-tight">
                  {component.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

