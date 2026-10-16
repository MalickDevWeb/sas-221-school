import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTenantStore } from '@/core/store/tenantStore';
import { LoginMobileView } from '../components/LoginMobileView';
import { LoginTabletView } from '../components/LoginTabletView';
import { LoginDesktopView } from '../components/LoginDesktopView';
import { MobileCalendarModal } from '../components/MobileCalendarModal';
import loginBg from '../../../../assets/images/login_bg_clean_ecole221_1784306644151.jpg';

export function LoginPage() {
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const navigate = useNavigate();
  const currentTenant = useTenantStore((s) => s.currentTenant);

  // Une école ne doit jamais être affichée sans son slug dans l'URL.
  // Si aucun slug n'est présent, on redirige vers le portail de sélection /login
  useEffect(() => {
    if (!tenantSlug) {
      navigate('/login', { replace: true });
    }
  }, [tenantSlug, navigate]);

  const [tabletActiveTab, setTabletActiveTab] = useState<'login' | 'calendar'>('login');
  const [desktopShowCalendar, setDesktopShowCalendar] = useState(false);
  const [showMobileCalendarModal, setShowMobileCalendarModal] = useState(false);
  const customBg = currentTenant?.branding?.backgroundUrl;
  const bgImageUrl = `url('${customBg || loginBg}')`;

  return (
    <main className="h-screen w-full max-w-full bg-[#FAF8F6] flex items-stretch overflow-hidden select-none">
      <LoginMobileView bgImageUrl={bgImageUrl} setShowMobileCalendarModal={setShowMobileCalendarModal} />
      <LoginTabletView bgImageUrl={bgImageUrl} tabletActiveTab={tabletActiveTab} setTabletActiveTab={setTabletActiveTab} />
      <LoginDesktopView bgImageUrl={bgImageUrl} desktopShowCalendar={desktopShowCalendar} setDesktopShowCalendar={setDesktopShowCalendar} />
      {showMobileCalendarModal && <MobileCalendarModal setShowMobileCalendarModal={setShowMobileCalendarModal} />}
    </main>
  );
}
