import React, { useState, useEffect } from 'react';
import { Sprout, Droplets, Wind, Sun, Leaf, TrendingDown, Award, Globe, Zap, BarChart2 } from 'lucide-react';

function EcoScore({ score }: { score: number }) {
  const color = score > 80 ? '#22c55e' : score > 60 ? '#84cc16' : '#f59e0b';
  const circumference = 2 * Math.PI * 52;
  const dash = circumference * (score / 100);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#1f2937" strokeWidth="10" />
          <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
            className="transition-all duration-2000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-sm font-medium" style={{ color }}>
        {score > 80 ? 'Excellent' : score > 60 ? 'Good' : 'Needs Work'}
      </div>
    </div>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export default function Sustainability() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const waterSaved = 3840 + tick * 2;
  const co2Reduced = 1.24;
  const ecoScore = 82;
  const solarCharge = Math.min(100, 67 + Math.sin(tick * 0.5) * 5);

  const carbonData = [2.1, 1.9, 1.8, 1.7, 1.5, 1.24];
  const waterData = [520, 490, 460, 420, 390, 360];

  return (
    <div className="space-y-6">
      {/* Hero row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Eco Score */}
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="text-sm font-medium text-white mb-4">Eco Score</div>
          <EcoScore score={ecoScore} />
          <p className="text-xs text-gray-500 text-center mt-3">Your farm is in the top 18% for sustainability</p>
        </div>

        {/* Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {[
            { label: 'Water Saved This Month', value: `${waterSaved.toLocaleString()} L`, icon: Droplets, color: 'text-blue-400', sub: 'vs conventional farming' },
            { label: 'CO₂ Reduced', value: `${co2Reduced} t`, icon: Wind, color: 'text-cyan-400', sub: 'this season' },
            { label: 'Solar Energy Used', value: `${solarCharge.toFixed(0)}%`, icon: Sun, color: 'text-yellow-400', sub: 'of drone power' },
            { label: 'Pesticide Reduction', value: '34%', icon: Leaf, color: 'text-green-400', sub: 'AI-optimized spraying' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-600 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Carbon footprint tracker */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Carbon Footprint Tracker</span>
          <span className="ml-auto text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
            Trending Down
          </span>
        </div>
        <div className="flex items-end gap-2 h-24 mb-3">
          {carbonData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-500">{v}t</span>
              <div
                className="w-full rounded-t-sm transition-all duration-700"
                style={{
                  height: `${(v / 2.5) * 72}px`,
                  backgroundColor: i === carbonData.length - 1 ? '#22c55e' : '#374151',
                }}
              />
              <span className="text-[9px] text-gray-600">{MONTHS[i]}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-green-400">
          <TrendingDown className="w-4 h-4" />
          <span>41% reduction in 6 months — excellent progress!</span>
        </div>
      </div>

      {/* Water analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Water Usage Analytics</span>
          </div>
          <div className="flex items-end gap-2 h-24 mb-3">
            {waterData.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${(v / 600) * 72}px`,
                    backgroundColor: i === waterData.length - 1 ? '#3b82f6' : '#1e40af',
                    opacity: 0.7 + i * 0.05,
                  }}
                />
                <span className="text-[9px] text-gray-600">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-blue-400 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            31% water savings through smart irrigation
          </div>
        </div>

        {/* Solar panel */}
        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Solar Charging Station</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Solar Panels', value: solarCharge, color: 'bg-yellow-500', status: 'Active' },
              { label: 'Battery Storage', value: 78, color: 'bg-green-500', status: 'Charging' },
              { label: 'Grid Export', value: 23, color: 'bg-blue-500', status: 'Exporting' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{item.value.toFixed(0)}%</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      item.status === 'Active' ? 'bg-yellow-500/20 text-yellow-400' :
                      item.status === 'Charging' ? 'bg-green-500/20 text-green-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>{item.status}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-800 rounded-full">
                  <div className={`${item.color} h-2 rounded-full transition-all duration-1000`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-400">
            Estimated energy generated today: <strong>4.7 kWh</strong> — enough for 3 full drone flights
          </div>
        </div>
      </div>

      {/* Green Insights */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Green Farming Insights</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            { icon: Leaf, title: 'Precision Spraying', desc: 'AI-guided spraying reduced chemical use by 34% while maintaining crop health scores above 85%.', tag: 'Active' },
            { icon: Droplets, title: 'Smart Irrigation', desc: 'Moisture sensors triggered 18 automated irrigation events this month, saving 3,840 liters vs manual scheduling.', tag: 'Optimized' },
            { icon: Zap, title: 'Energy Efficiency', desc: 'Drone fleet runs 67% on solar. Battery recycling program saves 2.3 kg of lithium waste per quarter.', tag: 'On Track' },
            { icon: Wind, title: 'Air Quality', desc: 'Farm air quality index averages 42 (Good). Reduced dust through precision tillage techniques.', tag: 'Good' },
            { icon: Globe, title: 'Biodiversity', desc: 'Pollinator corridors established in 1.2ha of field margins. Bee population increased 22% YoY.', tag: 'Growing' },
            { icon: BarChart2, title: 'Impact Report', desc: 'This season: 1.24t CO₂ saved, 31% less water, 34% less pesticide — equivalent to planting 58 trees.', tag: 'Report Ready' },
          ].map(item => (
            <div key={item.title} className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-white">{item.title}</span>
                <span className="ml-auto text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded-full">{item.tag}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
