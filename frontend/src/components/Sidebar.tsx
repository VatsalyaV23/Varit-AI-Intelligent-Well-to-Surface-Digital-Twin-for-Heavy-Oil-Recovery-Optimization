import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useWell } from '../context/WellContext';
import {
  Flame,
  Activity,
  Cpu,
  Settings,
  Sliders,
  BarChart3,
  Layers,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { selectedWellId, setSelectedWellId, wells, liveTick, demoMode, theme, toggleTheme } = useWell();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const navItems = [
    { to: '/', label: 'Main Dashboard', icon: Activity },
    { to: '/digital-twin', label: 'Digital Twin', icon: Layers },
    { to: '/css-optimization', label: 'CSS Optimization', icon: Flame },
    { to: '/srp-optimization', label: 'SRP Optimization', icon: Settings },
    { to: '/integrated-optimization', label: 'Joint AI Optimizer', icon: Cpu },
    { to: '/what-if-simulator', label: 'What-If Simulator', icon: Sliders },
    { to: '/analytics', label: 'Historical Analytics', icon: BarChart3 },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4 space-y-6 bg-white dark:bg-[#080d1a] transition-colors">
      
      {/* Brand Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600">
                  Varit AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Well-to-Surface Digital Twin
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode & Live Status */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold">
              {liveTick ? `LIVE (${liveTick.tick_count})` : 'STREAMING'}
            </span>
          </div>
          {demoMode && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              DEMO DATA
            </span>
          )}
        </div>

        {/* Well Selector */}
        <div className="space-y-1.5">
          <label htmlFor="sidebar-well-select" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Target Field Well:
          </label>
          <div className="relative">
            <select
              id="sidebar-well-select"
              value={selectedWellId}
              onChange={(e) => setSelectedWellId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-cyan-400 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer appearance-none"
            >
              {wells.length > 0 ? (
                wells.map((w) => (
                  <option key={w.id} value={w.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                    {w.name} ({w.id})
                  </option>
                ))
              ) : (
                <option value="BGW-01">BGW-01</option>
              )}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">
            Navigation Modules
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Theme Switcher Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block px-1">
          Theme Display Mode:
        </span>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-cyan-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center space-x-2 text-xs font-bold">
            {theme === 'dark' ? (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Pure Dark Theme</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Pure White Theme</span>
              </>
            )}
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            TOGGLE
          </span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Mobile Top Header with Hamburger Toggle */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-[#030712]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
            <Flame className="w-5 h-5" />
          </div>
          <span className="font-black text-lg text-slate-900 dark:text-white">Varit AI</span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 xl:w-72 bg-white dark:bg-[#080d1a] border-r border-slate-200 dark:border-slate-800/80 z-30 transition-colors">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full bg-white dark:bg-[#080d1a] h-full shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
