import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CleanTimelineMap } from './components/CleanTimelineMap';
import { SectorClustersAnalysis } from './components/SectorClustersAnalysis';
import NewsPage from './pages/NewsPage';
import FuturesPage from './pages/FuturesPage';
import WorkspacePage from './pages/WorkspacePage';
import SimulatorPage from './pages/SimulatorPage';
import ScalpingVisualizerPage from './pages/ScalpingVisualizerPage';
import CScalpTerminalPage from './pages/CScalpTerminalPage';
import TerminalAnatomyPage from './pages/TerminalAnatomyPage';
import FuturesScreenerPage from './pages/FuturesScreenerPage';
import SpecificationsPage from './pages/SpecificationsPage';
import { Clock, TrendingUp, Newspaper, BarChart3, Monitor, Zap, Activity, Terminal, Layers, Search, FileText } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Trading Timeline', icon: Clock },
    { path: '/clusters', label: 'Sector Clusters', icon: TrendingUp },
    { path: '/futures', label: 'Futures', icon: BarChart3 },
    { path: '/futures-screener', label: 'Futures Screener', icon: Search },
    { path: '/specs', label: 'Характеристики', icon: FileText },
    { path: '/workspace', label: 'Workspace', icon: Monitor },
    { path: '/simulator', label: 'Simulator', icon: Zap },
    { path: '/visualizer', label: 'Terminal Visualizer', icon: Activity },
    { path: '/cscalp', label: 'CScalp Terminal', icon: Terminal },
    { path: '/anatomy', label: 'Terminal Anatomy', icon: Layers },
    { path: '/news', label: 'News & Events', icon: Newspaper }
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1800px] mx-auto px-8 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/moex-logo.svg" alt="MOEX" className="h-8" />
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              MOEX Analytics
            </span>
          </div>
          
          <div className="flex-1 flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="pt-20">
      <Routes>
        <Route path="/" element={<CleanTimelineMap />} />
        <Route path="/clusters" element={<SectorClustersAnalysis />} />
        <Route path="/futures" element={<FuturesPage />} />
        <Route path="/futures-screener" element={<FuturesScreenerPage />} />
        <Route path="/specs" element={<SpecificationsPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/visualizer" element={<ScalpingVisualizerPage />} />
        <Route path="/cscalp" element={<CScalpTerminalPage />} />
        <Route path="/anatomy" element={<TerminalAnatomyPage />} />
        <Route path="/news" element={<NewsPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white font-sans">
        <Navigation />
        <AppContent />
      </div>
    </Router>
  );
}

export default App;
