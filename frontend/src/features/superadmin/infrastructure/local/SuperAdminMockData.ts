import type { Tenant } from '../../domain/model/Tenant';

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 't-001',
    name: 'Lycée d\'Excellence Birago Diop',
    contactEmail: 'contact@biragodiop.edu.sn',
    status: 'ACTIVE',
    plan: 'ENTERPRISE',
    usersCount: 2450,
    createdAt: '2023-09-01',
  },
  {
    id: 't-002',
    name: 'Groupe Scolaire Les Pédagogues',
    contactEmail: 'direction@lespedagogues.sn',
    status: 'ACTIVE',
    plan: 'PRO',
    usersCount: 850,
    createdAt: '2023-11-15',
  },
  {
    id: 't-003',
    name: 'Institut Privé de Gestion',
    contactEmail: 'admin@ipg-dakar.sn',
    status: 'TRIAL',
    plan: 'BASIC',
    usersCount: 120,
    createdAt: '2024-02-10',
  },
  {
    id: 't-004',
    name: 'Collège Saint Michel',
    contactEmail: 'contact@stmichel.sn',
    status: 'SUSPENDED',
    plan: 'PRO',
    usersCount: 1100,
    createdAt: '2022-10-05',
  },
  {
    id: 't-005',
    name: 'École Internationale Bilingue',
    contactEmail: 'hello@eib.edu.sn',
    status: 'ACTIVE',
    plan: 'ENTERPRISE',
    usersCount: 3200,
    createdAt: '2023-01-20',
  }
];

