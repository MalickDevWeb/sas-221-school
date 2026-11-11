import React from 'react';
import { Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ComposedChart, ResponsiveContainer } from 'recharts';
import { PerformanceData } from '../../domain/Dashboard';
import { CustomTooltip } from './PerformanceChartTooltip';

interface Props {
  performanceData: PerformanceData[];
  activeTab: 'combined' | 'notes' | 'presence';
}

/** « 2026-10 » → « oct. 26 ». */
const libelleMois = (m: string) => {
  const [a, mo] = m.split('-').map(Number);
  return new Date(a, (mo || 1) - 1, 1).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
};

/**
 * Courbe réelle (GET /student/performance). Axes complets (0–20, 0–100 %) : avant, des bornes 10–20 et 80–100
 * masquaient les notes sous 10 et les présences sous 80 %, et une « moyenne de promo » 13,84 était inventée.
 */
export function PerformanceComposedChart({ performanceData, activeTab }: Props) {
  const donnees = performanceData.map((d) => ({ ...d, libelle: libelleMois(d.mois) }));
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <ComposedChart data={donnees} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id="colorNote" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary, #B3181C)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-primary, #B3181C)" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
        <XAxis dataKey="libelle" tick={{ fontSize: 9, fontWeight: 700, fill: '#888' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} tick={{ fontSize: 9, fontWeight: 700, fill: '#888' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 9, fontWeight: 700, fill: '#888' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {activeTab !== 'presence' && (
          <>
            <Area yAxisId="left" type="monotone" dataKey="note" name="note" stroke="var(--color-primary, #B3181C)" strokeWidth={activeTab === 'notes' ? 3 : 2.5}
              fillOpacity={1} fill="url(#colorNote)" connectNulls dot={{ r: 3 }} />
            <Line yAxisId="left" type="monotone" dataKey="moyenneClasse" name="moyenneClasse" stroke="#291715" strokeDasharray="4 4"
              strokeWidth={1.5} connectNulls dot={false} />
          </>
        )}
        {activeTab === 'combined' && (
          <Line yAxisId="right" type="monotone" dataKey="presence" name="presence" stroke="#10B981" strokeWidth={2.5} connectNulls
            dot={{ r: 3, fill: '#10B981', strokeWidth: 1, stroke: '#fff' }} activeDot={{ r: 5 }} />
        )}
        {activeTab === 'presence' && (
          <Area yAxisId="right" type="monotone" dataKey="presence" name="presence" stroke="#10B981" strokeWidth={3} connectNulls
            fillOpacity={1} fill="url(#colorPresence)" dot={{ r: 3 }} />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
