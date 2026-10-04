import React, { createContext, useContext, useState, useEffect } from 'react';
import { Well, AlertItem, LiveTelemetryTick } from '../types';
import { getWells, getAlerts } from '../services/api';

export type Theme = 'dark' | 'light';

interface WellContextType {
  selectedWellId: string;
  setSelectedWellId: (id: string) => void;
  wells: Well[];
  currentWell: Well | null;
  alerts: AlertItem[];
  liveTick: LiveTelemetryTick | null;
  setLiveTick: React.Dispatch<React.SetStateAction<LiveTelemetryTick | null>>;
  loading: boolean;
  refreshWells: () => Promise<void>;
  demoMode: boolean;
  theme: Theme;
  toggleTheme: () => void;
}

const WellContext = createContext<WellContextType | undefined>(undefined);

export const WellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedWellId, setSelectedWellId] = useState<string>('BGW-01');
  const [wells, setWells] = useState<Well[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [liveTick, setLiveTick] = useState<LiveTelemetryTick | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<Theme>('dark');
  const demoMode = true;

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const refreshWells = async () => {
    try {
      setLoading(true);
      const data = await getWells();
      setWells(data);
      const alertData = await getAlerts();
      setAlerts(alertData);
    } catch (err) {
      console.error('Failed to fetch wells/alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWells();
  }, []);

  useEffect(() => {
    const wsUrl = `ws://127.0.0.1:8005/ws/live-stream/${selectedWellId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const tickData: LiveTelemetryTick = JSON.parse(event.data);
        setLiveTick(tickData);
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [selectedWellId]);

  const currentWell = wells.find((w) => w.id === selectedWellId) || wells[0] || null;

  return (
    <WellContext.Provider
      value={{
        selectedWellId,
        setSelectedWellId,
        wells,
        currentWell,
        alerts,
        liveTick,
        setLiveTick,
        loading,
        refreshWells,
        demoMode,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </WellContext.Provider>
  );
};

export const useWell = () => {
  const context = useContext(WellContext);
  if (!context) {
    throw new Error('useWell must be used within a WellProvider');
  }
  return context;
};
