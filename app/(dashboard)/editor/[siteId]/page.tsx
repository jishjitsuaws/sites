'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { useEditorStore } from '@/lib/store/editorStore';
import Button from '@/components/ui/Button';
import ImageModal from '@/components/modals/ImageModal';
import ButtonModal from '@/components/modals/ButtonModal';
import TextEditorToolbar from '@/components/modals/TextEditor';
import BlockModal from '@/components/modals/BlockModal';
import ComponentRenderer from '@/components/editor/ComponentRenderer';
import SectionWrapper from '@/components/editor/SectionWrapper';
import ComponentsPanel from '@/components/editor/ComponentsPanel';
import ThemesPanel from '@/components/editor/ThemesPanel';
import PagesPanel from '@/components/editor/PagesPanel';
import LogoHandler from '@/components/editor/LogoHandler';
import {
  Save,
  Eye,
  Settings,
  ChevronLeft,
  Plus,
  FileText,
  Image as ImageIcon,
  Type,
  Video,
  Link as LinkIcon,
  Layout,
  Palette,
  Trash2,
  Upload,
  Layers,
  Minus,
} from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Site {
  _id: string;
  siteName: string;
  subdomain: string;
  isPublished: boolean;
  logo?: string;
  logoWidth?: string;
  themeId?: string | {
    _id: string;
    name: string;
    description?: string;
    colors?: any;
    fonts?: {
      heading: string;
      body: string;
    };
    effects?: {
      enableHoverEffects?: boolean;
      hoverScale?: number;
      hoverShadow?: string;
      transitionDuration?: string;
      enableGradients?: boolean;
      enableAlternatingSections?: boolean;
      alternateSectionColor?: string;
    };
  };
  theme?: {
    _id: string;
    name: string;
    description?: string;
    colors?: any;
    fonts?: {
      heading: string;
      body: string;
    };
    effects?: {
      enableHoverEffects?: boolean;
      hoverScale?: number;
      hoverShadow?: string;
      transitionDuration?: string;
      enableGradients?: boolean;
      enableAlternatingSections?: boolean;
      alternateSectionColor?: string;
    };
  };
}

interface Page {
  _id: string;
  pageName: string;
  slug: string;
  isHome: boolean;
  content: any[];
  sections?: any[];
  settings?: {
    showInNavbar?: boolean;
  };
}

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params?.siteId as string;

  const [site, setSite] = useState<Site | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState<'pages' | 'insert' | 'themes'>('insert');
  const [selectedComponent, setSelectedComponent] = useState<any | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<{componentId: string, sectionId: string} | null>(null);
  const [dragOverComponent, setDragOverComponent] = useState<string | null>(null);
  const [themes, setThemes] = useState<any[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishName, setPublishName] = useState('');
  const [publishSubdomain, setPublishSubdomain] = useState('');
  const [showAddPageForm, setShowAddPageForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  
  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [showTextToolbar, setShowTextToolbar] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showCardGridModal, setShowCardGridModal] = useState(false);
  const [cardGridMode, setCardGridMode] = useState<'create' | 'edit'>('create');
  const [cardGridTargetSectionId, setCardGridTargetSectionId] = useState<string | null>(null);
  const [cardGridForm, setCardGridForm] = useState({
    count: 3,
    cardType: 'text' as 'text' | 'icon' | 'image',
    template: 'outlined' as 'simple' | 'outlined' | 'elevated',
    imageFrameHeight: 180,
    icon: '⭐',
  });
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNavbarSettings, setShowNavbarSettings] = useState(false);
  const [isEditingSiteName, setIsEditingSiteName] = useState(false);
  const [editedSiteName, setEditedSiteName] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const { 
    components, 
    sections,
    addComponent, 
    addSection,
    updateComponent, 
    updateSection,
    deleteComponent,
    deleteSection, 
    setComponents,
    setSections,
    reorderComponentsInSection,
    setSelectedComponent: setStoreSelectedComponent,
  } = useEditorStore();

  useEffect(() => {
    if (siteId) {
      fetchSiteData();
      fetchThemes();
    }
  }, [siteId]);

  const fetchThemes = async () => {
    try {
      const response = await api.get('/themes');
      setThemes(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch themes:', err);
    }
  };

  // Scrollspy for editor: highlight sections in navbar while scrolling
  useEffect(() => {
    const container = document.getElementById('editor-scroll-container');
    if (!container || !currentPage || !sections.length) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        let current: string | null = null;
        let lastPassed: string | null = null;

        sections.forEach((section: any) => {
          const el = document.getElementById(`section-${section.id}`);
          if (!el) return;

          const rect = el.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const top = rect.top - containerRect.top; // position within scroll container

          if (top <= 200 && rect.bottom - containerRect.top >= 0) {
            current = section.id;
          }
          if (top <= 200) {
            lastPassed = section.id;
          }
        });

        if (!current && lastPassed) current = lastPassed;
        if (!current && sections.length > 0) current = sections[0].id;

        if (current) {
          setActiveSection(current);
        }

        ticking = false;
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true as any });
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll as any);
    };
  }, [currentPage, sections]);

  const fetchSiteData = async () => {
    try {
      setLoading(true);
      
      // Fetch site first
      const siteRes = await api.get(`/sites/${siteId}`);

      const siteData = siteRes.data.data;

      if (!siteData) {
        toast.error('Site not found');
        router.push('/home');
        return;
      }

      setSite(siteData);

      // Then fetch pages - handle error if no pages exist yet
      try {
        const pagesRes = await api.get(`/sites/${siteId}/pages`);
        const pagesData = pagesRes.data.data || [];
        setPages(pagesData);

        // Load first page or home page
        const homePage = pagesData.find((p: Page) => p.isHome);
        const firstPage = homePage || pagesData[0];
        
        if (firstPage) {
          setCurrentPage(firstPage);
          
          // ALWAYS prioritize sections if they exist
          if (firstPage.sections && firstPage.sections.length > 0) {
            
            // Check if footer exists, if not add it
            const hasFooter = firstPage.sections.some((s: any) => 
              s.components?.some((c: any) => c.type === 'footer')
            );
            
            if (!hasFooter) {
              console.log('[Editor] No footer found, adding default footer');
              const defaultFooterSection = {
                id: `section-footer-${Date.now()}`,
                sectionName: '',
                showInNavbar: false,
                components: [{
                  id: `footer-${Date.now()}`,
                  type: 'footer',
                  props: {
                    companyName: 'Your Company',
                    description: 'Building amazing experiences for our customers.',
                    backgroundColor: '#1f2937',
                    textColor: '#ffffff',
                    link1Text: 'About',
                    link1Url: '#',
                    link2Text: 'Services', 
                    link2Url: '#',
                    link3Text: 'Contact',
                    link3Url: '#',
                    social1Text: 'Twitter',
                    social1Url: '#',
                    social2Text: 'LinkedIn',
                    social2Url: '#',
                    social3Text: 'Facebook',
                    social3Url: '#',
                  }
                }],
                layout: {
                  direction: 'column' as const,
                  justifyContent: 'center' as const,
                  alignItems: 'center' as const,
                  gap: 16,
                  padding: 0,
                },
                order: firstPage.sections.length,
              };
              setSections([...firstPage.sections, defaultFooterSection]);
            } else {
              setSections(firstPage.sections);
            }
            setComponents([]); // Don't use content when sections exist
          } else {
            console.log('[Editor] No sections found, creating default footer');
            const defaultFooterSection = {
              id: `section-footer-${Date.now()}`,
              sectionName: '',
              showInNavbar: false,
              components: [{
                id: `footer-${Date.now()}`,
                type: 'footer',
                props: {
                  companyName: 'Your Company',
                  description: 'Building amazing experiences for our customers.',
                  backgroundColor: '#1f2937',
                  textColor: '#ffffff',
                  link1Text: 'About',
                  link1Url: '#',
                  link2Text: 'Services', 
                  link2Url: '#',
                  link3Text: 'Contact',
                  link3Url: '#',
                  social1Text: 'Twitter',
                  social1Url: '#',
                  social2Text: 'LinkedIn',
                  social2Url: '#',
                  social3Text: 'Facebook',
                  social3Url: '#',
                }
              }],
              layout: {
                direction: 'column' as const,
                justifyContent: 'center' as const,
                alignItems: 'center' as const,
                gap: 16,
                padding: 0,
              },
              order: 0,
            };
            setSections([defaultFooterSection]);
            setComponents([]);
          }
        } else {
          // No pages yet - create a default home page with footer
          const defaultFooterSection = {
            id: `section-footer-${Date.now()}`,
            sectionName: '',
            showInNavbar: false,
            components: [{
              id: `footer-${Date.now()}`,
              type: 'footer',
              props: {
                companyName: 'Your Company',
                description: 'Building amazing experiences for our customers.',
                backgroundColor: '#1f2937',
                textColor: '#ffffff',
                link1Text: 'About',
                link1Url: '#',
                link2Text: 'Services', 
                link2Url: '#',
                link3Text: 'Contact',
                link3Url: '#',
                social1Text: 'Twitter',
                social1Url: '#',
                social2Text: 'LinkedIn',
                social2Url: '#',
                social3Text: 'Facebook',
                social3Url: '#',
              }
            }],
            layout: {
              direction: 'column' as const,
              justifyContent: 'center' as const,
              alignItems: 'center' as const,
              gap: 16,
              padding: 0,
            },
            order: 0,
          };

          const defaultPage = await api.post(`/sites/${siteId}/pages`, {
            pageName: 'Home',
            slug: '',
            isHome: true,
            sections: [defaultFooterSection],
          });
          const newPage = defaultPage.data.data;
          setPages([newPage]);
          setCurrentPage(newPage);
          setComponents([]);
          setSections([defaultFooterSection]);
        }
      } catch (pageErr: any) {
        console.error('Error fetching pages:', pageErr);
        // If pages endpoint fails (404 means no pages yet), try to create a default page
        if (pageErr.response?.status === 404 || pageErr.response?.data?.count === 0) {
          try {
            const defaultFooterSection = {
              id: `section-footer-${Date.now()}`,
              sectionName: '',
              showInNavbar: false,
              components: [{
                id: `footer-${Date.now()}`,
                type: 'footer',
                props: {
                  companyName: 'Your Company',
                  description: 'Building amazing experiences for our customers.',
                  backgroundColor: '#1f2937',
                  textColor: '#ffffff',
                  link1Text: 'About',
                  link1Url: '#',
                  link2Text: 'Services', 
                  link2Url: '#',
                  link3Text: 'Contact',
                  link3Url: '#',
                  social1Text: 'Twitter',
                  social1Url: '#',
                  social2Text: 'LinkedIn',
                  social2Url: '#',
                  social3Text: 'Facebook',
                  social3Url: '#',
                }
              }],
              layout: {
                direction: 'column' as const,
                justifyContent: 'center' as const,
                alignItems: 'center' as const,
                gap: 16,
                padding: 0,
              },
              order: 0,
            };

            const defaultPage = await api.post(`/sites/${siteId}/pages`, {
              pageName: 'Home',
              slug: 'home',
              isHome: true,
              sections: [defaultFooterSection],
            });
            const newPage = defaultPage.data.data;
            setPages([newPage]);
            setCurrentPage(newPage);
            setComponents([]);
            setSections([defaultFooterSection]);
          } catch (createErr) {
            console.error('Error creating default page:', createErr);
            // Continue anyway with empty pages
            setPages([]);
          }
        } else {
          // Real error, not just missing pages
          setPages([]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching site data:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to load site data');
      // Redirect back to home if site not found
      if (err.response?.status === 404 || err.response?.status === 403) {
        router.push('/home');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentPage) return;

    setSaving(true);
    try {
      // Clean up and format sections for saving
      const cleanedSections = sections.map(section => ({
        ...section,
        layout: {
          ...section.layout,
          // Force row layout for sections with multiple cards
          direction: section.components.length >= 2 && section.components.every((c: any) => c.type === 'card') 
            ? 'row' 
            : section.layout.direction,
          justifyContent: section.components.length >= 2 && section.components.every((c: any) => c.type === 'card')
            ? 'space-between'
            : section.layout.justifyContent,
          alignItems: section.components.length >= 2 && section.components.every((c: any) => c.type === 'card')
            ? 'stretch'
            : section.layout.alignItems,
        }
      }));
      
      // Flatten sections to components for legacy backend compatibility
      const flatComponents = cleanedSections.flatMap(section => section.components);
      
      const response = await api.put(`/pages/${currentPage._id}`, {
        content: flatComponents,
        sections: cleanedSections,
      });
      
      console.log('Save response:', response.data);
      
      // Update local state
      setPages(pages.map(p => 
        p._id === currentPage._id 
          ? { ...p, content: flatComponents, sections: cleanedSections } 
          : p
      ));
      
      setCurrentPage({ ...currentPage, content: flatComponents, sections: cleanedSections });
      setSections(cleanedSections);
      
      toast.success('Changes saved successfully');
    } catch (err: any) {
      console.error('Save error:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      // First, save the current page
      if (currentPage) {
        setSaving(true);
        console.log('Saving page before preview:', currentPage._id);
        
        const cleanedSections = sections.map(section => ({
          ...section,
          layout: {
            ...section.layout,
            direction: section.components.length >= 2 && section.components.every((c: any) => c.type === 'card') 
              ? 'row' 
              : section.layout.direction,
            justifyContent: section.components.length >= 2 && section.components.every((c: any) => c.type === 'card')
              ? 'space-between'
              : section.layout.justifyContent,
            alignItems: section.components.length >= 2 && section.components.every((c: any) => c.type === 'card')
              ? 'stretch'
              : section.layout.alignItems,
          }
        }));
        
        const flatComponents = cleanedSections.flatMap(section => section.components);
        
        await api.put(`/pages/${currentPage._id}`, {
          content: flatComponents,
          sections: cleanedSections,
        });
        
        setPages(pages.map(p => 
          p._id === currentPage._id 
            ? { ...p, content: flatComponents, sections: cleanedSections } 
            : p
        ));
        
        setSaving(false);
      }

      // Then publish the site
      if (!site) return;
      
      // Check if site has proper name and subdomain
      if (site.siteName === 'Untitled Site' || site.subdomain.startsWith('site-')) {
        toast.error('Please set a site name and subdomain before previewing');
        setPublishName(site.siteName || '');
        setPublishSubdomain('');
        setShowPublishModal(true);
        return;
      }

      await api.post(`/sites/${siteId}/publish`);
      setSite({ ...site, isPublished: true });
      
      // Open published site in new tab
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      window.open(`${siteUrl}/site/${site.subdomain}`, '_blank');
      
      toast.success('Site saved and published! Opening preview...');
    } catch (err: any) {
      console.error('Preview error:', err);
      toast.error(err.response?.data?.message || 'Failed to preview site');
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    // Check if site has a proper name and subdomain
    if (!site || site.siteName === 'Untitled Site' || site.subdomain.startsWith('site-')) {
      setPublishName(site?.siteName || '');
      setPublishSubdomain('');
      setShowPublishModal(true);
      return;
    }

    // Already has proper name, just publish
    try {
      await api.post(`/sites/${siteId}/publish`);
      toast.success('Site published successfully!');
      if (site) {
        setSite({ ...site, isPublished: true });
      }
      // Open published site in new tab
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      window.open(`${siteUrl}/site/${site.subdomain}`, '_blank');
    } catch (err: any) {
      toast.error('Failed to publish site');
    }
  };

  const handlePublishWithDetails = async () => {
    if (!publishName || !publishSubdomain) {
      toast.error('Please provide both site name and subdomain');
      return;
    }

    try {
      // Update site details first
      await api.put(`/sites/${siteId}`, {
        siteName: publishName,
        subdomain: publishSubdomain,
      });

      // Then publish
      await api.post(`/sites/${siteId}/publish`);
      
      toast.success('Site published successfully!');
      setShowPublishModal(false);
      
      // Update local state
      if (site) {
        setSite({ ...site, siteName: publishName, subdomain: publishSubdomain, isPublished: true });
      }
      
      // Open published site
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      window.open(`${siteUrl}/site/${publishSubdomain}`, '_blank');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish site');
    }
  };

  const handleSaveLogo = (logoData: { logo: string; logoWidth: string }) => {
    if (site) {
      setSite({ ...site, ...logoData });
    }
  };

  const handleSaveSiteName = async () => {
    if (!editedSiteName.trim() || editedSiteName === site?.siteName) {
      setIsEditingSiteName(false);
      return;
    }

    try {
      await api.put(`/sites/${siteId}`, {
        siteName: editedSiteName.trim(),
      });
      
      if (site) {
        setSite({ ...site, siteName: editedSiteName.trim() });
      }
      
      toast.success('Site name updated');
      setIsEditingSiteName(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update site name');
    }
  };

  const handleAddPage = async () => {
    if (!newPageName.trim()) {
      toast.error('Please enter a page name');
      return;
    }

    try {
      const response = await api.post(`/sites/${siteId}/pages`, {
        pageName: newPageName,
        siteId,
      });
      const newPage = response.data.data;
      setPages([...pages, newPage]);
      setCurrentPage(newPage);
      // Initialize empty state for new page
      setSections([]);
      setComponents([]);
      setNewPageName('');
      setShowAddPageForm(false);
      toast.success('Page created successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create page');
      console.error(err);
    }
  };

  const handlePageSwitch = async (page: Page) => {
    console.log('=== Switching page ===');
    console.log('Current page:', currentPage?.pageName, currentPage?._id);
    console.log('Target page:', page.pageName, page._id);
    
    // Auto-save current page if it has sections
    if (currentPage && sections.length > 0) {
      try {
        console.log('Auto-saving current page...');
        await handleSave();
      } catch (err) {
        console.error('Failed to auto-save:', err);
      }
    }
    
    // Fetch fresh page data from backend to ensure we have latest sections
    try {
      const pageRes = await api.get(`/pages/${page._id}`);
      const freshPage = pageRes.data.data;
      
      // Load target page with fresh data
      setCurrentPage(freshPage);
      setActiveSection(null);
      
      if (freshPage.sections && freshPage.sections.length > 0) {
        console.log('Loading sections from fresh page data:', freshPage.sections.length);
        setSections(freshPage.sections);
        setComponents([]);
      } else if (freshPage.content && freshPage.content.length > 0) {
        console.log('Converting content to sections:', freshPage.content.length);
        const convertedSections = freshPage.content.map((component: any, index: number) => ({
          id: `section-${component.id}`,
          components: [component],
          layout: {
            direction: 'column' as const,
            justifyContent: 'flex-start' as const,
            alignItems: 'center' as const,
            gap: 16,
            padding: 24,
          },
          order: index,
        }));
        setSections(convertedSections);
        setComponents(freshPage.content);
      } else {
        console.log('Empty page');
        setSections([]);
        setComponents([]);
      }
      
      // Update pages array with fresh data
      setPages(pages.map(p => p._id === freshPage._id ? freshPage : p));
    } catch (err) {
      console.error('Failed to fetch fresh page data:', err);
      // Fallback to cached page data
      setCurrentPage(page);
      setActiveSection(null);
      
      if (page.sections && page.sections.length > 0) {
        console.log('Loading sections from cached page:', page.sections.length);
        setSections(page.sections);
        setComponents([]);
      } else {
        setSections([]);
        setComponents([]);
      }
    }
    
    setSelectedComponent(null);
    setSelectedSection(null);
  };

  const handleDeletePage = async (pageId: string, pageName: string) => {
    if (!confirm(`Are you sure you want to delete "${pageName}"?`)) {
      return;
    }

    // Prevent deleting the last page
    if (pages.length === 1) {
      toast.error('Cannot delete the last page');
      return;
    }

    try {
      await api.delete(`/pages/${pageId}`);
      
      // Remove from pages array
      const updatedPages = pages.filter(p => p._id !== pageId);
      setPages(updatedPages);
      
      // If we deleted the current page, switch to the first available page
      if (currentPage?._id === pageId) {
        const nextPage = updatedPages[0];
        setCurrentPage(nextPage);
        // Prioritize sections over content
        if (nextPage.sections && nextPage.sections.length > 0) {
          setSections(nextPage.sections);
          setComponents([]); // Clear components when using sections
        } else if (nextPage.content && nextPage.content.length > 0) {
          const convertedSections = nextPage.content.map((component: any, index: number) => ({
            id: `section-${component.id}`,
            components: [component],
            layout: {
              direction: 'column' as const,
              justifyContent: 'flex-start' as const,
              alignItems: 'center' as const,
              gap: 16,
              padding: 24,
            },
            order: index,
          }));
          setSections(convertedSections);
          setComponents(nextPage.content);
        } else {
          setSections([]);
          setComponents([]);
        }
      }
      
      toast.success('Page deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete page');
    }
  };

  const insertComponentTypes = [
    { id: 'hero-center', name: 'Hero Center', icon: Layout, description: 'Centered hero section' },
    { id: 'banner-full', name: 'Text Banner', icon: Layout, description: 'Banner with text & button' },
    { id: 'banner-minimal', name: 'Image Banner', icon: ImageIcon, description: 'Banner - image only' },
    { id: 'heading', name: 'Heading', icon: Type, description: 'Add a title or heading' },
    { id: 'text', name: 'Text', icon: FileText, description: 'Add a paragraph of text' },
    { id: 'image', name: 'Image', icon: ImageIcon, description: 'Insert an image' },
    { id: 'button', name: 'Button', icon: LinkIcon, description: 'Add a clickable button' },
    { id: 'video', name: 'Video', icon: Video, description: 'Embed a video' },
  { id: 'divider', name: 'Divider', icon: Minus, description: 'Line / Dashed / Dotted / Spacer' },
    { id: 'social', name: 'Social Links', icon: LinkIcon, description: 'Instagram, Facebook, Twitter icons' },
    { id: 'timer', name: 'Countdown Timer', icon: Layout, description: 'Countdown to a specific date' },
    { id: 'card-grid', name: 'Card Grid', icon: Layout, description: 'Add 1-5 cards in a row' },
    { id: 'carousel', name: 'Carousel', icon: ImageIcon, description: 'Image carousel (1–5, 16:9)' },
    { id: 'bullet-list', name: 'Bullet List', icon: FileText, description: 'Bulleted or numbered list' },
    { id: 'collapsible-list', name: 'Collapsible List', icon: FileText, description: 'Expandable items with > or bullets' },
    { id: 'faqs', name: 'FAQs', icon: FileText, description: 'Questions with expandable answers' },
  ];

  const handleInsertComponent = (type: string) => {
    // Handle hero-center template - creates a centered hero section
    if (type === 'hero-center') {
      const timestamp = Date.now();
      const newComponents = [
        {
          id: `heading-${timestamp}`,
          type: 'heading',
          props: {
            text: 'Welcome',
            align: 'center',
            fontSize: 48,
            fontFamily: getThemeFonts().heading,
            bold: true,
            color: getThemeColors().primary,
          }
        },
        {
          id: `text-${timestamp + 1}`,
          type: 'text',
          props: {
            text: 'Add your description here',
            align: 'center',
            fontSize: 18,
            color: getThemeColors().textSecondary,
          }
        },
        {
          id: `button-${timestamp + 2}`,
          type: 'button',
          props: {
            text: 'Get Started',
            href: '#',
            variant: 'primary',
            align: 'center',
          }
        }
      ];

      const newSection = {
        id: `section-${Date.now()}`,
        components: newComponents,
        layout: {
          direction: 'column' as const,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          gap: 24,
          padding: 80,
        },
        order: sections.length,
      };

      addSection(newSection);
      setSelectedSection(newSection.id);
      toast.success('Hero section added');
      return;
    }

    // Handle card grid specially - show modal to choose number of cards
    if (type === 'card-grid') {
      setCardGridMode('create');
      setCardGridTargetSectionId(null);
      setCardGridForm({ count: 3, cardType: 'text', template: 'outlined', imageFrameHeight: 180, icon: '⭐' });
      setShowCardGridModal(true);
      return;
    }

    const newComponent: any = {
      id: `${type}-${Date.now()}`,
      type: type === 'banner-full' || type === 'banner-minimal' ? 'banner' : type,
      subType: type === 'banner-full' || type === 'banner-minimal' ? type : undefined,
      props: getDefaultProps(type),
    };

    // Banner gets a full-width section
    if (type === 'banner-full' || type === 'banner-minimal') {
      const newSection = {
        id: `section-${Date.now()}`,
        components: [newComponent],
        layout: {
          direction: 'column' as const,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          gap: 16,
          padding: 0, // No padding for full-width banners
          backgroundColor: 'transparent', // No section background - banner has its own
        },
        order: sections.length,
      };
      addSection(newSection);
      setSelectedSection(newSection.id);
      toast.success('Banner added');
      return;
    }

    // Footer gets a full-width section like banners
    if (type === 'footer') {
      const newSection = {
        id: `section-${Date.now()}`,
        components: [newComponent],
        layout: {
          direction: 'column' as const,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          gap: 16,
          padding: 0, // No padding for full-width footer
          backgroundColor: newComponent.props.backgroundColor,
        },
        order: sections.length,
      };
      addSection(newSection);
      setSelectedSection(newSection.id);
      toast.success('Footer added');
      return;
    }

    // Create a new section for this component
    const newSection = {
      id: `section-${Date.now()}`,
      components: [newComponent],
      layout: {
        direction: 'column' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        gap: 16,
        padding: 24,
      },
      order: sections.length,
    };

    // For images and buttons, open modal immediately
    if (type === 'image') {
      addSection(newSection);
      setSelectedComponent(newComponent);
      setSelectedSection(newSection.id);
      setShowImageModal(true);
    } else if (type === 'button') {
      addSection(newSection);
      setSelectedComponent(newComponent);
      setSelectedSection(newSection.id);
      setShowButtonModal(true);
    } else {
      addSection(newSection);
      setSelectedSection(newSection.id);
      toast.success('Component added');
    }
  };

  const createCardGrid = (numberOfCards: number, config?: { cardType?: 'text'|'icon'|'image'; template?: 'simple'|'outlined'|'elevated'; imageFrameHeight?: number; icon?: string; }) => {
    const timestamp = Date.now();
    const cardComponents = [];
    
    for (let i = 1; i <= numberOfCards; i++) {
      cardComponents.push({
        id: `card-${timestamp}-${i}`,
        type: 'card',
        props: {
          cardType: config?.cardType || 'text',
          icon: config?.icon || '⭐',
          image: '',
          title: `Card ${i}`,
          description: `Description for card ${i}`,
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          padding: 24,
          template: config?.template || 'outlined',
          imageFrameHeight: config?.imageFrameHeight || 180,
        }
      });
    }

    const cardSection = {
      id: `section-${timestamp}`,
      components: cardComponents,
      layout: {
        direction: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'stretch' as const,
        gap: 24,
        padding: 40,
      },
      order: sections.length,
    };

    addSection(cardSection);
    setSelectedSection(cardSection.id);
    setShowCardGridModal(false);
    toast.success(`${numberOfCards}-card grid added!`);
  };

  const openCardGridEditorForSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const cards = section.components.filter((c: any) => c.type === 'card');
    const first = cards[0]?.props || {};
    setCardGridMode('edit');
    setCardGridTargetSectionId(sectionId);
    setCardGridForm({
      count: cards.length || 3,
      cardType: (first.cardType as any) || 'text',
      template: (first.template as any) || 'outlined',
      imageFrameHeight: typeof first.imageFrameHeight === 'number' ? first.imageFrameHeight : 180,
      icon: first.icon || '⭐',
    });
    setShowCardGridModal(true);
  };

  const applyCardGridToSection = (sectionId: string, form: typeof cardGridForm) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    // Ensure components are cards only
    let cards = section.components.filter((c: any) => c.type === 'card');
    const currentCount = cards.length;
    const desired = Math.max(1, form.count);
    const timestamp = Date.now();

    if (desired > currentCount) {
      const toAdd = desired - currentCount;
      for (let i = 1; i <= toAdd; i++) {
        cards.push({
          id: `card-${timestamp}-${i}`,
          type: 'card',
          props: {
            cardType: form.cardType,
            icon: form.icon,
            image: '',
            title: `Card ${currentCount + i}`,
            description: `Description for card ${currentCount + i}`,
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            padding: 24,
            template: form.template,
            imageFrameHeight: form.imageFrameHeight,
          }
        });
      }
    } else if (desired < currentCount) {
      cards = cards.slice(0, desired);
    }

    // Update props for all cards
    cards = cards.map((c: any, idx: number) => ({
      ...c,
      props: {
        ...c.props,
        cardType: form.cardType,
        icon: form.icon,
        template: form.template,
        imageFrameHeight: form.imageFrameHeight,
      },
    }));

    const updatedSection = {
      ...section,
      components: cards,
      layout: {
        ...section.layout,
        direction: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'stretch' as const,
        gap: section.layout.gap ?? 24,
        padding: section.layout.padding ?? 40,
      }
    };

    updateSection(section.id, updatedSection);
    setSelectedSection(section.id);
    setShowCardGridModal(false);
    toast.success(`Updated grid: ${desired} ${form.cardType} card(s)`);
  };

  const handleAddEmptySection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      components: [],
      layout: {
        direction: 'column' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        gap: 16,
        padding: 60,
        backgroundColor: '#f9fafb',
      },
      order: sections.length,
    };

    addSection(newSection);
    setSelectedSection(newSection.id);
    toast.success('Empty section added - drag components here!');
  };

  const handleAddBlockTemplate = (template: any) => {
    // Convert block template to individual components
    const timestamp = Date.now();
    const newComponents: any[] = [];
    const layout = template.layout;
    const data = template.structure;
    
    // Force all new sections to maintain their structure
    const preserveSection = true;

    if (layout === 'hero-center') {
      newComponents.push({
        id: `heading-${timestamp}`,
        type: 'heading',
        props: {
          text: data.heading || 'Welcome',
          align: 'center',
          fontSize: 48,
          fontFamily: getThemeFonts().heading,
          bold: true,
          color: getThemeColors().primary,
        }
      });
      if (data.subheading) {
        newComponents.push({
          id: `heading-${timestamp + 1}`,
          type: 'heading',
          props: {
            text: data.subheading,
            align: 'center',
            fontSize: 24,
            fontFamily: getThemeFonts().heading,
            bold: false,
            color: getThemeColors().textSecondary,
          }
        });
      }
      newComponents.push({
        id: `text-${timestamp + 2}`,
        type: 'text',
        props: {
          text: data.text || '',
          align: 'center',
          fontSize: 18,
          color: getThemeColors().textSecondary,
        }
      });
      if (data.buttonText) {
        newComponents.push({
          id: `button-${timestamp + 3}`,
          type: 'button',
          props: {
            text: data.buttonText,
            href: data.buttonLink || '#',
            variant: 'primary',
            align: 'center',
          }
        });
      }
    } else if (layout === 'hero-image-right' || layout === 'hero-image-left') {
      // For hero layouts with side-by-side layout
      // Hero-image-right: Image on right, text on left
      // Hero-image-left: Image on left, text on right
      
      if (layout === 'hero-image-right') {
        // Add image FIRST with float right so it appears on the right
        newComponents.push({
          id: `image-${timestamp}`,
          type: 'image',
          props: {
            src: data.image || '',
            alt: data.imageAlt || 'Image',
            width: '400px',
            height: '300px',
            objectFit: 'cover',
            float: 'right',
          }
        });
        // Then add text content that will wrap to the left
        newComponents.push({
          id: `heading-${timestamp + 1}`,
          type: 'heading',
          props: {
            text: data.heading || 'Feature Heading',
            align: 'left',
            fontSize: 36,
            fontFamily: getThemeFonts().heading,
            bold: true,
            color: getThemeColors().text,
          }
        });
        newComponents.push({
          id: `text-${timestamp + 2}`,
          type: 'text',
          props: {
            text: data.text || '',
            align: 'left',
            fontSize: 16,
            color: getThemeColors().textSecondary,
          }
        });
        if (data.buttonText) {
          newComponents.push({
            id: `button-${timestamp + 3}`,
            type: 'button',
            props: {
              text: data.buttonText,
              href: data.buttonLink || '#',
              variant: 'primary',
              align: 'left',
            }
          });
        }
      } else {
        // For hero-image-left, add image FIRST with float left
        newComponents.push({
          id: `image-${timestamp}`,
          type: 'image',
          props: {
            src: data.image || '',
            alt: data.imageAlt || 'Image',
            width: '400px',
            height: '300px',
            objectFit: 'cover',
            float: 'left',
          }
        });
        newComponents.push({
          id: `heading-${timestamp + 1}`,
          type: 'heading',
          props: {
            text: data.heading || 'Feature Heading',
            align: 'left',
            fontSize: 36,
            fontFamily: getThemeFonts().heading,
            bold: true,
            color: getThemeColors().text,
          }
        });
        newComponents.push({
          id: `text-${timestamp + 2}`,
          type: 'text',
          props: {
            text: data.text || '',
            align: 'left',
            fontSize: 16,
            color: getThemeColors().textSecondary,
          }
        });
        if (data.buttonText) {
          newComponents.push({
            id: `button-${timestamp + 3}`,
            type: 'button',
            props: {
              text: data.buttonText,
              href: data.buttonLink || '#',
              variant: 'primary',
              align: 'left',
            }
          });
        }
      }
      
      // Add a divider to clear the float
      newComponents.push({
        id: `divider-${timestamp + 4}`,
        type: 'divider',
        props: {
          style: 'none',
          color: 'transparent',
        }
      });
    } else if (layout === 'feature-grid-3' || layout === 'feature-grid-4') {
      // Grid layouts: Create header section + grid section
      const gridCount = layout === 'feature-grid-3' ? 3 : 4;
      
      // Header section
      if (data.heading) {
        const headerSection = {
          id: `section-${timestamp}-header`,
          components: [{
            id: `heading-${timestamp}`,
            type: 'heading',
            props: {
              text: data.heading,
              align: 'center',
              fontSize: 32,
              fontFamily: getThemeFonts().heading,
              bold: true,
              color: getThemeColors().text,
            }
          }],
          layout: {
            direction: 'column' as const,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            gap: 16,
            padding: 24,
          },
          order: sections.length,
        };
        addSection(headerSection);
      }
      
      // Create feature card components
      const gridComponents: any[] = [];
      data.features?.forEach((feature: any, idx: number) => {
        gridComponents.push({
          id: `feature-card-${timestamp + idx}`,
          type: 'card',
          props: {
            cardType: 'icon',
            icon: feature.icon || '⭐',
            image: '',
            title: feature.title,
            description: feature.description,
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            padding: 24,
          }
        });
      });
      
      // Create grid section with row layout
      const gridSection = {
        id: `section-${timestamp}-grid`,
        components: gridComponents,
        layout: {
          direction: 'row' as const,
          justifyContent: 'flex-start' as const,
          alignItems: 'stretch' as const,
          gap: 24,
          padding: 40,
        },
        order: sections.length,
      };
      
      addSection(gridSection);
      toast.success(`Added ${gridCount}-column grid!`);
      setShowBlockModal(false);
      return; // Early return for grids
    } else if (layout.startsWith('card-grid-')) {
      // Card grids: 2-5 columns
      const gridCount = parseInt(layout.split('-')[2]);
      
      // Header section
      if (data.heading) {
        const headerSection = {
          id: `section-${timestamp}-header`,
          components: [{
            id: `heading-${timestamp}`,
            type: 'heading',
            props: {
              text: data.heading,
              align: 'center',
              fontSize: 32,
              fontFamily: getThemeFonts().heading,
              bold: true,
              color: getThemeColors().text,
            }
          }],
          layout: {
            direction: 'column' as const,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            gap: 16,
            padding: 24,
          },
          order: sections.length,
        };
        addSection(headerSection);
      }
      
      // Create individual card components
      const cardComponents: any[] = [];
      data.cards?.forEach((card: any, idx: number) => {
        cardComponents.push({
          id: `card-${timestamp + idx}`,
          type: 'card',
          props: {
            cardType: 'text',
            icon: '⭐',
            image: '',
            title: card.title,
            description: card.description,
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            padding: 24,
          }
        });
      });
      
      // Create card grid section with row layout
      const cardSection = {
        id: `section-${timestamp}-cards`,
        components: cardComponents,
        layout: {
          direction: 'row' as const,
          justifyContent: 'flex-start' as const,
          alignItems: 'stretch' as const,
          gap: 20,
          padding: 40,
        },
        order: sections.length,
      };
      
      addSection(cardSection);
      toast.success(`Added ${gridCount}-card grid!`);
      setShowBlockModal(false);
      return; // Early return for card grids
    } else if (layout === 'cta-section') {
      newComponents.push({
        id: `heading-${timestamp}`,
        type: 'heading',
        props: {
          text: data.heading || 'Call to Action',
          align: 'center',
          fontSize: 40,
          fontFamily: getThemeFonts().heading,
          bold: true,
          color: getThemeColors().primary,
        }
      });
      newComponents.push({
        id: `text-${timestamp + 1}`,
        type: 'text',
        props: {
          text: data.text || '',
          align: 'center',
          fontSize: 18,
          color: getThemeColors().textSecondary,
        }
      });
      if (data.buttonText) {
        newComponents.push({
          id: `button-${timestamp + 2}`,
          type: 'button',
          props: {
            text: data.buttonText,
            href: data.buttonLink || '#',
            variant: 'primary',
            align: 'center',
          }
        });
      }
    } else if (layout === 'image-grid-3' || layout === 'image-grid-4') {
      const gridCount = layout === 'image-grid-3' ? 3 : 4;
      
      // Header section
      if (data.heading) {
        const headerSection = {
          id: `section-${timestamp}-header`,
          components: [{
            id: `heading-${timestamp}`,
            type: 'heading',
            props: {
              text: data.heading,
              align: 'center',
              fontSize: 32,
              fontFamily: getThemeFonts().heading,
              bold: true,
              color: getThemeColors().text,
            }
          }],
          layout: {
            direction: 'column' as const,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
            gap: 16,
            padding: 24,
          },
          order: sections.length,
        };
        addSection(headerSection);
      }
      
      // Grid images with fixed dimensions
      const gridImages: any[] = [];
      data.images?.forEach((img: any, idx: number) => {
        const imageComponent = {
          id: `image-${timestamp + idx + 1}`,
          type: 'image',
          props: {
            src: img.src || '',
            alt: img.alt || `Image ${idx + 1}`,
            width: `${Math.floor(100 / gridCount) - 2}%`,
            height: '250px',
            objectFit: 'cover', // Crop to fit
            align: 'center',
          }
        };
        gridImages.push(imageComponent);
        
        if (img.caption) {
          gridImages.push({
            id: `text-${timestamp + idx + 1}`,
            type: 'text',
            props: {
              text: img.caption,
              align: 'center',
              fontSize: 14,
              color: getThemeColors().textSecondary,
              width: `${Math.floor(100 / gridCount) - 2}%`,
            }
          });
        }
      });
      
      // Create grid section
      const gridSection = {
        id: `section-${timestamp}-grid`,
        components: gridImages,
        layout: {
          direction: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'flex-start' as const,
          gap: 24,
          padding: 40,
        },
        order: sections.length,
      };
      
      addSection(gridSection);
      toast.success(`Added ${gridCount}-image grid!`);
      setShowBlockModal(false);
      return; // Early return for grids
    } else if (layout === 'image-text-2col') {
      newComponents.push({
        id: `image-${timestamp}`,
        type: 'image',
        props: {
          src: data.image || '',
          alt: data.imageAlt || 'Image',
          width: '400px',
          height: '300px',
          objectFit: 'cover',
          float: 'left',
        }
      });
      newComponents.push({
        id: `heading-${timestamp + 1}`,
        type: 'heading',
        props: {
          text: data.heading || 'Feature',
          align: 'left',
          fontSize: 28,
          fontFamily: getThemeFonts().heading,
          bold: true,
          color: getThemeColors().text,
        }
      });
      newComponents.push({
        id: `text-${timestamp + 2}`,
        type: 'text',
        props: {
          text: data.text || '',
          align: 'left',
          fontSize: 16,
          color: getThemeColors().textSecondary,
        }
      });
      // Add divider to clear float
      newComponents.push({
        id: `divider-${timestamp + 3}`,
        type: 'divider',
        props: {
          style: 'none',
          color: 'transparent',
        }
      });
    }

    // Create a new section with all template components
    const newSection = {
      id: `section-${timestamp}`,
      components: newComponents,
      layout: {
        // Determine layout based on template type - all use column now
        direction: 'column' as const,
        justifyContent: 'center' as const,
        alignItems: layout.includes('hero-center') || layout.includes('cta') || layout.includes('grid') 
          ? 'center' as const 
          : 'flex-start' as const,
        gap: layout.includes('grid') ? 32 : 16,
        padding: 40,
      },
      order: sections.length,
    };

    // Add section with all components at once
    addSection(newSection);
    toast.success(`Added section from template!`);
    setShowBlockModal(false);
  };

  const getDefaultProps = (type: string) => {
    switch (type) {
      case 'banner-full':
        return {
          heading: 'Welcome to our site',
          subheading: 'Discover amazing features',
          backgroundColor: getThemeColors().primary,
          textColor: '#ffffff',
          height: '600px',
          backgroundImage: '',
          buttonText: 'Get Started',
          buttonLink: '#',
        };
      case 'banner-minimal':
        return {
          heading: null,
          subheading: null,
          backgroundColor: getThemeColors().primary,
          textColor: '#ffffff',
          height: '600px',
          backgroundImage: '',
          buttonText: null,
          buttonLink: '#',
        };
      case 'banner':
        return {
          heading: null,
          subheading: null,
          backgroundColor: getThemeColors().primary,
          textColor: '#ffffff',
          height: '600px',
          backgroundImage: '',
          buttonText: null,
          buttonLink: '#',
        };
      case 'heading':
        return { 
          text: 'New Heading', 
          level: 2, 
          align: 'left',
          size: 'heading',
          fontSize: 24,
          fontFamily: getThemeFonts().heading,
          bold: true,
          italic: false,
          underline: false,
          color: getThemeColors().primary,
        };
      case 'text':
        return { 
          text: 'Enter your text here...', 
          align: 'left',
          size: 'text',
          fontSize: 16,
          fontFamily: getThemeFonts().body,
          bold: false,
          italic: false,
          underline: false,
          color: getThemeColors().text,
        };
      case 'image':
        return { src: '', alt: '', width: '400px', height: '300px', objectFit: 'cover', align: 'center', link: '', layout: 'single' };
      case 'button':
        return { text: 'Button', href: '#', variant: 'primary', align: 'left', textColor: '#ffffff', buttonColor: getThemeColors().primary };
      case 'video':
        return { url: '', autoplay: false, height: 400 };
      case 'divider':
        return { style: 'solid', color: '#94a3b8', thickness: 2, height: '40px' };
      case 'social':
        return {
          instagramUrl: '',
          facebookUrl: '',
          twitterUrl: '',
          iconSize: 32,
          iconColor: getThemeColors().primary,
          iconGap: 16,
        };
      case 'footer':
        return {
          companyName: 'Your Company',
          description: 'Building amazing experiences for our customers.',
          backgroundColor: '#1f2937',
          textColor: '#ffffff',
          link1Text: 'About',
          link1Url: '#',
          link2Text: 'Services', 
          link2Url: '#',
          link3Text: 'Contact',
          link3Url: '#',
          social1Text: 'Twitter',
          social1Url: '#',
          social2Text: 'LinkedIn',
          social2Url: '#',
          social3Text: 'Facebook',
          social3Url: '#',
        };
      case 'timer':
        return {
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          title: 'Coming Soon',
          backgroundColor: getThemeColors().primary,
          textColor: '#ffffff',
          fontSize: 48,
          showLabels: true,
        };
      case 'card':
        return {
          cardType: 'text',
          icon: '⭐',
          image: '',
          title: 'Card Title',
          description: 'Card description goes here',
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          padding: 24,
        };
      case 'carousel':
        return {
          images: [
            { src: '', alt: 'Slide 1' },
            { src: '', alt: 'Slide 2' },
          ],
          showArrows: true,
          showDots: true,
          currentIndex: 0,
          aspect: '16:9',
          autoplay: false,
          autoplayInterval: 3000,
        };
      case 'bullet-list':
        return {
          items: ['First item', 'Second item', 'Third item'],
          style: 'bulleted', // bulleted | numbered | none
          align: 'left',
          gap: 8,
        };
      case 'collapsible-list':
        return {
          items: ['Item 1', 'Item 2', 'Item 3'],
          expanded: false,
          buttonTextShow: 'Show Items',
          buttonTextHide: 'Hide Items',
          width: '100%',
        };
      case 'faqs':
        return {
          items: [
            { question: 'What is your service?', answer: 'We provide amazing sites.', expanded: false },
            { question: 'How do I start?', answer: 'Click the button and follow the steps.', expanded: false }
          ],
          align: 'left',
          width: '100%'
        };
      default:
        return {};
    }
  };

  // Get theme colors for editor preview
  const getThemeColors = () => {
    const themeData = typeof site?.themeId === 'object' ? site.themeId : site?.theme;
    return themeData?.colors || {
      background: '#ffffff',
      text: '#1e293b',
      primary: '#3b82f6',
      secondary: '#8b5cf6'
    };
  };

  // Get theme fonts for editor preview
  const getThemeFonts = () => {
    const themeData = typeof site?.themeId === 'object' ? site.themeId : site?.theme;
    return themeData?.fonts || {
      heading: 'Inter',
      body: 'Inter'
    };
  };

  // Handle component click
  const handleComponentClick = (component: any, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Close any open modals/toolbars first
    setShowImageModal(false);
    setShowButtonModal(false);
    setShowTextToolbar(false);
    
    // Set the new selected component
    setSelectedComponent(component);
    
    // Find and select the parent section
    const parentSection = sections.find(section => 
      section.components.some(c => c.id === component.id)
    );
    
    if (parentSection) {
      setSelectedSection(parentSection.id);
    }
    
    // For text/heading, show toolbar
    if (component.type === 'text' || component.type === 'heading') {
      // Don't show toolbar immediately - let the onFocus handler in ComponentRenderer do it
      // This prevents multiple toolbars from showing
    }
    // For images and buttons, just select them (inline controls will show)
  };

  // Handle copying component
  const handleCopyComponent = () => {
    if (!selectedComponent) return;
    
    const copiedComponent = {
      ...selectedComponent,
      id: `${selectedComponent.type}-${Date.now()}`,
    };
    
    addComponent(copiedComponent);
    toast.success('Component copied');
    closeAllModals();
  };

  // Handle deleting component
  const handleDeleteComponent = () => {
    if (!selectedComponent) return;
    
    deleteComponent(selectedComponent.id);
    toast.success('Component deleted');
    closeAllModals();
  };

  // Close all modals
  const closeAllModals = () => {
    setShowImageModal(false);
    setShowButtonModal(false);
    setShowTextToolbar(false);
    setShowBlockModal(false);
    setSelectedComponent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Generate Google Fonts URL for editor
  const themeFonts = getThemeFonts();
  const fontFamilies = [themeFonts.heading, themeFonts.body]
    .filter((font, index, self) => self.indexOf(font) === index) // Remove duplicates
    .map(font => font.replace(/ /g, '+'))
    .join('&family=');
  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontFamilies}&display=swap`;

  return (
    <>
      <link rel="stylesheet" href={googleFontsUrl} />
      <div 
        className="h-screen flex flex-col bg-gray-50"
        onClick={(e) => {
          // Deselect section/component when clicking outside the editor canvas
          const target = e.target as HTMLElement;
          
          // Check if click is within the canvas area
          const clickedOnCanvas = target.closest('.bg-gray-100.p-4.overflow-y-auto');
          
          // If clicked outside canvas (on header, sidebars, etc.), deselect everything
          if (!clickedOnCanvas) {
            // But don't deselect if clicking on component toolbars or modals
            const clickedOnToolbar = target.closest('.absolute.bg-white.rounded-lg.shadow-xl');
            const clickedOnModal = target.closest('[role="dialog"]') || target.closest('.modal');
            
            if (!clickedOnToolbar && !clickedOnModal) {
              setSelectedComponent(null);
              setSelectedSection(null);
              setShowTextToolbar(false);
              setShowImageModal(false);
              setShowButtonModal(false);
            }
          }
        }}
      >
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/home')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-gray-900">
              {site?.siteName}
            </h1>
            <p className="text-sm text-gray-500">{currentPage?.pageName || 'Untitled'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LogoHandler 
            site={site} 
            siteId={siteId} 
            onLogoUpdate={handleSaveLogo} 
          />
          <Button variant="outline" size="sm" onClick={handlePreview} disabled={saving}>
            <Eye className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Preview'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowNavbarSettings(true)}
            title="Configure navbar section names"
          >
            <Settings className="h-4 w-4 mr-2" />
            Navbar
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {site?.isPublished ? (
            <Button 
              size="sm" 
              onClick={() => {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                window.open(`${siteUrl}/site/${site?.subdomain}`, '_blank');
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Site
            </Button>
          ) : (
            <Button size="sm" onClick={handlePublish}>
              Publish
            </Button>
          )}
        </div>
      </header>

  {/* Main Editor Area */}
  <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Center Canvas */}
        <div 
          id="editor-scroll-container"
          className="flex-1 min-h-0 bg-gray-100 p-4 overflow-y-auto relative"
          onClick={(e) => {
            // Deselect component when clicking on canvas background (gray area)
            const target = e.target as HTMLElement;
            
            // Check if clicked on the gray background itself
            if (target.classList.contains('bg-gray-100') || 
                target.classList.contains('flex-1') ||
                target.classList.contains('overflow-y-auto')) {
              setSelectedComponent(null);
              setSelectedSection(null);
              setShowTextToolbar(false);
              setShowImageModal(false);
              setShowButtonModal(false);
            }
          }}
        >
          <div 
            className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm min-h-[800px] relative"
            style={{ maxWidth: '1400px' }}
            onClick={(e) => {
              // Deselect component when clicking on white canvas area (not on a component)
              const target = e.target as HTMLElement;
              if (target.classList.contains('max-w-7xl') || 
                  target.classList.contains('bg-white') ||
                  target.classList.contains('min-h-[800px]') ||
                  target.classList.contains('p-4') ||
                  target.classList.contains('space-y-4')) {
                setSelectedComponent(null);
                setShowTextToolbar(false);
                setShowImageModal(false);
                setShowButtonModal(false);
              }
            }}
          >
            {/* Fixed Navbar Preview */}
            <div 
              className="border-b px-6 py-4 rounded-t-lg"
              style={{
                backgroundColor: getThemeColors().background,
                borderColor: getThemeColors().primary
              }}
              onClick={(e) => {
                // Don't deselect if clicking on the site name input
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'H1') {
                  e.stopPropagation();
                  return;
                }
                // Deselect when clicking elsewhere on navbar
                e.stopPropagation();
                setSelectedComponent(null);
                setSelectedSection(null);
                setShowTextToolbar(false);
                setShowImageModal(false);
                setShowButtonModal(false);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                  
                  {/* Site Logo AND Name - show both */}
                  {site?.logo && (
                    <img 
                      src={site.logo} 
                      alt={site.siteName}
                      style={{ 
                        height: '40px',
                        width: 'auto',
                        maxWidth: site.logoWidth || '200px',
                        objectFit: 'contain'
                      }}
                    />
                  )}
                  
                  {/* Site Name - always show (editable when no logo or alongside logo) */}
                  {isEditingSiteName ? (
                    <input
                      type="text"
                      value={editedSiteName}
                      onChange={(e) => setEditedSiteName(e.target.value)}
                      onBlur={handleSaveSiteName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveSiteName();
                        } else if (e.key === 'Escape') {
                          setIsEditingSiteName(false);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="text-xl font-bold border-b-2 outline-none bg-transparent px-1"
                      style={{
                        color: getThemeColors().primary,
                        borderColor: getThemeColors().primary,
                        fontFamily: `'${getThemeFonts().heading}', sans-serif`,
                        width: Math.max(150, editedSiteName.length * 12) + 'px'
                      }}
                    />
                  ) : (
                    <h1 
                      className="text-xl font-bold cursor-pointer hover:opacity-70 transition-opacity"
                      style={{
                        color: getThemeColors().primary,
                        fontFamily: `'${getThemeFonts().heading}', sans-serif`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditedSiteName(site?.siteName || '');
                        setIsEditingSiteName(true);
                      }}
                      title="Click to edit site name"
                    >
                      {site?.siteName || 'Untitled Site'}
                    </h1>
                  )}
                </div>
                
                {/* Unified Navigation - Sections from ALL pages first, then Pages */}
                <nav className="flex gap-4">
                  {/* Show sections from ALL pages */}
                  {pages.flatMap(page => 
                    (page.sections || [])
                      .filter(section => !section.components?.some((c: any) => c.type === 'footer'))
                      .filter(section => section.showInNavbar === true || section.showInNavbar === undefined)
                      .map((section, visibleIndex) => {
                        const sectionName = section.sectionName || `Section ${visibleIndex + 1}`;
                        const navType = section.navType || 'section';
                        const isActive = activeSection === section.id || selectedSection === section.id;
                        const isOnThisPage = currentPage?._id === page._id;
                        
                        return {
                          ...section,
                          pageId: page._id,
                          pageName: page.pageName,
                          isOnThisPage,
                          sectionName,
                          navType,
                          isActive
                        };
                      })
                  ).map((sectionData) => (
                      <button
                        key={`${sectionData.pageId}-${sectionData.id}`}
                        onClick={() => {
                          if (sectionData.navType === 'page' && sectionData.navTarget) {
                            // Navigate to another page
                            const targetPage = pages.find(p => p.slug === sectionData.navTarget);
                            if (targetPage) {
                              handlePageSwitch(targetPage);
                              toast.success(`Navigating to ${targetPage.pageName}`);
                            } else {
                              toast.error(`Page "${sectionData.navTarget}" not found`);
                            }
                          } else {
                            // If section is on a different page, switch to that page first
                            if (!sectionData.isOnThisPage) {
                              const targetPage = pages.find(p => p._id === sectionData.pageId);
                              if (targetPage) {
                                handlePageSwitch(targetPage).then(() => {
                                  // After switching, scroll to the section
                                  setTimeout(() => {
                                    setSelectedSection(sectionData.id);
                                    setActiveSection(sectionData.id);
                                    setSelectedComponent(null);
                                    
                                    const sectionElement = document.getElementById(`section-${sectionData.id}`);
                                    if (sectionElement) {
                                      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                  }, 300);
                                });
                              }
                            } else {
                              // Section is on current page, just scroll
                              setSelectedSection(sectionData.id);
                              setActiveSection(sectionData.id);
                              setSelectedComponent(null);
                              
                              const sectionElement = document.getElementById(`section-${sectionData.id}`);
                              if (sectionElement) {
                                sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }
                          }
                        }}
                        className="text-sm font-medium transition-colors pb-1"
                        style={{
                          color: sectionData.isActive ? getThemeColors().primary : getThemeColors().text,
                          borderBottom: sectionData.isActive ? `2px solid ${getThemeColors().primary}` : 'none',
                          opacity: sectionData.isActive ? 1 : 0.7,
                          fontFamily: `'${getThemeFonts().body}', sans-serif`
                        }}
                      >
                        {sectionData.sectionName}
                      </button>
                    ))
                  }
                  
                  {/* Show pages after sections */}
                  {pages
                    .filter(page => {
                      // Only filter by showInNavbar setting, don't hide Home
                      if (page.settings?.showInNavbar === false) return false;
                      return true;
                    })
                    .map((page) => (
                      <button
                        key={page._id}
                        onClick={() => handlePageSwitch(page)}
                        className="text-sm font-medium transition-colors pb-1"
                        style={{
                          color: currentPage?._id === page._id ? getThemeColors().primary : getThemeColors().text,
                          borderBottom: currentPage?._id === page._id ? `2px solid ${getThemeColors().primary}` : 'none',
                          opacity: currentPage?._id === page._id ? 1 : 0.7,
                          fontFamily: `'${getThemeFonts().body}', sans-serif`
                        }}
                      >
                        {page.pageName}
                      </button>
                    ))
                  }
                </nav>
              </div>
            </div>

            {/* Page Content */}
            <div 
              className="p-8 pt-0 pb-0 flex flex-col"
              style={{
                backgroundColor: getThemeColors().background,
                fontFamily: `'${getThemeFonts().body}', sans-serif`,
                overflow: 'visible',
                minHeight: '600px',
              }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.classList.contains('p-8') || target.classList.contains('pt-0')) {
                  setSelectedComponent(null);
                  setSelectedSection(null);
                }
              }}
            >
              {/* Regular Sections (not footer) */}
              <div className="flex-1">
                {!sections || sections.filter((s) => !s.components?.some((c: any) => c.type === 'footer')).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Layout className="h-16 w-16 mb-4" />
                    <p className="text-lg font-medium">Start building your page</p>
                    <p className="text-sm">Add sections from the right panel</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sections
                      .filter((section) => !section.components?.some((c: any) => c.type === 'footer'))
                      .map((section, index, filteredSections) => {
                      return (
                    <SectionWrapper
                      key={section.id}
                      section={section}
                      isFirstSection={index === 0}
                      isLastSection={index === sections.length - 1}
                      isSelected={selectedSection === section.id}
                      onOpenCardGridModal={(sectionId) => openCardGridEditorForSection(sectionId)}
                      onSelect={() => {
                        setSelectedSection(section.id);
                        setSelectedComponent(null);
                      }}
                      onUpdate={(updates) => {
                        updateSection(section.id, { ...section, ...updates });
                      }}
                      onDelete={() => {
                        deleteSection(section.id);
                        setSelectedSection(null);
                      }}
                      onMoveUp={() => {
                        if (index > 0) {
                          const newSections = [...sections];
                          [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
                          // Update order property
                          newSections.forEach((s, idx) => {
                            s.order = idx;
                          });
                          setSections(newSections);
                        }
                      }}
                      onMoveDown={() => {
                        if (index < filteredSections.length - 1) {
                          const allNonFooterSections = sections.filter((s) => !s.components?.some((c: any) => c.type === 'footer'));
                          const currentIdx = allNonFooterSections.findIndex(s => s.id === section.id);
                          const newSections = [...sections];
                          const sectionIdx = newSections.findIndex(s => s.id === section.id);
                          const nextSectionIdx = newSections.findIndex(s => s.id === allNonFooterSections[currentIdx + 1].id);
                          [newSections[sectionIdx], newSections[nextSectionIdx]] = [newSections[nextSectionIdx], newSections[sectionIdx]];
                          newSections.forEach((s, idx) => {
                            s.order = idx;
                          });
                          setSections(newSections);
                        }
                      }}
                      onUpdateComponent={(componentId, updates) => {
                        updateComponent(componentId, updates);
                      }}
                      onDeleteComponent={(componentId) => {
                        deleteComponent(componentId);
                      }}
                      onCopyComponent={(componentId) => {
                        const componentToCopy = section.components.find(c => c.id === componentId);
                        if (componentToCopy) {
                          const newComponent = {
                            ...componentToCopy,
                            id: `${componentToCopy.type}-${Date.now()}`,
                          };
                          // Add to same section
                          const updatedComponents = [...section.components, newComponent];
                          updateSection(section.id, { ...section, components: updatedComponents });
                          addComponent(newComponent);
                        }
                      }}
                      onComponentClick={(component, e) => {
                        handleComponentClick(component, e);
                      }}
                      onShowImageModal={(componentId) => {
                        const component = section.components.find(c => c.id === componentId);
                        if (component) {
                          setSelectedComponent(component);
                          setShowImageModal(true);
                        }
                      }}
                      onShowTextToolbar={(componentId, rect) => {
                        const component = section.components.find(c => c.id === componentId);
                        if (component) {
                          // Don't close selection for banner/footer - they need to stay selected for contentEditable
                          if (component.type !== 'banner' && component.type !== 'footer') {
                            setSelectedComponent(null);
                            setSelectedSection(null);
                          }
                          setToolbarPosition({ x: rect.left, y: rect.top });
                          setShowTextToolbar(true);
                        }
                      }}
                      setSelectedComponent={setSelectedComponent}
                      selectedComponentId={selectedComponent?.id || null}
                      themeColors={getThemeColors()}
                      themeFonts={getThemeFonts()}
                      onDragStart={(e) => {
                        setDraggedSection(section.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={(e) => {
                        setDraggedSection(null);
                        setDragOverSection(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggedSection && draggedSection !== section.id) {
                          setDragOverSection(section.id);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggedSection && draggedSection !== section.id) {
                          // Reorder sections
                          const draggedIndex = sections.findIndex(s => s.id === draggedSection);
                          const dropIndex = sections.findIndex(s => s.id === section.id);
                          
                          if (draggedIndex !== -1 && dropIndex !== -1) {
                            const newSections = [...sections];
                            const [removed] = newSections.splice(draggedIndex, 1);
                            newSections.splice(dropIndex, 0, removed);
                            
                            // Update order property
                            newSections.forEach((s, idx) => {
                              s.order = idx;
                            });
                            
                            setSections(newSections);
                          }
                        }
                        setDraggedSection(null);
                        setDragOverSection(null);
                      }}
                      isDragging={draggedSection === section.id}
                      onComponentDragStart={(componentId, sectionId) => {
                        setDraggedComponent({ componentId, sectionId });
                      }}
                      onComponentDragEnd={() => {
                        setDraggedComponent(null);
                        setDragOverComponent(null);
                      }}
                      onComponentDragOver={(componentId) => {
                        if (draggedComponent && draggedComponent.componentId !== componentId) {
                          setDragOverComponent(componentId);
                        }
                      }}
                      onComponentDrop={(targetComponentId, targetSectionId) => {
                        if (draggedComponent && draggedComponent.sectionId === targetSectionId) {
                          // Reorder within same section
                          const section = sections.find(s => s.id === targetSectionId);
                          if (section) {
                            const draggedIndex = section.components.findIndex(c => c.id === draggedComponent.componentId);
                            const dropIndex = section.components.findIndex(c => c.id === targetComponentId);
                            
                            if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
                              const componentIds = [...section.components.map(c => c.id)];
                              const [removed] = componentIds.splice(draggedIndex, 1);
                              componentIds.splice(dropIndex, 0, removed);
                              
                              reorderComponentsInSection(targetSectionId, componentIds);
                            }
                          }
                        }
                        setDraggedComponent(null);
                        setDragOverComponent(null);
                      }}
                      draggedComponentId={draggedComponent?.componentId || null}
                    />
                  );
                  })}
                </div>
              )}
              </div>

              {/* Footer Section - Always at bottom, not draggable */}
              {sections
                .filter((section) => section.components?.some((c: any) => c.type === 'footer'))
                .map((footerSection) => {
                  const footerComponent = footerSection.components.find((c: any) => c.type === 'footer');
                  return (
                    <div 
                      key={footerSection.id}
                      className="mt-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSection(footerSection.id);
                        setSelectedComponent(footerComponent || null);
                      }}
                    >
                      {footerComponent && (
                        <div className={`relative ${selectedSection === footerSection.id ? 'ring-2 ring-blue-500' : ''}`}>
                          {selectedSection === footerSection.id && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
                              Footer (click to edit)
                            </div>
                          )}
                          <ComponentRenderer
                            component={footerComponent}
                            isSelected={selectedComponent?.id === footerComponent.id}
                            themeColors={getThemeColors()}
                            themeFonts={getThemeFonts()}
                            onComponentClick={(comp, e) => handleComponentClick(comp, e)}
                            onUpdateComponent={(id, updated) => updateComponent(id, updated)}
                            onCopyComponent={() => {
                              const newComponent = {
                                ...footerComponent,
                                id: `footer-${Date.now()}`,
                              };
                              addComponent(newComponent);
                            }}
                            onDeleteComponent={() => {
                              deleteComponent(footerComponent.id);
                            }}
                            onShowImageModal={() => {
                              setSelectedComponent(footerComponent);
                              setShowImageModal(true);
                            }}
                            onShowTextToolbar={(position) => {
                              // Don't close selection for footer - it needs to stay selected for contentEditable
                              setToolbarPosition(position);
                              setShowTextToolbar(true);
                            }}
                            setSelectedComponent={setStoreSelectedComponent}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Components, Themes, Pages (collapsible) */}
        <div
          className="bg-white border-l border-gray-200 flex flex-col h-[calc(100vh-64px)] min-h-0 relative"
          style={{ width: sidebarCollapsed ? '12px' : '20rem' }}
        >
          {/* Collapse/Expand toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full shadow p-1 hover:bg-gray-50 z-10"
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {sidebarCollapsed ? (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>
          {/* Tabbed Panel - Components, Themes, Pages */}
          {!sidebarCollapsed && (
            <div className="flex border-b border-gray-200 px-4 shrink-0">
              <button
                onClick={() => setActivePanel('insert')}
                className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                  activePanel === 'insert'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layout className="h-4 w-4 inline mr-1.5" />
                Components
              </button>
              <button
                onClick={() => setActivePanel('themes')}
                className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                  activePanel === 'themes'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Palette className="h-4 w-4 inline mr-1.5" />
                Themes
              </button>
              <button
                onClick={() => setActivePanel('pages')}
                className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                  activePanel === 'pages'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span className="text-xs">Pages</span>
              </button>
            </div>
          )}

          {!sidebarCollapsed && (
            <div className="flex-1 min-h-0 overflow-y-auto px-4">
              {/* Components Tab */}
              {activePanel === 'insert' && (
                <ComponentsPanel
                  insertComponentTypes={insertComponentTypes}
                  onInsertComponent={handleInsertComponent}
                />
              )}

              {/* Themes Tab */}
              {activePanel === 'themes' && (
                <ThemesPanel
                  themes={themes}
                  site={site}
                  siteId={siteId}
                  onThemeChange={(updatedSite) => setSite(updatedSite)}
                />
              )}

              {/* Pages Tab */}
              {activePanel === 'pages' && (
                <PagesPanel
                  pages={pages}
                  currentPage={currentPage}
                  siteId={siteId}
                  onPageSwitch={handlePageSwitch}
                  onPagesUpdate={(updatedPages) => setPages(updatedPages)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Publish Your Website</h2>
            <p className="text-black opacity-70 mb-6">
              Choose a name and URL for your website before publishing.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Website Name
                </label>
                <input
                  type="text"
                  value={publishName}
                  onChange={(e) => setPublishName(e.target.value)}
                  placeholder="My Awesome Website"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Subdomain
                </label>
                <input
                  type="text"
                  value={publishSubdomain}
                  onChange={(e) => setPublishSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="my-awesome-site"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
                <p className="text-sm text-black opacity-70 mt-1">
                  {publishSubdomain}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPublishModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublishWithDetails}
                className="flex-1"
                disabled={!publishName || !publishSubdomain}
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedComponent && (
        <ImageModal
          isOpen={showImageModal}
          onClose={closeAllModals}
          onSave={(props) => {
            // For banner components, save image to backgroundImage instead of src
            if (selectedComponent.type === 'banner') {
              updateComponent(selectedComponent.id, {
                ...selectedComponent,
                props: { 
                  ...selectedComponent.props, 
                  backgroundImage: props.src,
                  alt: props.alt 
                }
              });
            } else if (selectedComponent.type === 'card') {
              // For card components, save image to 'image' property instead of 'src'
              updateComponent(selectedComponent.id, {
                ...selectedComponent,
                props: { 
                  ...selectedComponent.props, 
                  image: props.src,
                  alt: props.alt 
                }
              });
            } else {
              updateComponent(selectedComponent.id, {
                ...selectedComponent,
                props: { ...selectedComponent.props, ...props }
              });
            }
            closeAllModals();
          }}
          initialProps={selectedComponent.type === 'banner' 
            ? { ...selectedComponent.props, src: selectedComponent.props.backgroundImage }
            : selectedComponent.type === 'card'
            ? { ...selectedComponent.props, src: selectedComponent.props.image }
            : selectedComponent.props
          }
          onDelete={handleDeleteComponent}
          onCopy={handleCopyComponent}
        />
      )}

      {/* Button Modal */}
      {showButtonModal && selectedComponent && (
        <ButtonModal
          isOpen={showButtonModal}
          onClose={closeAllModals}
          onSave={(props) => {
            updateComponent(selectedComponent.id, {
              ...selectedComponent,
              props: { ...selectedComponent.props, ...props }
            });
            closeAllModals();
          }}
          initialProps={selectedComponent.props}
          onDelete={handleDeleteComponent}
          onCopy={handleCopyComponent}
          themeColors={getThemeColors()}
        />
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <BlockModal
          onClose={() => setShowBlockModal(false)}
          onSave={handleAddBlockTemplate}
        />
      )}

      {/* Text Editor Toolbar */}
      {showTextToolbar && selectedComponent && (
        <TextEditorToolbar
          component={selectedComponent}
          onUpdate={(newProps) => {
            updateComponent(selectedComponent.id, {
              ...selectedComponent,
              props: { ...selectedComponent.props, ...newProps }
            });
            setSelectedComponent({
              ...selectedComponent,
              props: { ...selectedComponent.props, ...newProps }
            });
          }}
          onClose={closeAllModals}
          onDelete={handleDeleteComponent}
          onCopy={handleCopyComponent}
          position={toolbarPosition}
          themeColors={getThemeColors()}
          themeFonts={getThemeFonts()}
        />
      )}

      {/* Card Grid Modal (Create/Edit) */}
      {showCardGridModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {cardGridMode === 'create' ? 'Add Card Grid' : 'Edit Card Grid'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of cards</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={cardGridForm.count}
                  onChange={(e) => setCardGridForm({ ...cardGridForm, count: Math.max(1, Math.min(12, parseInt(e.target.value) || 1)) })}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card type</label>
                <select
                  value={cardGridForm.cardType}
                  onChange={(e) => setCardGridForm({ ...cardGridForm, cardType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="text">Text</option>
                  <option value="icon">Icon</option>
                  <option value="image">Image</option>
                </select>
              </div>

              {cardGridForm.cardType === 'icon' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default icon</label>
                  <input
                    type="text"
                    value={cardGridForm.icon}
                    onChange={(e) => setCardGridForm({ ...cardGridForm, icon: e.target.value })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              )}

              {cardGridForm.cardType === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image frame height (px)</label>
                  <input
                    type="number"
                    min={120}
                    max={600}
                    value={cardGridForm.imageFrameHeight}
                    onChange={(e) => setCardGridForm({ ...cardGridForm, imageFrameHeight: Math.max(120, Math.min(600, parseInt(e.target.value) || 180)) })}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">The image will be cropped to this fixed frame (object-fit: cover)</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select
                  value={cardGridForm.template}
                  onChange={(e) => setCardGridForm({ ...cardGridForm, template: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="simple">Simple</option>
                  <option value="outlined">Outlined</option>
                  <option value="elevated">Elevated</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCardGridModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (cardGridMode === 'create') {
                    createCardGrid(cardGridForm.count, {
                      cardType: cardGridForm.cardType,
                      template: cardGridForm.template,
                      imageFrameHeight: cardGridForm.imageFrameHeight,
                      icon: cardGridForm.icon,
                    });
                  } else if (cardGridMode === 'edit' && cardGridTargetSectionId) {
                    applyCardGridToSection(cardGridTargetSectionId, cardGridForm);
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {cardGridMode === 'create' ? 'Add Grid' : 'Apply Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Editor Toolbar */}
      {showTextToolbar && selectedComponent && (
        <TextEditorToolbar
          component={selectedComponent}
          onUpdate={(props) => {
            if (selectedComponent) {
              updateComponent(selectedComponent.id, {
                ...selectedComponent,
                props: { ...selectedComponent.props, ...props }
              });
            }
          }}
          onClose={() => setShowTextToolbar(false)}
          onDelete={() => {
            if (selectedComponent) {
              deleteComponent(selectedComponent.id);
              setSelectedComponent(null);
              setShowTextToolbar(false);
            }
          }}
          onCopy={() => {
            if (selectedComponent) {
              const newComponent = {
                ...selectedComponent,
                id: `${selectedComponent.type}-${Date.now()}`,
              };
              addComponent(newComponent);
              toast.success('Component copied');
            }
          }}
          position={toolbarPosition}
          themeColors={getThemeColors()}
          themeFonts={getThemeFonts()}
        />
      )}

      {/* Navbar Settings Modal */}
      {showNavbarSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Navbar Navigation Settings</h2>
              <button
                onClick={() => setShowNavbarSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Customize navigation labels, visibility, and link destinations for each navbar item.
            </p>

            {/* Preview Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">NAVBAR PREVIEW</label>
              <div className="bg-white p-3 rounded shadow-sm flex items-center justify-center gap-6">
                <div className="font-bold text-lg text-gray-900">{site?.siteName || 'Logo'}</div>
                <div className="flex gap-4">
                  {/* Show sections from ALL pages */}
                  {pages.flatMap(page => 
                    (page.sections || [])
                      .filter(s => !s.components?.some((c: any) => c.type === 'footer'))
                      .filter(s => s.showInNavbar !== false)
                      .map((section, index) => (
                        <div
                          key={`${page._id}-${section.id}`}
                          className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {section.sectionName || `Section ${index + 1}`}
                        </div>
                      ))
                  )}
                  {pages
                    .filter(p => p.settings?.showInNavbar !== false)
                    .map((page) => (
                      <div
                        key={page._id}
                        className="text-sm text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {page.pageName}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Grid of Navigation Cards - Sections grouped by page + Pages */}
            <div className="space-y-6 mb-6">
              {/* Sections from all pages - grouped by page with color coding */}
              {pages.map((page, pageIndex) => {
                const pageSections = page.sections?.filter(s => !s.components?.some((c: any) => c.type === 'footer')) || [];
                if (pageSections.length === 0) return null;
                
                // Different color schemes for each page
                const colorSchemes = [
                  { border: 'border-blue-200', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-600', hover: 'hover:border-blue-400', ring: 'focus:ring-blue-500', text: 'text-blue-600' },
                  { border: 'border-purple-200', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-600', hover: 'hover:border-purple-400', ring: 'focus:ring-purple-500', text: 'text-purple-600' },
                  { border: 'border-pink-200', bg: 'bg-pink-50', badge: 'bg-pink-100 text-pink-600', hover: 'hover:border-pink-400', ring: 'focus:ring-pink-500', text: 'text-pink-600' },
                  { border: 'border-orange-200', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-600', hover: 'hover:border-orange-400', ring: 'focus:ring-orange-500', text: 'text-orange-600' },
                  { border: 'border-teal-200', bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-600', hover: 'hover:border-teal-400', ring: 'focus:ring-teal-500', text: 'text-teal-600' },
                ];
                const colors = colorSchemes[pageIndex % colorSchemes.length];
                
                return (
                  <div key={page._id}>
                    <h3 className={`text-sm font-bold mb-3 ${colors.text}`}>
                      {page.pageName} Page Sections
                    </h3>
                    <div 
                      className="grid gap-4"
                      style={{
                        gridTemplateColumns: pageSections.length <= 4 
                          ? 'repeat(2, 1fr)' 
                          : pageSections.length <= 9 
                          ? 'repeat(3, 1fr)' 
                          : 'repeat(4, 1fr)'
                      }}
                    >
                      {pageSections.map((section, index) => (
                        <div 
                          key={section.id} 
                          className={`p-4 border-2 ${colors.border} rounded-lg ${colors.hover} transition-colors ${colors.bg}`}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`shrink-0 w-7 h-7 ${colors.badge} rounded-full flex items-center justify-center font-semibold text-xs`}>
                                {index + 1}
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={section.showInNavbar === true || section.showInNavbar === undefined}
                                  onChange={async (e) => {
                                    // Update section in the page
                                    const updatedSections = page.sections?.map(s => 
                                      s.id === section.id ? { ...s, showInNavbar: e.target.checked } : s
                                    );
                                    
                                    try {
                                      await api.put(`/pages/${page._id}`, {
                                        sections: updatedSections
                                      });
                                      
                                      // Update local state
                                      setPages(pages.map(p => 
                                        p._id === page._id ? { ...p, sections: updatedSections } : p
                                      ));
                                      
                                      // Update current page if it's this page
                                      if (currentPage?._id === page._id) {
                                        setCurrentPage({ ...currentPage, sections: updatedSections });
                                        setSections(updatedSections || []);
                                      }
                                    } catch (err) {
                                      toast.error('Failed to update section');
                                    }
                                  }}
                                  className={`w-4 h-4 ${colors.text} rounded ${colors.ring} focus:ring-2`}
                                />
                                <span className="text-xs font-semibold text-gray-600">Show</span>
                              </label>
                            </div>
                          </div>

                          {/* Label Input */}
                          <div className="mb-3">
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Label</label>
                            <input
                              type="text"
                              value={section.sectionName || ''}
                              onChange={async (e) => {
                                const updatedSections = page.sections?.map(s => 
                                  s.id === section.id ? { ...s, sectionName: e.target.value } : s
                                );
                                
                                try {
                                  await api.put(`/pages/${page._id}`, {
                                    sections: updatedSections
                                  });
                                  
                                  setPages(pages.map(p => 
                                    p._id === page._id ? { ...p, sections: updatedSections } : p
                                  ));
                                  
                                  if (currentPage?._id === page._id) {
                                    setCurrentPage({ ...currentPage, sections: updatedSections });
                                    setSections(updatedSections || []);
                                  }
                                } catch (err) {
                                  toast.error('Failed to update section');
                                }
                              }}
                              placeholder={`Section ${index + 1}`}
                              className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded ${colors.ring} focus:ring-2 focus:border-transparent text-gray-900`}
                            />
                          </div>

                          {/* Navigation Type */}
                          <div className="mb-3">
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Navigate To</label>
                            <select
                              value={section.navType || 'section'}
                              onChange={async (e) => {
                                const newNavType = e.target.value as 'section' | 'page';
                                const updatedSections = page.sections?.map(s => 
                                  s.id === section.id ? { ...s, navType: newNavType, navTarget: '' } : s
                                );
                                
                                try {
                                  await api.put(`/pages/${page._id}`, {
                                    sections: updatedSections
                                  });
                                  
                                  setPages(pages.map(p => 
                                    p._id === page._id ? { ...p, sections: updatedSections } : p
                                  ));
                                  
                                  if (currentPage?._id === page._id) {
                                    setCurrentPage({ ...currentPage, sections: updatedSections });
                                    setSections(updatedSections || []);
                                  }
                                } catch (err) {
                                  toast.error('Failed to update section');
                                }
                              }}
                              className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded ${colors.ring} focus:ring-2 focus:border-transparent text-gray-900`}
                            >
                              <option value="section">This Section</option>
                              <option value="page">Page</option>
                            </select>
                          </div>

                          {/* Conditional Input based on Navigation Type */}
                          {section.navType === 'page' && (
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1 block">Link to Page</label>
                              <select
                                value={section.navTarget || ''}
                                onChange={async (e) => {
                                  const updatedSections = page.sections?.map(s => 
                                    s.id === section.id ? { ...s, navTarget: e.target.value } : s
                                  );
                                  
                                  try {
                                    await api.put(`/pages/${page._id}`, {
                                      sections: updatedSections
                                    });
                                    
                                    setPages(pages.map(p => 
                                      p._id === page._id ? { ...p, sections: updatedSections } : p
                                    ));
                                    
                                    if (currentPage?._id === page._id) {
                                      setCurrentPage({ ...currentPage, sections: updatedSections });
                                      setSections(updatedSections || []);
                                    }
                                  } catch (err) {
                                    toast.error('Failed to update section');
                                  }
                                }}
                                className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded ${colors.ring} focus:ring-2 focus:border-transparent text-gray-900`}
                              >
                                <option value="">Select a page</option>
                                {pages.map((p) => (
                                  <option key={p._id} value={p.slug || ''}>
                                    {p.isHome ? 'Home' : p.pageName} ({p.isHome ? '/' : `/${p.slug}`})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          
                          {/* Page Badge */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className={`text-xs ${colors.badge} px-2 py-1 rounded`}>
                              {page.pageName}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Divider between sections and pages */}
              <div className="col-span-full">
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm font-bold text-gray-600">PAGES</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Cards */}
            <div 
              className="grid gap-4 mb-6"
              style={{
                gridTemplateColumns: pages.length <= 4 
                  ? 'repeat(2, 1fr)' 
                  : pages.length <= 9 
                  ? 'repeat(3, 1fr)' 
                  : 'repeat(4, 1fr)'
              }}
            >
              {pages.map((page, index) => (
                <div 
                  key={page._id} 
                  className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 transition-colors bg-green-50"
                  onClick={(e) => {
                    // Prevent any bubbling that might interfere with checkbox
                    if ((e.target as HTMLElement).tagName !== 'INPUT') {
                      e.stopPropagation();
                    }
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-xs">
                        P{index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`page-checkbox-${page._id}`}
                          checked={page.settings?.showInNavbar === undefined ? true : page.settings?.showInNavbar}
                          onChange={async (e) => {
                            try {
                              const newValue = e.target.checked;
                              await api.put(`/pages/${page._id}`, {
                                settings: {
                                  ...page.settings,
                                  showInNavbar: newValue,
                                }
                              });
                              
                              const updatedPages = pages.map(p => 
                                p._id === page._id 
                                  ? { 
                                      ...p, 
                                      settings: { 
                                        ...p.settings, 
                                        showInNavbar: newValue 
                                      } 
                                    } 
                                  : p
                              );
                              setPages(updatedPages);
                              
                              // Also update currentPage if it's this page
                              if (currentPage?._id === page._id) {
                                setCurrentPage({
                                  ...currentPage,
                                  settings: {
                                    ...currentPage.settings,
                                    showInNavbar: newValue
                                  }
                                });
                              }
                            } catch (err: any) {
                              toast.error('Failed to update page visibility');
                            }
                          }}
                          className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                        />
                        <label 
                          htmlFor={`page-checkbox-${page._id}`}
                          className="text-xs font-semibold text-gray-600 cursor-pointer"
                        >
                          Show
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Page Name (read-only in navbar settings) */}
                  <div className="mb-3">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Page Name</label>
                    <div className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 text-gray-900">
                      {page.pageName}
                    </div>
                  </div>

                  {/* Route Display */}
                  <div className="mb-3">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Route</label>
                    <div className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 text-gray-900 font-mono">
                      {page.isHome ? '/' : `/${page.slug}`}
                    </div>
                  </div>

                  {/* Type Label */}
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded inline-block">
                      Page
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNavbarSettings(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
