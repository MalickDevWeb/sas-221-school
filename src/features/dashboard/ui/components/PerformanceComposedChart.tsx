import React from 'react';
import { Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ComposedChart, ResponsiveContainer } from 'recharts';
import { PerformanceData } from '../../domain/Dashboard';
import { CustomTooltip } from './PerformanceChartTooltip';

interface Props {
  performanceData: PerformanceData[];
  activeTab: 'combined' | 'notes' | 'presence';
}

export function PerformanceComposedChart({ performanceData, activeTab }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
      <ComposedChart
        data={performanceData}
        margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorNote" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B3181C" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#B3181C" stopOpacity={0.00}/>
          </linearGradient>
          <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.00}/>
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
        
        <XAxis 
          dataKey="mois" 
          tick={{ fontSize: 9, fontWeight: 700, fill: '#888' }} 
          axisLine={false} 
          tickLine={false}
        />
        
        <YAxis 
          yAxisId="left"
          domain={[10, 20]} 
          tickCount={6}
          tick={{ fontSize: 9, fontWeight: 700, fill: '#888' }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis 
          yAxisId="right"
          orientation="right"
          domain={[80, 100]} 
          tickCount={5}
          tick={{ fontSize: 9, fontWeight: 700, fill: '#888' }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip content={<CustomTooltip />} />

        {activeTab !== 'presence' && (
          <ReferenceLine 
            yAxisId="left"
            y={13.84} 
            stroke="#291715" 
            strokeDasharray="4 4" 
            label={{ 
              value: 'Promo (13.84)', 
              position: 'insideBottomRight', 
              fill: '#291715', 
              fontSize: 8, 
              fontWeight: 800 
            }} 
          />
        )}

        {activeTab === 'combined' && (
          <>
            <Area yAxisId="left" type="monotone" dataKey="note" name="note" stroke="#B3181C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNote)" />
            <Line yAxisId="right" type="monotone" dataKey="presence" name="presence" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981', strokeWidth: 1, stroke: '#fff' }} activeDot={{ r: 5 }} />
          </>
        )}

        {activeTab === 'notes' && (
          <Area yAxisId="left" type="monotone" dataKey="note" name="note" stroke="#B3181C" strokeWidth={3} fillOpacity={1} fill="url(#colorNote)" />
        )}

        {activeTab === 'presence' && (
          <Area yAxisId="right" type="monotone" dataKey="presence" name="presence" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPresence)" />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
