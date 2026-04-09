import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Rectangle } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface VisualizationProps {
  data: Record<string, any>[];
  columns: string[];
}

export function Visualization({ data, columns }: VisualizationProps) {
  const [selectedCol, setSelectedCol] = useState<string>(columns[0] || '');

  const chartData = useMemo(() => {
    if (!selectedCol || data.length === 0) return [];

    const values = data.map(row => row[selectedCol]).filter(v => v !== null && v !== undefined && v !== '');
    if (values.length === 0) return [];

    // Determine if numerical or categorical
    const isNumerical = values.every(v => !isNaN(Number(v)));

    if (isNumerical) {
      // Histogram logic (binning)
      const numValues = values.map(Number);
      const min = Math.min(...numValues);
      const max = Math.max(...numValues);
      const binCount = Math.min(20, new Set(numValues).size); // Max 20 bins
      
      if (binCount <= 1) {
        return [{ name: String(min), count: numValues.length }];
      }

      const binWidth = (max - min) / binCount;
      const bins = Array.from({ length: binCount }, (_, i) => ({
        min: min + i * binWidth,
        max: min + (i + 1) * binWidth,
        count: 0
      }));

      numValues.forEach(v => {
        const binIndex = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
        if (bins[binIndex]) bins[binIndex].count++;
      });

      return bins.map(b => ({
        name: `${b.min.toFixed(2)} - ${b.max.toFixed(2)}`,
        count: b.count
      }));
    } else {
      // Categorical logic (frequencies)
      const counts: Record<string, number> = {};
      values.forEach(v => {
        const strVal = String(v);
        counts[strVal] = (counts[strVal] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 categories
    }
  }, [data, selectedCol]);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500">
        <p>No data available for visualization.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 size={20} className="text-indigo-600" />
          Data Distribution
        </h2>
        <select
          value={selectedCol}
          onChange={(e) => setSelectedCol(e.target.value)}
          title="Select data column to visualize"
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
        >
          {columns.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="h-[400px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
                interval={0}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
              />
              <Bar 
                dataKey="count" 
                fill="#6366f1" 
                radius={[6, 6, 0, 0]}
                activeBar={<Rectangle fill="#4f46e5" stroke="#4338ca" strokeWidth={1} />}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No valid data to display for this column.
          </div>
        )}
      </div>
    </div>
  );
}
