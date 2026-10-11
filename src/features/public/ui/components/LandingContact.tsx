import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';
import { useContactForm } from '../../hooks/useContactForm';

/**
 * LandingContact - Section de contact et demande de démonstration personnalisée (SRP).
 * Délègue toute la logique de validation et de soumission au hook useContactForm.
 */
export const LandingContact: React.FC = () => {
  const {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    isSubmitted,
    resetForm,
    referenceId,
  } = useContactForm();

  return (
    <section id="contact" className="py-28 bg-[#070A14] relative overflow-hidden border-t border-white/5 isolate">
      {/* Halos d'ambiance ultra-performants via radial-gradients */}
      <div
        className="absolute top-1/2 right-10 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.02) 50%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-10 left-10 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.10) 0%, rgba(99, 102, 241, 0.02) 50%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-4 py-1.5 rounded-full border border-purple-500/20">
            Contact & Support
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
            Prêt à moderniser votre établissement ?
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Notre équipe d'experts vous accompagne pour déployer My School dans votre école ou université.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch max-w-6xl mx-auto">
          {/* Informations directes */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl p-8 bg-slate-900/90 sm:bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-6">
                <Icon icon="solar:chat-line-bold-duotone" className="text-base" />
                <span>Assistance dédiée 7j/7</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Échangez avec nos conseillers</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-8">
                Vous avez un projet spécifique, plusieurs campus ou des besoins sur-mesure ? Nous organisons une démonstration privée personnalisée.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <Icon icon="solar:letter-bold-duotone" className="text-xl" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email direct</span>
                    <a href="mailto:contact@myschool.sn" className="text-sm font-bold text-white hover:text-purple-400 transition-colors">
                      contact@myschool.sn
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Icon icon="solar:phone-bold-duotone" className="text-xl" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Téléphone / WhatsApp</span>
                    <a href="tel:+221770000000" className="text-sm font-bold text-white hover:text-indigo-400 transition-colors">
                      +221 77 000 00 00
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Icon icon="solar:map-point-bold-duotone" className="text-xl" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Siège Régional</span>
                    <span className="text-sm font-bold text-white">Dakar, Sénégal (Déploiement Panafricain)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3 text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Temps de réponse moyen estimé : moins de 2 heures</span>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="lg:col-span-7 rounded-3xl p-8 sm:p-10 bg-slate-900/90 sm:bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-2xl">
            {isSubmitted ? (
              <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                  <Icon icon="solar:check-circle-bold-duotone" className="text-4xl" />
                </div>
                <h4 className="text-2xl font-black text-white mb-2">Message bien reçu !</h4>
                {referenceId && (
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-purple-300 border border-purple-500/30 mb-3">
                    Réf. {referenceId}
                  </span>
                )}
                <p className="text-sm text-slate-300 max-w-md">
                  Merci de votre intérêt pour <strong>My School</strong>. Un conseiller vous contactera sous 24h avec une démonstration adaptée.
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-6 px-6 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Votre Nom complet *
                    </label>
                    <input
                      name="nom"
                      type="text"
                      required
                      placeholder="Ex: Amadou Diallo"
                      value={formData.nom}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Email Professionnel *
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="direction@mon-ecole.sn"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Téléphone / WhatsApp *
                    </label>
                    <input
                      name="telephone"
                      type="tel"
                      required
                      placeholder="+221 77 000 00 00"
                      value={formData.telephone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Nom de l'établissement *
                    </label>
                    <input
                      name="etablissement"
                      type="text"
                      required
                      placeholder="Groupe Scolaire Excellence"
                      value={formData.etablissement}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Votre Message ou Besoins *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Expliquez-nous brièvement la taille de votre école (nombre d'élèves, cycles) et vos objectifs..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-xl shadow-purple-900/30 hover:shadow-purple-700/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Icon icon="solar:refresh-circle-bold-duotone" className="text-lg animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Envoyer ma demande</span>
                      <Icon icon="solar:plain-2-bold-duotone" className="text-lg" />
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
