'use client';

import { Copy, Trash2, AlignLeft, AlignCenter, AlignRight, Settings, Link as LinkIcon, Image as ImageIcon, Video, Type } from 'lucide-react';

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
  onShowButtonModal: () => void;
  onShowTextToolbar: (rect: DOMRect) => void;
  setSelectedComponent: (component: ComponentData) => void;
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
  onShowButtonModal,
  onShowTextToolbar,
  setSelectedComponent
}: ComponentRendererProps) {
  
  const isFloating = component.type === 'image' && component.props.float && component.props.float !== 'none';
  
  return (
    <div
      className={`group relative border-2 rounded p-4 transition-all ${
        isSelected 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-transparent hover:border-blue-300'
      }`}
      style={{
        display: isFloating ? 'inline-block' : 'block',
        width: isFloating ? 'fit-content' : '100%',
        float: isFloating ? component.props.float : 'none',
        marginRight: isFloating && component.props.float === 'left' ? '20px' : '0',
        marginLeft: isFloating && component.props.float === 'right' ? '20px' : '0',
        marginBottom: '16px',
        maxWidth: '100%',
        position: 'relative',
        overflow: 'visible',
        zIndex: isSelected ? 50 : 1,
      }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.getAttribute('contenteditable')) {
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
              const newText = e.currentTarget.textContent || '';
              if (newText !== component.props.text) {
                onUpdateComponent(component.id, {
                  ...component,
                  props: { ...component.props, text: newText }
                });
              }
            }}
            onFocus={(e) => {
              setSelectedComponent(component);
              const rect = e.currentTarget.getBoundingClientRect();
              onShowTextToolbar(rect);
            }}
            onClick={(e) => {
              e.stopPropagation();
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
                  height: component.props.height || 'auto',
                }}
              >
                <img
                  src={component.props.src}
                  alt={component.props.alt || ''}
                  className="w-full rounded"
                  style={{
                    objectFit: component.props.objectFit || (component.props.height ? 'cover' : 'contain'),
                    height: component.props.height || 'auto',
                    width: '100%',
                  }}
                />
                
                {/* Resize Handles - Corner dots */}
                {isSelected && (
                  <>
                    {/* Bottom-right resize handle */}
                    <div
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = parseInt(component.props.width) || 400;
                        
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
                    {/* Bottom-left resize handle */}
                    <div
                      className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nesw-resize hover:scale-125 transition-transform"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const startX = e.clientX;
                        const startWidth = parseInt(component.props.width) || 400;
                        
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = startX - moveEvent.clientX;
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
            {/* Inline Button Controls */}
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
                
                <div className="w-px bg-gray-300"></div>
                
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
                
                <div className="w-px bg-gray-300"></div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowButtonModal();
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-900"
                  title="Edit"
                >
                  <Settings className="h-4 w-4" />
                </button>
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
                backgroundColor: component.props.variant === 'primary' 
                  ? themeColors.primary 
                  : component.props.variant === 'secondary'
                  ? themeColors.secondary
                  : 'transparent',
                color: component.props.variant === 'outline' || component.props.variant === 'text' 
                  ? themeColors.primary 
                  : '#ffffff',
                border: component.props.variant === 'outline' ? `2px solid ${themeColors.primary}` : 'none',
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
                top: component.props.style === 'none' ? '50%' : '-56px',
                left: '50%',
                transform: component.props.style === 'none' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
                zIndex: 1000,
                minWidth: 'max-content',
              }}
            >
              {component.props.style === 'none' && (
                <span className="px-2 py-1 text-sm text-gray-600">Float Clearfix (invisible)</span>
              )}
              {component.props.style !== 'none' && (
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
          
          {component.props.style !== 'none' && (
            <hr style={{ borderColor: component.props.color, borderStyle: component.props.style }} />
          )}
        </div>
      )}

      {/* Video Component */}
      {component.type === 'video' && (
        <div className="relative">
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
            <div className="aspect-video">
              <iframe
                src={component.props.url}
                title="Embedded video"
                className="w-full h-full rounded"
                allowFullScreen
              />
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
            flex: '1 1 0',
            minWidth: '200px',
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const title = prompt('Enter card title:', component.props.title);
                  if (title !== null) {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, title }
                    });
                  }
                }}
                className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                title="Edit Title"
              >
                <Type className="h-4 w-4" />
                Edit
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

          <h3 
            className="text-xl font-bold mb-3 text-center"
            style={{ 
              fontFamily: `'${themeFonts.heading}', sans-serif`,
              color: themeColors.text,
            }}
          >
            {component.props.title}
          </h3>
          
          <p 
            className="text-center"
            style={{ 
              fontFamily: `'${themeFonts.body}', sans-serif`,
              color: themeColors.textSecondary,
              fontSize: '14px',
            }}
          >
            {component.props.description}
          </p>
        </div>
      )}

      {/* Banner Component */}
      {component.type === 'banner' && (
        <div 
          className="relative w-full flex flex-col items-center justify-center text-center"
          style={{
            backgroundColor: component.props.backgroundColor || themeColors.primary,
            backgroundImage: component.props.backgroundImage ? `url(${component.props.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: component.props.height || '400px',
            padding: '60px 40px',
            color: component.props.textColor || '#ffffff',
          }}
        >
          {/* Inline toolbar for banner */}
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
                  const heading = prompt('Enter heading:', component.props.heading);
                  if (heading !== null) {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, heading }
                    });
                  }
                }}
                className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                title="Edit Heading"
              >
                <Type className="h-4 w-4" />
                Edit
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const color = prompt('Enter background color (hex):', component.props.backgroundColor);
                  if (color !== null) {
                    onUpdateComponent(component.id, {
                      ...component,
                      props: { ...component.props, backgroundColor: color }
                    });
                  }
                }}
                className="px-3 py-1.5 hover:bg-gray-100 rounded text-sm flex items-center gap-1.5 transition-colors text-gray-900"
                title="Change Color"
              >
                <Settings className="h-4 w-4" />
                Color
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

          <h1 
            className="text-5xl font-bold mb-4"
            style={{ 
              fontFamily: `'${themeFonts.heading}', sans-serif`,
              color: component.props.textColor || '#ffffff',
            }}
          >
            {component.props.heading}
          </h1>
          
          {component.props.subheading && (
            <p 
              className="text-xl mb-8 max-w-2xl"
              style={{ 
                fontFamily: `'${themeFonts.body}', sans-serif`,
                color: component.props.textColor || '#ffffff',
                opacity: 0.9,
              }}
            >
              {component.props.subheading}
            </p>
          )}
          
          {component.props.buttonText && (
            <button
              className="px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105"
              style={{
                backgroundColor: '#ffffff',
                color: component.props.backgroundColor || themeColors.primary,
              }}
            >
              {component.props.buttonText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
