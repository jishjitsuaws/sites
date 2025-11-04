'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import LogoModal from '@/components/modals/LogoModal';
import { Settings } from 'lucide-react';

interface LogoHandlerProps {
  site: any;
  siteId: string;
  onLogoUpdate: (logoData: { logo: string; logoWidth: string }) => void;
}

export default function LogoHandler({ site, siteId, onLogoUpdate }: LogoHandlerProps) {
  const [showLogoModal, setShowLogoModal] = useState(false);

  const handleSaveLogo = async (logoData: { logo: string; logoWidth: string }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/sites/${siteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logoData),
      });

      if (response.ok) {
        onLogoUpdate(logoData);
        setShowLogoModal(false);
      } else {
        throw new Error('Failed to update logo');
      }
    } catch (err) {
      console.error('Failed to update logo:', err);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowLogoModal(true)}>
        <Settings className="h-4 w-4 mr-2" />
        Logo
      </Button>

      {showLogoModal && (
        <LogoModal
          isOpen={showLogoModal}
          onClose={() => setShowLogoModal(false)}
          onSave={handleSaveLogo}
          currentLogo={site?.logo}
          currentWidth={site?.logoWidth}
        />
      )}
    </>
  );
}