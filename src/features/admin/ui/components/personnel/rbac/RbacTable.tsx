import React from 'react';
import { RbacPermission, STAFF_ROLES } from '../../../../domain/PersonnelModels';

interface Props {
  permissions: RbacPermission[];
  roles: string[];
  matrix: Record<string, string[]>;
  validKeys: Set<string>;
  totalCount: number;
  onToggle: (role: string, key: string) => void;
  onSetAll: (role: string, keys: string[], enabled: boolean) => void;
  onRemoveRole: (role: string) => void;
}

const getBadge = (m: string) => {
  switch (m) {
    case 'GET': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'POST': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'PUT': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PATCH': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'DELETE': return 'bg-rose-50 text-rose-700 border-rose-200';
    default: return 'bg-neutral-50 text-neutral-600 border-neutral-200';
  }
};

export const RbacTable: React.FC<Props> = ({
  permissions, roles, matrix, validKeys, totalCount, onToggle, onSetAll, onRemoveRole,
}) => (
  <div className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs">
    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-[#FAF8F6] z-10 border-b border-neutral-200 shadow-xs">
          <tr className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">
            <th className="px-5 py-3.5 min-w-[280px]">Permission Système</th>
            <th className="px-3 py-3.5 min-w-[110px]">Catégorie</th>
            {roles.map((r) => (
              <th key={r} className="px-3 py-3.5 text-center min-w-[120px]">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[#1E293B] font-black">{r}</span>
                    {!STAFF_ROLES.includes(r) && (
                      <button type="button" onClick={() => onRemoveRole(r)} className="text-neutral-400 hover:text-rose-600 text-xs border-0 bg-transparent cursor-pointer">✕</button>
                    )}
                  </div>
                  <span className="text-[9px] text-neutral-400 font-semibold lowercase">
                    ({(matrix[r] || []).filter((k) => validKeys.has(k)).length} actives)
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <button type="button" onClick={() => onSetAll(r, permissions.map((p) => p.key), true)} className="text-[8px] font-black px-1.5 py-0.5 bg-neutral-100 hover:bg-emerald-50 text-neutral-600 rounded cursor-pointer border border-neutral-200">+ Tous</button>
                    <button type="button" onClick={() => onSetAll(r, permissions.map((p) => p.key), false)} className="text-[8px] font-black px-1.5 py-0.5 bg-neutral-100 hover:bg-rose-50 text-neutral-600 rounded cursor-pointer border border-neutral-200">- Aucun</button>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 font-bold text-neutral-600 text-xs">
          {permissions.length === 0 ? (
            <tr><td colSpan={2 + roles.length} className="px-6 py-12 text-center text-neutral-400 font-medium">Aucune permission ne correspond aux filtres.</td></tr>
          ) : (
            permissions.map((p) => (
              <tr key={p.key} className="hover:bg-neutral-50/60 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-start gap-2.5">
                    <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded border shrink-0 mt-0.5 ${getBadge(p.method)}`}>{p.method}</span>
                    <div>
                      <div className="text-[#1E293B] font-extrabold text-xs">{p.label}</div>
                      <code className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1 py-0.2 rounded mt-0.5 inline-block">{p.endpoint}</code>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3"><span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md text-[9px] uppercase font-black border border-neutral-200/60 inline-block">{p.category}</span></td>
                {roles.map((r) => {
                  const checked = matrix[r]?.includes(p.key) || false;
                  return (
                    <td key={r} className="px-3 py-3 text-center">
                      <input type="checkbox" checked={checked} onChange={() => onToggle(r, p.key)} className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer" />
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    <div className="bg-[#FAF8F6] px-5 py-2.5 border-t border-neutral-200 flex items-center justify-between text-[10px] text-neutral-500 font-semibold">
      <span>Affichage de <strong className="text-neutral-800">{permissions.length}</strong> sur <strong>{totalCount}</strong> permissions</span>
    </div>
  </div>
);

