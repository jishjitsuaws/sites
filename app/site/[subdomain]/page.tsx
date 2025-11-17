'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getYouTubeEmbedUrl } from '@/lib/utils';

// Timer Component with real-time countdown for published site
function PublishedTimerComponent({ component, themeColors, themeFonts }: any) {
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
      className="text-center p-4 md:p-8 rounded-lg"
      style={{
        backgroundColor: component.props.backgroundColor || 'transparent',
        color: component.props.textColor || themeColors.text,
      }}
    >
      <h3 
        className="text-lg md:text-xl font-semibold mb-4"
        style={{ fontFamily: `'${themeFonts.heading}', sans-serif` }}
      >
        {component.props.title || 'Countdown Timer'}
      </h3>
      <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-md mx-auto">
        <div className="bg-white p-2 md:p-4 rounded-lg shadow-sm border border-gray-200">
          <div 
            className="text-xl md:text-2xl font-bold"
            style={{ color: themeColors.primary }}
          >
            {timeLeft.days}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600 uppercase font-medium">
            Days
          </div>
        </div>
        <div className="bg-white p-2 md:p-4 rounded-lg shadow-sm border border-gray-200">
          <div 
            className="text-xl md:text-2xl font-bold"
            style={{ color: themeColors.primary }}
          >
            {timeLeft.hours}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600 uppercase font-medium">
            Hours
          </div>
        </div>
        <div className="bg-white p-2 md:p-4 rounded-lg shadow-sm border border-gray-200">
          <div 
            className="text-xl md:text-2xl font-bold"
            style={{ color: themeColors.primary }}
          >
            {timeLeft.minutes}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600 uppercase font-medium">
            Minutes
          </div>
        </div>
        <div className="bg-white p-2 md:p-4 rounded-lg shadow-sm border border-gray-200">
          <div 
            className="text-xl md:text-2xl font-bold"
            style={{ color: themeColors.primary }}
          >
            {timeLeft.seconds}
          </div>
          <div className="text-[10px] md:text-xs text-gray-600 uppercase font-medium">
            Seconds
          </div>
        </div>
      </div>
    </div>
  );
}
function PublishedCollapsibleList({ component, themeColors, themeFonts }: any) {
  const [expanded, setExpanded] = useState(!!component.props.expanded);
  const items = Array.isArray(component.props.items) ? component.props.items : [];
  const showLabel = component.props.buttonTextShow || 'Show Items';
  const hideLabel = component.props.buttonTextHide || 'Hide Items';

  return (
    <div style={{ 
      textAlign: component.props.align || 'left',
      maxWidth: component.props.width || '100%',
      margin: component.props.align === 'center' ? '0 auto' : component.props.align === 'right' ? '0 0 0 auto' : '0'
    }}>
      <div className="mb-3">
        <button
          className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? hideLabel : showLabel}
        </button>
      </div>
      {expanded && (
        <div className="space-y-2">
          {items.map((raw: any, idx: number) => {
            const text = typeof raw === 'string' ? raw : (raw?.title || '');
            return (
              <div key={idx} className="border rounded-md p-3 bg-white shadow-sm">
                <div style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text }}>
                  {text || `Item ${idx + 1}`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Published Carousel Component (16:9, cover)
function PublishedCarousel({ component }: any) {
  const [index, setIndex] = useState(component.props.currentIndex || 0);
  const [hover, setHover] = useState(false);
  const images = Array.isArray(component.props.images) ? component.props.images : [];
  const normalizeUrl = (u: string) => {
    if (!u) return '';
    if (u.startsWith('http')) return u;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');
    if (u.startsWith('/')) return `${apiUrl}${u}`;
    if (u.startsWith('uploads')) return `${apiUrl}/${u}`;
    return u;
  };
  const getImgSrc = (img: any) => {
    if (!img) return '';
    if (typeof img === 'string') return normalizeUrl(img);
    return normalizeUrl(img.src || img.url || img.image || img.path || '');
  };
  useEffect(() => {
    // Clamp index if images change
    if (index >= images.length) setIndex(0);
  }, [images.length]);

  // Autoplay on published site (always on unless hovered or only one image)
  useEffect(() => {
    const intervalMs = Number(component.props.autoplayInterval) || 3000;
    if (images.length <= 1 || hover) return;
    const t = setInterval(() => {
      setIndex((prev: number) => ((prev + 1) % images.length));
    }, Math.max(1000, intervalMs));
    return () => clearInterval(t);
  }, [component.props.autoplayInterval, images.length, hover]);

  if (!images.length) {
    return (
      <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-gray-200"></div>
    );
  }

  return (
    <div className="relative w-full" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-gray-200 border border-gray-300" style={{ aspectRatio: '16 / 9' }}>
        {images.map((img: any, idx: number) => (
          <div key={idx} className={`absolute inset-0 transition-opacity duration-300 ${idx === index ? 'opacity-100' : 'opacity-0'}`}>
            {(() => {
              const src = getImgSrc(img);
              return src ? (
                <img src={src} alt={(typeof img === 'object' && img?.alt) || `Slide ${idx + 1}`} className="w-full h-full" style={{ objectFit: 'cover', display: 'block' }} />
              ) : (
                <div className="w-full h-full"></div>
              );
            })()}
          </div>
        ))}
      </div>
      {component.props.showDots && images.length > 1 && (
        <div className="flex gap-2 justify-center mt-2">
          {images.map((_: any, i: number) => (
            <button key={i} onClick={() => setIndex(i)} className={`w-2.5 h-2.5 rounded-full ${i === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

interface Component {
  id: string;
  type: string;
  props: any;
}

interface Section {
  id: string;
  sectionName?: string;
  showInNavbar?: boolean;
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
  logo?: string;
  logoWidth?: string;
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
  const [activeSection, setActiveSection] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (subdomain) {
      fetchSite();
    }
  }, [subdomain]);

  const fetchSite = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      // Fetch site by subdomain
      const siteRes = await fetch(`${apiUrl}/sites?subdomain=${subdomain}`);
      const siteData = await siteRes.json();
      
      if (!siteData.success || !siteData.data || siteData.data.length === 0) {
        notFound();
        return;
      }

      const foundSite = siteData.data[0];
      
      // Allow preview for both published and unpublished sites in development
      // Remove this check in production or add environment check
      // if (!foundSite.isPublished) {
      //   notFound();
      //   return;
      // }

      console.log('Fetched site:', foundSite); // Debug: check theme data
      setSite(foundSite);

      // Fetch pages for this site
      const pagesRes = await fetch(`${apiUrl}/sites/${foundSite._id}/pages`);
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

  // Scrollspy effect for single-page sites
  useEffect(() => {
    if (!currentPage || !currentPage.sections || pages.length > 1) return;

    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = currentPage.sections || [];
          let current = '';
          let lastPassedSection = '';
          
          // Find the section that's currently in view or the last one we've scrolled past
          sections.forEach((section) => {
            const element = document.getElementById(`section-${section.id}`);
            if (element) {
              const rect = element.getBoundingClientRect();
              
              // Section is in the activation zone (near top of viewport)
              if (rect.top <= 200 && rect.bottom >= 0) {
                current = section.id;
              }
              
              // Keep track of the last section we've scrolled past
              if (rect.top <= 200) {
                lastPassedSection = section.id;
              }
            }
          });

          // If no section is in the activation zone, use the last section we passed
          if (!current && lastPassedSection) {
            current = lastPassedSection;
          }
          
          // If still no section (at top of page), default to first section
          if (!current && sections.length > 0) {
            current = sections[0].id;
          }

          if (current && current !== activeSection) {
            setActiveSection(current);
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage, pages.length, activeSection]);

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      const navHeight = 80; // Approximate navbar height
      const top = element.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
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
          ? 'text-3xl md:text-4xl font-bold' 
          : component.props.level === 2 
          ? 'text-2xl md:text-3xl font-bold' 
          : 'text-xl md:text-2xl font-bold';
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
              width: component.props.width || '100%',
              display: 'block',
              margin: component.props.width && component.props.width !== '100%'
                ? (component.props.align === 'center' ? '0 auto' : component.props.align === 'right' ? '0 0 0 auto' : '0')
                : '0',
            }}
          >
            {component.props.text}
          </HeadingTag>
        );

      case 'text':
        return (
          <p className="text-sm md:text-base" style={{ 
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
                width: component.props.width || 'auto',
                maxWidth: '100%',
                height: 'auto', // Always auto to maintain aspect ratio
                objectFit: 'contain',
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
          <div style={{ 
            width: component.props.width || '100%',
            maxWidth: '100%',
            aspectRatio: '16 / 9',
          }}>
            <iframe
              src={getYouTubeEmbedUrl(component.props.url)}
              title="Embedded video"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        ) : null;

      case 'divider':
        return (
          <div style={{ clear: 'both' }}>
            {component.props.style === 'spacer' ? (
              <div style={{ height: component.props.height || '40px' }} />
            ) : component.props.style !== 'none' ? (
              <hr 
                style={{ 
                  borderColor: component.props.color || themeColors.primary, 
                  borderStyle: component.props.style || 'solid'
                }} 
              />
            ) : null}
          </div>
        );

      case 'card':
        return (
          <div 
            className="rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-blue-300 cursor-pointer"
            style={{
              backgroundColor: component.props.backgroundColor || '#ffffff',
              borderColor: component.props.borderColor || '#e5e7eb',
              padding: `${component.props.padding || 24}px`,
              flex: '1 1 300px',
              minWidth: '250px',
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              transform: 'translateY(0)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            {/* Icon Card */}
            {component.props.cardType === 'icon' && component.props.icon && (
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{component.props.icon}</div>
              </div>
            )}

            {/* Image Card */}
            {component.props.cardType === 'image' && component.props.image && (
              <div className="mb-4">
                <div 
                  className="w-full rounded-lg overflow-hidden"
                  style={{ 
                    height: `${component.props.imageFrameHeight || 180}px`,
                    maxHeight: `${component.props.imageFrameHeight || 180}px`,
                    minHeight: `${component.props.imageFrameHeight || 180}px`
                  }}
                >
                  <img
                    src={component.props.image}
                    alt={component.props.title || 'Card image'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
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
                color: themeColors.text,
                fontSize: '14px',
                opacity: 0.7,
              }}
            >
              {component.props.description}
            </p>
          </div>
        );

      case 'carousel':
        return (
          <PublishedCarousel component={component} />
        );

      case 'banner':
        return (
          <div 
            className="w-full flex flex-col items-center justify-center text-center relative"
            style={{
              backgroundColor: component.props.backgroundColor || themeColors.primary,
              minHeight: component.props.backgroundImage ? 'auto' : (component.props.height || '400px'),
              padding: '0',
              color: component.props.textColor || '#ffffff',
            }}
          >
            {component.props.backgroundImage && (
              <img
                src={component.props.backgroundImage}
                alt="Banner background"
                className="w-full h-auto block"
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                }}
              />
            )}
            
            {/* Content overlay when there's an image */}
            {component.props.backgroundImage && (component.props.heading || component.props.subheading || component.props.buttonText) && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-10"
                style={{ paddingTop: '60px', paddingBottom: '60px' }}
              >
                {component.props.heading && (
                  <h1 
                    className="text-3xl md:text-5xl font-bold mb-4"
                    style={{ 
                      fontFamily: `'${themeFonts.heading}', sans-serif`,
                      color: component.props.textColor || '#ffffff',
                    }}
                  >
                    {component.props.heading}
                  </h1>
                )}
                
                {component.props.subheading && (
                  <p 
                    className="text-base md:text-xl mb-8 max-w-2xl"
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
                    target={component.props.buttonLink ? '_blank' : '_self'}
                    rel={component.props.buttonLink ? 'noopener noreferrer' : undefined}
                    className="px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-base md:text-lg transition-all hover:scale-105 inline-block"
                    style={{
                      backgroundColor: '#ffffff',
                      color: component.props.backgroundColor || themeColors.primary,
                      textDecoration: 'none',
                    }}
                  >
                    {component.props.buttonText}
                  </a>
                )}
              </div>
            )}
            
            {/* Content when there's NO image */}
            {!component.props.backgroundImage && (
              <div className="px-4 md:px-10" style={{ paddingTop: '60px', paddingBottom: '60px', width: '100%' }}>
                {component.props.heading && (
                  <h1 
                    className="text-3xl md:text-5xl font-bold mb-4"
                    style={{ 
                      fontFamily: `'${themeFonts.heading}', sans-serif`,
                      color: component.props.textColor || '#ffffff',
                    }}
                  >
                    {component.props.heading}
                  </h1>
                )}
                
                {component.props.subheading && (
                  <p 
                    className="text-base md:text-xl mb-8 max-w-2xl mx-auto"
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
                    target={component.props.buttonLink ? '_blank' : '_self'}
                    rel={component.props.buttonLink ? 'noopener noreferrer' : undefined}
                    className="px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-base md:text-lg transition-all hover:scale-105 inline-block"
                    style={{
                      backgroundColor: '#ffffff',
                      color: component.props.backgroundColor || themeColors.primary,
                      textDecoration: 'none',
                    }}
                  >
                    {component.props.buttonText}
                  </a>
                )}
              </div>
            )}
          </div>
        );

      case 'bullet-list':
        if (component.props.style === 'numbered') {
          return (
            <ol className="list-decimal pl-6" style={{ lineHeight: 1.6, textAlign: component.props.align || 'left' }}>
              {(component.props.items || []).map((item: string, idx: number) => (
                <li key={idx} className="mb-1" style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text }}>{item}</li>
              ))}
            </ol>
          );
        }
        if (component.props.style === 'none') {
          return (
            <div className="space-y-1" style={{ textAlign: component.props.align || 'left' }}>
              {(component.props.items || []).map((item: string, idx: number) => (
                <div key={idx} style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text }}>{item}</div>
              ))}
            </div>
          );
        }
        const bulletTextSizeClass = component.props.textSize === 'heading' ? 'text-3xl' : 
                             component.props.textSize === 'title' ? 'text-2xl' :
                             component.props.textSize === 'subheading' ? 'text-xl' : 'text-base';
        return (
          <ul className="list-disc pl-6" style={{ lineHeight: 1.6, textAlign: component.props.align || 'left' }}>
            {(component.props.items || []).map((item: string, idx: number) => (
              <li key={idx} className={`mb-1 ${bulletTextSizeClass}`} style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text }}>{item}</li>
            ))}
          </ul>
        );

      case 'collapsible-list':
        return <PublishedCollapsibleList component={component} themeColors={themeColors} themeFonts={themeFonts} />;

      case 'social':
        return (
          <div className="flex gap-4 items-center justify-center py-8 min-w-[400px]">
            {/* Show placeholder if no URLs are set */}
            {!component.props.instagramUrl && 
             !component.props.facebookUrl && 
             !component.props.twitterUrl && 
             !component.props.linkedinUrl && 
             !component.props.youtubeUrl && (
              <div className="text-gray-400 text-sm text-center py-4 px-6 border-2 border-dashed border-gray-300 rounded-lg">
                Click here to add social media links for icons to appear
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
        );

      case 'footer':
        return (
          <div 
            className="w-screen mt-auto"
            style={{
              backgroundColor: '#0066CC',
              color: '#ffffff',
              marginLeft: 'calc(-50vw + 50%)',
              marginRight: 'calc(-50vw + 50%)',
              padding: '2rem 1rem',
            }}
          >
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                {/* Left: C-DAC Hyderabad Address */}
                <div>
                  <h3 className="text-base font-bold mb-3" style={{ fontFamily: `'${themeFonts.heading}', sans-serif` }}>
                    C-DAC Hyderabad
                  </h3>
                  <p className="text-sm" style={{ fontFamily: `'${themeFonts.body}', sans-serif` }}>
                    sites.isea.in
                  </p>
                </div>

                {/* Center: Social Network Links */}
                <div className="text-center">
                  <h3 className="text-base font-bold mb-3" style={{ fontFamily: `'${themeFonts.heading}', sans-serif` }}>
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
                  <h3 className="text-base font-bold mb-3" style={{ fontFamily: `'${themeFonts.heading}', sans-serif` }}>
                    Supported By
                  </h3>
                  <div className="flex justify-end items-center gap-4">
                    <img 
                      src="/3.png" 
                      alt="ISEA Logo"
                      className="h-14 w-auto object-contain bg-white rounded p-1"
                    />
                    <img 
                      src="/cdac.png" 
                      alt="C-DAC Logo"
                      className="h-14 w-auto object-contain bg-white rounded p-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'timer':
        return (
          <PublishedTimerComponent 
            component={component}
            themeColors={themeColors}
            themeFonts={themeFonts}
          />
        );

      case 'bullet-list':
        const listTextSizeClass = component.props.textSize === 'heading' ? 'text-2xl md:text-3xl' : 
                             component.props.textSize === 'title' ? 'text-xl md:text-2xl' :
                             component.props.textSize === 'subheading' ? 'text-lg md:text-xl' : 'text-sm md:text-base';
        
        return (
          <div style={{ textAlign: component.props.align || 'left' }}>
            {component.props.style === 'numbered' ? (
              <ol className="list-decimal pl-6" style={{ lineHeight: 1.6, color: themeColors.text }}>
                {(component.props.items || []).map((item: string, idx: number) => (
                  <li key={idx} className={`mb-1 ${listTextSizeClass}`}>
                    <span style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            ) : component.props.style === 'none' ? (
              <div className="space-y-1">
                {(component.props.items || []).map((item: string, idx: number) => (
                  <div key={idx} className={listTextSizeClass}>
                    <span style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="list-disc pl-6" style={{ lineHeight: 1.6, color: themeColors.text }}>
                {(component.props.items || []).map((item: string, idx: number) => (
                  <li key={idx} className={`mb-1 ${listTextSizeClass}`}>
                    <span style={{ fontFamily: `'${themeFonts.body}', sans-serif`, color: themeColors.text }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case 'collapsible-list':
        return (
          <PublishedCollapsibleList 
            component={component}
            themeColors={themeColors}
            themeFonts={themeFonts}
          />
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
        className="min-h-screen flex flex-col"
        style={{ 
          backgroundColor: themeColors.background,
          color: themeColors.text,
          fontFamily: `'${themeFonts.body}', sans-serif`,
          overflowX: 'clip'
        }}
      >
      {/* Fixed Navbar */}
      <header 
        className="sticky top-0 z-50 border-b shadow-sm bg-white"
        style={{
          backgroundColor: themeColors.background,
          borderColor: themeColors.primary
        }}
      >
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile: Single page - centered logo */}
            {pages.length === 1 && (
              <div className="md:hidden flex-1 flex justify-center">
                {site.logo ? (
                  <img 
                    src={site.logo} 
                    alt={site.siteName}
                    style={{
                      height: '32px',
                      width: 'auto',
                      maxWidth: site.logoWidth || '150px',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <h1 
                    className="text-lg font-bold"
                    style={{ color: themeColors.primary }}
                  >
                    {site.siteName}
                  </h1>
                )}
              </div>
            )}

            {/* Mobile: Multi-page - logo left, hamburger right */}
            {pages.length > 1 && (
              <>
                <div className="md:hidden flex items-center gap-3">
                  {/* ISEA Logo - Always displayed (immutable) */}
                  <img 
                    src="/3.png" 
                    alt="ISEA Logo"
                    style={{ 
                      height: '40px',
                      width: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                  
                  {/* Site Logo or Name */}
                  {site.logo ? (
                    <img 
                      src={site.logo} 
                      alt={site.siteName}
                      style={{
                        height: '32px',
                        width: 'auto',
                        maxWidth: site.logoWidth || '150px',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <h1 
                      className="text-lg font-bold"
                      style={{ color: themeColors.primary }}
                    >
                      {site.siteName}
                    </h1>
                  )}
                </div>
                
                {/* Hamburger Menu Button */}
                <button
                  className="md:hidden p-2"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  <svg 
                    className="h-6 w-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: themeColors.text }}
                  >
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            )}

            {/* Desktop Logo/Title */}
            <div className="hidden md:flex items-center gap-3">
              {/* ISEA Logo - Always displayed (immutable) */}
              <img 
                src="/3.png" 
                alt="ISEA Logo"
                style={{ 
                  height: '45px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
              
              {/* Site Logo or Name */}
              {site.logo ? (
                <img 
                  src={site.logo} 
                  alt={site.siteName}
                  style={{
                    height: '32px',
                    width: 'auto',
                    maxWidth: site.logoWidth || '150px',
                    objectFit: 'contain'
                  }}
                  className="md:h-10"
                />
              ) : (
                <h1 
                  className="text-lg md:text-xl font-bold"
                  style={{ color: themeColors.primary }}
                >
                  {site.siteName}
                </h1>
              )}
            </div>
            
            {/* Desktop Multi-page navigation */}
            {pages.length > 1 && (
              <nav className="hidden md:flex gap-6">
                {pages.map((page) => (
                  <button
                    key={page._id}
                    onClick={() => setCurrentPage(page)}
                    className="text-base font-medium transition-colors pb-2"
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
            )}
            
            {/* Desktop Single-page section navigation (scrollspy) */}
            {pages.length === 1 && currentPage?.sections && currentPage.sections.length > 0 && (
              <nav className="hidden md:flex gap-4 lg:gap-6">
                {currentPage.sections
                  .filter(section => section.showInNavbar === true || section.showInNavbar === undefined)
                  .map((section) => {
                    const visibleSections = (currentPage.sections || []).filter(s => s.showInNavbar === true || s.showInNavbar === undefined);
                    const visibleIndex = visibleSections.findIndex(s => s.id === section.id);
                    const sectionName = section.sectionName || `Section ${visibleIndex + 1}`;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className="text-sm lg:text-base font-medium transition-colors pb-2"
                        style={{
                          color: activeSection === section.id ? themeColors.primary : themeColors.text,
                          borderBottom: activeSection === section.id ? `2px solid ${themeColors.primary}` : 'none',
                          opacity: activeSection === section.id ? 1 : 0.7
                        }}
                      >
                        {sectionName}
                      </button>
                    );
                  })}
              </nav>
            )}
          </div>

          {/* Mobile Menu Dropdown */}
          {pages.length > 1 && mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t" style={{ borderColor: themeColors.primary }}>
              <nav className="flex flex-col gap-3">
                {pages.map((page) => (
                  <button
                    key={page._id}
                    onClick={() => {
                      setCurrentPage(page);
                      setMobileMenuOpen(false);
                    }}
                    className="text-left px-4 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: currentPage._id === page._id ? `${themeColors.primary}15` : 'transparent',
                      color: currentPage._id === page._id ? themeColors.primary : themeColors.text,
                      fontWeight: currentPage._id === page._id ? '600' : '400'
                    }}
                  >
                    {page.pageName}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 container mx-auto flex flex-col" style={{ overflow: 'visible', padding: '1rem 2rem 0 2rem' }}>
        {currentPage.sections && currentPage.sections.length > 0 ? (
          // Render sections with flexbox layout (excluding footer sections)
          <>
            <div style={{ marginBottom: 0 }}>
            {currentPage.sections.filter(section => !section.components?.some((c: any) => c.type === 'footer')).map((section, index) => {
              // Check if this is a card section
              const cardCount = section.components?.filter((c: any) => c.type === 'card').length || 0;
              const isCardSection = cardCount >= 1; // Any section with cards
              
              // Respect user's direction choice, don't force row layout
              const direction = section.layout.direction || 'column';
              const justify = section.layout.justifyContent || 'flex-start';
              const align = section.layout.alignItems || 'stretch';
              const flexWrap = isCardSection ? 'wrap' : 'nowrap';
              
              // Check if section has banner or footer (full-width components)
              const hasFullWidthComponent = section.components?.some((c: any) => 
                c.type === 'banner' || c.type === 'footer'
              );
              
              // Check if this is the last section
              const isLastSection = index === (currentPage.sections?.length || 0) - 1;
              
              // For cards on mobile, use centered justification
              const mobileJustify = isCardSection && direction === 'row' ? 'center' : justify;
              
              return (
                <div 
                  id={`section-${section.id}`}
                  key={section.id}
                  className="flex w-full scroll-mt-20"
                  style={{
                    display: 'flex',
                    flexDirection: direction,
                    alignItems: align,
                    flexWrap: flexWrap,
                    gap: isCardSection ? '24px' : `${section.layout.gap || 16}px`,
                    padding: hasFullWidthComponent ? '0' : `${section.layout.padding}px`,
                    backgroundColor: section.layout.backgroundColor || 'transparent',
                    // For full-width components, extend to full width by negating parent's padding
                    marginLeft: hasFullWidthComponent ? '-32px' : '0',
                    marginRight: hasFullWidthComponent ? '-32px' : '0',
                    marginTop: hasFullWidthComponent && index === 0 ? '-16px' : undefined,
                    marginBottom: isLastSection ? '0' : '24px', // No margin on last section
                    width: hasFullWidthComponent ? 'calc(100% + 64px)' : 'auto',
                  }}
                >
                  <style jsx>{`
                    @media (max-width: 767px) {
                      #section-${section.id} {
                        justify-content: ${mobileJustify} !important;
                      }
                    }
                    @media (min-width: 768px) {
                      #section-${section.id} {
                        justify-content: ${justify} !important;
                      }
                    }
                  `}</style>
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
                      style={{
                        // Ensure full width for components that need container width for geometry
                        width: hasOwnAlignment
                          ? '100%'
                          : (component.type === 'card'
                              ? undefined
                              : (component.type === 'carousel' || component.type === 'banner' || component.type === 'footer'
                                  ? '100%'
                                  : (component.props.width || 'auto'))),
                        alignSelf: alignSelf,
                        // Don't apply flex/minWidth to wrapper when it's a card - the card itself has these properties
                      }}
                    >
                      {renderComponent(component)}
                    </div>
                  );
                })}
              </div>
            );
            })}
          </div>
          {/* Dynamic spacer that fills remaining space */}
          <div style={{ flex: 1, minHeight: '2rem' }}></div>
          </>
        ) : currentPage.content && currentPage.content.length > 0 ? (
          // Legacy: Render flat components (backward compatibility)
          <>
            <div className="space-y-6" style={{ marginBottom: 0 }}>
              {currentPage.content.map((component) => (
                <div key={component.id}>{renderComponent(component)}</div>
              ))}
            </div>
            {/* Dynamic spacer that fills remaining space */}
            <div style={{ flex: 1, minHeight: '2rem' }}></div>
          </>
        ) : (
          <>
            <div className="text-center py-12" style={{ color: themeColors.text, opacity: 0.6, marginBottom: 0 }}>
              <p>This page has no content yet.</p>
            </div>
            {/* Dynamic spacer that fills remaining space */}
            <div style={{ flex: 1, minHeight: '2rem' }}></div>
          </>
        )}
      </main>

      {/* Render Footer from page sections if available, otherwise show default */}
      {currentPage && currentPage.sections ? (
        // Find and render footer section
        currentPage.sections
          .filter((section: any) => section.components?.some((c: any) => c.type === 'footer'))
          .map((footerSection: any) => {
            const footerComponent = footerSection.components.find((c: any) => c.type === 'footer');
            return footerComponent ? (
              <div key={footerSection.id}>
                {renderComponent(footerComponent)}
              </div>
            ) : null;
          })
      ) : (
        // Default hardcoded footer (fallback)
        <footer 
          style={{
            backgroundColor: '#1f2937',
            color: '#ffffff',
            padding: '3rem 0',
          }}
        >
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Your Company</h3>
                <p className="text-gray-300">Building amazing experiences for our customers.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>© 2024 Your Company. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
      </div>
    </>
  );
}
