'use client';

import React, { useState } from 'react';
import { GripVertical, Trash2, Settings, Plus } from 'lucide-react';
import ComponentRenderer from './ComponentRenderer';

interface Component {
  id: string;
  type: string;
  props: Record<string, any>;
  styles?: Record<string, any>;
}

interface Section {
  id: string;
  components: Component[];
  layout: {
    direction: 'row' | 'column';
    justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    gap: number;
    padding: number;
    backgroundColor?: string;
  };
  order: number;
}

interface SectionWrapperProps {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
  onUpdateComponent: (componentId: string, updates: any) => void;
  onDeleteComponent: (componentId: string) => void;
  onCopyComponent: (componentId: string) => void;
  onComponentClick: (component: Component, e: React.MouseEvent) => void;
  onShowImageModal: (componentId: string) => void;
  onShowButtonModal: (componentId: string) => void;
  onShowTextToolbar: (componentId: string, rect: DOMRect) => void;
  setSelectedComponent: (component: Component) => void;
  selectedComponentId: string | null;
  themeColors: any;
  themeFonts: any;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
}

export default function SectionWrapper({
  section,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onUpdateComponent,
  onDeleteComponent,
  onCopyComponent,
  onComponentClick,
  onShowImageModal,
  onShowButtonModal,
  onShowTextToolbar,
  setSelectedComponent,
  selectedComponentId,
  themeColors,
  themeFonts,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
}: SectionWrapperProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`
        relative group transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      style={{
        backgroundColor: section.layout.backgroundColor || 'transparent',
        padding: `${section.layout.padding}px`,
      }}
    >
      {/* Section Toolbar */}
      {isSelected && (
        <div className="absolute -top-12 left-0 right-0 flex justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-2 flex gap-2 items-center">
            <button
              className="p-2 hover:bg-gray-100 rounded cursor-move"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-gray-600" />
            </button>
            
            <div className="w-px h-6 bg-gray-300"></div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              className={`p-2 hover:bg-gray-100 rounded ${showSettings ? 'bg-gray-100' : ''}`}
              title="Section Settings"
            >
              <Settings className="h-4 w-4 text-gray-600" />
            </button>

            <div className="w-px h-6 bg-gray-300"></div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 hover:bg-red-100 rounded text-red-600"
              title="Delete Section"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Section Settings Panel */}
      {isSelected && showSettings && (
        <div className="absolute -top-12 left-0 right-0 flex justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-4 mt-12 w-96">
            <h3 className="font-semibold text-sm mb-3 text-gray-900">Section Layout</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Direction</label>
                <select
                  value={section.layout.direction}
                  onChange={(e) =>
                    onUpdate({
                      layout: {
                        ...section.layout,
                        direction: e.target.value as 'row' | 'column',
                      },
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="row">Horizontal (Row)</option>
                  <option value="column">Vertical (Column)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Justify Content</label>
                <select
                  value={section.layout.justifyContent}
                  onChange={(e) =>
                    onUpdate({
                      layout: {
                        ...section.layout,
                        justifyContent: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="flex-start">Start</option>
                  <option value="center">Center</option>
                  <option value="flex-end">End</option>
                  <option value="space-between">Space Between</option>
                  <option value="space-around">Space Around</option>
                  <option value="space-evenly">Space Evenly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Align Items</label>
                <select
                  value={section.layout.alignItems}
                  onChange={(e) =>
                    onUpdate({
                      layout: {
                        ...section.layout,
                        alignItems: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="flex-start">Start</option>
                  <option value="center">Center</option>
                  <option value="flex-end">End</option>
                  <option value="stretch">Stretch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gap: {section.layout.gap}px</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={section.layout.gap}
                  onChange={(e) =>
                    onUpdate({
                      layout: {
                        ...section.layout,
                        gap: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Padding: {section.layout.padding}px</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={section.layout.padding}
                  onChange={(e) =>
                    onUpdate({
                      layout: {
                        ...section.layout,
                        padding: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Background Color</label>
                <input
                  type="color"
                  value={section.layout.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    onUpdate({
                      layout: {
                        ...section.layout,
                        backgroundColor: e.target.value,
                      },
                    })
                  }
                  className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Content */}
      <div
        className="flex"
        style={{
          flexDirection: section.layout.direction,
          justifyContent: section.layout.justifyContent,
          alignItems: section.layout.alignItems,
          gap: `${section.layout.gap}px`,
        }}
      >
        {section.components.map((component) => (
          <div
            key={component.id}
            className="shrink-0"
            style={{
              width: component.props.width || 'auto',
              maxWidth: '100%',
            }}
          >
            <ComponentRenderer
              component={component}
              isSelected={selectedComponentId === component.id}
              themeColors={themeColors}
              themeFonts={themeFonts}
              onComponentClick={(comp, e) => onComponentClick(comp, e)}
              onUpdateComponent={(id, updates) => onUpdateComponent(id, updates)}
              onCopyComponent={() => onCopyComponent(component.id)}
              onDeleteComponent={() => onDeleteComponent(component.id)}
              onShowImageModal={() => onShowImageModal(component.id)}
              onShowButtonModal={() => onShowButtonModal(component.id)}
              onShowTextToolbar={(rect) => onShowTextToolbar(component.id, rect)}
              setSelectedComponent={setSelectedComponent}
            />
          </div>
        ))}
      </div>

      {/* Empty section placeholder */}
      {section.components.length === 0 && (
        <div className="flex items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-300 rounded">
          <div className="text-center">
            <Plus className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Add components to this section</p>
          </div>
        </div>
      )}
    </div>
  );
}
