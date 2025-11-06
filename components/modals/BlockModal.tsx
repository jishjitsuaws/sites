'use client';

import { useState } from 'react';
import { X, Image, Type, Layout } from 'lucide-react';
import Button from '@/components/ui/Button';

interface BlockModalProps {
  onClose: () => void;
  onSave: (blockData: any) => void;
}

const BLOCK_TEMPLATES = [
  {
    id: 'hero-center',
    name: 'Hero - Centered',
    thumbnail: '📄',
    description: 'Large centered heading with text and CTA',
    layout: 'hero-center',
    structure: {
      heading: 'Welcome to Our Site',
      subheading: 'Build something amazing today',
      text: 'Get started with our powerful platform and create stunning websites in minutes.',
      buttonText: 'Get Started',
      buttonLink: '#',
      backgroundType: 'color',
      backgroundColor: '#f3f4f6'
    }
  },
  {
    id: 'feature-grid-3',
    name: 'Feature Grid - 3 Column',
    thumbnail: '📦📦📦',
    description: '3 feature cards with icons and text',
    layout: 'feature-grid-3',
    structure: {
      heading: 'Our Features',
      features: [
        { icon: '⚡', title: 'Fast', description: 'Lightning fast performance' },
        { icon: '🎨', title: 'Beautiful', description: 'Stunning designs' },
        { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' }
      ]
    }
  },
  {
    id: 'feature-grid-4',
    name: 'Feature Grid - 4 Column',
    thumbnail: '📦📦📦📦',
    description: '4 feature cards with icons and text',
    layout: 'feature-grid-4',
    structure: {
      heading: 'Why Choose Us',
      features: [
        { icon: '⚡', title: 'Fast', description: 'Lightning fast performance' },
        { icon: '🎨', title: 'Beautiful', description: 'Stunning designs' },
        { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
        { icon: '💎', title: 'Premium', description: 'Premium features included' }
      ]
    }
  },
  {
    id: 'image-grid-3',
    name: 'Image Grid - 3 Column',
    thumbnail: '🖼️🖼️🖼️',
    description: 'Grid of 3 images with captions',
    layout: 'image-grid-3',
    structure: {
      heading: 'Gallery',
      images: [
        { src: '', alt: 'Image 1', caption: 'Caption 1' },
        { src: '', alt: 'Image 2', caption: 'Caption 2' },
        { src: '', alt: 'Image 3', caption: 'Caption 3' }
      ]
    }
  },
  {
    id: 'image-grid-4',
    name: 'Image Grid - 4 Column',
    thumbnail: '🖼️🖼️🖼️🖼️',
    description: 'Grid of 4 images',
    layout: 'image-grid-4',
    structure: {
      images: [
        { src: '', alt: 'Image 1' },
        { src: '', alt: 'Image 2' },
        { src: '', alt: 'Image 3' },
        { src: '', alt: 'Image 4' }
      ]
    }
  },
  {
    id: 'card-grid-2',
    name: 'Card Grid - 2 Column',
    thumbnail: '🃏🃏',
    description: '2 card layout with title and description',
    layout: 'card-grid-2',
    structure: {
      heading: 'Our Services',
      cards: [
        { title: 'Service 1', description: 'Description for service 1' },
        { title: 'Service 2', description: 'Description for service 2' }
      ]
    }
  },
  {
    id: 'card-grid-3',
    name: 'Card Grid - 3 Column',
    thumbnail: '🃏🃏🃏',
    description: '3 card layout with title and description',
    layout: 'card-grid-3',
    structure: {
      heading: 'Our Services',
      cards: [
        { title: 'Service 1', description: 'Description for service 1' },
        { title: 'Service 2', description: 'Description for service 2' },
        { title: 'Service 3', description: 'Description for service 3' }
      ]
    }
  },
  {
    id: 'card-grid-4',
    name: 'Card Grid - 4 Column',
    thumbnail: '🃏🃏🃏🃏',
    description: '4 card layout with title and description',
    layout: 'card-grid-4',
    structure: {
      heading: 'What We Offer',
      cards: [
        { title: 'Feature 1', description: 'Description for feature 1' },
        { title: 'Feature 2', description: 'Description for feature 2' },
        { title: 'Feature 3', description: 'Description for feature 3' },
        { title: 'Feature 4', description: 'Description for feature 4' }
      ]
    }
  },
  {
    id: 'card-grid-5',
    name: 'Card Grid - 5 Column',
    thumbnail: '🃏🃏🃏🃏🃏',
    description: '5 card layout with title and description',
    layout: 'card-grid-5',
    structure: {
      heading: 'Our Team',
      cards: [
        { title: 'Member 1', description: 'Role & bio' },
        { title: 'Member 2', description: 'Role & bio' },
        { title: 'Member 3', description: 'Role & bio' },
        { title: 'Member 4', description: 'Role & bio' },
        { title: 'Member 5', description: 'Role & bio' }
      ]
    }
  },
  {
    id: 'cta-section',
    name: 'Call to Action',
    thumbnail: '📣',
    description: 'Centered CTA with heading and button',
    layout: 'cta-section',
    structure: {
      heading: 'Ready to Get Started?',
      text: 'Join thousands of satisfied customers today.',
      buttonText: 'Start Free Trial',
      buttonLink: '#',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff'
    }
  }
];

export default function BlockModal({ onClose, onSave }: BlockModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const handleSelectTemplate = (template: any) => {
    onSave(template);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{ zIndex: 100 }}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose a Block Layout</h2>
            <p className="text-sm text-gray-500 mt-1">Select a pre-built layout to get started</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Template Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BLOCK_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all text-left group"
              >
                <div className="text-4xl mb-3 text-center">{template.thumbnail}</div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
