'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import LogoModal from '@/components/modals/LogoModal';
import { Settings } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface LogoHandlerProps {
  site: any;
  siteId: string;
  onLogoUpdate: (logoData: { logo: string; logoWidth: string }) => void;
}

export default function LogoHandler({ site, siteId, onLogoUpdate }: LogoHandlerProps) {
  const [showLogoModal, setShowLogoModal] = useState(false);

  const handleSaveLogo = async (logoData: { logo: string; logoWidth: string }) => {
    try {
      await api.put(`/sites/${siteId}`, logoData);
      onLogoUpdate(logoData);
      setShowLogoModal(false);
      toast.success('Logo updated successfully');
    } catch (err: any) {
      console.error('Failed to update logo:', err);
      toast.error(err.response?.data?.message || 'Failed to update logo');
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