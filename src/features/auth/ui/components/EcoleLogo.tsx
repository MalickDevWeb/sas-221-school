import React from 'react';
import { useTenantStore } from '@/core/store/tenantStore';

export interface EcoleLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const EcoleLogo = ({ size = 'md' }: EcoleLogoProps) => {
  const { currentTenant } = useTenantStore();
  
  const sizeClasses = {
    sm: 'text-[24px] h-[30px]',
    md: 'text-[28px] h-[34px]',
    lg: 'text-[34px] h-[40px]',
  };

  const slug = currentTenant?.slug;
  const isEcole221 = !slug || slug === 'ecole221' || slug === 'ecole-221';

  // Si on a une URL de logo personnalisée pour une autre école
  if (!isEcole221 && currentTenant?.branding?.logoUrl && !currentTenant.branding.logoUrl.includes('myschool-icon')) {
    return (
      <img 
        src={currentTenant.branding.logoUrl} 
        alt={`Logo ${currentTenant.name}`} 
        className={`object-contain ${sizeClasses[size]}`} 
      />
    );
  }

  // Fallback Texte Dynamique
  const name = currentTenant?.name || 'ÉCOLE 221';
  // Séparer le premier mot du reste (pour mettre le reste en couleur primaire si on veut)
  const [firstWord, ...rest] = name.split(' ');
  const restStr = rest.join(' ');
  
  return (
    <div className={`flex items-center justify-center font-sans tracking-tight text-[#291715] ${sizeClasses[size]} font-black select-none`}>
      <span className="uppercase">{firstWord}</span>
      {restStr && <span className="text-primary ml-1.5 font-black uppercase">{restStr}</span>}
    </div>
  );
};
