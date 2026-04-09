import React, { useMemo } from 'react';
import { Type, Hash, Calendar, ToggleLeft, HelpCircle } from 'lucide-react';

interface DataViewerProps {
  data: Record<string, any>[];
  columns: string[];
  modifications?: Record<string, { original: any; new: any; type: string }>;
}

export function DataViewer({ data, columns, modifications = {} }: DataViewerProps) {
  const columnTypes = useMemo(() => {
    const types: Record<string, { label: string, icon: any }> = {};
    
    columns.forEach(col => {
      let type = 'unknown';
      for (let i = 0; i < Math.min(data.length, 100); i++) {
        const val = data[i][col];
        if (val !== null && val !== undefined && val !== '') {
          if (typeof val === 'number') {
            type = 'numeric';
            break;
          }
          if (typeof val === 'boolean') {
            type = 'boolean';
            break;
          }
          if (typeof val === 'string') {
            if (!isNaN(Date.parse(val)) && val.length > 8 && /^\d/.test(val)) {
              type = 'datetime';
            } else {
              type = 'categorical';
            }
            break;
          }
        }
      }
      
      switch(type) {
        case 'numeric': types[col] = { label: 'Numeric', icon: Hash }; break;
        case 'categorical': types[col] = { label: 'Categorical', icon: Type }; break;
        case 'boolean': types[col] = { label: 'Boolean', icon: ToggleLeft }; break;
        case 'datetime': types[col] = { label: 'Datetime', icon: Calendar }; break;
        default: types[col] = { label: 'Unknown', icon: HelpCircle }; break;
      }
    });
    return types;
  }, [data, columns]);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-500">
        <p>No data loaded yet.</p>
        <p className="text-sm">Upload a CSV or Excel file to get started.</p>
      </div>
    );
  }

  // Display only first 100 rows for performance
  const displayData = data.slice(0, 100);

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 rounded-xl shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
              #
            </th>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-left bg-gray-50 border-b border-gray-200 whitespace-nowrap"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{col}</span>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100/80 px-1.5 py-0.5 rounded w-max border border-gray-200">
                    {React.createElement(columnTypes[col].icon, { size: 10 })}
                    {columnTypes[col].label}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {displayData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-indigo-50/50 even:bg-slate-50/50 transition-colors">
              <td className="px-4 py-2 whitespace-nowrap text-gray-400 font-mono text-xs border-r border-gray-100">
                {rowIndex + 1}
              </td>
              {columns.map((col, colIndex) => {
                const val = row[col];
                const isNull = val === null || val === undefined || val === '';
                const modKey = `${rowIndex}-${col}`;
                const mod = modifications[modKey];
                
                return (
                  <td
                    key={colIndex}
                    className={`px-4 py-2 whitespace-nowrap relative group border-r border-gray-50 last:border-r-0 ${
                      isNull ? 'text-red-400 italic' : 'text-gray-700'
                    } ${mod ? 'bg-yellow-50/80 cursor-help font-medium text-yellow-900' : ''}`}
                  >
                    {isNull ? 'NaN' : String(val)}
                    
                    {mod && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                          <div className="font-semibold text-yellow-400 mb-1 capitalize">{mod.type}</div>
                          <div className="text-gray-300">Original: <span className="text-white line-through">{mod.original}</span></div>
                          <div className="text-gray-300">New Value: <span className="text-green-400">{mod.new}</span></div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 100 && (
        <div className="p-3 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
          Showing 100 of {data.length} rows
        </div>
      )}
    </div>
  );
}
