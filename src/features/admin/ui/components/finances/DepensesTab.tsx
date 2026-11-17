import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Expense } from '../../../domain/FinancesModels';
import { toneOf, useReferentiel } from '@/features/referentiels';

interface Props {
  expenses: Expense[];
  /** Renvoie false si le serveur a refusé (la saisie est alors conservée). */
  onAddExpense: (exp: Omit<Expense, 'id'>) => Promise<boolean> | void;
}

const MONTANT_MAX = 10_000_000_000;
/** Règles d'une dépense (erreurs humaines : espaces seuls, montant nul / négatif / décimal / démesuré, date absurde). */
const schemaDepense = z.object({
  label: z.string().trim().min(1, 'Saisissez le libellé de la dépense.').max(200, '200 caractères au maximum.'),
  amount: z.string().trim().min(1, 'Saisissez le montant en FCFA.')
    .refine(v => /^\d+$/.test(v.replace(/\s/g, '')), 'Montant invalide : un nombre entier de FCFA, sans virgule ni signe.')
    .refine(v => Number(v.replace(/\s/g, '')) > 0, 'Le montant doit être supérieur à 0.')
    .refine(v => Number(v.replace(/\s/g, '')) <= MONTANT_MAX, 'Montant démesuré : vérifiez le nombre de zéros.'),
  date: z.string().min(1, 'Indiquez la date de décaissement.')
    .refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).getFullYear() >= 2000, 'Date invalide.')
    .refine(v => new Date(v) <= new Date(Date.now() + 366 * 86_400_000), 'Date trop lointaine : une dépense se saisit au plus un an à l’avance.'),
});
type SaisieDepense = z.infer<typeof schemaDepense>;
const VIDE: SaisieDepense = { label: '', amount: '', date: '' };

export function DepensesTab({ expenses, onAddExpense }: Props) {
  const [categorie, setCategorie] = useState('RH');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  // Formulaire ouvert par « + Saisir une dépense »
  const [saisie, setSaisie] = useState(false);
  // Catégories paramétrables (onglet « Référentiels ») : plus de liste en dur
  const categories = useReferentiel('expense-category');
  const selectedCategory = categories.find(categorie) ? categorie : categories.values[0]?.code ?? '';
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SaisieDepense>({
    resolver: zodResolver(schemaDepense), defaultValues: VIDE, mode: 'onTouched',
  });
  // Verrou immédiat : un double clic n'enregistre la dépense qu'une fois
  const enCours = useRef(false);

  const enregistrer = async (v: SaisieDepense) => {
    if (enCours.current || !selectedCategory) return;
    enCours.current = true;
    try {
      const enregistree = await onAddExpense({
        label: v.label.trim(),
        category: selectedCategory,
        amount: Number(v.amount.replace(/\s/g, '')),
        date: v.date,
      });
      // Formulaire vidé seulement si le serveur a enregistré
      if (enregistree !== false) { reset(VIDE); setSaisie(false); }
    } finally {
      enCours.current = false;
    }
  };
  const aria = (id: keyof SaisieDepense) => errors[id] ? { 'aria-invalid': true as const, 'aria-describedby': `depense-${id}-erreur` } : {};
  const message = (id: keyof SaisieDepense) => errors[id] && (
    <p id={`depense-${id}-erreur`} role="alert" className="text-[10px] text-red-600 font-bold">{errors[id]?.message}</p>
  );

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortBy === 'amount') return b.amount - a.amount;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-4" id="depenses-tab-root">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E293B]">Dépenses</h3>
          <p className="text-[11px] text-neutral-500 font-semibold">Toutes les sorties de caisse de l'école.</p>
        </div>
        {!saisie && (
          <button id="depense-saisir" type="button" onClick={() => setSaisie(true)}
            className="px-4 py-2 bg-primary text-text-on-primary rounded-xl text-xs font-black flex items-center gap-1.5 w-fit cursor-pointer border-0">
            <span translate="no" className="material-symbols-outlined text-sm">add</span> Saisir une dépense
          </button>
        )}
      </div>
      <div className={`grid grid-cols-1 gap-6 ${saisie ? 'lg:grid-cols-3' : ''}`}>
      <div className={`${saisie ? 'lg:col-span-2' : ''} space-y-4`}>
        <div className="flex justify-between items-center bg-[#FAF8F6] p-3 border border-neutral-200 rounded-xl">
          <span className="text-[10px] font-black uppercase text-neutral-400">Trier le Journal</span>
          <div className="flex gap-2 text-xs font-bold">
            <button onClick={() => setSortBy('date')} className={`px-2.5 py-1 rounded ${sortBy === 'date' ? 'bg-[#1E293B] text-white' : 'bg-white border border-neutral-200 text-neutral-600'}`}>Par Date</button>
            <button onClick={() => setSortBy('amount')} className={`px-2.5 py-1 rounded ${sortBy === 'amount' ? 'bg-[#1E293B] text-white' : 'bg-white border border-neutral-200 text-neutral-600'}`}>Par Montant</button>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F6] text-[9px] font-black text-neutral-400 uppercase border-b border-neutral-200">
                <th className="px-4 py-2.5">Libellé</th>
                <th className="px-4 py-2.5">Catégorie</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600">
              {sortedExpenses.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500 font-semibold">Aucune dépense enregistrée.</td></tr>
              )}
              {sortedExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-neutral-50/50">
                  <td className="px-4 py-3 text-[#1E293B] font-extrabold">{exp.label}</td>
                  <td className="px-4 py-3">
                    <span className={`border px-2 py-0.5 rounded text-[9px] uppercase font-black ${toneOf(categories.find(exp.category)?.color).badge}`}>{categories.labelOf(exp.category)}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400 font-semibold">{exp.date}</td>
                  <td className="px-4 py-3 text-right font-mono text-rose-600 font-black">- {exp.amount.toLocaleString('fr-FR')} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {saisie && (
      <div className="bg-[#FAF8F6] border border-neutral-200 rounded-2xl p-4 shadow-sm h-fit space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[11px] font-black text-[#1E293B] uppercase tracking-wider">Nouvelle dépense</h4>
          <button type="button" onClick={() => { reset(VIDE); setSaisie(false); }} className="text-[11px] font-bold text-neutral-500 hover:text-neutral-800 cursor-pointer border-0 bg-transparent">Annuler</button>
        </div>

        <form id="form-depense" onSubmit={(e) => void handleSubmit(enregistrer)(e)} noValidate data-validation-externe className="space-y-3 text-xs font-bold text-neutral-600">
          <div className="space-y-1">
            <label htmlFor="depense-label" className="text-[9px] text-neutral-400 font-black uppercase">Libellé de la Dépense</label>
            <input id="depense-label" type="text" placeholder="Ex: Achat craies..." className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none aria-[invalid=true]:border-red-400" {...register('label')} {...aria('label')} />
            {message('label')}
          </div>
          <div className="space-y-1">
            <label className="text-[9px] text-neutral-400 font-black uppercase">Catégorie</label>
            <select value={selectedCategory} onChange={e => setCategorie(e.target.value)} disabled={categories.loading || !!categories.error} className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none">
              {categories.values.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
            {categories.error && <p role="alert" className="text-[10px] text-red-600 font-semibold">{categories.error}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="depense-amount" className="text-[9px] text-neutral-400 font-black uppercase">Montant (FCFA)</label>
            <input id="depense-amount" inputMode="numeric" placeholder="FCFA" className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none aria-[invalid=true]:border-red-400" {...register('amount')} {...aria('amount')} />
            {message('amount')}
          </div>
          <div className="space-y-1">
            <label htmlFor="depense-date" className="text-[9px] text-neutral-400 font-black uppercase">Date de Décaissement</label>
            <input id="depense-date" type="date" className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl focus:outline-none aria-[invalid=true]:border-red-400" {...register('date')} {...aria('date')} />
            {message('date')}
          </div>
          <button type="submit" disabled={isSubmitting || !selectedCategory} className="disabled:opacity-60 w-full py-2.5 bg-primary text-text-on-primary rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs border-0">Enregistrer</button>
          {!selectedCategory && !categories.loading && <p className="text-[10px] text-neutral-500">Aucune catégorie de dépense : ajoutez-en dans « Référentiels ».</p>}
        </form>
      </div>
      )}
      </div>
    </div>
  );
}
