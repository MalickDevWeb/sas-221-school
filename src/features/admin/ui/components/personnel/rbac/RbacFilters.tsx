import React from 'react';
import { RBAC_CATEGORIES } from '../../../../domain/PersonnelModels';

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
}

const HTTP_METHODS = ['TOUS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export const RbacFilters: React.FC<Props> = ({
  search,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedMethod,
  onSelectMethod,
}) => (
  <div className="bg-[#FAF8F6] p-3.5 rounded-2xl border border-neutral-200/80 space-y-3">
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
      <div className="relative flex-1">
        <span translate="no" className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
          search
        </span>
        <input
          type="text"
          placeholder="Rechercher une méthode, endpoint ou permission..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 shrink-0">
        <span className="text-[10px] text-neutral-400 uppercase font-black mr-1">Méthode :</span>
        {HTTP_METHODS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onSelectMethod(m)}
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

    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-neutral-200/60">
      <span className="text-[10px] text-neutral-400 uppercase font-black mr-1">Catégorie :</span>
      {RBAC_CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelectCategory(cat)}
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
);

