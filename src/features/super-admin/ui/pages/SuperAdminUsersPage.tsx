import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  User, 
  ShieldCheck, 
  UserCog,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { ROLE_UTILISATEUR } from '@/shared/constants';
import { superAdminService } from '@/services/superAdminService';
import type { GlobalUser, CreateGlobalUserPayload } from '@/types/superAdmin';

export const SuperAdminUsersPage = () => {
  const [users, setUsers] = useState<GlobalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateGlobalUserPayload>({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'SUPER_ADMIN'
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await superAdminService.getGlobalUsers();
      setUsers(data);
    } catch (error) {
      console.error('API Error', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await superAdminService.createGlobalUser(formData);
      toast.success('Utilisateur créé avec succès');
      setIsModalOpen(false);
      setFormData({ nom: '', prenom: '', email: '', password: '', role: 'SUPER_ADMIN' });
      fetchUsers();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('Conflit', { description: error.response.data?.message || 'Cet email est déjà utilisé' });
      } else if (error.response?.status === 400) {
        toast.error('Erreur de validation', { description: 'Veuillez vérifier les champs du formulaire' });
      } else {
        toast.error('Erreur', { description: 'Impossible de créer l\'utilisateur' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === 'SUPER_ADMIN' || role === 'PLATFORM_ADMIN') return <ShieldCheck className="w-4 h-4 text-purple-600" />;
    return <UserCog className="w-4 h-4 text-blue-600" />;
  };

  const getRoleBadgeClass = (role: string) => {
    if (role === 'SUPER_ADMIN' || role === 'PLATFORM_ADMIN') return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const filteredUsers = users.filter(user => {
    const searchString = `${user.prenom} ${user.nom} ${user.email} ${user.matricule}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8 h-full flex flex-col bg-slate-50/50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Utilisateurs Globaux</h1>
          <p className="text-sm text-gray-500 mt-1">Gérer les administrateurs globaux et super admins</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-[#4A5BE8] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvel Utilisateur
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Créer un utilisateur global</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input required type="text" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} className="w-full border rounded-lg p-2" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input required type="text" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} className="w-full border rounded-lg p-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input required minLength={8} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full border rounded-lg p-2">
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="PLATFORM_ADMIN">Platform Admin</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50">
                  {isSubmitting ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher nom, email, matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6BF9]/50 focus:border-primary transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white border border-gray-200 text-sm rounded-lg p-2 outline-none"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="PLATFORM_ADMIN">Platform Admin</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="min-w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Matricule</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Chargement des utilisateurs...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-base font-semibold text-gray-900">Aucun utilisateur trouvé</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold mr-3 border border-slate-200">
                          {user.prenom.charAt(0)}{user.nom.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{user.prenom} {user.nom}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">
                      {user.matricule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getRoleBadgeClass(user.role)}`}>
                        <span className="mr-1.5">{getRoleIcon(user.role)}</span>
                        {user.role.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-1 opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
