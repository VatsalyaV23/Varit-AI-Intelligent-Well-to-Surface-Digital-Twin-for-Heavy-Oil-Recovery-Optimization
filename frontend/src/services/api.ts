import axios from 'axios';
import {
  Well,
  DashboardSummary,
  DigitalTwinState,
  CssOptimizationResult,
  SrpOptimizationResult,
  IntegratedOptimizationResult,
  WhatIfResult,
  AlertItem
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:8005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWells = async (): Promise<Well[]> => {
  const response = await api.get('/wells');
  return response.data;
};

export const getWellById = async (wellId: string): Promise<Well> => {
  const response = await api.get(`/wells/${wellId}`);
  return response.data;
};

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

export const getDigitalTwin = async (wellId: string): Promise<DigitalTwinState> => {
  const response = await api.get(`/wells/${wellId}/digital-twin`);
  return response.data;
};

export const optimizeCss = async (params: {
  well_id: string;
  steam_volume_m3: number;
  injection_pressure_bar: number;
  steam_temp_c: number;
  injection_days: number;
  soak_days: number;
  target_production_days: number;
  previous_cycle_production_m3: number;
  reservoir_temp_c: number;
}): Promise<CssOptimizationResult> => {
  const response = await api.post('/css/optimize', params);
  return response.data;
};

export const optimizeSrp = async (params: {
  well_id: string;
  stroke_length_m: number;
  spm: number;
  vfd_freq_hz: number;
  pump_depth_m: number;
  viscosity_cp: number;
  rod_load_kn: number;
  pump_fillage_pct: number;
}): Promise<SrpOptimizationResult> => {
  const response = await api.post('/srp/optimize', params);
  return response.data;
};

export const optimizeIntegrated = async (params: {
  well_id: string;
  max_steam_m3?: number;
  max_spm?: number;
  max_rod_load_kn?: number;
  min_pump_fillage_pct?: number;
  objective?: string;
}): Promise<IntegratedOptimizationResult> => {
  const response = await api.post('/integrated/optimize', params);
  return response.data;
};

export const runWhatIfSimulation = async (params: {
  well_id: string;
  steam_volume_m3: number;
  steam_pressure_bar: number;
  soak_days: number;
  stroke_length_m: number;
  spm: number;
  vfd_freq_hz: number;
  production_cutoff_days?: number;
}): Promise<WhatIfResult> => {
  const response = await api.post('/simulation/what-if', params);
  return response.data;
};

export const getAlerts = async (wellId?: string): Promise<AlertItem[]> => {
  const response = await api.get('/alerts', { params: { well_id: wellId } });
  return response.data;
};

export const getWellAnalytics = async (wellId: string) => {
  const response = await api.get(`/analytics/${wellId}`);
  return response.data;
};

export default api;
