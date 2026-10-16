import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

interface RegistrationErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  field?: string;
  onClose: () => void;
}

export const RegistrationErrorModal: React.FC<RegistrationErrorModalProps> = ({
  isOpen,
  title = 'Inscription interrompue',
  message,
  field,
  onClose,
}) => {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900/95 p-6 shadow-2xl text-white relative isolate overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Icon icon="solar:danger-triangle-bold-duotone" className="text-2xl text-rose-400" />
            </div>
            <div className="space-y-1.5 flex-1">
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
              {field && (
                <div className="pt-1.5">
                  <span className="text-[11px] font-semibold text-rose-300 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-md">
                    Champ concerné : {field}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all cursor-pointer text-center"
            >
              Corriger les informations
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Se connecter</span>
              <Icon icon="solar:arrow-right-line-duotone" className="text-sm" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

