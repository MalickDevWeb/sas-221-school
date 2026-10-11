import React from 'react';
import { Construction } from 'lucide-react';

export const SuperAdminPlaceholderPage = () => {
  const pathname = window.location.pathname;
  const sectionName = pathname.split('/').pop()?.replace('-', ' ') || 'Section';

  return (
    <div className="p-8 h-full flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
        Module {sectionName}
      </h2>
      <p className="text-gray-500 max-w-md">
        Cette fonctionnalité est en cours de développement. Vous pourrez bientôt gérer cette partie de la plateforme depuis cet écran.
      </p>
    </div>
  );
};

