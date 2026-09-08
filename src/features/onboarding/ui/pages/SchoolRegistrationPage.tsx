import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/apiClient';
import { Button } from '@/shared/design/components/Button';
import { ROUTES } from '@/shared/constants';

export const SchoolRegistrationPage = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    subdomain: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPhone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.post('/register-school', formData);
      toast.success('Demande enregistrée avec succès !', {
        description: 'Votre école est en cours de validation. Vous recevrez un email prochainement.'
      });
      navigate(ROUTES.login);
    } catch (error) {
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Inscrire votre établissement
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Rejoignez la plateforme éducative
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700">Nom de l'école</label>
              <div className="mt-1">
                <input id="schoolName" name="schoolName" type="text" required value={formData.schoolName} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">Sous-domaine souhaité</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input type="text" name="subdomain" id="subdomain" required value={formData.subdomain} onChange={handleChange} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="mon-ecole" />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  .plateforme.com
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="adminFirstName" className="block text-sm font-medium text-gray-700">Prénom Admin</label>
                <div className="mt-1">
                  <input id="adminFirstName" name="adminFirstName" type="text" required value={formData.adminFirstName} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="adminLastName" className="block text-sm font-medium text-gray-700">Nom Admin</label>
                <div className="mt-1">
                  <input id="adminLastName" name="adminLastName" type="text" required value={formData.adminLastName} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">Email Administrateur</label>
              <div className="mt-1">
                <input id="adminEmail" name="adminEmail" type="email" required value={formData.adminEmail} onChange={handleChange} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {isLoading ? 'Envoi en cours...' : 'Soumettre la demande'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

