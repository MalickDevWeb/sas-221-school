import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { TrendingUp, Award, CheckCircle2 } from 'lucide-react';

import { dashboardRepository } from '../../infrastructure/config/dependencies';
import { PerformanceData } from '../../domain/Dashboard';

import { PerformanceComposedChart } from './PerformanceComposedChart';
export function PerformanceChart() {
  const [activeTab, setActiveTab] = useState<'combined' | 'notes' | 'presence'>('combined');
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  React.useEffect(() => {
    dashboardRepository.getPerformanceData()
      .then(setPerformanceData)
      .catch(console.error);
  }, []);

  return (
    <section className="col-span-12 md:col-span-4 bg-white border border-neutral-gray-200 rounded-3xl p-5 shadow-sm h-[380px] flex flex-col justify-between">
      
      {/* Chart Header & Toggles */}
      <div className="shrink-0 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-title-lg text-xs font-black flex items-center gap-1.5 text-[#291715]">
            <TrendingUp className="h-4 w-4 text-[#B3181C]" />
            Analytique Performance
          </h3>
          
          {/* Quick Stats Badge */}
          <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5 animate-pulse" />
            GPA: 3.4
          </span>
        </div>

        {/* Responsive Mini Tabs */}
        <div className="flex bg-[#FAF8F6] p-1 rounded-xl border border-neutral-200/60 select-none">
          <button
            onClick={() => setActiveTab('combined')}
            className={`flex-1 py-1 text-center font-black text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'combined'
                ? 'bg-white text-[#B3181C] shadow-sm border border-neutral-250/20'
                : 'text-neutral-400 hover:text-[#291715]'
            }`}
          >
            Globale
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-1 text-center font-black text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-white text-[#B3181C] shadow-sm border border-neutral-250/20'
                : 'text-neutral-400 hover:text-[#291715]'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab('presence')}
            className={`flex-1 py-1 text-center font-black text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeTab === 'presence'
                ? 'bg-white text-[#B3181C] shadow-sm border border-neutral-250/20'
                : 'text-neutral-400 hover:text-[#291715]'
            }`}
          >
            Assiduité
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-grow w-full relative h-[210px] mt-2 select-none">
        
        <PerformanceComposedChart performanceData={performanceData} activeTab={activeTab} />
      </div>

      {/* Footer statistics benchmarks */}
      <div className="pt-3 border-t border-neutral-gray-150 flex justify-between items-center text-[10px] text-neutral-500 font-bold select-none">
        <div className="flex items-center gap-1">
          <Award className="h-3.5 w-3.5 text-[#B3181C]" />
          <span>Moyenne Promo : 13.84</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B3181C]" />
          <span>Note</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] ml-1.5" />
          <span>Présence</span>
        </div>
      </div>
    </section>
  );
}
