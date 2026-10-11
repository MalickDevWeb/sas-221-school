import React from 'react';
import { LifeBuoy, MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const SuperAdminSupportPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Support Client</h1>
          <p className="text-slate-500 mt-1">Gérez les requêtes de support des administrateurs d'écoles</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span>Nouveau ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tickets ouverts</p>
            <p className="text-xl font-bold text-slate-800">3</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Temps de réponse moy.</p>
            <p className="text-xl font-bold text-slate-800">2.4h</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tickets résolus</p>
            <p className="text-xl font-bold text-slate-800">142</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">École</th>
                <th className="px-6 py-4">Priorité</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Créé le</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { id: "TK-2042", subject: "Impossible de générer les bulletins", school: "Lycée d'Excellence", priority: "Haute", status: "Ouvert", date: "Il y a 2h" },
                { id: "TK-2041", subject: "Ajout de nouveaux professeurs", school: "Groupe Scolaire Bilingue", priority: "Moyenne", status: "En cours", date: "Hier" },
                { id: "TK-2040", subject: "Configuration des paiements Wave", school: "École Primaire ABC", priority: "Basse", status: "Résolu", date: "15 sept." },
              ].map((ticket, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800 text-sm">{ticket.subject}</p>
                    <p className="text-xs text-slate-500">{ticket.id}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{ticket.school}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${ticket.priority === 'Haute' ? 'bg-rose-50 text-rose-600' : ticket.priority === 'Moyenne' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${ticket.status === 'Ouvert' ? 'bg-rose-50 border-rose-200 text-rose-700' : ticket.status === 'En cours' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{ticket.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-primary font-medium text-sm hover:underline">Voir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
