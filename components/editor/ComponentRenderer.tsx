 'use client';

import { Copy, Trash2, AlignLeft, AlignCenter, AlignRight, Settings, Link as LinkIcon, Image as ImageIcon, Video, Type, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { sanitizeText, sanitizeHtml, sanitizeUrl } from '@/lib/sanitize';
import { getImageUrl, getYouTubeEmbedUrl } from '@/lib/utils';

// Timer Component with real-time countdown
function TimerComponent({ component, themeColors, themeFonts, isSelected, onUpdateComponent, onDeleteComponent }: any) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!component.props.targetDate) {
        setTimeLeft({ days: 30, hours: 12, minutes: 45, seconds: 23 });
        return;
      }

      const difference = new Date(component.props.targetDate).getTime() - Date.now();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [component.props.targetDate]);

  return (
    <div 
      className="text-center p-8 rounded-lg"
      style={{
        backgroundColor: component.props.backgroundColor || 'transparent',
        color: component.props.textColor || themeColors.text,
      }}
    >
      <h3 
        className="text-xl font-semibold mb-4"
        style={{ fontFamily: themeFonts.heading }}
      >
        {component.props.title || 'Countdown Timer'}
      </h3>
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div 
            className="text-2xl font-bold"
            style={{ color: themeColors.primary }}
          >
            {timeLeft.days}
          </div>
          <div className="text-xs text-gray-600 uppercase font-medium">
            Days
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div 
            className="text-2xl font-bold"
            style={{ color: themeColors.primary }}
          >
            {timeLeft.hours}
          </div>
          <div className="text-xs text-gray-600 uppercase font-medium">
            Hours
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div 
            className="text-2xl font-bold"
            style={{ color: themeColors.primary }}
          >
            {timeLeft.minutes}
          </div>
          <div className="text-xs text-gray-600 uppercase font-medium">
            Minutes
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div 
            className="text-2xl font-bold"
            style={{ color: themeColors.primary }}
          >
            {timeLeft.seconds}
          </div>
          <div className="text-xs text-gray-600 uppercase font-medium">
            Seconds
          </div>
        </div>
      </div>

      {/* Timer Settings Toolbar */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-white shadow-lg rounded-lg border p-2 flex items-center gap-2 text-gray-600 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const title = prompt('Enter timer title:', component.props.title || '');
              if (title !== null) {
                onUpdateComponent(component.id, {
                  ...component,
                  props: { ...component.props, title }
                });
              }
            }}
            className="px-2 py-1 hover:bg-gray-100 rounded text-sm"
            title="Edit Title"
          >
            Title
          </button>
          <div className="w-px bg-gray-300"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const targetDate = prompt('Enter target date (YYYY-MM-DD):', component.props.targetDate || '');
              if (targetDate !== null) {
                onUpdateComponent(component.id, {
                  ...component,
                  props: { ...component.props, targetDate }
                });
              }
            }}
            className="px-2 py-1 hover:bg-gray-100 rounded text-sm"
            title="Set Target Date"
          >
            Date
          </button>
          <div className="w-px bg-gray-300"></div>
          <div className="px-2 py-1.5 flex items-center gap-2">
            <span className="text-xs">Color:</span>
            <input
              type="color"
              value={component.props.backgroundColor || themeColors.primary}
              onChange={(e) => {
                e.stopPropagation();
                onUpdateComponent(component.id, {
                  ...component,
                  props: { ...component.props, backgroundColor: e.target.value }
                });
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded cursor-pointer border border-gray-300"
              title="Background Color"
            />
            <input
              type="text"
              value={component.props.backgroundColor || themeColors.primary}
              onChange={(e) => {
                e.stopPropagation();
                const newColor = e.target.value;
                if (newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                  onUpdateComponent(component.id, {
                    ...component,
                    props: { ...component.props, backgroundColor: newColor }
                  });
                }
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder="#000000"
              className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
              title="Hex Color Code"
            />
          </div>
          <div className="w-px bg-gray-300"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteComponent();
            }}
            className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
            title="Delete Timer"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

interface ComponentData {
  id: string;
  type: string;
  props: any;
}

interface ComponentRendererProps {
  component: ComponentData;
  isSelected: boolean;
  themeColors: any;
  themeFonts: any;
  onComponentClick: (component: ComponentData, e: React.MouseEvent) => void;
  onUpdateComponent: (id: string, updated: ComponentData) => void;
  onCopyComponent: () => void;
  onDeleteComponent: () => void;
  onShowImageModal: () => void;
  onShowTextToolbar: (rect: DOMRect) => void;
  setSelectedComponent: (component: ComponentData) => void;
  onOpenCardGridModal?: () => void;
}

export default function ComponentRenderer({
  component,
  isSelected,
  themeColors,
  themeFonts,
  onComponentClick,
  onUpdateComponent,
  onCopyComponent,
  onDeleteComponent,
  onShowImageModal,
  onShowTextToolbar,
  setSelectedComponent,
  onOpenCardGridModal,
}: ComponentRendererProps) {
  
  const isFloating = component.type === 'image' && component.props.float && component.props.float !== 'none';
  const isBanner = component.type === 'banner';
  const isFooter = component.type === 'footer';
  // For carousel autoplay (safe to declare regardless of component type)
  const [carouselHover, setCarouselHover] = useState(false);

  // Autoplay logic for Carousel in editor preview
  useEffect(() => {
    if (component.type !== 'carousel') return;
    const autoplay = !!component.props?.autoplay;
    const intervalMs = Number(component.props?.autoplayInterval) || 3000;
    const imagesLen = Array.isArray(component.props?.images) ? component.props.images.length : 0;
    if (!autoplay || imagesLen <= 1 || carouselHover) return;

    const timer = setInterval(() => {
      const len = imagesLen || 1;
      const next = ((component.props?.currentIndex || 0) + 1) % len;
      onUpdateComponent(component.id, { ...component, props: { ...component.props, currentIndex: next } });
    }, Math.max(1000, intervalMs));

    return () => clearInterval(timer);
  }, [component, onUpdateComponent, carouselHover]);
  
  return (
    <div
      data-component-id={component.id}
      className={`group relative transition-all ${
        isBanner || isFooter
          ? '' // No padding or borders for banner and footer
          : `border-2 rounded p-4 ${
              isSelected 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-transparent hover:border-blue-300'
            }`
      }`}
      style={{
        display: isFloating ? 'inline-block' : 'block',
        width: isFloating ? 'fit-content' : '100%',
        float: isFloating ? component.props.float : 'none',
        marginRight: isFloating && component.props.float === 'left' ? '20px' : '0',
        marginLeft: isFloating && component.props.float === 'right' ? '20px' : '0',
        marginBottom: (isBanner || isFooter) ? '0' : '16px',
        maxWidth: '100%',
        position: 'relative',
        // Allow full-bleed banner/footer content (which uses negative margins) to be visible
        overflow: (isBanner || isFooter) ? 'visible' : 'visible',
        zIndex: isSelected ? 50 : 1,
        outline: (isBanner || isFooter) && isSelected ? '2px solid #60a5fa' : 'none',
        outlineOffset: (isBanner || isFooter) && isSelected ? '2px' : '0',
      }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        // Allow clicks on contentEditable elements
        if (target.contentEditable !== 'true') {
          onComponentClick(component, e);
        }
      }}
    >
      {/* Text/Heading Component */}
      {(component.type === 'heading' || component.type === 'text') && (
        <div style={{ 
          textAlign: component.props.align,
          position: 'relative'
        }}>
          <div
            className="outline-none cursor-text min-h-[1.5em] inline-block relative"
            style={{
              fontSize: component.props.fontSize || 16,
              fontFamily: `'${component.props.fontFamily || themeFonts.body}', sans-serif`,
              fontWeight: component.props.bold ? 'bold' : 'normal',
              fontStyle: component.props.italic ? 'italic' : 'normal',
              textDecoration: component.props.underline ? 'underline' : 'none',
              color: component.props.color || themeColors.text,
              minWidth: '100px',
              maxWidth: component.props.width || '100%',
              width: component.props.width || 'auto',
              textAlign: component.props.align,
            }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const rawText = e.currentTarget.textContent || '';
              const newText = sanitizeText(rawText);
              if (newText !== component.props.text) {
                onUpdateComponent(component.id, {
                  ...component,
                  props: { ...component.props, text: newText }
                });
              }
            }}
            onFocus={(e) => {
              // Select component first if not already selected
              if (!isSelected) {
                onComponentClick(component, e as any);
              }
              
              setSelectedComponent(component);
              const element = e.currentTarget as HTMLElement;
              const rect = element.getBoundingClientRect();
              
              // Use absolute screen coordinates for fixed positioning
              const absoluteRect = {
                x: rect.left,
                y: rect.top,
                left: rect.left,
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height,
                toJSON: () => ({})
              } as DOMRect;
              onShowTextToolbar(absoluteRect);
            }}
            onClick={(e) => {
              e.stopPropagation();
              // Also select component on click
              if (!isSelected) {
                onComponentClick(component, e);
              }
            }}
          >
            {component.props.text}
          </div>
          
          {/* Resize Handles for Text - Corner dots */}
          {isSelected && (
            <>
              {/* Bottom-left resize handle */}
              <div
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform z-10"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const textElement = e.currentTarget.parentElement?.querySelector('[contenteditable]') as HTMLElement;
                  const startX = e.clientX;
                  const startWidth = textElement?.offsetWidth || 300;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const deltaX = startX - moveEvent.clientX; // Inverted for left handle
                    const newWidth = Math.max(100, Math.min(1200, startWidth + deltaX));
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, width: `${newWidth}px` }
                    });
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              {/* Bottom-right resize handle */}
              <div
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-ew-resize hover:scale-125 transition-transform z-10"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const textElement = e.currentTarget.parentElement?.querySelector('[contenteditable]') as HTMLElement;
                  const startX = e.clientX;
                  const startWidth = textElement?.offsetWidth || 300;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const deltaX = moveEvent.clientX - startX;
                    const newWidth = Math.max(100, Math.min(1200, startWidth + deltaX));
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, width: `${newWidth}px` }
                    });
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            </>
          )}
        </div>
      )}

      {/* Image Component */}
      {component.type === 'image' && (
        <div style={{ 
          textAlign: (!component.props.float || component.props.float === 'none') ? (component.props.align || 'center') : undefined,
        }}>
          <div className="relative inline-block">
            {/* Inline Image Controls - Always show when selected */}
            {isSelected && (
              <div 
                className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-2 flex gap-1 whitespace-nowrap"
                style={{
                  top: '-56px',
                  left: '0',
                  zIndex: 1000,
                  minWidth: 'max-content',
                }}
              >
                {/* Only show alignment and settings if image has src */}
                {component.props.src && (
                  <>
                    {/* Position Control */}
                    <div className="flex items-center gap-1 px-2 border-r border-gray-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { ...component.props, float: 'left', align: 'left' }
                          });
                        }}
                        className={`p-1.5 rounded ${component.props.float === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Align Left"
                      >
                        <AlignLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { ...component.props, float: 'none', align: 'center' }
                          });
                        }}
                        className={`p-1.5 rounded ${!component.props.float || component.props.float === 'none' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Align Center"
                      >
                        <AlignCenter className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { ...component.props, float: 'right', align: 'right' }
                          });
                        }}
                        className={`p-1.5 rounded ${component.props.float === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                        title="Align Right"
                      >
                        <AlignRight className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="w-px bg-gray-300"></div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowImageModal();
                      }}
                      className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                      title="Crop"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Crop
                    </button>
                    <div className="w-px bg-gray-300"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = prompt('Enter link URL:', component.props.link || '');
                        if (link !== null) {
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { ...component.props, link }
                          });
                        }
                      }}
                      className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                      title="Add/Edit Link"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Link
                    </button>
                    <div className="w-px bg-gray-300"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopyComponent();
                      }}
                      className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                    <div className="w-px bg-gray-300"></div>
                  </>
                )}
                
                {/* Upload button for images without src */}
                {!component.props.src && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowImageModal();
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm flex items-center gap-1.5 transition-colors"
                      title="Upload Image"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Upload Image
                    </button>
                    <div className="w-px bg-gray-300"></div>
                  </>
                )}
                
                {/* Delete button - always show */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteComponent();
                  }}
                  className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}

            {component.props.src ? (
              <div 
                className="inline-block relative"
                style={{
                  width: component.props.width || '400px',
                  maxWidth: '100%',
                }}
              >
                <img
                  src={getImageUrl(component.props.src)}
                  alt={component.props.alt || ''}
                  className="w-full rounded"
                  style={{
                    objectFit: 'contain',
                    width: '100%',
                    height: 'auto',
                  }}
                />
                
                {/* Resize Handles - Use only width-based resizing to maintain aspect ratio */}
                {isSelected && (
                  <>
                    {/* Bottom-right resize handle - resize width only, height auto-scales */}
                    <div
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-lg"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = parseInt(component.props.width) || 400;
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = moveEvent.clientX - startX;
                          const newWidth = Math.max(100, Math.min(1400, startWidth + deltaX));
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { 
                              ...component.props, 
                              width: `${newWidth}px`,
                              height: undefined, // Remove height to maintain aspect ratio
                              objectFit: 'contain'
                            }
                          });
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                    
                    {/* Bottom-left resize handle */}
                    <div
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-lg"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = parseInt(component.props.width) || 400;
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = startX - moveEvent.clientX;
                          const newWidth = Math.max(100, Math.min(1400, startWidth + deltaX));
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { 
                              ...component.props, 
                              width: `${newWidth}px`,
                              height: undefined, // Remove height to maintain aspect ratio
                              objectFit: 'contain'
                            }
                          });
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                    
                    {/* Top-right resize handle */}
                    <div
                      className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-lg"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = parseInt(component.props.width) || 400;
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = moveEvent.clientX - startX;
                          const newWidth = Math.max(100, Math.min(1400, startWidth + deltaX));
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { 
                              ...component.props, 
                              width: `${newWidth}px`,
                              height: undefined, // Remove height to maintain aspect ratio
                              objectFit: 'contain'
                            }
                          });
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                    
                    {/* Top-left resize handle */}
                    <div
                      className="absolute -top-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-lg"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = parseInt(component.props.width) || 400;
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = startX - moveEvent.clientX;
                          const newWidth = Math.max(100, Math.min(1400, startWidth + deltaX));
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { 
                              ...component.props, 
                              width: `${newWidth}px`,
                              height: undefined, // Remove height to maintain aspect ratio
                              objectFit: 'contain'
                            }
                          });
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    />
                  </>
                )}
              </div>
            ) : (
              <div 
                className="bg-gray-200 h-48 flex items-center justify-center text-gray-400 cursor-pointer rounded"
              >
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>Click to upload an image</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Button Component */}
      {component.type === 'button' && (
        <div style={{ 
          textAlign: component.props.align || 'center',
          position: 'relative'
        }}>
          <div className="inline-block relative" style={{ zIndex: isSelected ? 10 : 'auto' }}>
            {/* Inline Button Controls with Text and Color Editing */}
            {isSelected && (
              <div 
                className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-2 flex gap-2 items-center flex-wrap"
                style={{
                  top: '-68px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                  minWidth: '600px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Button Text Input */}
                <input
                  type="text"
                  value={component.props.text || 'Button'}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, text: e.target.value }
                    });
                  }}
                  placeholder="Button text"
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 w-24"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Link Input */}
                <input
                  type="text"
                  value={component.props.href || '#'}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, href: e.target.value }
                    });
                  }}
                  placeholder="Link URL"
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 w-32"
                  onClick={(e) => e.stopPropagation()}
                />
                
                <div className="w-px bg-gray-300 h-6"></div>
                
                <select
                  value={component.props.variant || 'primary'}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, variant: e.target.value }
                    });
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                  <option value="text">Text</option>
                </select>
                
                <div className="w-px bg-gray-300 h-6"></div>
                
                {/* Text Color Picker */}
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-600 font-medium" title="Text Color">Text</label>
                  <input
                    type="color"
                    value={component.props.textColor || '#ffffff'}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, textColor: e.target.value }
                      });
                    }}
                    className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                    title="Text Color"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                {/* Button Background Color Picker */}
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-600 font-medium" title="Button Color">Bg</label>
                  <input
                    type="color"
                    value={component.props.buttonColor || themeColors.primary}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, buttonColor: e.target.value }
                      });
                    }}
                    className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                    title="Button Background Color"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div className="w-px bg-gray-300 h-6"></div>
                
                {/* Alignment Icons */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, align: 'left' }
                    });
                  }}
                  className={`p-1.5 rounded transition-colors ${component.props.align === 'left' ? 'bg-blue-100 text-blue-600' : 'text-gray-900 hover:bg-gray-100'}`}
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, align: 'center' }
                    });
                  }}
                  className={`p-1.5 rounded transition-colors ${component.props.align === 'center' ? 'bg-blue-100 text-blue-600' : 'text-gray-900 hover:bg-gray-100'}`}
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, align: 'right' }
                    });
                  }}
                  className={`p-1.5 rounded transition-colors ${component.props.align === 'right' ? 'bg-blue-100 text-blue-600' : 'text-gray-900 hover:bg-gray-100'}`}
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
                
                <div className="w-px bg-gray-300 h-6"></div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyComponent();
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-900"
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteComponent();
                  }}
                  className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <button 
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: component.props.buttonColor || (
                  component.props.variant === 'primary' 
                    ? themeColors.primary 
                    : component.props.variant === 'secondary'
                    ? themeColors.secondary
                    : 'transparent'
                ),
                color: component.props.textColor || (
                  component.props.variant === 'outline' || component.props.variant === 'text' 
                    ? themeColors.primary 
                    : '#ffffff'
                ),
                border: component.props.variant === 'outline' ? `2px solid ${component.props.buttonColor || themeColors.primary}` : 'none',
              }}
            >
              {component.props.text}
            </button>
          </div>
        </div>
      )}

      {/* Divider Component */}
      {component.type === 'divider' && (
        <div style={{ clear: 'both', position: 'relative' }}>
          {/* Inline toolbar for dividers */}
          {isSelected && (
            <div 
              className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-2 flex gap-1 whitespace-nowrap"
              style={{
                top: component.props.style === 'none' || component.props.style === 'spacer' ? '50%' : '-56px',
                left: '50%',
                transform: component.props.style === 'none' || component.props.style === 'spacer' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
                zIndex: 1000,
                minWidth: 'max-content',
              }}
            >
              {component.props.style === 'none' && (
                <span className="px-2 py-1 text-sm text-gray-600">Float Clearfix (invisible)</span>
              )}
              {component.props.style === 'spacer' && (
                <>
                  <span className="px-2 py-1 text-sm text-gray-600">Spacer:</span>
                  <input
                    type="number"
                    value={parseInt(component.props.height) || 40}
                    onChange={(e) => {
                      e.stopPropagation();
                      const height = Math.max(10, Math.min(200, parseInt(e.target.value) || 40));
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, height: `${height}px` }
                      });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                    min="10"
                    max="200"
                    title="Spacer Height (px)"
                  />
                  <span className="text-xs text-gray-600">px</span>
                </>
              )}
              {component.props.style !== 'none' && component.props.style !== 'spacer' && (
                <>
                  <select
                    value={component.props.style || 'solid'}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, style: e.target.value }
                      });
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="spacer">Spacer</option>
                  </select>
                  <div className="w-px bg-gray-300"></div>
                </>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent();
                }}
                className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
          
          {component.props.style === 'spacer' ? (
            <div style={{ height: component.props.height || '40px' }} />
          ) : component.props.style !== 'none' ? (
            <hr style={{ borderColor: component.props.color, borderStyle: component.props.style }} />
          ) : null}
        </div>
      )}

      {/* Social Media Component */}
      {component.type === 'social' && (
        <div className="relative flex justify-center items-center">
          {/* Social Media Toolbar */}
          {isSelected && (
            <div 
              className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-3 flex flex-col gap-2 whitespace-nowrap"
              style={{
                top: '-220px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                minWidth: 'max-content',
              }}
            >
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-700 whitespace-nowrap w-20">Instagram:</label>
                <input
                  type="text"
                  value={component.props.instagramUrl || ''}
                  onChange={(e) => {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, instagramUrl: e.target.value }
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Instagram URL"
                  className="w-64 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-700 whitespace-nowrap w-20">Facebook:</label>
                <input
                  type="text"
                  value={component.props.facebookUrl || ''}
                  onChange={(e) => {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, facebookUrl: e.target.value }
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Facebook URL"
                  className="w-64 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-700 whitespace-nowrap w-20">Twitter:</label>
                <input
                  type="text"
                  value={component.props.twitterUrl || ''}
                  onChange={(e) => {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, twitterUrl: e.target.value }
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Twitter URL"
                  className="w-64 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-700 whitespace-nowrap w-20">LinkedIn:</label>
                <input
                  type="text"
                  value={component.props.linkedinUrl || ''}
                  onChange={(e) => {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, linkedinUrl: e.target.value }
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="LinkedIn URL"
                  className="w-64 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-700 whitespace-nowrap w-20">YouTube:</label>
                <input
                  type="text"
                  value={component.props.youtubeUrl || ''}
                  onChange={(e) => {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, youtubeUrl: e.target.value }
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="YouTube URL"
                  className="w-64 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                />
              </div>
              
              <div className="border-t border-gray-300 pt-2 mt-1 flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={component.props.iconColor || themeColors.primary}
                    onChange={(e) => {
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, iconColor: e.target.value }
                      });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-6 h-6 rounded cursor-pointer border-none"
                    title="Icon Color"
                  />
                  <input
                    type="text"
                    value={component.props.iconColor || themeColors.primary}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newColor = e.target.value;
                      if (newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { ...component.props, iconColor: newColor }
                        });
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="#000000"
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                    title="Hex Color Code"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-700 whitespace-nowrap">Gap:</label>
                  <input
                    type="number"
                    value={component.props.iconGap || 16}
                    onChange={(e) => {
                      const gap = Math.max(0, Math.min(100, parseInt(e.target.value) || 16));
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, iconGap: gap }
                      });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                    min="0"
                    max="100"
                    title="Gap between icons (px)"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteComponent();
                  }}
                  className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                  title="Delete Social Links"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Social Icons Grid */}
          <div className="flex gap-4 items-center justify-center py-4">
            {/* Instagram Icon */}
            {component.props.instagramUrl && (
              <a
                href={component.props.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:scale-110 transition-transform"
                style={{ color: component.props.iconColor || themeColors.primary }}
              >
                <svg width={component.props.iconSize || 32} height={component.props.iconSize || 32} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}

            {/* Facebook Icon */}
            {component.props.facebookUrl && (
              <a
                href={component.props.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:scale-110 transition-transform"
                style={{ color: component.props.iconColor || themeColors.primary }}
              >
                <svg width={component.props.iconSize || 32} height={component.props.iconSize || 32} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}

            {/* Twitter Icon */}
            {component.props.twitterUrl && (
              <a
                href={component.props.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="hover:scale-110 transition-transform"
                style={{ color: component.props.iconColor || themeColors.primary }}
              >
                <svg width={component.props.iconSize || 32} height={component.props.iconSize || 32} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            )}
            
            {/* LinkedIn Icon */}
            {component.props.linkedinUrl && (
              <a
                href={component.props.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="hover:scale-110 transition-transform"
                style={{ color: component.props.iconColor || themeColors.primary }}
              >
                <svg width={component.props.iconSize || 32} height={component.props.iconSize || 32} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
            
            {/* YouTube Icon */}
            {component.props.youtubeUrl && (
              <a
                href={component.props.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="hover:scale-110 transition-transform"
                style={{ color: component.props.iconColor || themeColors.primary }}
              >
                <svg width={component.props.iconSize || 32} height={component.props.iconSize || 32} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Video Component */}
      {component.type === 'video' && (
        <div className="relative inline-block" style={{ maxWidth: '100%' }}>
          {/* Inline toolbar for videos */}
          {isSelected && (
            <div 
              className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-2 flex gap-1 whitespace-nowrap"
              style={{
                top: '-56px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                minWidth: 'max-content',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const url = prompt('Enter video URL (YouTube, Vimeo, etc.):', component.props.url || '');
                  if (url !== null) {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, url }
                    });
                  }
                }}
                className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                title="Set Video URL"
              >
                <Video className="h-4 w-4" />
                {component.props.url ? 'Change URL' : 'Add URL'}
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyComponent();
                }}
                className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent();
                }}
                className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
          
          {component.props.url ? (
            <div 
              className="relative"
              style={{ 
                width: component.props.width || '800px',
                maxWidth: '100%',
                aspectRatio: '16 / 9', // Maintain 16:9 aspect ratio
              }}
            >
              <iframe
                src={getYouTubeEmbedUrl(component.props.url)}
                title="Embedded video"
                className="w-full h-full rounded"
                allowFullScreen
              />
              
              {/* Resize Handles - Width only, height maintains 16:9 ratio */}
              {isSelected && (
                <>
                  {/* Bottom-right resize handle - resize width only */}
                  <div
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-lg z-10"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const startX = e.clientX;
                      const startWidth = parseInt(component.props.width) || 800;
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        const newWidth = Math.max(200, Math.min(1400, startWidth + deltaX));
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { 
                            ...component.props, 
                            width: `${newWidth}px`,
                            height: undefined // Remove height to use aspect ratio
                          }
                        });
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />
                  
                  {/* Bottom-left resize handle */}
                  <div
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-lg z-10"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const startX = e.clientX;
                      const startWidth = parseInt(component.props.width) || 800;
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = startX - moveEvent.clientX;
                        const newWidth = Math.max(200, Math.min(1400, startWidth + deltaX));
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { 
                            ...component.props, 
                            width: `${newWidth}px`,
                            height: undefined
                          }
                        });
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />
                  
                  {/* Top-right resize handle */}
                  <div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform shadow-lg z-10"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const startX = e.clientX;
                      const startWidth = parseInt(component.props.width) || 800;
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        const newWidth = Math.max(200, Math.min(1400, startWidth + deltaX));
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { 
                            ...component.props, 
                            width: `${newWidth}px`,
                            height: undefined
                          }
                        });
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />
                  
                  {/* Top-left resize handle */}
                  <div
                    className="absolute -top-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform shadow-lg z-10"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const startX = e.clientX;
                      const startWidth = parseInt(component.props.width) || 800;
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = startX - moveEvent.clientX;
                        const newWidth = Math.max(200, Math.min(1400, startWidth + deltaX));
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { 
                            ...component.props, 
                            width: `${newWidth}px`,
                            height: undefined
                          }
                        });
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />
                </>
              )}
            </div>
          ) : (
            <div className="bg-gray-200 h-64 flex items-center justify-center text-gray-400 rounded">
              <div className="text-center">
                <Video className="h-12 w-12 mx-auto mb-2" />
                <p>Click to add video URL</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Component */}
      {component.type === 'card' && (
        <div 
          className="relative flex flex-col rounded-lg border-2 transition-all"
          style={{
            backgroundColor: component.props.backgroundColor || '#ffffff',
            borderColor: component.props.borderColor || '#e5e7eb',
            padding: `${component.props.padding || 24}px`,
            flex: '1 1 300px',
            minWidth: '250px',
            maxWidth: '100%',
          }}
        >
          {/* Inline toolbar for card */}
          {isSelected && (
            <div 
              className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-2 flex gap-1 whitespace-nowrap"
              style={{
                top: '-56px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                minWidth: 'max-content',
              }}
            >
              {onOpenCardGridModal && (
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenCardGridModal(); }}
                  className="px-2 py-1 hover:bg-gray-100 rounded text-sm"
                  title="Configure Card Grid"
                >
                  Grid…
                </button>
              )}
              {onOpenCardGridModal && <div className="w-px bg-gray-300"></div>}
              <select
                value={component.props.cardType || 'text'}
                onChange={(e) => {
                  e.stopPropagation();
                  const cardType = e.target.value;
                  const newProps: any = {
                    ...component.props,
                    cardType,
                  };
                  
                  // Set defaults based on card type
                  if (cardType === 'icon' && !component.props.icon) {
                    newProps.icon = '⭐';
                  } else if (cardType === 'image' && !component.props.image) {
                    newProps.image = '';
                  }
                  
                  onUpdateComponent(component.id, {
                    ...component,
                    props: newProps
                  });
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="text">Text Only</option>
                <option value="icon">Icon Card</option>
                <option value="image">Image Card</option>
              </select>
              <div className="w-px bg-gray-300"></div>
              
              {/* Icon/Image specific controls */}
              {component.props.cardType === 'icon' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const icon = prompt('Enter emoji or icon:', component.props.icon || '⭐');
                      if (icon !== null) {
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { ...component.props, icon }
                        });
                      }
                    }}
                    className="px-2 py-1 hover:bg-gray-100 rounded text-sm"
                    title="Change Icon"
                  >
                    Icon: {component.props.icon || '⭐'}
                  </button>
                  <div className="w-px bg-gray-300"></div>
                </>
              )}
              
              {component.props.cardType === 'image' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowImageModal();
                    }}
                    className="px-2 py-1 hover:bg-gray-100 rounded text-sm flex items-center gap-1"
                    title="Upload Image"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {component.props.image ? 'Change' : 'Upload'}
                  </button>
                  <div className="w-px bg-gray-300"></div>
                </>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyComponent();
                }}
                className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent();
                }}
                className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}

          {/* Icon Card */}
          {component.props.cardType === 'icon' && (
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">{component.props.icon || '⭐'}</div>
            </div>
          )}

          {/* Image Card */}
          {component.props.cardType === 'image' && (
            <div className="mb-4">
              {component.props.image ? (
                <div 
                  className="w-full rounded-lg overflow-hidden"
                  style={{ 
                    height: `${component.props.imageFrameHeight || 180}px`,
                    maxHeight: `${component.props.imageFrameHeight || 180}px`,
                    minHeight: `${component.props.imageFrameHeight || 180}px`
                  }}
                >
                  <img
                    src={getImageUrl(component.props.image)}
                    alt={component.props.title || 'Card image'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
              ) : (
                <div 
                  className="w-full bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ 
                    height: `${component.props.imageFrameHeight || 180}px`,
                    maxHeight: `${component.props.imageFrameHeight || 180}px`,
                    minHeight: `${component.props.imageFrameHeight || 180}px`
                  }}
                  onClick={(e) => {
                    if (isSelected) {
                      e.stopPropagation();
                      onShowImageModal();
                    }
                  }}
                >
                  <div className="text-center text-gray-400">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Click to upload</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <h3 
            contentEditable={isSelected}
            suppressContentEditableWarning
            onBlur={(e) => {
              const newTitle = e.currentTarget.textContent || '';
              if (newTitle !== component.props.title) {
                onUpdateComponent(component.id, {
                  ...component,
                  props: { ...component.props, title: newTitle }
                });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            onClick={(e) => {
              if (isSelected) {
                e.stopPropagation();
              }
            }}
            className="text-xl font-bold mb-3 text-center outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            style={{ 
              fontFamily: `'${themeFonts.heading}', sans-serif`,
              color: themeColors.text,
              cursor: isSelected ? 'text' : 'default',
            }}
          >
            {component.props.title}
          </h3>
          
          <p 
            contentEditable={isSelected}
            suppressContentEditableWarning
            onBlur={(e) => {
              const newDescription = e.currentTarget.textContent || '';
              if (newDescription !== component.props.description) {
                onUpdateComponent(component.id, {
                  ...component,
                  props: { ...component.props, description: newDescription }
                });
              }
            }}
            onClick={(e) => {
              if (isSelected) {
                e.stopPropagation();
              }
            }}
            className="text-center outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            style={{ 
              fontFamily: `'${themeFonts.body}', sans-serif`,
              color: themeColors.textSecondary,
              fontSize: '14px',
              cursor: isSelected ? 'text' : 'default',
            }}
          >
            {component.props.description}
          </p>
        </div>
      )}

      {/* Carousel Component */}
      {component.type === 'carousel' && (
        <div className="relative w-full" style={{ position: 'relative' }} onMouseEnter={() => setCarouselHover(true)} onMouseLeave={() => setCarouselHover(false)}>
          {/* Inline toolbar when selected */}
          {isSelected && (
            <div 
              className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-2 flex gap-1 whitespace-nowrap"
              style={{ top: '-56px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, minWidth: 'max-content' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-gray-900"
                title="Previous slide"
                onClick={() => {
                  const len = (component.props.images || []).length || 0;
                  const next = ((component.props.currentIndex || 0) - 1 + len) % Math.max(1, len);
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, currentIndex: next } });
                }}
              >
                Prev
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-gray-900"
                title="Next slide"
                onClick={() => {
                  const len = (component.props.images || []).length || 0;
                  const next = ((component.props.currentIndex || 0) + 1) % Math.max(1, len);
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, currentIndex: next } });
                }}
              >
                Next
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-gray-900"
                title="Add slide"
                onClick={async () => {
                  const imgs = Array.isArray(component.props.images) ? [...component.props.images] : [];
                  if (imgs.length >= 5) return;
                  imgs.push({ src: '', alt: `Slide ${imgs.length + 1}` });
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, images: imgs, currentIndex: imgs.length - 1 } });
                }}
              >
                + Slide
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-gray-900"
                title="Remove current slide"
                onClick={() => {
                  const imgs = Array.isArray(component.props.images) ? [...component.props.images] : [];
                  if (imgs.length <= 1) return;
                  const idx = component.props.currentIndex || 0;
                  imgs.splice(idx, 1);
                  const next = Math.max(0, Math.min(idx, imgs.length - 1));
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, images: imgs, currentIndex: next } });
                }}
              >
                Delete Slide
              </button>
              <div className="w-px bg-gray-300"></div>
              <label className="px-2 py-1 hover:bg-gray-100 rounded text-sm cursor-pointer text-gray-900">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const inputEl = e.currentTarget as HTMLInputElement;
                    const file = inputEl.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) return; // 5MB
                    try {
                      const formData = new FormData();
                      formData.append('file', file);
                      const res = await api.post('/assets/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                      const url = res.data?.data?.url;
                      if (!url) return;
                      const imgs = Array.isArray(component.props.images) ? [...component.props.images] : [];
                      const idx = component.props.currentIndex || 0;
                      if (!imgs[idx]) imgs[idx] = { src: '', alt: `Slide ${idx + 1}` };
                      imgs[idx] = { ...imgs[idx], src: url };
                      onUpdateComponent(component.id, { ...component, props: { ...component.props, images: imgs, currentIndex: idx } });
                    } catch (err) {
                      // swallow
                    } finally {
                      if (inputEl) inputEl.value = '';
                    }
                  }}
                />
              </label>
              <div className="w-px bg-gray-300"></div>
              {/* Autoplay controls */}
              <button
                className={`px-2 py-1 rounded text-sm ${component.props.autoplay ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100 text-gray-900'}`}
                title="Toggle autoplay"
                onClick={() => {
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, autoplay: !component.props.autoplay } });
                }}
              >
                {component.props.autoplay ? 'Autoplay: On' : 'Autoplay: Off'}
              </button>
              <select
                value={component.props.autoplayInterval || 3000}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 3000;
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, autoplayInterval: val } });
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-900"
                title="Autoplay interval"
              >
                <option value={2000}>2s</option>
                <option value={3000}>3s</option>
                <option value={5000}>5s</option>
                <option value={8000}>8s</option>
              </select>
              <div className="w-px bg-gray-300"></div>
              <button
                className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                title="Delete Carousel"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent();
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}

          {/* Slides */}
          <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-gray-200 border border-gray-300">
            {Array.isArray(component.props.images) && component.props.images.length > 0 ? (
              <>
                {component.props.images.map((img: any, idx: number) => {
                  const active = (component.props.currentIndex || 0) === idx;
                  return (
                    <div
                      key={idx}
                      className={`absolute inset-0 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
                    >
                      {img?.src ? (
                        <img
                          src={img.src}
                          alt={img.alt || `Slide ${idx + 1}`}
                          className="w-full h-full"
                          style={{ objectFit: 'cover', display: 'block' }}
                          onClick={(e) => { if (isSelected) e.stopPropagation(); }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Upload to add image</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Arrows (for preview) */}
                {component.props.showArrows && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full px-3 py-1 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const len = (component.props.images || []).length || 0;
                        const next = ((component.props.currentIndex || 0) - 1 + len) % Math.max(1, len);
                        onUpdateComponent(component.id, { ...component, props: { ...component.props, currentIndex: next } });
                      }}
                    >
                      Prev
                    </button>
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full px-3 py-1 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const len = (component.props.images || []).length || 0;
                        const next = ((component.props.currentIndex || 0) + 1) % Math.max(1, len);
                        onUpdateComponent(component.id, { ...component, props: { ...component.props, currentIndex: next } });
                      }}
                    >
                      Next
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Add 1–5 images</p>
                </div>
              </div>
            )}
          </div>

          {/* Dots */}
          {component.props.showDots && Array.isArray(component.props.images) && component.props.images.length > 1 && (
            <div className="flex gap-2 justify-center mt-2">
              {component.props.images.map((_: any, idx: number) => (
                <button
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full ${idx === (component.props.currentIndex || 0) ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, { ...component, props: { ...component.props, currentIndex: idx } });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bullet List Component */}
      {component.type === 'bullet-list' && (
        <div style={{ textAlign: component.props.align || 'left' }}>
          {/* Inline toolbar */}
          {isSelected && (
            <div 
              className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-2 flex gap-1 whitespace-nowrap"
              style={{ top: '-56px', left: '0', zIndex: 1000, minWidth: 'max-content' }}
              onClick={(e) => e.stopPropagation()}
            >
              <select
                value={component.props.style || 'bulleted'}
                onChange={(e) => onUpdateComponent(component.id, { ...component, props: { ...component.props, style: e.target.value } })}
                className="px-2 py-1 text-xs border border-gray-300 rounded text-black"
              >
                <option value="bulleted">Bulleted</option>
                <option value="numbered">Numbered</option>
                <option value="none">Plain</option>
              </select>
              <div className="w-px bg-gray-300"></div>
              {/* Size settings */}
              <select
                value={component.props.textSize || 'text'}
                onChange={(e) => onUpdateComponent(component.id, { ...component, props: { ...component.props, textSize: e.target.value } })}
                className="px-2 py-1 text-xs border border-gray-300 rounded text-black"
              >
                <option value="heading">Heading</option>
                <option value="title">Title</option>
                <option value="subheading">Subheading</option>
                <option value="text">Text</option>
              </select>
              <div className="w-px bg-gray-300"></div>
              {/* Alignment buttons */}
              <button
                className={`px-2 py-1 rounded text-sm ${component.props.align === 'left' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => onUpdateComponent(component.id, { ...component, props: { ...component.props, align: 'left' } })}
                title="Align Left"
              >
                <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                </svg>
              </button>
              <button
                className={`px-2 py-1 rounded text-sm ${component.props.align === 'center' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => onUpdateComponent(component.id, { ...component, props: { ...component.props, align: 'center' } })}
                title="Align Center"
              >
                <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
                </svg>
              </button>
              <button
                className={`px-2 py-1 rounded text-sm ${component.props.align === 'right' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => onUpdateComponent(component.id, { ...component, props: { ...component.props, align: 'right' } })}
                title="Align Right"
              >
                <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
                </svg>
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-black"
                onClick={() => {
                  const items = Array.isArray(component.props.items) ? [...component.props.items] : [];
                  items.push('New item');
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                }}
              >
                + Item
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-black"
                onClick={() => {
                  const items = Array.isArray(component.props.items) ? [...component.props.items] : [];
                  if (items.length > 0) items.pop();
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                }}
              >
                Remove
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                onClick={() => onDeleteComponent()}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}

          {component.props.style === 'numbered' ? (
            <ol className="list-decimal pl-6" style={{ lineHeight: 1.6, color: themeColors.text }}>
              {(component.props.items || []).map((item: string, idx: number) => {
                const textSizeClass = component.props.textSize === 'heading' ? 'text-3xl' : 
                                     component.props.textSize === 'title' ? 'text-2xl' :
                                     component.props.textSize === 'subheading' ? 'text-xl' : 'text-base';
                return (
                  <li key={idx} className={`mb-1 ${textSizeClass}`}>
                    <span
                      contentEditable={isSelected}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const items = [...(component.props.items || [])];
                        items[idx] = e.currentTarget.textContent || '';
                        onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                      }}
                      onClick={(e) => { if (isSelected) e.stopPropagation(); }}
                      className="outline-none px-1 rounded"
                      style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text }}
                    >
                      {item}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : component.props.style === 'none' ? (
            <div className="space-y-1">
              {(component.props.items || []).map((item: string, idx: number) => {
                const textSizeClass = component.props.textSize === 'heading' ? 'text-3xl' : 
                                     component.props.textSize === 'title' ? 'text-2xl' :
                                     component.props.textSize === 'subheading' ? 'text-xl' : 'text-base';
                return (
                  <div key={idx}>
                    <span
                      contentEditable={isSelected}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const items = [...(component.props.items || [])];
                        items[idx] = e.currentTarget.textContent || '';
                        onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                      }}
                      onClick={(e) => { if (isSelected) e.stopPropagation(); }}
                      className={`outline-none px-1 rounded ${textSizeClass}`}
                      style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text }}
                    >
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <ul className="list-disc pl-6" style={{ lineHeight: 1.6, color: themeColors.text }}>
              {(component.props.items || []).map((item: string, idx: number) => {
                const textSizeClass = component.props.textSize === 'heading' ? 'text-3xl' : 
                                     component.props.textSize === 'title' ? 'text-2xl' :
                                     component.props.textSize === 'subheading' ? 'text-xl' : 'text-base';
                return (
                  <li key={idx} className={`mb-1 ${textSizeClass}`}>
                    <span
                      contentEditable={isSelected}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const items = [...(component.props.items || [])];
                        items[idx] = e.currentTarget.textContent || '';
                        onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                      }}
                      onClick={(e) => { if (isSelected) e.stopPropagation(); }}
                      className="outline-none px-1 rounded"
                      style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text }}
                    >
                      {item}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Collapsible List Component (single toggle showing stacked cards) */}
      {component.type === 'collapsible-list' && (
        <div style={{ 
          textAlign: component.props.align || 'left',
          maxWidth: component.props.width || '100%',
          margin: component.props.align === 'center' ? '0 auto' : component.props.align === 'right' ? '0 0 0 auto' : '0'
        }}>
          {/* Inline toolbar */}
          {isSelected && (
            <div 
              className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-2 flex gap-1 whitespace-nowrap"
              style={{ top: '-56px', left: '0', zIndex: 1000, minWidth: 'max-content' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Alignment buttons */}
              <button
                className={`px-2 py-1 rounded text-sm ${component.props.align === 'left' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => onUpdateComponent(component.id, { ...component, props: { ...component.props, align: 'left' } })}
                title="Align Left"
              >
                <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                </svg>
              </button>
              <button
                className={`px-2 py-1 rounded text-sm ${component.props.align === 'center' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => onUpdateComponent(component.id, { ...component, props: { ...component.props, align: 'center' } })}
                title="Align Center"
              >
                <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
                </svg>
              </button>
              <button
                className={`px-2 py-1 rounded text-sm ${component.props.align === 'right' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => onUpdateComponent(component.id, { ...component, props: { ...component.props, align: 'right' } })}
                title="Align Right"
              >
                <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
                </svg>
              </button>
              <div className="w-px bg-gray-300"></div>
              {/* Width control */}
              <select
                value={component.props.width || '100%'}
                onChange={(e) => onUpdateComponent(component.id, { ...component, props: { ...component.props, width: e.target.value } })}
                className="px-2 py-1 text-xs border border-gray-300 rounded text-black"
              >
                <option value="100%">Full Width</option>
                <option value="75%">75%</option>
                <option value="50%">50%</option>
                <option value="33%">33%</option>
                <option value="600px">600px</option>
                <option value="400px">400px</option>
              </select>
              <div className="w-px bg-gray-300"></div>
              {/* Button text inputs */}
              <input
                type="text"
                value={component.props.buttonTextShow || ''}
                onChange={(e) => onUpdateComponent(component.id, { ...component, props: { ...component.props, buttonTextShow: e.target.value } })}
                placeholder="Show text"
                className="px-2 py-1 text-xs border border-gray-300 rounded text-black w-24"
                onClick={(e) => e.stopPropagation()}
              />
              <input
                type="text"
                value={component.props.buttonTextHide || ''}
                onChange={(e) => onUpdateComponent(component.id, { ...component, props: { ...component.props, buttonTextHide: e.target.value } })}
                placeholder="Hide text"
                className="px-2 py-1 text-xs border border-gray-300 rounded text-black w-24"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="w-px bg-gray-300"></div>
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-black"
                onClick={() => {
                  const items = Array.isArray(component.props.items) ? [...component.props.items] : [];
                  items.push('New item');
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                }}
              >
                + Item
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-black"
                onClick={() => {
                  const items = Array.isArray(component.props.items) ? [...component.props.items] : [];
                  if (items.length > 0) items.pop();
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                }}
              >
                Remove
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                onClick={() => onDeleteComponent()}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}

          {/* Toggle button */}
          <div className="mb-3">
            <button
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
              onClick={(e) => {
                e.stopPropagation();
                const expanded = !!component.props.expanded;
                onUpdateComponent(component.id, { ...component, props: { ...component.props, expanded: !expanded } });
              }}
            >
              {component.props.expanded ? (component.props.buttonTextHide || 'Hide Items') : (component.props.buttonTextShow || 'Show Items')}
            </button>
          </div>

          {/* Items as stacked cards when expanded */}
          {component.props.expanded && (
            <div className="space-y-2">
              {(component.props.items || []).map((raw: any, idx: number) => {
                const text = typeof raw === 'string' ? raw : (raw?.title || '');
                return (
                  <div key={idx} className="border rounded-md p-3 bg-white">
                    <div
                      contentEditable={isSelected}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const items = [...(component.props.items || [])];
                        items[idx] = e.currentTarget.textContent || '';
                        onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                      }}
                      onClick={(e) => { if (isSelected) e.stopPropagation(); }}
                      className="outline-none px-1 rounded"
                      style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text }}
                    >
                      {text || `Item ${idx + 1}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Banner Component */}
      {component.type === 'banner' && (
        <div 
          className="relative w-full flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: component.props.backgroundColor || themeColors.primary,
            minHeight: component.props.backgroundImage ? 'auto' : (component.props.height || '400px'),
            padding: '0',
            color: component.props.textColor || '#ffffff',
          }}
        >
          {/* Background image layer */}
          {component.props.backgroundImage && (
            <img
              src={component.props.backgroundImage}
              alt="Banner background"
              className="w-full h-auto block"
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                pointerEvents: 'none', // Don't capture clicks
                zIndex: 0, // Behind content
              }}
            />
          )}
          
          {/* Content overlay when there's an image */}
          {component.props.backgroundImage && (component.props.heading !== null || component.props.subheading !== null || component.props.buttonText !== null) && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
              style={{ 
                padding: '60px 40px',
                zIndex: 1,
              }}
            >
              {/* Heading with inline controls */}
              {(component.props.heading !== null && component.props.heading !== undefined) && (
                <div className="relative group/heading" style={{ zIndex: 2, width: '100%', maxWidth: '1200px' }}>
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { ...component.props, heading: null }
                        });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-100 transition-all shadow-lg"
                      title="Delete Heading"
                      style={{ zIndex: 10 }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  <h1 
                    contentEditable={isSelected}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newHeading = e.currentTarget.textContent || '';
                      if (newHeading !== component.props.heading) {
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { ...component.props, heading: newHeading }
                        });
                      }
                    }}
                    onFocus={(e) => {
                      // Select component first if not already selected
                      if (!isSelected) {
                        onComponentClick(component, e as any);
                      }
                      
                      setSelectedComponent(component);
                      const element = e.currentTarget as HTMLElement;
                      const rect = element.getBoundingClientRect();
                      
                      // Use absolute screen coordinates for fixed positioning
                      const absoluteRect = {
                        x: rect.left,
                        y: rect.top,
                        left: rect.left,
                        top: rect.top,
                        right: rect.right,
                        bottom: rect.bottom,
                        width: rect.width,
                        height: rect.height,
                        toJSON: () => ({})
                      } as DOMRect;
                      onShowTextToolbar(absoluteRect);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Also select component on click
                      if (!isSelected) {
                        onComponentClick(component, e);
                      }
                    }}
                    className="text-5xl font-bold mb-4 outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-4 py-2"
                    style={{ 
                      fontFamily: `'${themeFonts.heading}', sans-serif`,
                      color: component.props.textColor || '#ffffff',
                      cursor: isSelected ? 'text' : 'default',
                    }}
                  >
                    {component.props.heading || (isSelected ? 'Add heading...' : '')}
                  </h1>
                </div>
              )}
              
              {/* Subheading with inline controls */}
              {(component.props.subheading !== null && component.props.subheading !== undefined) && (
                <div className="relative group/subheading" style={{ zIndex: 2, width: '100%', maxWidth: '800px' }}>
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { ...component.props, subheading: null }
                        });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-100 transition-all shadow-lg"
                      title="Delete Subheading"
                      style={{ zIndex: 10 }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  <p 
                    contentEditable={isSelected}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newSubheading = e.currentTarget.textContent || '';
                      if (newSubheading !== component.props.subheading) {
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { ...component.props, subheading: newSubheading }
                        });
                      }
                    }}
                    onFocus={(e) => {
                      // Select component first if not already selected
                      if (!isSelected) {
                        onComponentClick(component, e as any);
                      }
                      
                      setSelectedComponent(component);
                      const element = e.currentTarget as HTMLElement;
                      const rect = element.getBoundingClientRect();
                      
                      // Use absolute screen coordinates for fixed positioning
                      const absoluteRect = {
                        x: rect.left,
                        y: rect.top,
                        left: rect.left,
                        top: rect.top,
                        right: rect.right,
                        bottom: rect.bottom,
                        width: rect.width,
                        height: rect.height,
                        toJSON: () => ({})
                      } as DOMRect;
                      onShowTextToolbar(absoluteRect);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Also select component on click
                      if (!isSelected) {
                        onComponentClick(component, e);
                      }
                    }}
                    className="text-xl mb-8 max-w-2xl outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-4 py-2"
                    style={{ 
                      fontFamily: `'${themeFonts.body}', sans-serif`,
                      color: component.props.textColor || '#ffffff',
                      opacity: 0.9,
                      cursor: isSelected ? 'text' : 'default',
                    }}
                  >
                    {component.props.subheading || (isSelected ? 'Add subheading...' : '')}
                  </p>
                </div>
              )}
              
              {/* Button with inline controls */}
              {(component.props.buttonText !== null && component.props.buttonText !== undefined) && (
                <div className="relative group/button inline-block" style={{ zIndex: 2 }}>
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { ...component.props, buttonText: null }
                        });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-100 transition-all shadow-lg"
                      title="Delete Button"
                      style={{ zIndex: 10 }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  {component.props.buttonLink && !isSelected ? (
                    <a
                      href={component.props.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105 inline-block"
                      style={{
                        backgroundColor: '#ffffff',
                        color: component.props.backgroundColor || themeColors.primary,
                        textDecoration: 'none',
                      }}
                    >
                      {component.props.buttonText || 'Get Started'}
                    </a>
                  ) : (
                    <div
                      contentEditable={isSelected}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newButtonText = e.currentTarget.textContent || '';
                        if (newButtonText !== component.props.buttonText) {
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { ...component.props, buttonText: newButtonText }
                          });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      onClick={(e) => {
                        if (isSelected) {
                          e.stopPropagation();
                        }
                      }}
                      className="px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105 outline-none focus:ring-2 focus:ring-offset-2 inline-block"
                      style={{
                        backgroundColor: '#ffffff',
                        color: component.props.backgroundColor || themeColors.primary,
                        cursor: isSelected ? 'text' : 'pointer',
                      }}
                    >
                      {component.props.buttonText || (isSelected ? 'Add button text...' : 'Get Started')}
                    </div>
                  )}
                </div>
              )}
              
              {/* Add component buttons when selected and elements are deleted */}
              {isSelected && (
                <div className="mt-6 flex gap-2 flex-wrap justify-center" style={{ zIndex: 2 }}>
                  {(component.props.heading === null || component.props.heading === undefined) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { ...component.props, heading: 'Welcome to our site' }
                        });
                      }}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm flex items-center gap-2 transition-colors border border-white/30"
                    >
                      <Plus className="h-4 w-4" />
                      Add Heading
                    </button>
                  )}
                  {(component.props.subheading === null || component.props.subheading === undefined) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { ...component.props, subheading: 'Discover amazing features' }
                        });
                      }}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm flex items-center gap-2 transition-colors border border-white/30"
                    >
                      <Plus className="h-4 w-4" />
                      Add Subheading
                    </button>
                  )}
                  {(component.props.buttonText === null || component.props.buttonText === undefined) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { ...component.props, buttonText: 'Get Started' }
                        });
                      }}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm flex items-center gap-2 transition-colors border border-white/30"
                    >
                      <Plus className="h-4 w-4" />
                      Add Button
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Content when there's NO image - centered in colored background */}
          {!component.props.backgroundImage && (
            <div style={{ padding: '60px 40px', width: '100%' }}>
              {/* Heading with inline controls */}
              {(component.props.heading !== null && component.props.heading !== undefined) && (
            <div className="relative group/heading" style={{ zIndex: 1, width: '100%', maxWidth: '1200px' }}>
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, heading: null }
                    });
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover/heading:opacity-100 transition-opacity shadow-lg"
                  title="Delete Heading"
                  style={{ zIndex: 10 }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
              <h1 
                contentEditable={isSelected}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newHeading = e.currentTarget.textContent || '';
                  if (newHeading !== component.props.heading) {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, heading: newHeading }
                    });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                onClick={(e) => {
                  if (isSelected) {
                    e.stopPropagation();
                  }
                }}
                className="text-5xl font-bold mb-4 outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-4 py-2"
                style={{ 
                  fontFamily: `'${themeFonts.heading}', sans-serif`,
                  color: component.props.textColor || '#ffffff',
                  cursor: isSelected ? 'text' : 'default',
                }}
              >
                {component.props.heading || (isSelected ? 'Add heading...' : '')}
              </h1>
            </div>
          )}
          
          {/* Subheading with inline controls */}
          {(component.props.subheading !== null && component.props.subheading !== undefined) && (
            <div className="relative group/subheading" style={{ zIndex: 1, width: '100%', maxWidth: '800px' }}>
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, subheading: null }
                    });
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover/subheading:opacity-100 transition-opacity shadow-lg"
                  title="Delete Subheading"
                  style={{ zIndex: 10 }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
              <p 
                contentEditable={isSelected}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newSubheading = e.currentTarget.textContent || '';
                  if (newSubheading !== component.props.subheading) {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, subheading: newSubheading }
                    });
                  }
                }}
                onClick={(e) => {
                  if (isSelected) {
                    e.stopPropagation();
                  }
                }}
                className="text-xl mb-8 max-w-2xl outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-4 py-2"
                style={{ 
                  fontFamily: `'${themeFonts.body}', sans-serif`,
                  color: component.props.textColor || '#ffffff',
                  opacity: 0.9,
                  cursor: isSelected ? 'text' : 'default',
                }}
              >
                {component.props.subheading || (isSelected ? 'Add subheading...' : '')}
              </p>
            </div>
          )}
          
          {/* Button with inline controls */}
          {(component.props.buttonText !== null && component.props.buttonText !== undefined) && (
            <div className="relative group/button inline-block" style={{ zIndex: 1 }}>
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, buttonText: null }
                    });
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover/button:opacity-100 transition-opacity shadow-lg"
                  title="Delete Button"
                  style={{ zIndex: 10 }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
              <div
                contentEditable={isSelected}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newButtonText = e.currentTarget.textContent || '';
                  if (newButtonText !== component.props.buttonText) {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, buttonText: newButtonText }
                    });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
                onClick={(e) => {
                  if (isSelected) {
                    e.stopPropagation();
                  }
                }}
                className="px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105 outline-none focus:ring-2 focus:ring-offset-2 inline-block"
                style={{
                  backgroundColor: '#ffffff',
                  color: component.props.backgroundColor || themeColors.primary,
                  cursor: isSelected ? 'text' : 'pointer',
                }}
              >
                {component.props.buttonText || (isSelected ? 'Add button text...' : 'Get Started')}
              </div>
            </div>
          )}
          
          {/* Add component buttons when selected and elements are deleted */}
          {isSelected && (
            <div className="mt-6 flex gap-2 flex-wrap justify-center" style={{ zIndex: 1 }}>
              {(component.props.heading === null || component.props.heading === undefined) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, heading: 'Welcome to our site' }
                    });
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm flex items-center gap-2 transition-colors border border-white/30"
                >
                  <Plus className="h-4 w-4" />
                  Add Heading
                </button>
              )}
              {(component.props.subheading === null || component.props.subheading === undefined) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, subheading: 'Discover amazing features' }
                    });
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm flex items-center gap-2 transition-colors border border-white/30"
                >
                  <Plus className="h-4 w-4" />
                  Add Subheading
                </button>
              )}
              {(component.props.buttonText === null || component.props.buttonText === undefined) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, buttonText: 'Get Started' }
                    });
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg text-sm flex items-center gap-2 transition-colors border border-white/30"
                >
                  <Plus className="h-4 w-4" />
                  Add Button
                </button>
              )}
            </div>
          )}
            </div>
          )}
          
          {/* Main toolbar - always visible when banner is selected */}
          {isSelected && (
            <div 
              className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-2 flex gap-1 whitespace-nowrap"
              style={{
                top: '16px',
                right: '16px',
                zIndex: 1000,
                minWidth: 'max-content',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowImageModal();
                }}
                className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                title="Upload Background Image"
              >
                <ImageIcon className="h-4 w-4" />
                Image
              </button>
              <div className="w-px bg-gray-300"></div>
              <div className="px-2 py-1.5 flex items-center gap-1.5">
                <input
                  type="color"
                  value={component.props.backgroundColor || themeColors.primary}
                  onChange={(e) => {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, backgroundColor: e.target.value }
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded cursor-pointer border-none"
                  title="Background Color"
                />
                <input
                  type="text"
                  value={component.props.backgroundColor || themeColors.primary}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newColor = e.target.value;
                    if (newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, backgroundColor: newColor }
                      });
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="#000000"
                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                  title="Hex Color Code"
                />
              </div>
              <div className="w-px bg-gray-300"></div>
              <div className="px-2 py-1.5 flex items-center gap-1.5">
                <input
                  type="color"
                  value={component.props.textColor || '#ffffff'}
                  onChange={(e) => {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, textColor: e.target.value }
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-6 h-6 rounded cursor-pointer border-none"
                  title="Text Color"
                />
                <input
                  type="text"
                  value={component.props.textColor || '#ffffff'}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newColor = e.target.value;
                    if (newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, textColor: newColor }
                      });
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="#ffffff"
                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                  title="Hex Color Code"
                />
              </div>
              <div className="w-px bg-gray-300"></div>
              <div className="px-2 py-1.5 flex items-center gap-2">
                <label className="text-xs text-gray-700 whitespace-nowrap">Link:</label>
                <input
                  type="text"
                  value={component.props.buttonLink || ''}
                  onChange={(e) => {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, buttonLink: e.target.value }
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="https://..."
                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                  title="Button Link URL"
                />
              </div>
              {!component.props.backgroundImage && (
                <>
                  <div className="w-px bg-gray-300"></div>
                  <div className="px-2 py-1.5 flex items-center gap-2">
                    <label className="text-xs text-gray-700 whitespace-nowrap">Height:</label>
                    <input
                      type="number"
                      value={parseInt(component.props.height) || 400}
                      onChange={(e) => {
                        const height = Math.max(200, Math.min(1000, parseInt(e.target.value) || 400));
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { ...component.props, height: `${height}px` }
                        });
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900"
                      min="200"
                      max="1000"
                      title="Banner Height (px)"
                    />
                  </div>
                </>
              )}
              <div className="w-px bg-gray-300"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent();
                }}
                className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                title="Delete Banner"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer Component (Editor rendering supports optional full-bleed preview) */}
      {component.type === 'footer' && (
        <div 
          className="w-full p-8"
          style={{
            backgroundColor: component.props.backgroundColor || themeColors.secondary,
            color: component.props.textColor || '#ffffff',
          }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
              {/* Company Info - Left */}
              <div className="flex-1 max-w-md">
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: themeFonts.heading }}
                >
                  {component.props.companyName || 'Company Name'}
                </h3>
                <p 
                  className="text-sm opacity-80"
                  style={{ fontFamily: themeFonts.body }}
                >
                  {component.props.description || 'Your company description goes here.'}
                </p>
              </div>

              {/* Links - Right */}
              <div className="flex gap-12 items-start text-right">
                <div>
                  <h4 className="font-semibold mb-2">Quick Links</h4>
                  <ul className="space-y-1 text-sm opacity-80">
                    <li><a href={component.props.link1Url || '#'} className="hover:opacity-100">{component.props.link1Text || 'About'}</a></li>
                    <li><a href={component.props.link2Url || '#'} className="hover:opacity-100">{component.props.link2Text || 'Services'}</a></li>
                    <li><a href={component.props.link3Url || '#'} className="hover:opacity-100">{component.props.link3Text || 'Contact'}</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Connect</h4>
                  <ul className="space-y-1 text-sm opacity-80">
                    <li><a href={component.props.social1Url || '#'} className="hover:opacity-100">{component.props.social1Text || 'Twitter'}</a></li>
                    <li><a href={component.props.social2Url || '#'} className="hover:opacity-100">{component.props.social2Text || 'LinkedIn'}</a></li>
                    <li><a href={component.props.social3Url || '#'} className="hover:opacity-100">{component.props.social3Text || 'Facebook'}</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4 text-center text-sm opacity-60">
              © 2024 {component.props.companyName || 'Company Name'}. All rights reserved.
            </div>
          </div>

          {/* Footer Settings Toolbar */}
          {isSelected && (
            <div className="absolute top-2 right-2 bg-white shadow-lg rounded-lg border p-2 flex items-center gap-2 text-gray-600 z-10 max-w-3xl overflow-x-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const companyName = prompt('Enter company name:', component.props.companyName || '');
                  if (companyName !== null) {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, companyName }
                    });
                  }
                }}
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm"
                title="Edit Company Name"
              >
                Company
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const description = prompt('Enter description:', component.props.description || '');
                  if (description !== null) {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, description }
                    });
                  }
                }}
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm"
                title="Edit Description"
              >
                Description
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const link1Text = prompt('Quick Link 1 Text:', component.props.link1Text || 'About');
                  if (link1Text !== null) {
                    const link1Url = prompt('Quick Link 1 URL:', component.props.link1Url || '#');
                    if (link1Url !== null) {
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, link1Text, link1Url }
                      });
                    }
                  }
                }}
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm"
                title="Edit Quick Links"
              >
                Quick Links
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const social1Text = prompt('Social Link 1 Text:', component.props.social1Text || 'Twitter');
                  if (social1Text !== null) {
                    const social1Url = prompt('Social Link 1 URL:', component.props.social1Url || '#');
                    if (social1Url !== null) {
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, social1Text, social1Url }
                      });
                    }
                  }
                }}
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm"
                title="Edit Social Links"
              >
                Social Links
              </button>
              <div className="w-px bg-gray-300"></div>
              <div className="px-2 py-1.5 flex items-center gap-2">
                <span className="text-xs">BG:</span>
                <input
                  type="color"
                  value={component.props.backgroundColor || themeColors.secondary}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, backgroundColor: e.target.value }
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                  title="Background Color"
                />
                <input
                  type="text"
                  value={component.props.backgroundColor || themeColors.secondary}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newColor = e.target.value;
                    if (newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, backgroundColor: newColor }
                      });
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="#000000"
                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                  title="Hex Color Code"
                />
              </div>
              <div className="w-px bg-gray-300"></div>
              <div className="px-2 py-1.5 flex items-center gap-2">
                <span className="text-xs">Text:</span>
                <input
                  type="color"
                  value={component.props.textColor || '#ffffff'}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, textColor: e.target.value }
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                  title="Text Color"
                />
                <input
                  type="text"
                  value={component.props.textColor || '#ffffff'}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newColor = e.target.value;
                    if (newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, textColor: newColor }
                      });
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="#ffffff"
                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                  title="Hex Color Code"
                />
              </div>
              <div className="w-px bg-gray-300"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent();
                }}
                className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                title="Delete Footer"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Timer Component */}
      {component.type === 'timer' && (
        <TimerComponent 
          component={component}
          themeColors={themeColors}
          themeFonts={themeFonts}
          isSelected={isSelected}
          onUpdateComponent={onUpdateComponent}
          onDeleteComponent={onDeleteComponent}
        />
      )}
    </div>
  );
}
