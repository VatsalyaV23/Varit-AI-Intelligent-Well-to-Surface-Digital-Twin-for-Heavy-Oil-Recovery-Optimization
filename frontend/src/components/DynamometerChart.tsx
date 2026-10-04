import React from 'react';
import { useWell } from '../context/WellContext';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface DynamometerChartProps {
  currentCard: { position_m: number; load_kn: number; stroke_phase: string }[];
  optimizedCard?: { position_m: number; load_kn: number; stroke_phase: string }[];
}

export const DynamometerChart: React.FC<DynamometerChartProps> = ({
  currentCard,
  optimizedCard,
}) => {
  const { theme } = useWell();

  const tooltipBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  const tooltipText = theme === 'dark' ? '#f8fafc' : '#0f172a';
  const gridStroke = theme === 'dark' ? '#334155' : '#cbd5e1';
  const axisColor = theme === 'dark' ? '#94a3b8' : '#475569';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} opacity={0.5} />
          <XAxis
            type="number"
            dataKey="position_m"
            name="Polished Rod Position"
            unit=" m"
            stroke={axisColor}
            fontSize={11}
            domain={[0, 'dataMax + 0.2']}
          />
          <YAxis
            type="number"
            dataKey="load_kn"
            name="Polished Rod Load"
            unit=" kN"
            stroke={axisColor}
            fontSize={11}
            domain={[0, 'dataMax + 20']}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: tooltipBg,
              borderColor: '#38547c',
              borderRadius: '8px',
              fontSize: '12px',
              color: tooltipText,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          
          <Scatter
            name="Current Dynamometer Card"
            data={currentCard}
            fill="#d97706"
            line={{ stroke: '#d97706', strokeWidth: 2 }}
          />

          {optimizedCard && (
            <Scatter
              name="Optimized Dynamometer Card"
              data={optimizedCard}
              fill="#0284c7"
              line={{ stroke: '#0284c7', strokeWidth: 2, strokeDasharray: '4 4' }}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
