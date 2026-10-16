import React from 'react';
import { ShieldCheck, UserCog, User } from 'lucide-react';
import type { GlobalUser } from '@/types/superAdmin';
import { UserActionMenu } from './UserActionMenu';

interface UsersTableProps {
  users: GlobalUser[];
  isLoading: boolean;
  onDelete: (id: string, name: string) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, isLoading, onDelete }) => {
  const getRoleIcon = (role: string) => {
    if (role === 'SUPER_ADMIN' || role === 'PLATFORM_ADMIN') return <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />;
    return <UserCog className="w-3.5 h-3.5 text-indigo-400" />;
  };

  const getRoleBadgeClass = (role: string) => {
    if (role === 'SUPER_ADMIN' || role === 'PLATFORM_ADMIN') return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <table className="min-w-full text-left border-collapse">
        <thead className="bg-white/5 border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider font-semibold">
          <tr>
            <th className="px-6 py-4">Utilisateur</th>
            <th className="px-6 py-4">Matricule</th>
            <th className="px-6 py-4">Privilèges</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
          {isLoading ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-3" />
                Chargement des administrateurs...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-16 text-center text-slate-500">
                <User className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                Aucun administrateur trouvé
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold mr-3 shadow-md">
                      {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{user.prenom} {user.nom}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-400">
                  {user.matricule || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getRoleBadgeClass(user.role)}`}>
                    {getRoleIcon(user.role)}
                    {user.role.replace('_', ' ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <UserActionMenu user={user} onDelete={onDelete} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
