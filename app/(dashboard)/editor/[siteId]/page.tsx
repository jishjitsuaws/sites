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
import LogoModal from '@/components/modals/LogoModal';
import ComponentRenderer from '@/components/editor/ComponentRenderer';
import SectionWrapper from '@/components/editor/SectionWrapper';
import ComponentsPanel from '@/components/editor/ComponentsPanel';
import ThemesPanel from '@/components/editor/ThemesPanel';
import PagesPanel from '@/components/editor/PagesPanel';
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
import { toast } from 'sonner';

interface Site {
  _id: string;
  siteName: string;
  subdomain: string;
  isPublished: boolean;
  logo?: string;
  logoWidth?: string;
  themeId?: string;
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
  const [themes, setThemes] = useState<any[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishName, setPublishName] = useState('');
  const [publishSubdomain, setPublishSubdomain] = useState('');
  const [showAddPageForm, setShowAddPageForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [showLogoModal, setShowLogoModal] = useState(false);
  
  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [showTextToolbar, setShowTextToolbar] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

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

  const fetchSiteData = async () => {
    try {
      setLoading(true);
      console.log('Fetching site data for:', siteId);
      
      // Fetch site first
      const siteRes = await api.get(`/sites/${siteId}`);
      console.log('Site response:', siteRes.data);

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
        console.log('Pages response:', pagesRes.data);
        const pagesData = pagesRes.data.data || [];
        setPages(pagesData);

        // Load first page or home page
        const homePage = pagesData.find((p: Page) => p.isHome);
        const firstPage = homePage || pagesData[0];
        
        if (firstPage) {
          setCurrentPage(firstPage);
          // Use sections if available, otherwise convert components to sections
          if (firstPage.sections && firstPage.sections.length > 0) {
            setSections(firstPage.sections);
          } else if (firstPage.content && firstPage.content.length > 0) {
            // Convert legacy flat components to sections
            const convertedSections = firstPage.content.map((component: any, index: number) => ({
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
          } else {
            setSections([]);
          }
          setComponents(firstPage.content || []);
        } else {
          // No pages yet - create a default home page
          const defaultPage = await api.post(`/sites/${siteId}/pages`, {
            pageName: 'Home',
            slug: 'home',
            isHome: true,
          });
          const newPage = defaultPage.data.data;
          setPages([newPage]);
          setCurrentPage(newPage);
          setComponents([]);
          setSections([]);
        }
      } catch (pageErr: any) {
        console.error('Error fetching pages:', pageErr);
        // If pages endpoint fails (404 means no pages yet), try to create a default page
        if (pageErr.response?.status === 404 || pageErr.response?.data?.count === 0) {
          try {
            const defaultPage = await api.post(`/sites/${siteId}/pages`, {
              pageName: 'Home',
              slug: 'home',
              isHome: true,
            });
            const newPage = defaultPage.data.data;
            setPages([newPage]);
            setCurrentPage(newPage);
            setComponents([]);
            setSections([]);
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
      console.log('Saving page:', currentPage._id);
      console.log('Sections to save:', sections);
      
      // Flatten sections back to components for backward compatibility with backend
      const flatComponents = sections.flatMap(section => section.components);
      
      const response = await api.put(`/pages/${currentPage._id}`, {
        content: flatComponents,
        sections: sections, // Save sections structure too
      });
      
      console.log('Save response:', response.data);
      
      // Update the pages array with the new content
      setPages(pages.map(p => 
        p._id === currentPage._id 
          ? { ...p, content: flatComponents, sections: sections } 
          : p
      ));
      
      // Update current page state
      setCurrentPage({ ...currentPage, content: flatComponents });
      
      toast.success('Changes saved successfully');
    } catch (err: any) {
      console.error('Save error:', err);
      console.error('Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
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
      window.open(`http://localhost:3000/site/${site.subdomain}`, '_blank');
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
      window.open(`http://localhost:3000/site/${publishSubdomain}`, '_blank');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to publish site');
    }
  };

  const handleSaveLogo = async (logoData: { logo: string; logoWidth: string }) => {
    try {
      await api.put(`/sites/${siteId}`, logoData);
      toast.success('Logo updated successfully!');
      if (site) {
        setSite({ ...site, ...logoData });
      }
      setShowLogoModal(false);
    } catch (err: any) {
      toast.error('Failed to update logo');
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
    console.log('Current components to save:', components.length);
    
    // Save current page's components before switching
    if (currentPage && components.length > 0) {
      try {
        console.log('Auto-saving before switch...');
        await api.put(`/pages/${currentPage._id}`, {
          content: components,
        });
        
        // Update the pages array with the saved content
        const updatedPages = pages.map(p => 
          p._id === currentPage._id 
            ? { ...p, content: components } 
            : p
        );
        setPages(updatedPages);
        console.log('Auto-save successful, updated pages array');
        
        // Find the updated target page from the updated array
        const targetPage = updatedPages.find(p => p._id === page._id);
        if (targetPage) {
          console.log('Loading updated page content:', targetPage.content?.length || 0, 'components');
          setCurrentPage(targetPage);
          setComponents(targetPage.content || []);
        } else {
          // Fallback to passed page
          console.log('Loading passed page content:', page.content?.length || 0, 'components');
          setCurrentPage(page);
          // Load sections if available, otherwise convert components
          if (page.sections && page.sections.length > 0) {
            setSections(page.sections);
          } else if (page.content && page.content.length > 0) {
            const convertedSections = page.content.map((component: any, index: number) => ({
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
          } else {
            setSections([]);
          }
          setComponents(page.content || []);
        }
      } catch (err) {
        console.error('Failed to auto-save page:', err);
        // Still switch even if save failed
        setCurrentPage(page);
        // Load sections if available
        if (page.sections && page.sections.length > 0) {
          setSections(page.sections);
        } else if (page.content && page.content.length > 0) {
          const convertedSections = page.content.map((component: any, index: number) => ({
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
        } else {
          setSections([]);
        }
        setComponents(page.content || []);
      }
    } else {
      // No save needed, just switch
      console.log('No save needed, loading page content:', page.content?.length || 0, 'components');
      setCurrentPage(page);
      // Load sections if available
      if (page.sections && page.sections.length > 0) {
        setSections(page.sections);
      } else if (page.content && page.content.length > 0) {
        const convertedSections = page.content.map((component: any, index: number) => ({
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
      } else {
        setSections([]);
      }
      setComponents(page.content || []);
    }
    
    setSelectedComponent(null);
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
        // Load sections if available
        if (nextPage.sections && nextPage.sections.length > 0) {
          setSections(nextPage.sections);
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
        } else {
          setSections([]);
        }
        setComponents(nextPage.content || []);
      }
      
      toast.success('Page deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete page');
    }
  };

  const insertComponentTypes = [
    { id: 'banner', name: 'Banner', icon: Layout, description: 'Full-width banner section' },
    { id: 'heading', name: 'Heading', icon: Type, description: 'Add a title or heading' },
    { id: 'text', name: 'Text', icon: FileText, description: 'Add a paragraph of text' },
    { id: 'image', name: 'Image', icon: ImageIcon, description: 'Insert an image' },
    { id: 'button', name: 'Button', icon: LinkIcon, description: 'Add a clickable button' },
    { id: 'video', name: 'Video', icon: Video, description: 'Embed a video' },
    { id: 'divider', name: 'Divider', icon: Minus, description: 'Add a horizontal line' },
  ];

  const handleInsertComponent = (type: string) => {
    const newComponent: any = {
      id: `${type}-${Date.now()}`,
      type,
      props: getDefaultProps(type),
    };

    // Banner gets a full-width section
    if (type === 'banner') {
      const newSection = {
        id: `section-${Date.now()}`,
        components: [newComponent],
        layout: {
          direction: 'column' as const,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          gap: 16,
          padding: 0, // No padding for full-width banners
          backgroundColor: newComponent.props.backgroundColor,
        },
        order: sections.length,
      };
      addSection(newSection);
      setSelectedSection(newSection.id);
      toast.success('Banner added');
      return;
    }

    // Create a new section for this component
    const newSection = {
      id: `section-${Date.now()}`,
      components: [newComponent],
      layout: {
        direction: 'column' as const,
        justifyContent: 'flex-start' as const,
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

  const handleAddEmptySection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      components: [],
      layout: {
        direction: 'column' as const,
        justifyContent: 'flex-start' as const,
        alignItems: 'center' as const,
        gap: 16,
        padding: 40,
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
            float: 'right',
            align: 'center',
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
            float: 'left',
            align: 'center',
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
            title: `${feature.icon} ${feature.title}`,
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
          width: '450px',
          align: 'center',
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
    }

    // Create a new section with all template components
    const newSection = {
      id: `section-${timestamp}`,
      components: newComponents,
      layout: {
        // Determine layout based on template type
        direction: (layout === 'hero-image-right' || layout === 'hero-image-left' || layout === 'image-text-2col') 
          ? 'row' as const 
          : 'column' as const,
        justifyContent: 'flex-start' as const,
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
      case 'banner':
        return {
          heading: 'Welcome to our site',
          subheading: 'Discover amazing features',
          backgroundColor: getThemeColors().primary,
          textColor: '#ffffff',
          height: '400px',
          backgroundImage: '',
          buttonText: 'Get Started',
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
        return { src: '', alt: '', width: '400px', align: 'center', link: '', layout: 'single' };
      case 'button':
        return { text: 'Click me', href: '#', variant: 'primary', align: 'center' };
      case 'video':
        return { url: '', autoplay: false };
      case 'divider':
        return { style: 'solid', color: '#e5e7eb' };
      case 'card':
        return {
          title: 'Card Title',
          description: 'Card description goes here',
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          padding: 24,
        };
      default:
        return {};
    }
  };

  // Get theme colors for editor preview
  const getThemeColors = () => {
    return site?.theme?.colors || {
      background: '#ffffff',
      text: '#1e293b',
      primary: '#3b82f6',
      secondary: '#8b5cf6'
    };
  };

  // Get theme fonts for editor preview
  const getThemeFonts = () => {
    return site?.theme?.fonts || {
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
    
    // For text/heading, show toolbar
    if (component.type === 'text' || component.type === 'heading') {
      const rect = event.currentTarget.getBoundingClientRect();
      setToolbarPosition({ x: rect.left, y: rect.top });
      setShowTextToolbar(true);
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
      <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/home')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-gray-900">{site?.siteName}</h1>
            <p className="text-sm text-gray-500">{currentPage?.pageName || 'Untitled'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowLogoModal(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Logo
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(`http://localhost:3000/site/${site?.subdomain}`, '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {site?.isPublished ? (
            <Button 
              size="sm" 
              onClick={() => window.open(`http://localhost:3000/site/${site?.subdomain}`, '_blank')}
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
      <div className="flex-1 flex overflow-hidden">
        {/* Center Canvas */}
        <div 
          className="flex-1 overflow-y-auto bg-gray-100 p-8"
          onClick={(e) => {
            // Deselect component when clicking on canvas background
            const target = e.target as HTMLElement;
            if (target.classList.contains('bg-gray-100') || target.classList.contains('p-8')) {
              setSelectedComponent(null);
              setShowTextToolbar(false);
              setShowImageModal(false);
              setShowButtonModal(false);
            }
          }}
        >
          <div 
            className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm min-h-[800px]"
            onClick={(e) => {
              // Deselect component when clicking on white canvas area (not on a component)
              const target = e.target as HTMLElement;
              if (target.classList.contains('max-w-4xl') || 
                  target.classList.contains('bg-white') ||
                  target.classList.contains('min-h-[800px]') ||
                  target.classList.contains('p-8') ||
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
            >
              <div className="flex items-center justify-between">
                {site?.logo ? (
                  <img 
                    src={site.logo} 
                    alt={site.siteName}
                    style={{ width: site.logoWidth || '120px' }}
                    className="h-auto"
                  />
                ) : (
                  <h1 
                    className="text-xl font-bold"
                    style={{
                      color: getThemeColors().primary,
                      fontFamily: `'${getThemeFonts().heading}', sans-serif`
                    }}
                  >
                    {site?.siteName || 'Untitled Site'}
                  </h1>
                )}
                <nav className="flex gap-4">
                  {pages.map((page) => (
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
                  ))}
                </nav>
              </div>
            </div>

            {/* Page Content */}
            <div 
              className="p-8"
              style={{
                backgroundColor: getThemeColors().background,
                fontFamily: `'${getThemeFonts().body}', sans-serif`,
                paddingTop: '80px',
              }}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.classList.contains('p-8')) {
                  setSelectedComponent(null);
                  setSelectedSection(null);
                }
              }}
            >
              {!sections || sections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Layout className="h-16 w-16 mb-4" />
                  <p className="text-lg font-medium">Start building your page</p>
                  <p className="text-sm">Add sections from the right panel</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <SectionWrapper
                      key={section.id}
                      section={section}
                      isSelected={selectedSection === section.id}
                      onSelect={() => {
                        setSelectedSection(section.id);
                        setSelectedComponent(null);
                      }}
                      onUpdate={(updates) => {
                        updateSection(section.id, { ...section, ...updates });
                      }}
                      onDelete={() => {
                        if (confirm('Delete this section?')) {
                          deleteSection(section.id);
                          setSelectedSection(null);
                        }
                      }}
                      onUpdateComponent={(componentId, updates) => {
                        updateComponent(componentId, updates);
                      }}
                      onDeleteComponent={(componentId) => {
                        if (confirm('Delete this component?')) {
                          deleteComponent(componentId);
                        }
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
                      onShowButtonModal={(componentId) => {
                        const component = section.components.find(c => c.id === componentId);
                        if (component) {
                          setSelectedComponent(component);
                          setShowButtonModal(true);
                        }
                      }}
                      onShowTextToolbar={(componentId, rect) => {
                        const component = section.components.find(c => c.id === componentId);
                        if (component) {
                          setSelectedComponent(component);
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
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Components, Themes, Pages (NO SETTINGS) */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            {/* Tabbed Panel - Components, Themes, Pages */}
            <div className="flex border-b border-gray-200 -mx-4 px-4">
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
                className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                  activePanel === 'pages'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-1.5" />
                Pages
              </button>
            </div>

            <div className="mt-4">
              {/* Components Tab */}
              {activePanel === 'insert' && (
                <ComponentsPanel
                  insertComponentTypes={insertComponentTypes}
                  onInsertComponent={handleInsertComponent}
                  onOpenBlockModal={() => setShowBlockModal(true)}
                  onAddEmptySection={handleAddEmptySection}
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
          </div>
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
                  {publishSubdomain && `Your site will be at: localhost:3000/site/${publishSubdomain}`}
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
            updateComponent(selectedComponent.id, {
              ...selectedComponent,
              props: { ...selectedComponent.props, ...props }
            });
            closeAllModals();
          }}
          initialProps={selectedComponent.props}
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

      {/* Logo Modal */}
      {showLogoModal && (
        <LogoModal
          isOpen={showLogoModal}
          onClose={() => setShowLogoModal(false)}
          onSave={handleSaveLogo}
          currentLogo={site?.logo}
          currentWidth={site?.logoWidth}
        />
      )}

      {/* Text Editor Toolbar */}
      {showTextToolbar && selectedComponent && (
        <TextEditorToolbar
          component={selectedComponent}
          onUpdate={(props) => {
            updateComponent(selectedComponent.id, {
              ...selectedComponent,
              props
            });
            setSelectedComponent({
              ...selectedComponent,
              props
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
      </div>
    </>
  );
}
