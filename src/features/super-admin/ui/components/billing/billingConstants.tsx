import React from 'react';
import { Users, BookOpen, Sparkles, Zap, TrendingUp, Building2, ShieldCheck, Database, Globe } from 'lucide-react';

export const FEATURE_LABELS: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
  MAX_USERS: { label: 'Utilisateurs max', icon: <Users size={14} />, desc: 'Comptes utilisateurs autorisés' },
  MAX_STUDENTS: { label: 'Élèves max', icon: <Users size={14} />, desc: 'Nombre maximal d\'élèves inscrits' },
  MAX_TEACHERS: { label: 'Professeurs max', icon: <Users size={14} />, desc: 'Nombre maximal d\'enseignants' },
  MAX_CLASSES: { label: 'Classes max', icon: <BookOpen size={14} />, desc: 'Nombre maximal de classes/filières' },
  AI_TUTOR: { label: 'Tuteur IA', icon: <Sparkles size={14} />, desc: 'Accès au tuteur IA pour les élèves' },
  LIVE_MEET: { label: 'Cours en direct', icon: <Zap size={14} />, desc: 'Visioconférence Live intégrée' },
  ADVANCED_REPORTS: { label: 'Rapports avancés', icon: <TrendingUp size={14} />, desc: 'Analytics et exports PDF/Excel' },
  MULTI_CAMPUS: { label: 'Multi-campus', icon: <Building2 size={14} />, desc: 'Gestion de plusieurs sites' },
  CUSTOM_DOMAIN: { label: 'Domaine personnalisé', icon: <Globe size={14} />, desc: 'URL école dédiée' },
  STORAGE: { label: 'Stockage Cloud', icon: <Database size={14} />, desc: 'Espace de stockage documents' },
  SUPPORT_24_7: { label: 'Support Dédié 24/7', icon: <ShieldCheck size={14} />, desc: 'Assistance prioritaire' },
};

export const getFeatureMeta = (code: string) => {
  if (FEATURE_LABELS[code]) return FEATURE_LABELS[code];
  const humanLabel = code.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  return { label: humanLabel, icon: <Sparkles size={14} />, desc: humanLabel };
};

export const planBg = (i: number) => {
  const map: Record<number, string> = {
    0: 'from-indigo-500 via-indigo-600 to-indigo-800',
    1: 'from-emerald-500 via-teal-600 to-emerald-800',
    2: 'from-purple-500 via-violet-600 to-purple-800',
    3: 'from-amber-500 via-orange-600 to-amber-800',
    4: 'from-rose-500 via-pink-600 to-rose-800',
    5: 'from-cyan-500 via-blue-600 to-cyan-800',
  };
  return map[i % 6] || 'from-indigo-500 to-purple-700';
};
