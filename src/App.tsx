import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AuthPage from './pages/AuthPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CameraPage from './pages/CameraPage';
import DroneControl from './pages/DroneControl';
import AIMonitor from './pages/AIMonitor';
import Gallery from './pages/Gallery';
import Analytics from './pages/Analytics';
import Sustainability from './pages/Sustainability';
import SettingsPage from './pages/Settings';

function AppShell() {
  const { user, currentPage, sidebarOpen, theme } = useApp();

  if (!user) return <AuthPage />;

  const pageMap: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    camera: <CameraPage />,
    'drone-control': <DroneControl />,
    'ai-monitor': <AIMonitor />,
    gallery: <Gallery />,
    analytics: <Analytics />,
    sustainability: <Sustainability />,
    settings: <SettingsPage />,
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Sidebar />
      <div
        className="transition-all duration-300 flex flex-col min-h-screen"
        style={{ marginLeft: sidebarOpen ? 256 : 64 }}
      >
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {pageMap[currentPage] ?? <Dashboard />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
