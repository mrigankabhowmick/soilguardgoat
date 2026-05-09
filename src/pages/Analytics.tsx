import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Droplets, Thermometer, Leaf, Activity, Calendar } from 'lucide-react';

function SimpleLineChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 280;
  const h = 80;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <defs>
          <linearGradient id={`grad-${label.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <polygon
          points={`0,${h} ${points} ${w},${h}`}
          fill={`url(#grad-${label.replace(/\s/g,'')})`}
        />
        {data.map((v, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - ((v - min) / range) * (h - 10) - 5;
          return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
        })}
      </svg>
    </div>
  );
}

function BarChartSimple({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm transition-all duration-700"
            style={{ height: `${(v / max) * 80}px`, backgroundColor: color, opacity: 0.8 }}
          />
          <span className="text-[9px] text-gray-600">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Analytics() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const moistureData = [58, 62, 55, 70, 65, 68, 63];
  const tempData = [22, 25, 28, 24, 23, 26, 24];
  const ndviData = [0.70, 0.72, 0.71, 0.75, 0.74, 0.76, 0.74];
  const yieldData = [3.2, 3.5, 3.1, 3.8, 3.6, 4.0, 3.9, 4.1, 4.2, 4.0, 4.3, 4.5];

  const zones = [
    { name: 'Zone A', crop: 'Wheat', health: 87, moisture: 58, ndvi: 0.74, area: 4.2 },
    { name: 'Zone B', crop: 'Corn', health: 79, moisture: 72, ndvi: 0.81, area: 3.8 },
    { name: 'Zone C', crop: 'Rice', health: 91, moisture: 45, ndvi: 0.62, area: 5.1 },
    { name: 'Zone D', crop: 'Soy', health: 65, moisture: 68, ndvi: 0.55, area: 2.7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Farm Analytics</span>
        </div>
        <div className="flex bg-gray-900/60 border border-gray-800/50 rounded-xl p-1 gap-1">
          {(['7d', '30d', '90d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                period === p ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Soil Moisture', value: '62%', change: '+4%', icon: Droplets, color: 'text-blue-400' },
          { label: 'Avg Temperature', value: '24.6°C', change: '-1.2°C', icon: Thermometer, color: 'text-orange-400' },
          { label: 'Avg NDVI', value: '0.74', change: '+0.03', icon: Leaf, color: 'text-green-400' },
          { label: 'Yield Forecast', value: '4.5 t/ha', change: '+12%', icon: TrendingUp, color: 'text-emerald-400' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              <span className="text-xs text-gray-500">{kpi.label}</span>
            </div>
            <div className="text-xl font-bold text-white">{kpi.value}</div>
            <div className="text-xs text-green-400 mt-1">{kpi.change} vs last week</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
          <div className="text-sm font-medium text-white mb-1">Soil Moisture Trend</div>
          <div className="text-xs text-gray-500 mb-4">Past 7 days – all zones avg</div>
          <SimpleLineChart data={moistureData} color="#3b82f6" label="Moisture (%)" />
          <div className="flex justify-between mt-2">
            {DAYS.map((d, i) => <span key={i} className="text-[9px] text-gray-600">{d}</span>)}
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
          <div className="text-sm font-medium text-white mb-1">NDVI Vegetation Index</div>
          <div className="text-xs text-gray-500 mb-4">Crop health over time</div>
          <SimpleLineChart data={ndviData} color="#22c55e" label="NDVI" />
          <div className="flex justify-between mt-2">
            {DAYS.map((d, i) => <span key={i} className="text-[9px] text-gray-600">{d}</span>)}
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
          <div className="text-sm font-medium text-white mb-1">Yield Prediction (t/ha)</div>
          <div className="text-xs text-gray-500 mb-4">Monthly forecast</div>
          <BarChartSimple data={yieldData} labels={MONTHS} color="#22c55e" />
        </div>
      </div>

      {/* Zone comparison table */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-800/50">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Zone Performance Comparison</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-800/50">
                {['Zone', 'Crop', 'Health Score', 'Moisture', 'NDVI', 'Area (ha)', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30">
              {zones.map(zone => (
                <tr key={zone.name} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-white">{zone.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{zone.crop}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-20 h-1.5 bg-gray-800 rounded-full">
                        <div
                          className={`h-1.5 rounded-full ${zone.health > 85 ? 'bg-green-500' : zone.health > 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${zone.health}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{zone.health}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-blue-400">{zone.moisture}%</td>
                  <td className="px-5 py-4 text-sm text-green-400">{zone.ndvi}</td>
                  <td className="px-5 py-4 text-sm text-gray-400">{zone.area}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      zone.health > 85 ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                      zone.health > 70 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {zone.health > 85 ? 'Excellent' : zone.health > 70 ? 'Good' : 'Needs Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Crop Health Heatmap</span>
          <span className="text-xs text-gray-500 ml-1">Last 7 weeks</span>
        </div>
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {Array.from({ length: 28 }, (_, i) => {
            const v = Math.random();
            const bg = v > 0.8 ? 'bg-green-500' : v > 0.6 ? 'bg-green-600/70' : v > 0.4 ? 'bg-yellow-600/70' : v > 0.2 ? 'bg-orange-700/70' : 'bg-red-800/70';
            return <div key={i} className={`${bg} rounded-sm h-6 opacity-${Math.round(v * 10) * 10}`} title={`${(v * 100).toFixed(0)}%`} />;
          })}
        </div>
        <div className="flex items-center gap-3 mt-3">
          {[['bg-red-800/70','Critical'],['bg-orange-700/70','Poor'],['bg-yellow-600/70','Fair'],['bg-green-600/70','Good'],['bg-green-500','Excellent']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-sm ${c}`} />
              <span className="text-xs text-gray-500">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
