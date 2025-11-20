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
        style={{ fontFamily: `'${themeFonts.heading}', sans-serif` }}
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
  subType?: string;
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
        maxWidth: (isBanner || isFooter) ? 'none' : '100%', // No max-width constraint for banners/footers
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
              border: component.props.borderWidth 
                ? `${component.props.borderWidth}px ${component.props.borderStyle || 'solid'} ${component.props.borderColor || '#000000'}` 
                : 'none',
              borderRadius: component.props.borderRadius ? `${component.props.borderRadius}px` : '0',
              padding: component.props.borderWidth ? '8px 12px' : '0',
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

      {/* FAQs Component */}
      {component.type === 'faqs' && (
        <div style={{ position: 'relative', width: component.props.width || '100%', margin: component.props.align === 'center' ? '0 auto' : component.props.align === 'right' ? '0 0 0 auto' : '0', textAlign: component.props.align || 'left', minHeight: isSelected ? '80px' : 'auto' }}>
          {/* Inline toolbar - fat toolbar with many options */}
          {isSelected && (
            <div
              className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-3 flex flex-wrap gap-2 items-center"
              style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, maxWidth: '90vw', marginBottom: '8px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Alignment */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-700">Align</span>
                <button
                  className={`p-1.5 rounded ${component.props.align === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => onUpdateComponent(component.id, { ...component, props: { ...component.props, align: 'left' } })}
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  className={`p-1.5 rounded ${component.props.align === 'center' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => onUpdateComponent(component.id, { ...component, props: { ...component.props, align: 'center' } })}
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  className={`p-1.5 rounded ${component.props.align === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                  onClick={() => onUpdateComponent(component.id, { ...component, props: { ...component.props, align: 'right' } })}
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
              </div>
              <div className="w-px bg-gray-300 h-6" />

              {/* Width */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-700">Width</span>
                <select
                  value={component.props.width || '100%'}
                  onChange={(e) => onUpdateComponent(component.id, { ...component, props: { ...component.props, width: e.target.value } })}
                  className="px-2 py-1 text-xs border border-gray-300 rounded text-black"
                >
                  <option value="100%">100%</option>
                  <option value="75%">75%</option>
                  <option value="50%">50%</option>
                  <option value="600px">600px</option>
                  <option value="800px">800px</option>
                </select>
              </div>
              <div className="w-px bg-gray-300 h-6" />

              {/* Add/Remove */}
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-black"
                onClick={() => {
                  const items = Array.isArray(component.props.items) ? [...component.props.items] : [];
                  items.push({ question: 'New question', answer: 'Answer goes here', expanded: false });
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                }}
              >
                + Add FAQ
              </button>
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-black"
                onClick={() => {
                  const items = Array.isArray(component.props.items) ? [...component.props.items] : [];
                  if (items.length > 0) items.pop();
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                }}
              >
                Remove Last
              </button>
              <div className="w-px bg-gray-300 h-6" />
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-black"
                onClick={() => {
                  const items = (component.props.items || []).map((it: any) => ({ ...it, expanded: true }));
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                }}
              >
                Expand All
              </button>
              <button
                className="px-2 py-1 hover:bg-gray-100 rounded text-sm text-black"
                onClick={() => {
                  const items = (component.props.items || []).map((it: any) => ({ ...it, expanded: false }));
                  onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                }}
              >
                Collapse All
              </button>
              <div className="w-px bg-gray-300 h-6" />
              <button
                className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                onClick={() => onCopyComponent()}
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
              <button
                className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                onClick={() => onDeleteComponent()}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}

          {/* FAQ items */}
          <div className="space-y-3 w-full">
            {(component.props.items || []).map((it: any, idx: number) => (
              <div key={idx} className="border rounded-md bg-white w-full overflow-hidden">
                <button
                  className="w-full text-left px-4 py-3 font-medium flex justify-between items-center hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    const items = [...(component.props.items || [])];
                    items[idx] = { ...it, expanded: !it.expanded };
                    onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                  }}
                >
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const items = [...(component.props.items || [])];
                      items[idx] = { ...it, question: e.currentTarget.textContent || '' };
                      onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                    }}
                    onFocus={(e) => {
                      e.stopPropagation();
                      if (!isSelected) {
                        onComponentClick(component, e as any);
                      }
                      setSelectedComponent(component);
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const absoluteRect = { x: rect.left, y: rect.top, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height, toJSON: () => ({}) } as DOMRect;
                      onShowTextToolbar(absoluteRect);
                    }}
                    onClick={(e) => { e.stopPropagation(); }}
                    className="outline-none cursor-text"
                    style={{ fontFamily: `'${themeFonts.heading}', sans-serif`, color: themeColors.text, textAlign: component.props.align || 'left' }}
                  >
                    {it.question || `Question ${idx + 1}`}
                  </span>
                  <span className="text-gray-500">{it.expanded ? '−' : '+'}</span>
                </button>
                {it.expanded && (
                  <div className="px-4 py-3 border-t bg-white">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const items = [...(component.props.items || [])];
                        items[idx] = { ...it, answer: e.currentTarget.textContent || '' };
                        onUpdateComponent(component.id, { ...component, props: { ...component.props, items } });
                      }}
                      onFocus={(e) => {
                        e.stopPropagation();
                        if (!isSelected) {
                          onComponentClick(component, e as any);
                        }
                        setSelectedComponent(component);
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const absoluteRect = { x: rect.left, y: rect.top, left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height, toJSON: () => ({}) } as DOMRect;
                        onShowTextToolbar(absoluteRect);
                      }}
                      onClick={(e) => { e.stopPropagation(); }}
                      className="outline-none cursor-text"
                      style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text, textAlign: component.props.align || 'left' }}
                    >
                      {it.answer || 'Answer goes here'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
                    pointerEvents: isSelected ? 'none' : 'auto', // Disable clicks when selected to allow dragging
                  }}
                />
                
                {/* Resize Handle - Full surface draggable like video */}
                {isSelected && (
                  <div
                    className="absolute top-0 right-0 bottom-0 cursor-ew-resize"
                    style={{
                      width: '100%', // Cover entire image area for easier dragging
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const startX = e.clientX;
                      const startWidth = parseInt(component.props.width) || 400;
                      
                      // Add body styles to prevent selection during drag
                      document.body.style.userSelect = 'none';
                      document.body.style.cursor = 'ew-resize';
                      
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        moveEvent.preventDefault();
                        moveEvent.stopPropagation();
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
                        // Restore body styles
                        document.body.style.userSelect = '';
                        document.body.style.cursor = '';
                        
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                    title="Drag anywhere to resize width (maintains aspect ratio)"
                  >
                    {/* Visual indicator on the right edge - inside border */}
                    <div 
                      className="absolute top-0 right-0 bottom-0 w-6 flex items-center justify-center hover:bg-blue-100 hover:bg-opacity-50 rounded transition-colors group"
                    >
                      <div className="w-1 h-8 bg-blue-600 rounded group-hover:h-12 transition-all"></div>
                    </div>
                  </div>
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
          position: 'relative',
          minHeight: isSelected ? '100px' : 'auto',
        }}>
          <div className="inline-block relative" style={{ zIndex: isSelected ? 10 : 'auto' }}>
            {/* Inline Button Controls with Text and Color Editing */}
            {isSelected && (
              <div 
                className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-3 flex gap-3 items-center flex-wrap"
                style={{
                  position: 'fixed',
                  top: '10%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                  minWidth: '800px',
                  maxWidth: '90vw',
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Button Text Input */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-600">Button Text</label>
                  <input
                    type="text"
                    value={component.props.text || ''}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newText = e.target.value;
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, text: newText }
                      });
                    }}
                    onFocus={(e) => e.stopPropagation()}
                    onBlur={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                    onKeyUp={(e) => {
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    placeholder="Button text"
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 w-32"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                {/* Link/Navigation Input */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-600">Link To</label>
                  <div className="flex gap-1">
                    <select
                      value={component.props.linkType || 'url'}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newLinkType = e.target.value;
                        let newHref = '';
                        
                        if (newLinkType === 'url') {
                          newHref = 'https://';
                        } else if (newLinkType === 'page') {
                          newHref = '/';
                        } else if (newLinkType === 'section') {
                          newHref = '#';
                        }
                        
                        onUpdateComponent(component.id, {
                          ...component,
                          props: { 
                            ...component.props, 
                            linkType: newLinkType,
                            href: newHref,
                            pageSlug: '',
                            sectionId: ''
                          }
                        });
                      }}
                      className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <option value="url">URL</option>
                      <option value="page">Page</option>
                      <option value="section">Section</option>
                    </select>
                    
                    {component.props.linkType === 'url' || !component.props.linkType ? (
                      <input
                        type="text"
                        value={component.props.href || 'https://'}
                        onChange={(e) => {
                          e.stopPropagation();
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { ...component.props, href: e.target.value }
                          });
                        }}
                        onFocus={(e) => e.stopPropagation()}
                        onBlur={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                        }}
                        onKeyUp={(e) => {
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        placeholder="https://example.com"
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 w-48"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : component.props.linkType === 'page' ? (
                      <input
                        type="text"
                        value={component.props.pageSlug || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          const slug = e.target.value;
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { 
                              ...component.props, 
                              pageSlug: slug, 
                              href: slug ? `/${slug}` : '/'
                            }
                          });
                        }}
                        onFocus={(e) => e.stopPropagation()}
                        onBlur={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                        }}
                        onKeyUp={(e) => {
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        placeholder="page-slug"
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 w-32"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <input
                        type="text"
                        value={component.props.sectionId || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          const sectionId = e.target.value;
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { 
                              ...component.props, 
                              sectionId: sectionId, 
                              href: sectionId ? `#${sectionId}` : '#'
                            }
                          });
                        }}
                        onFocus={(e) => e.stopPropagation()}
                        onBlur={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                        }}
                        onKeyUp={(e) => {
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        placeholder="section-id"
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 w-32"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </div>
                
                <div className="w-px bg-gray-300 h-8"></div>
                
                {/* Size */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-600">Size</label>
                  <select
                    value={component.props.size || 'medium'}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, size: e.target.value }
                      });
                    }}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                
                <div className="w-px bg-gray-300 h-8"></div>
                
                {/* Text Color Picker */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-600">Text Color</label>
                  <div className="flex items-center gap-1">
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
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                      title="Text Color"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                
                {/* Button Background Color Picker */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-600">BG Color</label>
                  <div className="flex items-center gap-1">
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
                      className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                      title="Button Background Color"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                
                <div className="w-px bg-gray-300 h-8"></div>
                
                {/* Alignment */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-600">Alignment</label>
                  <div className="flex gap-1">
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
                  </div>
                </div>
                
                <div className="w-px bg-gray-300 h-8"></div>
                
                {/* Border Radius */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-600">Rounding</label>
                  <input
                    type="number"
                    value={component.props.borderRadius || 8}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUpdateComponent(component.id, {
                        ...component,
                        props: { ...component.props, borderRadius: parseInt(e.target.value) || 0 }
                      });
                    }}
                    min="0"
                    max="50"
                    className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div className="w-px bg-gray-300 h-8"></div>
                
                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-gray-600">Actions</label>
                  <div className="flex gap-1">
                
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
                </div>
              </div>
            )}
            
            <button 
              className={`font-medium transition-colors ${
                (component.props.size || 'medium') === 'small' ? 'px-3 py-1 text-sm' :
                (component.props.size || 'medium') === 'large' ? 'px-8 py-3 text-lg' :
                'px-6 py-2 text-base'
              }`}
              style={{
                backgroundColor: component.props.buttonColor || themeColors.primary,
                color: component.props.textColor || '#ffffff',
                border: 'none',
                borderRadius: `${component.props.borderRadius || 8}px`,
              }}
            >
              {component.props.text ?? ''}
            </button>
          </div>
        </div>
      )}

      {/* Break Component */}
      {component.type === 'break' && (
        <div style={{ clear: 'both', position: 'relative', width: '100%', display: 'block', padding: 0, margin: 0 }}>
          {/* Inline toolbar for breaks */}
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
                  onCopyComponent();
                }}
                className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
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
          
          <hr 
            style={{
              border: 'none',
              borderTop: '1px solid #e5e7eb',
              width: '100%',
              margin: '0',
              display: 'block'
            }}
          />
        </div>
      )}

      {/* Social Media Component */}
      {component.type === 'social' && (
        <div className="relative flex justify-center items-center" style={{ minHeight: isSelected ? '100px' : 'auto' }}>
          {/* Social Media Toolbar */}
          {isSelected && (
            <div 
              className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-3 flex flex-col gap-2 whitespace-nowrap"
              style={{
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                minWidth: 'max-content',
                maxWidth: '90vw',
                marginBottom: '8px'
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
          <div className="flex gap-4 items-center justify-center py-8 min-w-[400px]">
            {/* Show placeholder if no URLs are set */}
            {!component.props.instagramUrl && 
             !component.props.facebookUrl && 
             !component.props.twitterUrl && 
             !component.props.linkedinUrl && 
             !component.props.youtubeUrl && (
              <div className="text-gray-400 text-sm text-center py-4 px-6 border-2 border-dashed border-gray-300 rounded-lg">
                Click above to add social media links for icons to appear
              </div>
            )}
            
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
                style={{
                  pointerEvents: isSelected ? 'none' : 'auto', // Disable clicks when selected to allow dragging
                }}
                allowFullScreen
              />
              
              {/* Resize Handle - Width-based resizing with aspect ratio maintained */}
              {isSelected && (
                <div
                  className="absolute top-0 -right-3 bottom-0 cursor-ew-resize"
                  style={{
                    width: '100%', // Cover entire video area for easier dragging
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const startX = e.clientX;
                    const startWidth = parseInt(component.props.width) || 800;
                    
                    // Add body styles to prevent selection during drag
                    document.body.style.userSelect = 'none';
                    document.body.style.cursor = 'ew-resize';
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      moveEvent.preventDefault();
                      moveEvent.stopPropagation();
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
                      // Restore body styles
                      document.body.style.userSelect = '';
                      document.body.style.cursor = '';
                      
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  title="Drag anywhere to resize width (maintains 16:9 ratio)"
                >
                  {/* Visual indicator on the right edge */}
                  <div 
                    className="absolute top-0 -right-3 bottom-0 w-6 flex items-center justify-center hover:bg-blue-100 rounded transition-colors group"
                  >
                    <div className="w-1 h-8 bg-blue-600 rounded group-hover:h-12 transition-all"></div>
                  </div>
                </div>
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
              <>
                {console.log(component.props.cardType, component.props.image)}
              </>
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
                  className="w-full bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden"
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
            onFocus={(e) => {
              // Show text toolbar for card title editing
              const element = e.currentTarget as HTMLElement;
              const rect = element.getBoundingClientRect();
              
              // Use absolute screen coordinates for text toolbar positioning
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
              if (onShowTextToolbar) {
                onShowTextToolbar(absoluteRect);
              }
            }}
            onMouseDown={(e) => {
              if (isSelected) {
                e.stopPropagation();
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
              userSelect: isSelected ? 'text' : 'none',
              WebkitUserSelect: isSelected ? 'text' : 'none',
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
            onFocus={(e) => {
              // Show text toolbar for card description editing
              const element = e.currentTarget as HTMLElement;
              const rect = element.getBoundingClientRect();
              
              // Use absolute screen coordinates for text toolbar positioning
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
              if (onShowTextToolbar) {
                onShowTextToolbar(absoluteRect);
              }
            }}
            onMouseDown={(e) => {
              if (isSelected) {
                e.stopPropagation();
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
              userSelect: isSelected ? 'text' : 'none',
              WebkitUserSelect: isSelected ? 'text' : 'none',
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
                className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                onClick={() => onCopyComponent()}
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
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
            <div className="space-y-2 w-full">
              {(component.props.items || []).map((raw: any, idx: number) => {
                const text = typeof raw === 'string' ? raw : (raw?.title || '');
                return (
                  <div key={idx} className="border rounded-md p-3 bg-white w-full">
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
      {component.type === 'banner' && (() => {
        // Infer banner type from props if subType is missing (for backwards compatibility after reload)
        const hasTextContent = component.props.heading || component.props.subheading || component.props.buttonText;
        const inferredSubType = component.subType || (hasTextContent ? 'banner-full' : 'banner-minimal');
        const isTextBanner = inferredSubType === 'banner-full';
        const isImageBanner = inferredSubType === 'banner-minimal';
        
        return (
        <div 
          className="relative w-full flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: component.props.backgroundColor || themeColors.primary,
            paddingTop: component.props.backgroundImage ? '0' : '120px',
            paddingBottom: component.props.backgroundImage ? '0' : '120px',
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
          
          {/* Content overlay when there's an image - for text banners */}
          {isTextBanner && component.props.backgroundImage && (component.props.heading !== null || component.props.subheading !== null || component.props.buttonText !== null) && (
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
                          props: { ...component.props, heading: "" }
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
                    contentEditable={true}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const rawText = e.currentTarget.textContent || '';
                      const newHeading = sanitizeText(rawText);
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
                      
                      // Use absolute screen coordinates for text toolbar positioning
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
                    onClick={(e) => e.stopPropagation()}
                    className="text-5xl font-bold mb-4 outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-4 py-2"
                    style={{ 
                      fontFamily: `'${themeFonts.heading}', sans-serif`,
                      color: component.props.textColor || '#ffffff',
                      cursor: 'text',
                      opacity: (!component.props.heading && isSelected) ? 0.6 : 1,
                    }}
                    data-placeholder={!component.props.heading && isSelected ? 'Add heading...' : ''}
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
                          props: { ...component.props, subheading: "" }
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
                    contentEditable={true}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const rawText = e.currentTarget.textContent || '';
                      const newSubheading = sanitizeText(rawText);
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
                      
                      // Use absolute screen coordinates for text toolbar positioning
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
                      // Don't auto-select component when clicking text elements
                    }}
                    className="text-xl mb-8 max-w-2xl outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-4 py-2"
                    style={{ 
                      fontFamily: `'${themeFonts.body}', sans-serif`,
                      color: component.props.textColor || '#ffffff',
                      opacity: (!component.props.subheading && isSelected) ? 0.6 : 0.9,
                      cursor: 'text',
                    }}
                  >
                    {component.props.subheading || (isSelected ? 'Add subheading...' : '')}
                  </p>
                </div>
              )}
              
              {/* Button with inline toolbar - like regular button component */}
              {(component.props.buttonText !== null && component.props.buttonText !== undefined) && (
                <div className="relative group/button inline-block" style={{ zIndex: 2, minHeight: isSelected ? '100px' : 'auto' }}>
                  {/* Banner Button Inline Toolbar */}
                  {isSelected && (
                    <div 
                      className="absolute bg-white rounded-lg shadow-xl border-2 border-gray-300 p-3 flex gap-3 items-center flex-wrap"
                      style={{
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        minWidth: '800px',
                        maxWidth: '90vw',
                        marginBottom: '8px',
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {/* Button Text Input */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-gray-600">Button Text</label>
                        <input
                          type="text"
                          value={component.props.buttonText || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            onUpdateComponent(component.id, {
                              ...component,
                              props: { ...component.props, buttonText: e.target.value }
                            });
                          }}
                          onFocus={(e) => e.stopPropagation()}
                          onBlur={(e) => e.stopPropagation()}
                          placeholder="Button text"
                          className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 w-32"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      {/* Link Input */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-gray-600">Link To</label>
                        <input
                          type="text"
                          value={component.props.buttonLink || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            onUpdateComponent(component.id, {
                              ...component,
                              props: { ...component.props, buttonLink: e.target.value }
                            });
                          }}
                          onFocus={(e) => e.stopPropagation()}
                          onBlur={(e) => e.stopPropagation()}
                          placeholder="https://example.com"
                          className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 w-48"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      <div className="w-px bg-gray-300 h-8"></div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { ...component.props, buttonText: "", buttonLink: "" }
                          });
                        }}
                        className="px-3 py-1.5 hover:bg-red-100 rounded text-sm flex items-center gap-1.5 text-red-600 transition-colors"
                        title="Delete Button"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                  
                  {/* Button Element - Always show if button exists, even without text */}
                  {component.props.buttonLink && !isSelected && component.props.buttonText ? (
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
                    <button
                      className="px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105 inline-block"
                      style={{
                        backgroundColor: '#ffffff',
                        color: component.props.backgroundColor || themeColors.primary,
                        cursor: 'pointer',
                        border: 'none',
                        opacity: (!component.props.buttonText && isSelected) ? 0.6 : 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Select this button for editing
                        if (!isSelected) {
                          onComponentClick(component, e as any);
                        }
                      }}
                    >
                      {component.props.buttonText || (isSelected ? 'Add button text...' : 'Get Started')}
                    </button>
                  )}
                </div>
              )}
              
              {/* Add component buttons when selected and elements are deleted - for text banners */}
              {isSelected && isTextBanner && (
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
          
          {/* Content when there's NO image */}
          {!component.props.backgroundImage && (
            <div style={{ 
              padding: isTextBanner ? '60px 0' : '60px 40px', 
              width: '100%' 
            }}>
              {/* Image Banner - show upload prompt */}
              {isImageBanner && (
                <div className="text-center">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-4 opacity-75">Click "Image" to upload a background image</p>
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowImageModal();
                      }}
                      className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-semibold transition-colors border border-white/30"
                    >
                      Upload Image
                    </button>
                  )}
                </div>
              )}
              
              {/* Text Banner - show text/button editing */}
              {isTextBanner && (
                <div className="text-center" style={{ padding: '0 40px' }}>
                  {component.props.heading && (
                    <h1 
                      contentEditable={true}
                      suppressContentEditableWarning
                      onInput={(e) => {
                        const newHeading = e.currentTarget.textContent || '';
                        if (newHeading !== component.props.heading) {
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { ...component.props, heading: newHeading }
                          });
                        }
                      }}
                      onFocus={(e) => {
                        if (!isSelected) {
                          onComponentClick(component, e as any);
                        }
                        setSelectedComponent(component);
                        const element = e.currentTarget as HTMLElement;
                        const rect = element.getBoundingClientRect();
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
                      onClick={(e) => e.stopPropagation()}
                      className="text-5xl font-bold mb-4 outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-4 py-2"
                      style={{ 
                        fontFamily: `'${themeFonts.heading}', sans-serif`,
                        color: component.props.textColor || '#ffffff',
                        cursor: 'text',
                      }}
                    >
                      {component.props.heading}
                    </h1>
                  )}
                  
                  {component.props.subheading && (
                    <p 
                      contentEditable={true}
                      suppressContentEditableWarning
                      onInput={(e) => {
                        const newSubheading = e.currentTarget.textContent || '';
                        if (newSubheading !== component.props.subheading) {
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { ...component.props, subheading: newSubheading }
                          });
                        }
                      }}
                      onFocus={(e) => {
                        if (!isSelected) {
                          onComponentClick(component, e as any);
                        }
                        setSelectedComponent(component);
                        const element = e.currentTarget as HTMLElement;
                        const rect = element.getBoundingClientRect();
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
                      onClick={(e) => e.stopPropagation()}
                      className="text-xl mb-8 max-w-2xl mx-auto outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded px-4 py-2"
                      style={{ 
                        fontFamily: `'${themeFonts.body}', sans-serif`,
                        color: component.props.textColor || '#ffffff',
                        opacity: 0.9,
                        cursor: 'text',
                      }}
                    >
                      {component.props.subheading}
                    </p>
                  )}
                  
                  {component.props.buttonText && (
                    <div
                      contentEditable={true}
                      suppressContentEditableWarning
                      onInput={(e) => {
                        const newButtonText = e.currentTarget.textContent || '';
                        if (newButtonText !== component.props.buttonText) {
                          onUpdateComponent(component.id, {
                            ...component,
                            props: { ...component.props, buttonText: newButtonText }
                          });
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="px-8 py-3 rounded-lg font-semibold text-lg transition-all inline-block outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                      style={{
                        backgroundColor: '#ffffff',
                        color: component.props.backgroundColor || themeColors.primary,
                        cursor: 'text',
                      }}
                    >
                      {component.props.buttonText}
                    </div>
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
        );
      })()}

      {/* Footer Component (Immutable - matches C-DAC design) */}
      {component.type === 'footer' && (
        <div 
          className="w-full py-8"
          style={{
            backgroundColor: themeColors.primary || '#0066CC',
            color: '#ffffff',
          }}
        >
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
              {/* Left: C-DAC Hyderabad Address */}
              <div>
                <h3 className="text-base font-bold mb-2" style={{ fontFamily: `'${themeFonts.heading}', sans-serif`, color: '#ffffff' }}>
                  CDAC Hyderabad
                </h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: '#ffffff' }}>
                  sites.isea - Build beautiful websites
                    Create stunning websites. No coding required.
                </p>
              </div>

              {/* Center: Social Network Links */}
              <div className="text-center">
                <h3 className="text-base font-bold mb-3" style={{ fontFamily: `'${themeFonts.heading}', sans-serif`, color: '#ffffff' }}>
                  Our Social Network
                </h3>
                <div className="flex justify-center gap-4">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Visit our Twitter page">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </div>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Visit our Facebook page">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Visit our Instagram page">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                  </a>
                  <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Contact us on WhatsApp">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Visit our YouTube channel">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                  </a>
                  <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Visit our Pinterest page">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                      </svg>
                    </div>
                  </a>
                </div>
              </div>

              {/* Right: Supported By Logos */}
              <div className="text-right">
                <h3 className="text-base font-bold mb-3" style={{ fontFamily: `'${themeFonts.heading}', sans-serif`, color: '#ffffff' }}>
                  Supported By
                </h3>
                <div className="flex justify-end items-center gap-4">
                  <img 
                    src="/3.png" 
                    alt="ISEA Logo"
                    className="h-14 w-auto"
                  />
                  <img 
                    src="/cdac.png" 
                    alt="C-DAC Logo"
                    className="h-14 w-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* NO TOOLBAR - Footer is immutable */}
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
