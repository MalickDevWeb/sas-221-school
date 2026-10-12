import React, { useState, useMemo } from 'react';
import { 
  RBAC_PERMISSIONS, 
  RBAC_CATEGORIES, 
  RbacPermission,
  STAFF_ROLES
} from '../../../domain/PersonnelModels';
import { useRbacStore } from '@/core/store/rbacStore';

interface Props {
  onShowToast: (msg: string, success: boolean) => void;
}

export function RbacTab({ onShowToast }: Props) {
  const { 
    roles, 
    matrix, 
    togglePermission, 
    setAllForRole, 
    addRole, 
    removeRole, 
    resetToDefaults, 
    saveMatrix 
  } = useRbacStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [selectedMethod, setSelectedMethod] = useState<string>('TOUS');
  const [newRoleInput, setNewRoleInput] = useState('');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);

  const validKeys = useMemo(() => new Set(RBAC_PERMISSIONS.map(p => p.key)), []);

  // Filter permissions
  const filteredPermissions = useMemo(() => {
    return RBAC_PERMISSIONS.filter(p => {
      const matchCat = selectedCategory === 'Toutes' || p.category === selectedCategory;
      const matchMethod = selectedMethod === 'TOUS' || p.method === selectedMethod;
      const q = search.toLowerCase().trim();
      const matchQuery = !q || 
        p.label.toLowerCase().includes(q) || 
        p.key.toLowerCase().includes(q) || 
        p.endpoint.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchMethod && matchQuery;
    });
  }, [selectedCategory, selectedMethod, search]);

  const handleSave = () => {
    saveMatrix(matrix);
    
    // Alerte de sécurité si un rôle non-habilité a des droits critiques
    const vigilDeletesFinance = matrix['Vigile']?.some(k => k.startsWith('finance_transactions_delete'));
    const teacherDeletesStaff = matrix['Enseignant']?.some(k => k.startsWith('hr_staff_delete'));
    
    if (vigilDeletesFinance || teacherDeletesStaff) {
      onShowToast("Avertissement Sécurité : Des permissions de suppression critique ont été attribuées !", false);
    } else {
      onShowToast("Matrice RBAC mise à jour et appliquée en temps réel avec succès !", true);
    }
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleInput.trim()) return;
    addRole(newRoleInput.trim());
    onShowToast(`Nouveau rôle "${newRoleInput.trim()}" créé dans la matrice.`, true);
    setNewRoleInput('');
    setShowAddRoleModal(false);
  };

  const getMethodBadgeClass = (method: RbacPermission['method']) => {
    switch (method) {
      case 'GET': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'POST': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PUT': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'PATCH': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELETE': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  return (
    <div className="space-y-5 text-xs font-bold text-[#4A5568]" id="rbac-tab-root">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-3 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span translate="no" className="material-symbols-outlined text-primary text-xl font-black">
              security
            </span>
            <h3 className="font-black text-base text-[#1E293B] tracking-tight">
              Matrice de Droits (RBAC Enterprise)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary/10 text-primary border border-primary/20">
              {RBAC_PERMISSIONS.length} Méthodes API
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
            Cochez les droits par méthode HTTP (GET, POST, PUT, PATCH, DELETE) pour chaque rôle. Les profils connectés n'auront accès qu'aux fonctions accordées.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAddRoleModal(true)}
            className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-neutral-200"
          >
            <span translate="no" className="material-symbols-outlined text-sm font-black">add</span>
            <span>Nouveau Rôle</span>
          </button>
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-black rounded-xl transition-all cursor-pointer border border-neutral-200"
            title="Rétablir les règles de sécurité par défaut"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-primary hover:bg-[#921316] text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 border-0"
          >
            <span translate="no" className="material-symbols-outlined text-sm font-black">save</span>
            <span>Mettre à jour les permissions</span>
          </button>
        </div>
      </div>

      {/* Filter and Search toolbar */}
      <div className="bg-[#FAF8F6] p-3.5 rounded-2xl border border-neutral-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <span translate="no" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher une méthode, endpoint ou permission (ex: finance, POST, notes...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* HTTP Method filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <span className="text-[10px] text-neutral-400 uppercase font-black mr-1">Méthode :</span>
            {['TOUS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMethod(m)}
                className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer border ${
                  selectedMethod === m
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-neutral-200/60">
          <span className="text-[10px] text-neutral-400 uppercase font-black mr-1">Catégorie :</span>
          {RBAC_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main RBAC Table */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#FAF8F6] z-10 border-b border-neutral-200 shadow-xs">
              <tr className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                <th className="px-5 py-3.5 min-w-[280px]">Permission Système & Endpoint</th>
                <th className="px-3 py-3.5 min-w-[110px]">Catégorie</th>
                {roles.map(role => {
                  const rolePermCount = (matrix[role] || []).filter(k => validKeys.has(k)).length;
                  const isStandard = STAFF_ROLES.includes(role);
                  return (
                    <th key={role} className="px-3 py-3.5 text-center min-w-[125px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[#1E293B] font-black">{role}</span>
                          {!isStandard && (
                            <button
                              type="button"
                              onClick={() => removeRole(role)}
                              title="Supprimer ce rôle personnalisé"
                              className="text-neutral-400 hover:text-rose-600 text-xs cursor-pointer border-0 bg-transparent"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <span className="text-[9px] text-neutral-400 font-semibold lowercase">
                          ({rolePermCount} actives)
                        </span>
                        {/* Quick action buttons per column */}
                        <div className="flex items-center gap-1 mt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              const keys = filteredPermissions.map(p => p.key);
                              setAllForRole(role, keys, true);
                            }}
                            className="text-[8px] font-black px-1.5 py-0.5 bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-700 text-neutral-600 rounded cursor-pointer border border-neutral-200"
                            title="Tout cocher pour les éléments visibles"
                          >
                            + Tous
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const keys = filteredPermissions.map(p => p.key);
                              setAllForRole(role, keys, false);
                            }}
                            className="text-[8px] font-black px-1.5 py-0.5 bg-neutral-100 hover:bg-rose-50 hover:text-rose-700 text-neutral-600 rounded cursor-pointer border border-neutral-200"
                            title="Tout décocher pour les éléments visibles"
                          >
                            - Aucun
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600 text-xs">
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={2 + roles.length} className="px-6 py-12 text-center text-neutral-400 font-medium">
                    <span translate="no" className="material-symbols-outlined text-3xl mb-1 block">search_off</span>
                    Aucune permission ne correspond aux filtres appliqués.
                  </td>
                </tr>
              ) : (
                filteredPermissions.map(p => (
                  <tr key={p.key} className="hover:bg-neutral-50/60 transition-colors group">
                    {/* Permission details */}
                    <td className="px-5 py-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded border shrink-0 mt-0.5 ${getMethodBadgeClass(p.method)}`}>
                          {p.method}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[#1E293B] font-extrabold text-xs">{p.label}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <code className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1 py-0.2 rounded">
                              {p.endpoint}
                            </code>
                          </div>
                          <p className="text-[10px] text-neutral-400 font-normal line-clamp-1 mt-0.5">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3">
                      <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-wide border border-neutral-200/60 inline-block whitespace-nowrap">
                        {p.category}
                      </span>
                    </td>

                    {/* Role checkboxes */}
                    {roles.map(role => {
                      const checked = matrix[role]?.includes(p.key) || false;
                      const isDangerDelete = p.method === 'DELETE' && (role === 'Vigile' || role === 'Enseignant');
                      return (
                        <td key={role} className="px-3 py-3 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer group p-1">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(role, p.key)}
                              className={`w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer transition-all ${
                                checked ? 'scale-105' : 'opacity-70 group-hover:opacity-100'
                              } ${isDangerDelete && checked ? 'accent-rose-600' : ''}`}
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="bg-[#FAF8F6] px-5 py-2.5 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-neutral-500 font-semibold">
          <div>
            Affichage de <strong className="text-neutral-800">{filteredPermissions.length}</strong> sur <strong>{RBAC_PERMISSIONS.length}</strong> permissions système
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> GET (Lecture)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> POST (Création)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> PUT/PATCH (Modification)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> DELETE (Suppression)
            </span>
          </div>
        </div>
      </div>

      {/* Modal for adding a custom role */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-[1000] flex items-center justify-center p-4">
          <form onSubmit={handleCreateRole} className="bg-white rounded-2xl shadow-2xl p-6 border border-neutral-200 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span translate="no" className="material-symbols-outlined text-primary text-xl font-black">
                  person_add
                </span>
                <h4 className="font-black text-sm text-[#1E293B]">Créer un Profil / Rôle</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRoleModal(false)}
                className="text-neutral-400 hover:text-neutral-600 border-0 bg-transparent cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[10px] uppercase font-black text-neutral-400 block mb-1">
                Intitulé du Rôle
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="ex: Surveillant Général, Directeur Pédagogique..."
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Ce rôle apparaîtra immédiatement en nouvelle colonne dans la matrice pour y attribuer ses accès.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddRoleModal(false)}
                className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-xl text-xs font-bold cursor-pointer border-0 bg-transparent"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-black shadow hover:bg-[#921316] cursor-pointer border-0"
              >
                Ajouter le Rôle
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
