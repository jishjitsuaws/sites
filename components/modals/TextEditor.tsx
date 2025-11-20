'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link as LinkIcon,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface TextEditorToolbarProps {
  component: any;
  onUpdate: (props: any) => void;
  onClose: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  position: { x: number; y: number };
  themeColors?: any;
  themeFonts?: any;
}

export default function TextEditorToolbar({ 
  component, 
  onUpdate, 
  onClose, 
  onDelete, 
  onCopy,
  position,
  themeColors,
  themeFonts 
}: TextEditorToolbarProps) {
  const [textSize, setTextSize] = useState(component.props.size || 'text');
  const [fontSize, setFontSize] = useState(component.props.fontSize || 16);
  const [fontFamily, setFontFamily] = useState(component.props.fontFamily || themeFonts?.body || 'Inter');
  const [isBold, setIsBold] = useState(component.props.bold || false);
  const [isItalic, setIsItalic] = useState(component.props.italic || false);
  const [isUnderline, setIsUnderline] = useState(component.props.underline || false);
  const [textColor, setTextColor] = useState(component.props.color || themeColors?.text || '#1e293b');
  const [alignment, setAlignment] = useState(component.props.align || 'left');
  const [link, setLink] = useState(component.props.link || '');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [borderWidth, setBorderWidth] = useState(component.props.borderWidth || 0);
  const [borderColor, setBorderColor] = useState(component.props.borderColor || '#000000');
  const [borderStyle, setBorderStyle] = useState(component.props.borderStyle || 'solid');
  const [borderRadius, setBorderRadius] = useState(component.props.borderRadius || 0);

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Update state when component changes (switching between different text components)
  useEffect(() => {
    setTextSize(component.props.size || 'text');
    setFontSize(component.props.fontSize || 16);
    setFontFamily(component.props.fontFamily || themeFonts?.body || 'Inter');
    setIsBold(component.props.bold || false);
    setIsItalic(component.props.italic || false);
    setIsUnderline(component.props.underline || false);
    setTextColor(component.props.color || themeColors?.text || '#1e293b');
    setAlignment(component.props.align || 'left');
    setLink(component.props.link || '');
    setBorderWidth(component.props.borderWidth || 0);
    setBorderColor(component.props.borderColor || '#000000');
    setBorderStyle(component.props.borderStyle || 'solid');
    setBorderRadius(component.props.borderRadius || 0);
  }, [component.id, component.props.text]); // Re-sync when component changes or text is edited

  // Helper function to update component props
  const updateProps = (newProps: any) => {
    onUpdate({
      ...component.props,
      ...newProps,
    });
  };

  // Only update fontSize when textSize changes intentionally (not on component switch)
  const handleTextSizeChange = (newSize: string) => {
    setTextSize(newSize);
    let newFontSize = fontSize;
    if (newSize === 'title') newFontSize = 36;
    else if (newSize === 'heading') newFontSize = 24;
    else if (newSize === 'text') newFontSize = 16;
    else if (newSize === 'subtext') newFontSize = 14;
    setFontSize(newFontSize);
    
    // Immediately update component with new size and fontSize
    updateProps({
      size: newSize,
      fontSize: newFontSize,
    });
  };

  const fontOptions = [
    'Inter',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Playfair Display',
  ];

  return (
    <div 
      ref={toolbarRef}
      className="absolute bg-white rounded-lg shadow-2xl border border-gray-300 p-3 z-50"
      style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        minWidth: '700px',
        maxWidth: 'calc(100vw - 20px)',
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {/* Text Size */}
        <select
          value={textSize}
          onChange={(e) => handleTextSizeChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="title">Title</option>
          <option value="heading">Heading</option>
          <option value="text">Text</option>
          <option value="subtext">Sub-text</option>
        </select>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Font Family */}
        <select
          value={fontFamily}
          onChange={(e) => {
            const newFont = e.target.value;
            setFontFamily(newFont);
            updateProps({ fontFamily: newFont });
          }}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
        >
          {fontOptions.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>

        {/* Font Size */}
        <input
          type="number"
          value={fontSize}
          onChange={(e) => {
            const newSize = parseInt(e.target.value) || 16;
            setFontSize(newSize);
            updateProps({ fontSize: newSize });
          }}
          min="8"
          max="72"
          className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Text Formatting */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const newBold = !isBold;
            setIsBold(newBold);
            updateProps({ bold: newBold });
          }}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${isBold ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const newItalic = !isItalic;
            setIsItalic(newItalic);
            updateProps({ italic: newItalic });
          }}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${isItalic ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const newUnderline = !isUnderline;
            setIsUnderline(newUnderline);
            updateProps({ underline: newUnderline });
          }}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${isUnderline ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Text Color */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              const newColor = e.target.value;
              setTextColor(newColor);
              updateProps({ color: newColor });
            }}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            title="Text Color"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => {
              let newColor = e.target.value;
              // Validate hex format
              if (newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                setTextColor(newColor);
                updateProps({ color: newColor });
              } else if (newColor.match(/^#[0-9A-Fa-f]{0,5}$/)) {
                // Allow typing but don't update
                setTextColor(newColor);
              }
            }}
            placeholder="#000000"
            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
            title="Hex Color Code"
          />
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Border Options */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Border:</label>
          <input
            type="number"
            value={borderWidth}
            onChange={(e) => {
              const width = parseInt(e.target.value) || 0;
              setBorderWidth(width);
              updateProps({ borderWidth: width, borderColor, borderStyle, borderRadius });
            }}
            min="0"
            max="20"
            className="w-12 px-2 py-1 border border-gray-300 rounded text-xs"
            title="Border Width (px)"
          />
          <span className="text-xs text-gray-500">px</span>
          
          {borderWidth > 0 && (
            <>
              <select
                value={borderStyle}
                onChange={(e) => {
                  setBorderStyle(e.target.value);
                  updateProps({ borderWidth, borderColor, borderStyle: e.target.value, borderRadius });
                }}
                className="px-2 py-1 border border-gray-300 rounded text-xs"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
              
              <input
                type="color"
                value={borderColor}
                onChange={(e) => {
                  setBorderColor(e.target.value);
                  updateProps({ borderWidth, borderColor: e.target.value, borderStyle, borderRadius });
                }}
                className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                title="Border Color"
              />
              
              <input
                type="number"
                value={borderRadius}
                onChange={(e) => {
                  const radius = parseInt(e.target.value) || 0;
                  setBorderRadius(radius);
                  updateProps({ borderWidth, borderColor, borderStyle, borderRadius: radius });
                }}
                min="0"
                max="50"
                placeholder="Radius"
                className="w-12 px-2 py-1 border border-gray-300 rounded text-xs"
                title="Border Radius (px)"
              />
            </>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Alignment Icons */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setAlignment('left');
            updateProps({ align: 'left' });
          }}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${alignment === 'left' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setAlignment('center');
            updateProps({ align: 'center' });
          }}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${alignment === 'center' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setAlignment('right');
            updateProps({ align: 'right' });
          }}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${alignment === 'right' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Link */}
        <button
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${link ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Copy & Delete */}
        {onCopy && (
          <button
            onClick={onCopy}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 transition-colors"
            title="Copy"
          >
            <Copy className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Link Input (shown when link button is clicked) */}
      {showLinkInput && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <label className="block text-xs font-medium text-gray-700 mb-1">Link URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com or /page-slug"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                setShowLinkInput(false);
                updateProps({ link });
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Done
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Link to another page or external URL</p>
        </div>
      )}
    </div>
  );
}
