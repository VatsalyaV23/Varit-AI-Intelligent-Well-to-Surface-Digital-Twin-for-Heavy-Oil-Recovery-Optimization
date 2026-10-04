import React from 'react';
import { NavLink } from 'react-router-dom';
import { useWell } from '../context/WellContext';
import { 
  Flame, 
  Activity, 
  Cpu, 
  Settings, 
  Sliders, 
  BarChart3, 
  Radio, 
  Layers,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { selectedWellId, setSelectedWellId, wells, liveTick, demoMode, theme, toggleTheme } = useWell();

  const navItems = [
    { to: '/', label: 'Main Dashboard', icon: Activity },
    { to: '/digital-twin', label: 'Digital Twin', icon: Layers },
    { to: '/css-optimization', label: 'CSS Optimization', icon: Flame },
    { to: '/srp-optimization', label: 'SRP Optimization', icon: Settings },
    { to: '/integrated-optimization', label: 'Joint AI Optimizer', icon: Cpu },
    { to: '/what-if-simulator', label: 'What-If Simulator', icon: Sliders },
    { to: '/analytics', label: 'Historical Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b131e]/90 dark:bg-[#0b131e]/90 light:bg-white/85 backdrop-blur-xl border-b border-slate-800 dark:border-slate-800 light:border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                  Varit AI
                </span>
                {demoMode && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    DEMO DATA
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium">
                Well-to-Surface Digital Twin • Baghewala Field
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-400 dark:text-cyan-400 light:text-cyan-600 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                        : 'text-slate-300 dark:text-slate-300 light:text-slate-600 hover:text-cyan-400 hover:bg-slate-800/50 dark:hover:bg-slate-800/60 light:hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Bar: Theme Toggle + Well Selector + Live Status */}
          <div className="flex items-center space-x-3 shrink-0">
            
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 rounded-lg bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-100 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-cyan-400 transition-all cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Live Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                {liveTick ? `LIVE (${liveTick.tick_count})` : 'STREAM'}
              </span>
            </div>

            {/* Well Selector Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-900 dark:bg-slate-900 light:bg-white px-3 py-1.5 rounded-lg border border-slate-700 dark:border-slate-700 light:border-slate-300">
              <label htmlFor="well-select" className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium">
                Well:
              </label>
              <select
                id="well-select"
                value={selectedWellId}
                onChange={(e) => setSelectedWellId(e.target.value)}
                className="bg-transparent text-xs font-bold text-cyan-400 dark:text-cyan-400 light:text-cyan-600 focus:outline-none cursor-pointer"
              >
                {wells.length > 0 ? (
                  wells.map((w) => (
                    <option key={w.id} value={w.id} className="bg-slate-900 text-slate-100 dark:bg-slate-900 dark:text-slate-100 light:bg-white light:text-slate-900">
                      {w.name} ({w.id})
                    </option>
                  ))
                ) : (
                  <option value="BGW-01">BGW-01</option>
                )}
              </select>
            </div>

          </div>

        </div>

        {/* Mobile / Tablet Navigation Sub-Bar */}
        <div className="xl:hidden flex overflow-x-auto py-2 space-x-2 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                    isActive ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 dark:text-slate-400 light:text-slate-600'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

      </div>
    </header>
  );
};
