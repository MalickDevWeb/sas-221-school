import React, { useState, useEffect } from 'react';
import { Search, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { superAdminService } from '@/services/superAdminService';
import type { GlobalUser } from '@/types/superAdmin';
import { CreateUserModal } from '../components/users/CreateUserModal';
import { UsersTable } from '../components/users/UsersTable';
import { DeleteUserModal } from '../components/users/DeleteUserModal';

export const SuperAdminUsersPage = () => {
  const [users, setUsers] = useState<GlobalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await superAdminService.getGlobalUsers();
      setUsers(data);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await superAdminService.deleteGlobalUser(userToDelete.id);
      toast.success(`Accès révoqué pour ${userToDelete.name}`);
      setUserToDelete(null);
      fetchUsers();
    } catch {
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const search = `${user.prenom} ${user.nom} ${user.email} ${user.matricule}`.toLowerCase();
    const matchesSearch = search.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles size={12} className="text-cyan-400" /> Sécurité & Contrôle d'Accès
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Utilisateurs Globaux</h1>
          <p className="text-sm text-slate-400 mt-1">Gérer les comptes et privilèges des Super Administrateurs de la plateforme.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:shadow-lg hover:shadow-indigo-500/25 transition-all w-fit"
        >
          <Plus size={16} /> Nouvel Administrateur
        </button>
      </div>

      {isModalOpen && <CreateUserModal onClose={() => setIsModalOpen(false)} onSuccess={fetchUsers} />}
      {userToDelete && (
        <DeleteUserModal user={userToDelete} onClose={() => setUserToDelete(null)} onConfirm={handleConfirmDelete} isDeleting={isDeleting} />
      )}

      <div className="rounded-2xl bg-[#0E1326]/70 border border-white/10 backdrop-blur-xl shadow-xl flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white/[0.02]">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text" placeholder="Rechercher nom, email, matricule..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto bg-[#070A14] border border-white/10 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
            >
              <option value="ALL">Tous les privilèges</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="PLATFORM_ADMIN">Platform Admin</option>
              <option value="ADMIN">Admin Institutionnel</option>
            </select>
          </div>
        </div>

        <UsersTable users={filteredUsers} isLoading={isLoading} onDelete={(id, name) => setUserToDelete({ id, name })} />
      </div>
    </div>
  );
};
