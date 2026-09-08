import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import { Button } from '@/shared/design/components/Button';

export const BrandingSettingsPage = () => {
  const [branding, setBranding] = useState({
    primaryColor: '#0056b3',
    secondaryColor: '#f8f9fa',
    accentColor: '#e0a800',
    logoUrl: '',
    faviconUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Note: Un vrai endpoint Backend devrait exister pour récupérer et sauver ça :
  // GET /api/v1/admin/branding
  // PUT /api/v1/admin/branding

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBranding({ ...branding, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulation appel API
      // await apiClient.put('/api/v1/admin/branding', branding);
      
      // Simulation pour l'instant
      setTimeout(() => {
        toast.success('Paramètres de marque mis à jour avec succès');
        setIsLoading(false);
      }, 800);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg max-w-3xl">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Personnalisation (Branding) de l'école</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-700 border-b pb-2 mb-4">Couleurs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur Primaire</label>
              <div className="flex items-center space-x-2">
                <input type="color" name="primaryColor" value={branding.primaryColor} onChange={handleChange} className="h-8 w-12 border rounded cursor-pointer" />
                <input type="text" name="primaryColor" value={branding.primaryColor} onChange={handleChange} className="border-gray-300 rounded-md shadow-sm text-sm p-1 w-24" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur Secondaire</label>
              <div className="flex items-center space-x-2">
                <input type="color" name="secondaryColor" value={branding.secondaryColor} onChange={handleChange} className="h-8 w-12 border rounded cursor-pointer" />
                <input type="text" name="secondaryColor" value={branding.secondaryColor} onChange={handleChange} className="border-gray-300 rounded-md shadow-sm text-sm p-1 w-24" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur Accent</label>
              <div className="flex items-center space-x-2">
                <input type="color" name="accentColor" value={branding.accentColor} onChange={handleChange} className="h-8 w-12 border rounded cursor-pointer" />
                <input type="text" name="accentColor" value={branding.accentColor} onChange={handleChange} className="border-gray-300 rounded-md shadow-sm text-sm p-1 w-24" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 border-b pb-2 mb-4 mt-8">Logos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL du Logo Principal</label>
              <input type="url" name="logoUrl" value={branding.logoUrl} onChange={handleChange} placeholder="https://..." className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL du Favicon</label>
              <input type="url" name="faviconUrl" value={branding.faviconUrl} onChange={handleChange} placeholder="https://..." className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border" />
            </div>
          </div>
        </div>

        {/* Aperçu en direct */}
        <div className="mt-8 p-4 border rounded-md" style={{ backgroundColor: branding.secondaryColor }}>
          <h4 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>Aperçu Rapide</h4>
          <button style={{ backgroundColor: branding.primaryColor, color: '#fff' }} className="px-4 py-2 rounded text-sm shadow">
            Bouton Principal
          </button>
          <button style={{ backgroundColor: branding.accentColor, color: '#fff' }} className="px-4 py-2 rounded text-sm shadow ml-2">
            Action Accent
          </button>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isLoading ? 'Sauvegarde...' : 'Enregistrer les paramètres'}
          </Button>
        </div>
      </div>
    </div>
  );
};

