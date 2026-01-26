
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { HistoryPoint } from '../types';

interface Props {
  data: HistoryPoint[];
  fireCount: number;
}

const Statistics: React.FC<Props> = ({ data, fireCount }) => {
  return (
    <div className="bg-stone-900 rounded-[25px] md:rounded-[30px] p-4 md:p-6 border-4 md:border-8 border-orange-600 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-2">
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <i className="fa-solid fa-chart-line text-orange-500"></i>
          Incident Monitoring
        </h2>
        <div className="bg-orange-600 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase text-white shadow-lg">
          Active Data Link
        </div>
      </div>

      <div className="h-[200px] md:h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAlpha" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBeta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGamma" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#666" 
              fontSize={8} 
              tickLine={false} 
              axisLine={false}
              hide={window.innerWidth < 640}
            />
            <YAxis 
              stroke="#666" 
              fontSize={8} 
              tickLine={false} 
              axisLine={false} 
              unit="%"
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '15px', color: '#fff', fontSize: '10px' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
            <Area 
              type="monotone" 
              dataKey="alpha" 
              stroke="#f97316" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorAlpha)" 
              name="Alpha"
            />
            <Area 
              type="monotone" 
              dataKey="beta" 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorBeta)" 
              name="Beta"
            />
            <Area 
              type="monotone" 
              dataKey="gamma" 
              stroke="#fbbf24" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorGamma)" 
              name="Gamma"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6">
        <div className="bg-red-600 p-3 md:p-4 rounded-xl md:rounded-2xl border-b-4 border-red-800 text-center animate-pulse">
          <p className="text-[8px] md:text-[10px] font-black uppercase text-white/70 mb-1">Fire Events</p>
          <p className="text-xl md:text-3xl font-black text-white">{fireCount}</p>
        </div>
        <div className="bg-stone-800 p-3 md:p-4 rounded-xl md:rounded-2xl border-b-4 border-orange-500 text-center">
          <p className="text-[8px] md:text-[10px] font-black uppercase text-stone-500 mb-1">Flame Intensity</p>
          <p className="text-lg md:text-2xl font-black text-white">42%</p>
        </div>
        <div className="bg-stone-800 p-3 md:p-4 rounded-xl md:rounded-2xl border-b-4 border-emerald-500 text-center col-span-2 lg:col-span-1">
          <p className="text-[8px] md:text-[10px] font-black uppercase text-stone-500 mb-1">System Health</p>
          <p className="text-lg md:text-2xl font-black text-white">98%</p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
