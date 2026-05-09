import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, Maximize2, Minimize2, Sun, Thermometer, Eye,
  Circle, Square, RotateCcw, ZoomIn, ZoomOut, Flashlight,
  Download, Settings, Wifi, Battery, Layers, Monitor, Smartphone,
  Loader2, CheckCircle, X, Upload
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type VisionMode = 'normal' | 'thermal' | 'night' | 'ndvi';
type FeedSource = 'drone' | 'laptop';

const DRONE_FEEDS = [
  { id: 1, name: 'SG-Alpha', zone: 'Zone A – Wheat Field', lat: '28.6139°N', lng: '77.2090°E', status: 'live' },
  { id: 2, name: 'SG-Beta', zone: 'Zone B – Corn Field', lat: '28.6155°N', lng: '77.2110°E', status: 'live' },
  { id: 3, name: 'SG-Gamma', zone: 'Zone C – Rice Paddy', lat: '28.6120°N', lng: '77.2075°E', status: 'idle' },
];

function FeedOverlay({ mode, tick }: { mode: VisionMode; tick: number }) {
  if (mode === 'thermal') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/60 via-orange-700/40 to-yellow-600/30" />
        <div className="absolute top-4 left-4 bg-black/50 rounded px-2 py-1 text-xs text-orange-300 font-mono">THERMAL</div>
        <div className="absolute bottom-4 right-4 flex gap-1 items-center bg-black/50 rounded px-2 py-1 text-xs text-orange-300">
          <span>Min: 18°C</span><span className="mx-1">|</span><span>Max: 34°C</span>
        </div>
        <div className="absolute top-1/3 left-1/4 w-16 h-12 bg-red-500/30 rounded-full blur-md" style={{ transform: `scale(${1 + Math.sin(tick * 0.5) * 0.1})` }} />
        <div className="absolute top-1/2 right-1/3 w-12 h-10 bg-orange-500/30 rounded-full blur-md" />
      </div>
    );
  }
  if (mode === 'night') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gray-900/70" />
        <div className="absolute top-4 left-4 bg-black/50 rounded px-2 py-1 text-xs text-green-300 font-mono">NIGHT VISION</div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(74,222,128,0.08),transparent_70%)]" />
      </div>
    );
  }
  if (mode === 'ndvi') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 via-lime-700/30 to-yellow-600/20" />
        <div className="absolute top-4 left-4 bg-black/50 rounded px-2 py-1 text-xs text-lime-300 font-mono">NDVI ANALYSIS</div>
        <div className="absolute bottom-4 left-4 flex gap-1.5 bg-black/50 rounded px-2 py-1">
          {[['#ef4444','Low'],['#f97316','Med'],['#84cc16','Good'],['#22c55e','High']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-0.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: c }} />
              <span className="text-[9px] text-gray-300">{l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function LaptopCameraFeed({ visionMode, tick, onSnapshot }: { visionMode: VisionMode; tick: number; onSnapshot: (dataUrl: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStatus, setCameraStatus] = useState<'off' | 'requesting' | 'on' | 'error'>('off');
  const [errorMsg, setErrorMsg] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraStatus('off');
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    setCameraStatus('requesting');
    setErrorMsg('');
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Enumerate devices after getting permission
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (!deviceId && videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      }

      setCameraStatus('on');
    } catch (err) {
      setCameraStatus('error');
      const name = (err as DOMException).name;
      if (name === 'NotAllowedError') {
        setErrorMsg('Camera permission denied. Click the camera icon in your browser address bar to allow access.');
      } else if (name === 'NotFoundError') {
        setErrorMsg('No camera found. Make sure a webcam is connected.');
      } else if (name === 'NotReadableError') {
        setErrorMsg('Camera is in use by another application. Close other apps using the camera.');
      } else {
        setErrorMsg(`Camera error: ${(err as Error).message}`);
      }
    }
  }, [facingMode, stopCamera]);

  const switchDevice = async (deviceId: string) => {
    setSelectedDevice(deviceId);
    await startCamera(deviceId);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onSnapshot(dataUrl);
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  const videoFilter = visionMode === 'night'
    ? 'grayscale(1) brightness(0.4) hue-rotate(90deg)'
    : visionMode === 'thermal'
    ? 'saturate(2) hue-rotate(180deg)'
    : 'none';

  return (
    <div className="space-y-3">
      {/* Camera controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {cameraStatus === 'on' ? (
          <button
            onClick={stopCamera}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
          >
            <X className="w-3 h-3" />
            Stop Camera
          </button>
        ) : (
          <button
            onClick={() => startCamera(selectedDevice || undefined)}
            disabled={cameraStatus === 'requesting'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all disabled:opacity-50"
          >
            {cameraStatus === 'requesting' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Monitor className="w-3 h-3" />}
            {cameraStatus === 'requesting' ? 'Connecting...' : 'Start Laptop Camera'}
          </button>
        )}

        {cameraStatus === 'on' && (
          <>
            <button
              onClick={takeSnapshot}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
            >
              <Camera className="w-3 h-3" />
              Snapshot
            </button>
            {devices.length > 1 && (
              <select
                value={selectedDevice}
                onChange={e => switchDevice(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-2 py-2 text-xs text-gray-300 focus:outline-none focus:border-green-500/50"
              >
                {devices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${devices.indexOf(d) + 1}`}
                  </option>
                ))}
              </select>
            )}
          </>
        )}
      </div>

      {/* Video feed */}
      <div className="relative bg-gray-900 border border-gray-800/50 rounded-2xl overflow-hidden">
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          {cameraStatus === 'on' ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: videoFilter }}
              />
              <FeedOverlay mode={visionMode} tick={tick} />
              {/* Live indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-lg px-2.5 py-1.5">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-white font-mono">LIVE</span>
                <span className="text-xs text-gray-400 font-mono ml-1">Laptop Camera</span>
              </div>
              {/* Timestamp */}
              <div className="absolute bottom-3 right-3 bg-black/60 rounded-lg px-2.5 py-1.5 text-xs text-gray-400 font-mono">
                {new Date().toLocaleTimeString()}
              </div>
              {/* Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-1/2 w-px h-4 bg-white/30 -translate-x-1/2" />
                  <div className="absolute bottom-0 left-1/2 w-px h-4 bg-white/30 -translate-x-1/2" />
                  <div className="absolute left-0 top-1/2 h-px w-4 bg-white/30 -translate-y-1/2" />
                  <div className="absolute right-0 top-1/2 h-px w-4 bg-white/30 -translate-y-1/2" />
                  <div className="absolute inset-1/4 border border-white/20 rounded-sm" />
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
              {cameraStatus === 'error' ? (
                <div className="text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-sm text-red-400 mb-1">Camera Error</p>
                  <p className="text-xs text-gray-500 max-w-xs">{errorMsg}</p>
                </div>
              ) : cameraStatus === 'requesting' ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-green-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Requesting camera access...</p>
                  <p className="text-xs text-gray-600 mt-1">Click "Allow" in the browser prompt</p>
                </div>
              ) : (
                <div className="text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <Monitor className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-sm text-gray-300 mb-1">Laptop Camera</p>
                  <p className="text-xs text-gray-500 max-w-xs">Click "Start Laptop Camera" to connect your webcam. You can take snapshots and apply AI vision filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for snapshots */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function SnapshotGallery({ snapshots, onDismiss }: { snapshots: string[]; onDismiss: (i: number) => void }) {
  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<Set<number>>(new Set());

  const saveToCloud = async (index: number) => {
    setSaving(index);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const res = await fetch(snapshots[index]);
      const blob = await res.blob();
      const file = new File([blob], `snapshot-${Date.now()}.jpg`, { type: 'image/jpeg' });

      const filePath = `${user.id}/${Date.now()}-snapshot.jpg`;
      const { error } = await supabase.storage
        .from('drone-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      await supabase.from('media_files').insert({
        user_id: user.id,
        file_name: file.name,
        file_url: supabase.storage.from('drone-media').getPublicUrl(filePath).data.publicUrl,
        file_type: 'image',
        file_size_mb: +(blob.size / 1024 / 1024).toFixed(2),
        ai_tags: [],
      });

      setSaved(prev => new Set(prev).add(index));
    } catch {
      // Silently fail — user might not be authenticated
    } finally {
      setSaving(null);
    }
  };

  const download = (index: number) => {
    const a = document.createElement('a');
    a.href = snapshots[index];
    a.download = `soilguard-snapshot-${index + 1}.jpg`;
    a.click();
  };

  if (snapshots.length === 0) return null;

  return (
    <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Camera className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium text-white">Captured Snapshots</span>
        <span className="text-xs text-gray-500 ml-auto">{snapshots.length} captured</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {snapshots.map((snap, i) => (
          <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-800/50">
            <img src={snap} alt={`Snapshot ${i + 1}`} className="w-full aspect-video object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => download(i)}
                className="w-8 h-8 bg-green-500/80 rounded-lg flex items-center justify-center text-white hover:bg-green-500 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => saveToCloud(i)}
                disabled={saving === i || saved.has(i)}
                className="w-8 h-8 bg-blue-500/80 rounded-lg flex items-center justify-center text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
                title="Save to cloud"
              >
                {saving === i ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 saved.has(i) ? <CheckCircle className="w-4 h-4" /> :
                 <Upload className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onDismiss(i)}
                className="w-8 h-8 bg-red-500/80 rounded-lg flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {saved.has(i) && (
              <div className="absolute top-1.5 right-1.5 bg-green-500 rounded-full p-0.5">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CameraPage() {
  const [feedSource, setFeedSource] = useState<FeedSource>('laptop');
  const [selectedFeed, setSelectedFeed] = useState(0);
  const [visionMode, setVisionMode] = useState<VisionMode>('normal');
  const [fullscreen, setFullscreen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [tick, setTick] = useState(0);
  const [autoCapture, setAutoCapture] = useState(false);
  const [snapshots, setSnapshots] = useState<string[]>([]);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!recording) { setRecTime(0); return; }
    const id = setInterval(() => setRecTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const currentFeed = DRONE_FEEDS[selectedFeed];
  const modeColors: Record<VisionMode, string> = {
    normal: 'text-white',
    thermal: 'text-orange-400',
    night: 'text-green-400',
    ndvi: 'text-lime-400',
  };

  const FEED_IMAGES = [
    'https://images.pexels.com/photos/1629660/pexels-photo-1629660.jpeg?auto=compress&w=1280',
    'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg?auto=compress&w=1280',
    'https://images.pexels.com/photos/158028/bellingrath-gardens-alabama-landscape-scenic-158028.jpeg?auto=compress&w=1280',
  ];

  const handleSnapshot = (dataUrl: string) => {
    setSnapshots(prev => [dataUrl, ...prev]);
  };

  const dismissSnapshot = (index: number) => {
    setSnapshots(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Source selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setFeedSource('laptop')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            feedSource === 'laptop'
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : 'border-gray-700/50 text-gray-500 hover:text-gray-300'
          }`}
        >
          <Monitor className="w-4 h-4" />
          Laptop Camera
        </button>
        <button
          onClick={() => setFeedSource('drone')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
            feedSource === 'drone'
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : 'border-gray-700/50 text-gray-500 hover:text-gray-300'
          }`}
        >
          <Wifi className="w-4 h-4" />
          Drone Feeds
        </button>
      </div>

      <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-black flex flex-col p-4 gap-4' : ''}`}>
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Main Feed Area */}
          <div className="flex-1 space-y-4">
            {feedSource === 'laptop' ? (
              <LaptopCameraFeed visionMode={visionMode} tick={tick} onSnapshot={handleSnapshot} />
            ) : (
              /* Drone feed (existing) */
              <div className="bg-gray-900 border border-gray-800/50 rounded-2xl overflow-hidden relative group">
                <div className="relative" style={{ paddingBottom: '56.25%' }}>
                  <img
                    src={FEED_IMAGES[selectedFeed]}
                    alt="drone feed"
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                    style={{ filter: visionMode === 'night' ? 'grayscale(1) brightness(0.4) hue-rotate(90deg)' : visionMode === 'thermal' ? 'saturate(2) hue-rotate(180deg)' : 'none' }}
                  />
                  <FeedOverlay mode={visionMode} tick={tick} />
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs text-white font-mono">{recording ? `REC ${fmt(recTime)}` : 'LIVE'}</span>
                      <span className="text-xs text-gray-400 font-mono ml-2">{currentFeed.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                      <span>ALT: {(45 + Math.sin(tick * 0.3) * 3).toFixed(1)}m</span>
                      <span>SPD: {(3.2 + Math.cos(tick * 0.4) * 0.5).toFixed(1)}m/s</span>
                      <Battery className="w-3 h-3" /><span>78%</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-mono">
                      <span>{currentFeed.lat}</span><span className="mx-1">|</span><span>{currentFeed.lng}</span>
                    </div>
                    <div className={`text-xs font-mono ${modeColors[visionMode]}`}>{visionMode.toUpperCase()} MODE</div>
                    <div className="text-xs text-gray-400 font-mono">{new Date().toLocaleTimeString()}</div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-16 h-16">
                      <div className="absolute top-0 left-1/2 w-px h-4 bg-white/30 -translate-x-1/2" />
                      <div className="absolute bottom-0 left-1/2 w-px h-4 bg-white/30 -translate-x-1/2" />
                      <div className="absolute left-0 top-1/2 h-px w-4 bg-white/30 -translate-y-1/2" />
                      <div className="absolute right-0 top-1/2 h-px w-4 bg-white/30 -translate-y-1/2" />
                      <div className="absolute inset-1/4 border border-white/20 rounded-sm" />
                    </div>
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="w-8 h-8 bg-black/60 rounded-lg flex items-center justify-center text-white hover:bg-green-500/60 transition-colors"><ZoomIn className="w-4 h-4" /></button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="w-8 h-8 bg-black/60 rounded-lg flex items-center justify-center text-white hover:bg-green-500/60 transition-colors"><ZoomOut className="w-4 h-4" /></button>
                    <button className="w-8 h-8 bg-black/60 rounded-lg flex items-center justify-center text-white hover:bg-green-500/60 transition-colors"><Download className="w-4 h-4" /></button>
                    <button onClick={() => setFullscreen(!fullscreen)} className="w-8 h-8 bg-black/60 rounded-lg flex items-center justify-center text-white hover:bg-green-500/60 transition-colors">
                      {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                  {zoom > 1 && <div className="absolute top-10 right-3 bg-black/60 rounded px-2 py-0.5 text-xs text-green-400 font-mono">{zoom}x</div>}
                </div>
              </div>
            )}

            {/* Vision mode controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1.5">
                {(['normal', 'thermal', 'night', 'ndvi'] as VisionMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setVisionMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      visionMode === m
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'text-gray-500 hover:text-gray-300 border border-gray-700/50'
                    }`}
                  >
                    {m === 'ndvi' ? 'NDVI' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              {feedSource === 'drone' && (
                <>
                  <button
                    onClick={() => setAutoCapture(!autoCapture)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      autoCapture ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'text-gray-500 border-gray-700/50 hover:text-gray-300'
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                    Auto-Capture {autoCapture ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => setRecording(!recording)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      recording ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'text-gray-500 border-gray-700/50 hover:text-gray-300'
                    }`}
                  >
                    {recording ? <Square className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    {recording ? 'Stop' : 'Record'}
                  </button>
                </>
              )}
            </div>

            {/* Snapshot gallery */}
            <SnapshotGallery snapshots={snapshots} onDismiss={dismissSnapshot} />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-64 space-y-4">
            {/* Feed Selector (drone mode) */}
            {feedSource === 'drone' && (
              <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Camera Feeds</span>
                </div>
                <div className="space-y-2">
                  {DRONE_FEEDS.map((feed, i) => (
                    <button
                      key={feed.id}
                      onClick={() => setSelectedFeed(i)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all border ${
                        selectedFeed === i
                          ? 'bg-green-500/15 border-green-500/30 text-green-400'
                          : 'border-gray-700/40 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${feed.status === 'live' ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
                        <span className="font-medium">{feed.name}</span>
                      </div>
                      <div className="text-gray-600 mt-0.5 pl-3.5">{feed.zone}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Laptop camera info */}
            {feedSource === 'laptop' && (
              <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Laptop Camera</span>
                </div>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>Connect your laptop's built-in webcam or an external USB camera to get a live feed.</p>
                  <p>Take snapshots and save them directly to your cloud gallery.</p>
                  <p className="text-gray-600">Vision filters (Thermal, Night, NDVI) apply in real-time to the camera feed.</p>
                </div>
              </div>
            )}

            <TorchPanel />

            {/* AI Features */}
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-4">
              <div className="text-sm font-medium text-white mb-3">AI Features</div>
              <div className="space-y-2">
                {[
                  { label: 'Image Stabilization', active: true },
                  { label: 'Object Tracking', active: true },
                  { label: 'Motion Detection', active: false },
                  { label: 'Auto Exposure', active: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{item.label}</span>
                    <div className={`w-7 h-4 rounded-full transition-colors ${item.active ? 'bg-green-500' : 'bg-gray-700'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white m-0.5 transition-transform ${item.active ? 'translate-x-3' : 'translate-x-0'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TorchPanel() {
  const [on, setOn] = useState(false);
  const [brightness, setBrightness] = useState(80);
  const [sos, setSos] = useState(false);

  return (
    <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-4 h-4 ${on ? 'text-yellow-400' : 'text-gray-600'} transition-colors`}>
          <Sun className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-white">Torch Control</span>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => { setOn(!on); if (sos) setSos(false); }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
            on ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'border-gray-700 text-gray-500 hover:text-gray-300'
          }`}
        >
          {on ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => { setSos(!sos); if (!sos) setOn(true); }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
            sos ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'border-gray-700 text-gray-500 hover:text-gray-300'
          }`}
        >
          SOS
        </button>
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Brightness</span>
          <span>{brightness}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={100}
          value={brightness}
          onChange={e => setBrightness(+e.target.value)}
          disabled={!on}
          className="w-full accent-yellow-400 disabled:opacity-40"
        />
      </div>
    </div>
  );
}
