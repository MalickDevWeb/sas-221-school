import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Icon } from '@iconify/react';
import { PRICING_PLANS, type PricingPlan } from '../../model/landingData';

// Illustrations d'art numérique professionnelles pour chaque forfait
const renderPricingIllustration = (type: string) => {
  switch (type) {
    case 'essential':
      return (
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Icon icon="solar:school-bold-duotone" className="text-3xl text-cyan-400" />
        </div>
      );
    case 'premium':
      return (
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/40 flex items-center justify-center shadow-xl shadow-fuchsia-500/30">
            <Icon icon="solar:buildings-3-bold-duotone" className="text-3xl text-fuchsia-400" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
            <Icon icon="solar:star-bold" className="text-xs" />
          </div>
        </div>
      );
    case 'enterprise':
      return (
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Icon icon="solar:global-bold-duotone" className="text-3xl text-indigo-400" />
        </div>
      );
    default:
      return null;
  }
};

export const LandingPricing: React.FC = () => {
  const navigate = useNavigate();

  const handlePlanClick = (plan: PricingPlan) => {
    if (plan.id === 'essential') {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#3b82f6', '#10b981'],
      });
      setTimeout(() => navigate('/register-school?plan=essential'), 300);
    } else if (plan.id === 'premium') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d946ef', '#a855f7', '#ec4899', '#f59e0b'],
      });
      setTimeout(() => navigate('/register-school?plan=premium&trial=true'), 300);
    } else if (plan.id === 'enterprise') {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/register-school?plan=enterprise');
      }
    }
  };

  return (
    <section id="pricing" className="py-28 bg-[#080B17] relative overflow-hidden">
      {/* Background glowing aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          {/* Header pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-5 shadow-inner">
            <Icon icon="solar:tag-price-bold-duotone" className="text-sm" />
            <span className="text-xs font-black uppercase tracking-widest">
              ABONNEMENTS & FORFAITS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase mb-4">
            Des forfaits sur mesure pour chaque école
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Démarrez gratuitement ou choisissez le forfait adapté à la taille de votre structure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {PRICING_PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: plan.isPopular ? -20 : -8 }}
              className={`rounded-3xl p-8 border flex flex-col justify-between transition-all duration-300 relative ${
                plan.isPopular
                  ? 'bg-slate-900/80 border-fuchsia-500/80 shadow-[0_0_35px_rgba(217,70,239,0.3)] ring-2 ring-fuchsia-500/50 transform lg:-translate-y-4'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 shadow-xl'
              }`}
            >
              {/* Badge RECOMMANDÉ au-dessus de la carte populaire */}
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-20">
                  <Icon icon="solar:bolt-bold-duotone" className="text-sm" />
                  <span>RECOMMANDÉ</span>
                </div>
              )}

              <div>
                {/* Header: Titre & Illustration */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                      {plan.target}
                    </p>
                  </div>
                  <div>
                    {renderPricingIllustration(plan.illustrationType)}
                  </div>
                </div>

                {/* Prix */}
                <div className="my-8 flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm ml-2 text-slate-400 font-bold">
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* Liste des fonctionnalités avec puces colorées et vraies icônes vectorielles */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((item, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <span className="w-5 h-5 rounded-full border border-emerald-400/50 bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs mr-3 shrink-0">
                        <Icon icon="solar:check-read-linear" className="text-xs" />
                      </span>
                      <span className="text-slate-200 font-medium flex items-center gap-2">
                        <span>{item.text}</span>
                        {item.icon && (
                          <Icon icon={item.icon} className="text-lg text-purple-400 shrink-0" />
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bouton d'action interactif */}
              <button
                type="button"
                onClick={() => handlePlanClick(plan)}
                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-fuchsia-600/30 hover:shadow-fuchsia-600/50 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white border border-slate-700'
                }`}
              >
                {plan.ctaText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
