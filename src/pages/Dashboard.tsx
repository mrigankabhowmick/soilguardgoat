import React, { useEffect, useState } from 'react';
import {
  Cpu, Droplets, Wind, Thermometer, Zap, Map, TrendingUp,
  AlertTriangle, CheckCircle, Leaf, Activity, CloudRain, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';

function StatCard({ icon: Icon, label, value, unit, color, trend }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  unit?: string;
  color: string;
  trend?: string;
}) {
  return (
    <div className="bg-gray-900/60 backdrop-blur border border-gray-800/50 rounded-2xl p-5 hover:border-gray-700/50 transition-all group relative overflow-hidden">
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${color}/10 blur-xl group-hover:${color}/20 transition-all`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color}/15 border ${color}/20 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}<span className="text-sm text-gray-500 ml-1">{unit}</span></div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function DroneCard({ drone }: { drone: { name: string; status: string; battery_level: number; signal_strength: number } }) {
  const statusColor = drone.status === 'flying' ? 'text-green-400' : drone.status === 'online' ? 'text-blue-400' : 'text-gray-500';
  return (
    <div className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 flex items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
          <Cpu className="w-5 h-5 text-gray-400" />
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${drone.status === 'flying' || drone.status === 'online' ? 'bg-green-400' : 'bg-gray-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{drone.name}</div>
        <div className={`text-xs ${statusColor} capitalize`}>{drone.status}</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-400">{drone.battery_level}%</div>
        <div className="text-xs text-gray-600">Signal: {drone.signal_strength}%</div>
      </div>
    </div>
  );
}

const ALERTS_DEMO = [
  { type: 'pest', title: 'Pest detected in Zone B', severity: 'high', time: '2m ago' },
  { type: 'moisture', title: 'Low soil moisture Zone A', severity: 'medium', time: '15m ago' },
  { type: 'weather', title: 'Rain expected in 2h', severity: 'low', time: '1h ago' },
  { type: 'health', title: 'Crop health optimal', severity: 'info', time: '3h ago' },
];

function simVal(base: number, range: number) {
  return +(base + (Math.random() - 0.5) * range).toFixed(1);
}

export default function Dashboard() {
  const { drones, activeDrone } = useApp();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const moisture = simVal(62, 10);
  const ndvi = simVal(0.74, 0.1);
  const temp = simVal(24, 4);
  const humidity = simVal(58, 8);
  const airQuality = simVal(42, 6);
  const waterLevel = simVal(78, 12);

  return (
    <div className="space-y-6">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-xs text-green-400 font-medium">LIVE</span>
        <span className="text-xs text-gray-600">Auto-refreshing every 3s</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Droplets} label="Soil Moisture" value={moisture} unit="%" color="bg-blue-500" trend="+2%" />
        <StatCard icon={Leaf} label="NDVI Score" value={ndvi} color="bg-green-500" trend="Good" />
        <StatCard icon={Thermometer} label="Temperature" value={temp} unit="°C" color="bg-orange-500" />
        <StatCard icon={Wind} label="Humidity" value={humidity} unit="%" color="bg-cyan-500" />
        <StatCard icon={Eye} label="Air Quality" value={airQuality} unit="AQI" color="bg-emerald-500" trend="Clean" />
        <StatCard icon={CloudRain} label="Water Level" value={waterLevel} unit="%" color="bg-teal-500" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800/50 rounded-2xl overflow-hidden" style={{ minHeight: 320 }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/50">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Farm Map & Drone Tracking</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>
          <div className="relative h-64 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
            {/* Satellite grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
            {/* Farm zones */}
            <div className="absolute top-8 left-8 w-28 h-20 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center justify-center">
              <span className="text-xs text-green-400">Zone A - Wheat</span>
            </div>
            <div className="absolute top-8 left-44 w-24 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-lg flex items-center justify-center">
              <span className="text-xs text-emerald-400">Zone B - Corn</span>
            </div>
            <div className="absolute top-36 left-8 w-36 h-16 bg-teal-500/20 border border-teal-500/40 rounded-lg flex items-center justify-center">
              <span className="text-xs text-teal-400">Zone C - Rice</span>
            </div>
            <div className="absolute top-36 left-52 w-20 h-16 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center justify-center">
              <span className="text-xs text-yellow-400">Zone D</span>
            </div>
            {/* Drone icon animated */}
            <div
              className="absolute transition-all duration-3000"
              style={{
                left: `${40 + Math.sin(tick * 0.8) * 30}%`,
                top: `${35 + Math.cos(tick * 0.6) * 20}%`,
              }}
            >
              <div className="relative">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                  <Cpu className="w-3 h-3 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />
              </div>
            </div>
            {/* Coordinates */}
            <div className="absolute bottom-3 right-3 bg-gray-900/80 border border-gray-700/50 rounded-lg px-2 py-1 text-xs text-gray-400">
              {(28.6 + Math.sin(tick * 0.3) * 0.001).toFixed(4)}°N, {(77.2 + Math.cos(tick * 0.4) * 0.001).toFixed(4)}°E
            </div>
          </div>
        </div>

        {/* Alerts + Drones */}
        <div className="space-y-4">
          {/* Active Alerts */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Active Alerts</span>
            </div>
            <div className="space-y-2">
              {ALERTS_DEMO.map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    a.severity === 'high' ? 'bg-red-500' :
                    a.severity === 'medium' ? 'bg-yellow-500' :
                    a.severity === 'info' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-300">{a.title}</p>
                    <p className="text-xs text-gray-600">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fleet */}
          <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Drone Fleet</span>
              <span className="ml-auto text-xs text-gray-600">{drones.length} total</span>
            </div>
            <div className="space-y-2">
              {drones.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-600">No drones registered</p>
                  <div className="mt-3 space-y-2">
                    {[
                      { name: 'SG-Alpha', status: 'flying', battery_level: 78, signal_strength: 92 },
                      { name: 'SG-Beta', status: 'charging', battery_level: 45, signal_strength: 0 },
                    ].map((d, i) => <DroneCard key={i} drone={d} />)}
                  </div>
                </div>
              ) : drones.map(d => <DroneCard key={d.id} drone={d} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Crop Health Score', value: 87, color: 'bg-green-500', icon: CheckCircle },
          { label: 'Irrigation Efficiency', value: 73, color: 'bg-blue-500', icon: Droplets },
          { label: 'Yield Prediction', value: 94, color: 'bg-emerald-500', icon: TrendingUp },
        ].map((item, i) => (
          <div key={i} className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <item.icon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">{item.label}</span>
              <span className="ml-auto text-sm font-bold text-white">{item.value}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className={`${item.color} h-2 rounded-full transition-all duration-1000`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">AI Recommendations</span>
          <span className="ml-2 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">4 insights</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { icon: Droplets, text: 'Irrigate Zone A — moisture below 55%', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: Zap, text: 'Apply nitrogen fertilizer to Zone B in 2 days', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { icon: AlertTriangle, text: 'Monitor Zone C for aphid infestation signs', color: 'text-red-400', bg: 'bg-red-500/10' },
            { icon: Leaf, text: 'Optimal harvest window: 8–12 days from now', color: 'text-green-400', bg: 'bg-green-500/10' },
          ].map((rec, i) => (
            <div key={i} className={`${rec.bg} border border-gray-700/30 rounded-xl p-3 flex items-start gap-2`}>
              <rec.icon className={`w-4 h-4 ${rec.color} flex-shrink-0 mt-0.5`} />
              <p className="text-xs text-gray-300 leading-relaxed">{rec.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
