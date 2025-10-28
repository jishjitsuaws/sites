'use client';

import { Image as ImageIcon, Upload } from 'lucide-react';

interface BlockRendererProps {
  component: any;
  themeColors: any;
  themeFonts: any;
  isSelected: boolean;
  onImageUpload?: (imageIndex: number) => void;
}

export default function BlockRenderer({ 
  component, 
  themeColors, 
  themeFonts,
  isSelected,
  onImageUpload 
}: BlockRendererProps) {
  const props = component.props;

  // Hero Center Layout
  if (props.layout === 'hero-center') {
    return (
      <div 
        className="py-20 px-6 text-center rounded-lg"
        style={{ 
          backgroundColor: props.backgroundColor || themeColors.surface,
          backgroundImage: props.backgroundType === 'gradient' 
            ? `linear-gradient(${props.gradientDirection || 'to right'}, ${props.gradientFrom || themeColors.primary}, ${props.gradientTo || themeColors.secondary})` 
            : undefined
        }}
      >
        <h1 
          className="text-5xl font-bold mb-4"
          style={{ 
            fontFamily: `'${themeFonts.heading}', sans-serif`,
            color: props.textColor || themeColors.text 
          }}
        >
          {props.heading}
        </h1>
        {props.subheading && (
          <h2 
            className="text-2xl mb-6"
            style={{ 
              fontFamily: `'${themeFonts.body}', sans-serif`,
              color: props.textColor || themeColors.textSecondary 
            }}
          >
            {props.subheading}
          </h2>
        )}
        <p 
          className="text-lg mb-8 max-w-2xl mx-auto"
          style={{ 
            fontFamily: `'${themeFonts.body}', sans-serif`,
            color: props.textColor || themeColors.textSecondary 
          }}
        >
          {props.text}
        </p>
        {props.buttonText && (
          <button
            className="px-8 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
            style={{ backgroundColor: themeColors.primary }}
          >
            {props.buttonText}
          </button>
        )}
      </div>
    );
  }

  // Hero with Image (Right)
  if (props.layout === 'hero-image-right') {
    return (
      <div className="grid md:grid-cols-2 gap-8 items-center py-12 px-6">
        <div>
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ 
              fontFamily: `'${themeFonts.heading}', sans-serif`,
              color: themeColors.text 
            }}
          >
            {props.heading}
          </h1>
          <p 
            className="text-lg mb-6"
            style={{ 
              fontFamily: `'${themeFonts.body}', sans-serif`,
              color: themeColors.textSecondary 
            }}
          >
            {props.text}
          </p>
          {props.buttonText && (
            <button
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
              style={{ backgroundColor: themeColors.primary }}
            >
              {props.buttonText}
            </button>
          )}
        </div>
        <div>
          {props.image ? (
            <img 
              src={props.image} 
              alt={props.imageAlt} 
              className="w-full rounded-lg shadow-lg object-cover"
              style={{ height: '384px' }}
            />
          ) : (
            <div 
              className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onImageUpload?.(0)}
            >
              <div className="text-center text-gray-500">
                <Upload className="h-12 w-12 mx-auto mb-2" />
                <p>Click to upload image</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Hero with Image (Left)
  if (props.layout === 'hero-image-left') {
    return (
      <div className="grid md:grid-cols-2 gap-8 items-center py-12 px-6">
        <div>
          {props.image ? (
            <img 
              src={props.image} 
              alt={props.imageAlt} 
              className="w-full rounded-lg shadow-lg object-cover"
              style={{ height: '384px' }}
            />
          ) : (
            <div 
              className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onImageUpload?.(0)}
            >
              <div className="text-center text-gray-500">
                <Upload className="h-12 w-12 mx-auto mb-2" />
                <p>Click to upload image</p>
              </div>
            </div>
          )}
        </div>
        <div>
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ 
              fontFamily: `'${themeFonts.heading}', sans-serif`,
              color: themeColors.text 
            }}
          >
            {props.heading}
          </h1>
          <p 
            className="text-lg mb-6"
            style={{ 
              fontFamily: `'${themeFonts.body}', sans-serif`,
              color: themeColors.textSecondary 
            }}
          >
            {props.text}
          </p>
          {props.buttonText && (
            <button
              className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105"
              style={{ backgroundColor: themeColors.primary }}
            >
              {props.buttonText}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Feature Grid 3 Column
  if (props.layout === 'feature-grid-3') {
    return (
      <div className="py-12 px-6">
        {props.heading && (
          <h2 
            className="text-3xl font-bold text-center mb-12"
            style={{ 
              fontFamily: `'${themeFonts.heading}', sans-serif`,
              color: themeColors.text 
            }}
          >
            {props.heading}
          </h2>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          {props.features?.map((feature: any, index: number) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow" style={{ backgroundColor: themeColors.surface }}>
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ 
                  fontFamily: `'${themeFonts.heading}', sans-serif`,
                  color: themeColors.text 
                }}
              >
                {feature.title}
              </h3>
              <p 
                style={{ 
                  fontFamily: `'${themeFonts.body}', sans-serif`,
                  color: themeColors.textSecondary 
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Feature Grid 4 Column
  if (props.layout === 'feature-grid-4') {
    return (
      <div className="py-12 px-6">
        {props.heading && (
          <h2 
            className="text-3xl font-bold text-center mb-12"
            style={{ 
              fontFamily: `'${themeFonts.heading}', sans-serif`,
              color: themeColors.text 
            }}
          >
            {props.heading}
          </h2>
        )}
        <div className="grid md:grid-cols-4 gap-6">
          {props.features?.map((feature: any, index: number) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow" style={{ backgroundColor: themeColors.surface }}>
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 
                className="text-lg font-semibold mb-2"
                style={{ 
                  fontFamily: `'${themeFonts.heading}', sans-serif`,
                  color: themeColors.text 
                }}
              >
                {feature.title}
              </h3>
              <p 
                className="text-sm"
                style={{ 
                  fontFamily: `'${themeFonts.body}', sans-serif`,
                  color: themeColors.textSecondary 
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Image Grid 3 Column
  if (props.layout === 'image-grid-3') {
    return (
      <div className="py-12 px-6">
        {props.heading && (
          <h2 
            className="text-3xl font-bold text-center mb-12"
            style={{ 
              fontFamily: `'${themeFonts.heading}', sans-serif`,
              color: themeColors.text 
            }}
          >
            {props.heading}
          </h2>
        )}
        <div className="grid md:grid-cols-3 gap-6">
          {props.images?.map((img: any, index: number) => (
            <div key={index} className="overflow-hidden rounded-lg">
              {img.src ? (
                <div>
                  <img src={img.src} alt={img.alt} className="w-full h-64 object-cover hover:scale-105 transition-transform" />
                  {img.caption && (
                    <p className="text-center mt-2" style={{ color: themeColors.textSecondary }}>
                      {img.caption}
                    </p>
                  )}
                </div>
              ) : (
                <div 
                  className="w-full h-64 bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={() => onImageUpload?.(index)}
                >
                  <div className="text-center text-gray-500">
                    <Upload className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-sm">Upload image {index + 1}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Image Grid 4 Column
  if (props.layout === 'image-grid-4') {
    return (
      <div className="py-12 px-6">
        <div className="grid md:grid-cols-4 gap-4">
          {props.images?.map((img: any, index: number) => (
            <div key={index} className="overflow-hidden rounded-lg">
              {img.src ? (
                <img src={img.src} alt={img.alt} className="w-full h-48 object-cover hover:scale-105 transition-transform" />
              ) : (
                <div 
                  className="w-full h-48 bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={() => onImageUpload?.(index)}
                >
                  <div className="text-center text-gray-500">
                    <Upload className="h-8 w-8 mx-auto mb-1" />
                    <p className="text-xs">Upload</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // CTA Section
  if (props.layout === 'cta-section') {
    return (
      <div 
        className="py-20 px-6 text-center rounded-lg"
        style={{ backgroundColor: props.backgroundColor || themeColors.primary }}
      >
        <h2 
          className="text-4xl font-bold mb-4"
          style={{ 
            fontFamily: `'${themeFonts.heading}', sans-serif`,
            color: props.textColor || '#ffffff'
          }}
        >
          {props.heading}
        </h2>
        <p 
          className="text-lg mb-8"
          style={{ 
            fontFamily: `'${themeFonts.body}', sans-serif`,
            color: props.textColor || '#ffffff',
            opacity: 0.9
          }}
        >
          {props.text}
        </p>
        {props.buttonText && (
          <button
            className="px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            style={{ 
              backgroundColor: '#ffffff',
              color: props.backgroundColor || themeColors.primary
            }}
          >
            {props.buttonText}
          </button>
        )}
      </div>
    );
  }

  // Image + Text 2 Column
  if (props.layout === 'image-text-2col') {
    return (
      <div className={`grid md:grid-cols-2 gap-8 items-center py-12 px-6 ${props.imagePosition === 'right' ? 'md:grid-flow-dense' : ''}`}>
        <div className={props.imagePosition === 'right' ? 'md:col-start-2' : ''}>
          {props.image ? (
            <img 
              src={props.image} 
              alt={props.imageAlt} 
              className="w-full rounded-lg shadow-lg object-cover"
              style={{ height: '320px' }}
            />
          ) : (
            <div 
              className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={() => onImageUpload?.(0)}
            >
              <div className="text-center text-gray-500">
                <Upload className="h-12 w-12 mx-auto mb-2" />
                <p>Click to upload image</p>
              </div>
            </div>
          )}
        </div>
        <div className={props.imagePosition === 'right' ? 'md:col-start-1 md:row-start-1' : ''}>
          <h2 
            className="text-3xl font-bold mb-4"
            style={{ 
              fontFamily: `'${themeFonts.heading}', sans-serif`,
              color: themeColors.text 
            }}
          >
            {props.heading}
          </h2>
          <p 
            className="text-lg"
            style={{ 
              fontFamily: `'${themeFonts.body}', sans-serif`,
              color: themeColors.textSecondary 
            }}
          >
            {props.text}
          </p>
        </div>
      </div>
    );
  }

  return <div className="p-8 text-center text-gray-500">Unknown block layout</div>;
}
