'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Settings, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import ComponentRenderer from './ComponentRenderer';

interface Component {
  id: string;
  type: string;
  props: Record<string, any>;
  styles?: Record<string, any>;
}

interface Section {
  id: string;
  sectionName?: string;
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
  isFirstSection?: boolean;
  isLastSection?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onUpdateComponent: (componentId: string, updates: any) => void;
  onDeleteComponent: (componentId: string) => void;
  onCopyComponent: (componentId: string) => void;
  onComponentClick: (component: Component, e: React.MouseEvent) => void;
  onShowImageModal: (componentId: string) => void;
  onShowTextToolbar: (componentId: string, rect: DOMRect) => void;
  onShowButtonModal?: (componentId: string) => void;
  setSelectedComponent: (component: Component) => void;
  selectedComponentId: string | null;
  themeColors: any;
  themeFonts: any;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging: boolean;
  onComponentDragStart?: (componentId: string, sectionId: string) => void;
  onComponentDragEnd?: () => void;
  onComponentDragOver?: (componentId: string) => void;
  onComponentDrop?: (targetComponentId: string, sectionId: string) => void;
  draggedComponentId?: string | null;
  onOpenCardGridModal?: (sectionId: string) => void;
}

export default function SectionWrapper({
  section,
  isFirstSection,
  isLastSection,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpdateComponent,
  onDeleteComponent,
  onCopyComponent,
  onComponentClick,
  onShowImageModal,
  onShowTextToolbar,
  onShowButtonModal,
  setSelectedComponent,
  selectedComponentId,
  themeColors,
  themeFonts,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  onComponentDragStart,
  onComponentDragEnd,
  onComponentDragOver,
  onComponentDrop,
  draggedComponentId,
  onOpenCardGridModal,
}: SectionWrapperProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isInteractingWithSlider, setIsInteractingWithSlider] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  
  // Auto-fix section layout when it has multiple cards
  useEffect(() => {
    const cardCount = section.components.filter(c => c.type === 'card').length;
    if (cardCount >= 2 && section.layout.direction !== 'row') {
      console.log(`[SectionWrapper] Auto-fixing section ${section.id} to row layout (${cardCount} cards)`);
      onUpdate({
        layout: {
          ...section.layout,
          direction: 'row',
        },
      });
    }
  }, [section.components, section.layout.direction, section.id, onUpdate]);

  // Check if this section contains a footer or banner component
  const hasFooterOrBanner = section.components.some(c => c.type === 'footer' || c.type === 'banner');
  const hasFooter = section.components.some(c => c.type === 'footer');

  // Close settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      // Use setTimeout to avoid immediate closure on the same click that opened it
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSettings]);

  // Close settings when section is deselected
  useEffect(() => {
    if (!isSelected) {
      setShowSettings(false);
    }
  }, [isSelected]);

  return (
    <div
      id={`section-${section.id}`}
  draggable={!isInteractingWithSlider}
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
        marginTop: hasFooterOrBanner ? '16px' : '0',
        marginBottom: hasFooterOrBanner ? '16px' : '0',
        overflow: 'visible', // Allow toolbars to show above section
      }}
    >
      {/* Section Toolbar */}
      {isSelected && (
        <div className="absolute -top-12 left-0 right-0 flex justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-2 flex gap-2 items-center">
            {/* Move Up Button */}
            {!isFirstSection && !hasFooter && onMoveUp && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp();
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Move Section Up"
                >
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
              </>
            )}
            
            {/* Move Down Button */}
            {!isLastSection && !hasFooter && onMoveDown && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown();
                  }}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Move Section Down"
                >
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
              </>
            )}
            
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

            {!hasFooter && (
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
            )}
          </div>
        </div>
      )}

      {/* Section Settings Panel */}
      {isSelected && showSettings && (
        <div ref={settingsRef} className="fixed top-24 left-1/2 transform -translate-x-1/2 z-10000">
          <div className="bg-white rounded-lg shadow-xl border-2 border-blue-500 p-4 mt-12 w-96">
            <h3 className="font-semibold text-sm mb-3 text-gray-900">Section Settings</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Section Name (for navigation)</label>
                <input
                  type="text"
                  value={section.sectionName || ''}
                  onChange={(e) =>
                    onUpdate({
                      sectionName: e.target.value,
                    })
                  }
                  placeholder="e.g., Home, About, Features"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={(section as any).showInNavbar === true}
                    onChange={(e) =>
                      onUpdate({
                        showInNavbar: e.target.checked,
                      } as any)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Show in Navigation Bar
                </label>
              </div>
              
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
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsInteractingWithSlider(true);
                  }}
                  onMouseUp={() => {
                    setIsInteractingWithSlider(false);
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setIsInteractingWithSlider(true);
                  }}
                  onPointerUp={() => {
                    setIsInteractingWithSlider(false);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setIsInteractingWithSlider(true);
                  }}
                  onTouchEnd={() => {
                    setIsInteractingWithSlider(false);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdate({
                      layout: {
                        ...section.layout,
                        gap: parseInt(e.target.value),
                      },
                    });
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Padding: {section.layout.padding}px</label>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={section.layout.padding}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setIsInteractingWithSlider(true);
                  }}
                  onMouseUp={() => {
                    setIsInteractingWithSlider(false);
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setIsInteractingWithSlider(true);
                  }}
                  onPointerUp={() => {
                    setIsInteractingWithSlider(false);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setIsInteractingWithSlider(true);
                  }}
                  onTouchEnd={() => {
                    setIsInteractingWithSlider(false);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdate({
                      layout: {
                        ...section.layout,
                        padding: parseInt(e.target.value),
                      },
                    });
                  }}
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
          alignItems: hasFooterOrBanner ? 'stretch' : section.layout.alignItems, // Banners/footers need full width
          flexWrap: section.layout.direction === 'row' ? 'wrap' as const : 'nowrap' as const,
          gap: `${section.layout.gap}px`,
        }}
      >
        {section.components.map((component) => {
          // Check if component has its own alignment (text, heading, button)
          const hasOwnAlignment = (component.type === 'text' || component.type === 'heading' || component.type === 'button') && component.props.align;
          
          // Calculate alignment override based on component's align property
          let alignSelf = 'auto';
          if (hasOwnAlignment) {
            if (component.props.align === 'left') {
              alignSelf = 'flex-start';
            } else if (component.props.align === 'center') {
              alignSelf = 'center';
            } else if (component.props.align === 'right') {
              alignSelf = 'flex-end';
            }
          }
          
          return (
            <div
              key={component.id}
              draggable={!isInteractingWithSlider}
              onDragStart={(e) => {
                e.stopPropagation();
                onComponentDragStart?.(component.id, section.id);
              }}
              onDragEnd={(e) => {
                e.stopPropagation();
                onComponentDragEnd?.();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onComponentDragOver?.(component.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onComponentDrop?.(component.id, section.id);
              }}
              className={`shrink-0 transition-all ${
                draggedComponentId === component.id ? 'opacity-50' : 'opacity-100'
              }`}
              style={{
                width: hasOwnAlignment
                  ? '100%'
                  : (component.type === 'card'
                      ? (component.props.width || 'auto')
                      : (component.type === 'carousel' ? '100%' : (component.props.width || 'auto'))),
                maxWidth: '100%',
                alignSelf: alignSelf,
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
                onShowTextToolbar={(rect) => onShowTextToolbar(component.id, rect)}
                onShowButtonModal={onShowButtonModal ? () => onShowButtonModal(component.id) : undefined}
                setSelectedComponent={setSelectedComponent}
                onOpenCardGridModal={onOpenCardGridModal ? () => onOpenCardGridModal(section.id) : undefined}
                onInteractionStateChange={setIsInteractingWithSlider}
              />
            </div>
          );
        })}
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
