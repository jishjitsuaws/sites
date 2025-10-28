'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';

interface Component {
  id: string;
  type: string;
  props: any;
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

interface Page {
  _id: string;
  pageName: string;
  slug: string;
  isHome: boolean;
  content: Component[];
  sections?: Section[];
}

interface Site {
  _id: string;
  siteName: string;
  subdomain: string;
  isPublished: boolean;
  themeId?: {
    _id: string;
    name: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fonts?: {
      heading: string;
      body: string;
    };
  };
  customTheme?: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
  };
}

export default function PublishedSitePage() {
  const params = useParams();
  const subdomain = params?.subdomain as string;
  
  const [site, setSite] = useState<Site | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subdomain) {
      fetchSite();
    }
  }, [subdomain]);

  const fetchSite = async () => {
    try {
      setLoading(true);
      // Fetch site by subdomain
      const siteRes = await fetch(`http://localhost:5000/api/sites?subdomain=${subdomain}`);
      const siteData = await siteRes.json();
      
      if (!siteData.success || !siteData.data || siteData.data.length === 0) {
        notFound();
        return;
      }

      const foundSite = siteData.data[0];
      
      // Check if site is published
      if (!foundSite.isPublished) {
        notFound();
        return;
      }

      console.log('Fetched site:', foundSite); // Debug: check theme data
      setSite(foundSite);

      // Fetch pages for this site
      const pagesRes = await fetch(`http://localhost:5000/api/sites/${foundSite._id}/pages`);
      const pagesData = await pagesRes.json();

      if (pagesData.success && pagesData.data) {
        setPages(pagesData.data);
        
        // Load home page
        const homePage = pagesData.data.find((p: Page) => p.isHome);
        const firstPage = homePage || pagesData.data[0];
        
        if (firstPage) {
          setCurrentPage(firstPage);
        }
      }
    } catch (err) {
      console.error('Failed to load site:', err);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  // Get theme colors - prioritize themeId, fallback to customTheme, then defaults
  const getThemeColors = () => {
    return site?.themeId?.colors || site?.customTheme?.colors || {
      background: '#ffffff',
      text: '#000000',
      primary: '#3b82f6',
      secondary: '#8b5cf6'
    };
  };

  // Get theme fonts
  const getThemeFonts = () => {
    return site?.themeId?.fonts || {
      heading: 'Inter',
      body: 'Inter'
    };
  };

  const renderComponent = (component: Component) => {
    const themeColors = getThemeColors();
    const themeFonts = getThemeFonts();
    
    switch (component.type) {
      case 'heading':
        const HeadingTag = `h${component.props.level}` as keyof JSX.IntrinsicElements;
        const headingClasses = component.props.level === 1 
          ? 'text-4xl font-bold' 
          : component.props.level === 2 
          ? 'text-3xl font-bold' 
          : 'text-2xl font-bold';
        return (
          <HeadingTag 
            className={headingClasses}
            style={{ 
              textAlign: component.props.align,
              color: themeColors.primary,
              fontFamily: `'${themeFonts.heading}', sans-serif`,
              fontSize: component.props.fontSize ? `${component.props.fontSize}px` : undefined,
              fontWeight: component.props.bold ? 'bold' : 'normal',
              fontStyle: component.props.italic ? 'italic' : 'normal',
              textDecoration: component.props.underline ? 'underline' : 'none',
              maxWidth: component.props.width || '100%',
              width: component.props.width || 'auto',
              margin: component.props.width 
                ? (component.props.align === 'center' ? '0 auto' : component.props.align === 'right' ? '0 0 0 auto' : '0')
                : '0',
            }}
          >
            {component.props.text}
          </HeadingTag>
        );

      case 'text':
        return (
          <p style={{ 
            textAlign: component.props.align,
            color: themeColors.text,
            fontFamily: `'${themeFonts.body}', sans-serif`,
            fontSize: component.props.fontSize ? `${component.props.fontSize}px` : undefined,
            fontWeight: component.props.bold ? 'bold' : 'normal',
            fontStyle: component.props.italic ? 'italic' : 'normal',
            textDecoration: component.props.underline ? 'underline' : 'none',
            maxWidth: component.props.width || '100%',
            width: component.props.width || 'auto',
            margin: component.props.width 
              ? (component.props.align === 'center' ? '0 auto' : component.props.align === 'right' ? '0 0 0 auto' : '0')
              : '0',
          }}>
            {component.props.text}
          </p>
        );

      case 'image':
        return component.props.src ? (
          <div style={{ 
            textAlign: (!component.props.float || component.props.float === 'none') ? (component.props.align || 'center') : 'left',
            width: '100%'
          }}>
            <img 
              src={component.props.src} 
              alt={component.props.alt || ''} 
              className="inline-block rounded"
              style={{
                width: component.props.width || '100%',
                maxWidth: '100%',
                height: component.props.height || 'auto',
                objectFit: component.props.objectFit || (component.props.height ? 'cover' : 'contain'),
                float: (component.props.float && component.props.float !== 'none') ? component.props.float : 'none',
                marginRight: (component.props.float === 'left') ? '20px' : '0',
                marginLeft: (component.props.float === 'right') ? '20px' : '0',
                marginBottom: (component.props.float && component.props.float !== 'none') ? '16px' : '0'
              }}
            />
          </div>
        ) : null;

      case 'button':
        return (
          <div style={{ textAlign: component.props.align || 'center' }}>
            <a 
              href={component.props.href} 
              className="inline-block px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: component.props.variant === 'primary' 
                  ? themeColors.primary 
                  : themeColors.secondary,
                color: '#ffffff'
              }}
            >
              {component.props.text}
            </a>
          </div>
        );

      case 'video':
        return component.props.url ? (
          <div className="aspect-video">
            <iframe
              src={component.props.url}
              title="Embedded video"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        ) : null;

      case 'divider':
        return (
          <div style={{ clear: 'both' }}>
            {component.props.style !== 'none' && (
              <hr 
                style={{ 
                  borderColor: component.props.color || themeColors.primary, 
                  borderStyle: component.props.style || 'solid'
                }} 
              />
            )}
          </div>
        );

      case 'card':
        return (
          <div 
            className="flex flex-col rounded-lg border-2"
            style={{
              backgroundColor: component.props.backgroundColor || '#ffffff',
              borderColor: component.props.borderColor || '#e5e7eb',
              padding: `${component.props.padding || 24}px`,
              flex: '1 1 0',
              minWidth: '200px',
            }}
          >
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
                color: themeColors.text,
                fontSize: '14px',
                opacity: 0.7,
              }}
            >
              {component.props.description}
            </p>
          </div>
        );

      case 'banner':
        return (
          <div 
            className="w-full flex flex-col items-center justify-center text-center"
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
              <a
                href={component.props.buttonLink || '#'}
                className="px-8 py-3 rounded-lg font-semibold text-lg transition-all hover:scale-105 inline-block"
                style={{
                  backgroundColor: '#ffffff',
                  color: component.props.backgroundColor || themeColors.primary,
                }}
              >
                {component.props.buttonText}
              </a>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!site || !currentPage) {
    notFound();
    return null;
  }

  const themeColors = getThemeColors();
  const themeFonts = getThemeFonts();

  // Generate Google Fonts URL
  const fontFamilies = [themeFonts.heading, themeFonts.body]
    .filter((font, index, self) => self.indexOf(font) === index) // Remove duplicates
    .map(font => font.replace(/ /g, '+'))
    .join('&family=');
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;

  return (
    <>
      <link rel="stylesheet" href={googleFontsUrl} />
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: themeColors.background,
          color: themeColors.text,
          fontFamily: `'${themeFonts.body}', sans-serif`
        }}
      >
      {/* Fixed Navbar */}
      <header 
        className="sticky top-0 z-50 border-b shadow-sm"
        style={{
          backgroundColor: themeColors.background,
          borderColor: themeColors.primary
        }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-xl font-bold"
              style={{ color: themeColors.primary }}
            >
              {site.siteName}
            </h1>
            <nav className="flex gap-4">
              {pages.map((page) => (
                <button
                  key={page._id}
                  onClick={() => setCurrentPage(page)}
                  className="text-sm font-medium transition-colors pb-1"
                  style={{
                    color: currentPage._id === page._id ? themeColors.primary : themeColors.text,
                    borderBottom: currentPage._id === page._id ? `2px solid ${themeColors.primary}` : 'none',
                    opacity: currentPage._id === page._id ? 1 : 0.7
                  }}
                >
                  {page.pageName}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="container mx-auto px-6 py-8">
        {currentPage.sections && currentPage.sections.length > 0 ? (
          // Render sections with flexbox layout
          <div className="space-y-0">
            {currentPage.sections.map((section) => (
              <div 
                key={section.id}
                className="flex"
                style={{
                  flexDirection: section.layout.direction,
                  justifyContent: section.layout.justifyContent,
                  alignItems: section.layout.alignItems,
                  gap: `${section.layout.gap}px`,
                  padding: `${section.layout.padding}px`,
                  backgroundColor: section.layout.backgroundColor || 'transparent',
                }}
              >
                {section.components.map((component) => (
                  <div 
                    key={component.id}
                    style={{
                      width: component.props.width || 'auto',
                      maxWidth: '100%',
                    }}
                  >
                    {renderComponent(component)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : currentPage.content && currentPage.content.length > 0 ? (
          // Legacy: Render flat components (backward compatibility)
          <div className="space-y-6">
            {currentPage.content.map((component) => (
              <div key={component.id}>{renderComponent(component)}</div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: themeColors.text, opacity: 0.6 }}>
            <p>This page has no content yet.</p>
          </div>
        )}
      </main>
      </div>
    </>
  );
}
