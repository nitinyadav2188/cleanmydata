import React, { useState } from 'react';
import { Trash2, CopyMinus, Replace, AlertTriangle, Type } from 'lucide-react';

interface ToolPanelProps {
  columns: string[];
  onDropMissing: () => void;
  onDropDuplicates: () => void;
  onFillMissing: (column: string, method: 'mean' | 'median' | 'mode' | 'constant', constantValue?: string) => void;
  onExport: () => void;
  onHandleAnomalies: (column: string, method: 'zscore' | 'iqr', action: 'drop' | 'cap') => void;
  onTextFormat: (column: string, action: 'trim' | 'lowercase' | 'uppercase' | 'remove_special') => void;
  onEncode?: (column: string, method: 'label' | 'onehot') => void;
  onScale?: (column: string, method: 'minmax' | 'standard') => void;
  onFeatureEngineering?: (type: 'polynomial' | 'interaction' | 'binning', col1: string, col2?: string, param?: number) => void;
  hasData: boolean;
}

export function ToolPanel({
  columns,
  onDropMissing,
  onDropDuplicates,
  onFillMissing,
  onExport,
  onHandleAnomalies,
  onTextFormat,
  onEncode,
  onScale,
  onFeatureEngineering,
  hasData
}: ToolPanelProps) {
  const [fillCol, setFillCol] = useState('');
  const [fillMethod, setFillMethod] = useState<'mean' | 'median' | 'mode' | 'constant'>('mean');
  const [fillConstant, setFillConstant] = useState('');

  const [encodeCol, setEncodeCol] = useState('');
  const [encodeMethod, setEncodeMethod] = useState<'label' | 'onehot'>('label');

  const [scaleCol, setScaleCol] = useState('');
  const [scaleMethod, setScaleMethod] = useState<'minmax' | 'standard'>('minmax');

  const [anomalyCol, setAnomalyCol] = useState('');
  const [anomalyMethod, setAnomalyMethod] = useState<'zscore' | 'iqr'>('zscore');

  const [textCol, setTextCol] = useState('');
  const [textAction, setTextAction] = useState<'trim' | 'lowercase' | 'uppercase' | 'remove_special'>('trim');

  if (!hasData) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 opacity-50 pointer-events-none">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Cleaning Tools</h2>
        <p className="text-sm text-gray-500">Upload data to enable tools.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-8">
        <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Cleaning Tools</h2>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      {/* Basic Cleaning */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Basic Cleaning</h3>
        <div className="flex gap-2">
          <button
            onClick={onDropMissing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Drop NA
          </button>
          <button
            onClick={onDropDuplicates}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
          >
            <CopyMinus size={16} />
            Drop Duplicates
          </button>
        </div>
      </div>

      {/* Fill Missing */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Replace size={16} />
          Fill Missing Values
        </h3>
        <div className="space-y-2">
          <select
            value={fillCol}
            onChange={(e) => setFillCol(e.target.value)}
            title="Select column to fill missing values"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select Column...</option>
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <select
              value={fillMethod}
              onChange={(e) => setFillMethod(e.target.value as any)}
              title="Select fill method"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="mean">Mean</option>
              <option value="median">Median</option>
              <option value="mode">Mode</option>
              <option value="constant">Constant</option>
            </select>
            {fillMethod === 'constant' && (
              <input
                type="text"
                value={fillConstant}
                onChange={(e) => setFillConstant(e.target.value)}
                placeholder="Value"
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            )}
            <button
              onClick={() => fillCol && onFillMissing(fillCol, fillMethod, fillConstant)}
              disabled={!fillCol}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Anomaly Detection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle size={16} />
          Anomaly Detection
        </h3>
        <div className="space-y-2">
          <select
            value={anomalyCol}
            onChange={(e) => setAnomalyCol(e.target.value)}
            title="Select column for anomaly detection"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select Numerical Column...</option>
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <select
              value={anomalyMethod}
              onChange={(e) => setAnomalyMethod(e.target.value as any)}
              title="Select anomaly detection method"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="zscore">Z-Score (&gt; 3)</option>
              <option value="iqr">IQR (1.5x)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => anomalyCol && onHandleAnomalies(anomalyCol, anomalyMethod, 'drop')}
              disabled={!anomalyCol}
              className="flex-1 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              Drop Anomalies
            </button>
            <button
              onClick={() => anomalyCol && onHandleAnomalies(anomalyCol, anomalyMethod, 'cap')}
              disabled={!anomalyCol}
              className="flex-1 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              Cap Anomalies
            </button>
          </div>
        </div>
      </div>

      {/* Text Formatting */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Type size={16} />
          Text Formatting
        </h3>
        <div className="space-y-2">
          <select
            value={textCol}
            onChange={(e) => setTextCol(e.target.value)}
            title="Select text column"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select Text Column...</option>
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <select
              value={textAction}
              onChange={(e) => setTextAction(e.target.value as any)}
              title="Select text formatting action"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="trim">Trim Whitespace</option>
              <option value="lowercase">Convert to Lowercase</option>
              <option value="uppercase">Convert to Uppercase</option>
              <option value="remove_special">Remove Special Characters</option>
            </select>
            <button
              onClick={() => textCol && onTextFormat(textCol, textAction)}
              disabled={!textCol}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
