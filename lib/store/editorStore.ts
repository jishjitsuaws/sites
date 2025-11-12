import { create } from 'zustand';

interface Component {
  id: string;
  type: string;
  props: Record<string, any>;
  styles?: Record<string, any>;
  order?: number;
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
  sectionName?: string;
  showInNavbar?: boolean;
}

interface Page {
  _id: string;
  pageName: string;
  slug: string;
  content: Component[]; // Legacy support
  sections?: Section[]; // New section-based structure
  isHome: boolean;
  order: number;
}

interface Site {
  _id: string;
  siteName: string;
  subdomain: string;
  description?: string;
  customTheme: any;
  pages?: Page[];
  isPublished: boolean;
}

interface EditorState {
  currentSite: Site | null;
  currentPage: Page | null;
  selectedComponent: Component | null;
  selectedSection: Section | null;
  components: Component[]; // Legacy
  sections: Section[];
  history: Section[][];
  historyIndex: number;
  isDirty: boolean;
  isSaving: boolean;

  // Actions
  setCurrentSite: (site: Site) => void;
  setCurrentPage: (page: Page) => void;
  setSelectedComponent: (component: Component | null) => void;
  setSelectedSection: (section: Section | null) => void;
  addComponent: (component: Component) => void; // Legacy
  addSection: (section: Section) => void;
  addComponentToSection: (sectionId: string, component: Component) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteComponent: (id: string) => void;
  deleteSection: (id: string) => void;
  deleteComponentFromSection: (sectionId: string, componentId: string) => void;
  reorderComponents: (components: Component[]) => void; // Legacy
  reorderSections: (sections: Section[]) => void;
  reorderComponentsInSection: (sectionId: string, componentIds: string[]) => void;
  setComponents: (components: Component[]) => void; // Legacy
  setSections: (sections: Section[]) => void;
  undo: () => void;
  redo: () => void;
  setIsSaving: (isSaving: boolean) => void;
  resetEditor: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  currentSite: null,
  currentPage: null,
  selectedComponent: null,
  selectedSection: null,
  components: [],
  sections: [],
  history: [[]],
  historyIndex: 0,
  isDirty: false,
  isSaving: false,

  setCurrentSite: (site) => set({ currentSite: site }),

  setCurrentPage: (page) => {
    // Convert legacy content to sections if needed
    let sections: Section[] = [];
    if (page.sections && page.sections.length > 0) {
      sections = page.sections;
    } else if (page.content && page.content.length > 0) {
      // Legacy: convert flat components to sections (one component per section)
      sections = page.content.map((component, index) => ({
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
    }
    
    set({ 
      currentPage: page, 
      components: page.content || [],
      sections,
      history: [sections],
      historyIndex: 0,
      isDirty: false,
    });
  },

  setSelectedComponent: (component) => set({ selectedComponent: component }),
  
  setSelectedSection: (section) => set({ selectedSection: section }),

  // Legacy component methods (for backwards compatibility)
  addComponent: (component) => {
    const { sections, history, historyIndex } = get();
    // Add as new section
    const newSection: Section = {
      id: `section-${component.id}`,
      components: [component],
      layout: {
        direction: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 16,
        padding: 24,
      },
      order: sections.length,
    };
    const newSections = [...sections, newSection];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    
    set({
      sections: newSections,
      history: newHistory,
      historyIndex: historyIndex + 1,
      isDirty: true,
    });
  },

  addSection: (section) => {
    const { sections, history, historyIndex } = get();
    
    // Find footer section (if exists)
    const footerIndex = sections.findIndex(s => 
      s.components.some(c => c.type === 'footer')
    );
    
    let newSections: Section[];
    if (footerIndex !== -1) {
      // Insert before footer
      newSections = [
        ...sections.slice(0, footerIndex),
        section,
        ...sections.slice(footerIndex)
      ];
    } else {
      // No footer, add to end
      newSections = [...sections, section];
    }
    
    // Update order property for all sections
    newSections = newSections.map((s, idx) => ({ ...s, order: idx }));
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    
    set({
      sections: newSections,
      history: newHistory,
      historyIndex: historyIndex + 1,
      isDirty: true,
    });
  },

  addComponentToSection: (sectionId, component) => {
    const { sections, history, historyIndex } = get();
    const newSections = sections.map((s) =>
      s.id === sectionId
        ? { ...s, components: [...s.components, component] }
        : s
    );
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    
    set({
      sections: newSections,
      history: newHistory,
      historyIndex: historyIndex + 1,
      isDirty: true,
    });
  },

  updateComponent: (id, updates) => {
    const { sections, history, historyIndex } = get();
    const newSections = sections.map((section) => ({
      ...section,
      components: section.components.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    
    set({
      sections: newSections,
      history: newHistory,
      historyIndex: historyIndex + 1,
      isDirty: true,
      selectedComponent: newSections
        .flatMap((s) => s.components)
        .find((c) => c.id === id) || null,
    });
  },

  updateSection: (id, updates) => {
    const { sections, history, historyIndex } = get();
    const newSections = sections.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    
    set({
      sections: newSections,
      history: newHistory,
      historyIndex: historyIndex + 1,
      isDirty: true,
      selectedSection: newSections.find((s) => s.id === id) || null,
    });
  },

  deleteComponent: (id) => {
    const { sections, history, historyIndex } = get();
    const newSections = sections
      .map((section) => ({
        ...section,
        components: section.components.filter((c) => c.id !== id),
      }))
      .filter((section) => section.components.length > 0); // Remove empty sections
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    
    set({
      sections: newSections,
      history: newHistory,
      historyIndex: historyIndex + 1,
      isDirty: true,
      selectedComponent: null,
    });
  },

  deleteSection: (id) => {
    const { sections, history, historyIndex } = get();
    const newSections = sections.filter((s) => s.id !== id);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    
    set({
      sections: newSections,
      history: newHistory,
      historyIndex: historyIndex + 1,
      isDirty: true,
      selectedSection: null,
    });
  },

  deleteComponentFromSection: (sectionId, componentId) => {
    const { sections, history, historyIndex } = get();
    const newSections = sections
      .map((section) =>
        section.id === sectionId
          ? {
              ...section,
              components: section.components.filter((c) => c.id !== componentId),
            }
          : section
      )
      .filter((section) => section.components.length > 0);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    
    set({
      sections: newSections,
      history: newHistory,
      historyIndex: historyIndex + 1,
      isDirty: true,
      selectedComponent: null,
    });
  },

  reorderComponents: (newComponents) => {
    // Legacy: convert to sections
    const sections = newComponents.map((component, index) => ({
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
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(sections);
    
    set({
      sections,
      history: newHistory,
      historyIndex: historyIndex + 1,
      isDirty: true,
    });
  },

  reorderSections: (newSections) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    
    set({
      sections: newSections,
      history: newHistory,
      historyIndex: historyIndex + 1,
      isDirty: true,
    });
  },

  reorderComponentsInSection: (sectionId, componentIds) => {
    const { sections, history, historyIndex } = get();
    const newSections = sections.map(section => {
      if (section.id === sectionId) {
        // Reorder components based on the provided IDs
        const reorderedComponents = componentIds
          .map(id => section.components.find(c => c.id === id))
          .filter((c): c is Component => c !== undefined);
        return { ...section, components: reorderedComponents };
      }
      return section;
    });
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSections);
    
    set({
      sections: newSections,
      history: newHistory,
      historyIndex: historyIndex + 1,
      isDirty: true,
    });
  },

  setComponents: (components) => set({ components, isDirty: false }),
  
  setSections: (sections) => set({ sections, isDirty: false }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        sections: history[newIndex],
        historyIndex: newIndex,
        isDirty: true,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        sections: history[newIndex],
        historyIndex: newIndex,
        isDirty: true,
      });
    }
  },

  setIsSaving: (isSaving) => set({ isSaving }),

  resetEditor: () =>
    set({
      currentSite: null,
      currentPage: null,
      selectedComponent: null,
      selectedSection: null,
      components: [],
      sections: [],
      history: [[]],
      historyIndex: 0,
      isDirty: false,
      isSaving: false,
    }),
}));
