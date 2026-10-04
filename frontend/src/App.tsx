import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WellProvider } from './context/WellContext';
import { Sidebar } from './components/Sidebar';

import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { CssOptimizationPage } from './pages/CssOptimizationPage';
import { SrpOptimizationPage } from './pages/SrpOptimizationPage';
import { IntegratedOptimizationPage } from './pages/IntegratedOptimizationPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export const App: React.FC = () => {
  return (
    <WellProvider>
      <Router>
        <div className="min-h-screen bg-white dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
          
          {/* Vertical Sidebar */}
          <Sidebar />

          {/* Main Content Area next to Sidebar */}
          <div className="lg:pl-64 xl:pl-72 flex-1 flex flex-col min-w-0 bg-white dark:bg-[#030712]">
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/digital-twin" element={<DigitalTwinPage />} />
                <Route path="/css-optimization" element={<CssOptimizationPage />} />
                <Route path="/srp-optimization" element={<SrpOptimizationPage />} />
                <Route path="/integrated-optimization" element={<IntegratedOptimizationPage />} />
                <Route path="/what-if-simulator" element={<WhatIfSimulatorPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Routes>
            </main>
            
            <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-8 bg-slate-50 dark:bg-[#030712]">
              Varit AI — Well-to-Surface Digital Twin Platform for Heavy-Oil Operations • Baghewala Field
            </footer>
          </div>

        </div>
      </Router>
    </WellProvider>
  );
};

export default App;
