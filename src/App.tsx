import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Database, RotateCcw, BarChart3, BrainCircuit, Wrench, X, Eraser, CopyMinus, Activity, FileJson, FileText, Sparkles, MessageSquare, LineChart, LayoutDashboard, Mail, Phone, MapPin, Scissors, Type, Hash, Github, Linkedin } from 'lucide-react';
import { DataViewer } from './components/DataViewer';
import { ToolPanel } from './components/ToolPanel';
import { Chatbot } from './components/Chatbot';
import { Visualization } from './components/Visualization';
import { Modeling } from './components/Modeling';
import { HeroCarousel } from './components/HeroCarousel';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type ModificationState = Record<string, { original: any; new: any; type: string }>;

export default function App() {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [modifications, setModifications] = useState<ModificationState>({});
  const [history, setHistory] = useState<{ data: Record<string, any>[]; columns: string[]; modifications: ModificationState }[]>([]);
  const [activeTab, setActiveTab] = useState<'data' | 'visualize' | 'modeling'>('data');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'converter' | null>(null);
  const [showConfirmHome, setShowConfirmHome] = useState(false);
  const [converterType, setConverterType] = useState<'csv-json' | 'excel-csv' | 'json-csv' | 'xml-json'>('csv-json');
  const [pendingAction, setPendingAction] = useState<{ tab: 'data' | 'visualize' | 'modeling' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const landingTools = [
    {
      category: 'Data Cleaning Tools',
      description: 'Clean, format, and standardize your datasets instantly. Handle missing values, remove duplicates, and detect outliers with our free online data cleaner.',
      items: [
        { name: 'Missing Value Handler', icon: Eraser, action: 'upload', tab: 'data' },
        { name: 'Duplicate Remover', icon: CopyMinus, action: 'upload', tab: 'data' },
        { name: 'Data Formatter', icon: Type, action: 'upload', tab: 'data' },
        { name: 'Outlier Detector', icon: Activity, action: 'upload', tab: 'data' },
      ]
    },
    {
      category: 'Data Analysis & EDA',
      description: 'Generate instant exploratory data analysis (EDA) reports. Visualize distributions, find correlations, and summarize data without writing code.',
      items: [
        { name: 'Auto EDA Dashboard', icon: BarChart3, action: 'upload', tab: 'visualize' },
        { name: 'CSV to Charts', icon: LineChart, action: 'upload', tab: 'visualize' },
        { name: 'Correlation Finder', icon: Hash, action: 'upload', tab: 'visualize' },
      ]
    },
    {
      category: 'Free File Converters',
      description: 'Fast, secure, and free online file converters. Convert CSV to JSON, Excel to CSV, and more directly in your browser.',
      items: [
        { name: 'CSV to JSON Converter', icon: FileJson, action: 'convert', type: 'csv-json' },
        { name: 'Excel to CSV Converter', icon: FileSpreadsheet, action: 'convert', type: 'excel-csv' },
        { name: 'JSON to CSV Converter', icon: FileText, action: 'convert', type: 'json-csv' },
      ]
    }
  ];

  const handleToolClick = (tool: any) => {
    if (tool.action === 'upload') {
      setPendingAction({ tab: tool.tab });
      fileInputRef.current?.click();
    } else if (tool.action === 'convert') {
      setConverterType(tool.type);
      setActiveModal('converter');
    }
  };

  const handleGoHome = () => {
    if (data.length > 0) {
      setShowConfirmHome(true);
    } else {
      confirmGoHome();
    }
  };

  const confirmGoHome = () => {
    setData([]);
    setColumns([]);
    setHistory([]);
    setModifications({});
    setActiveTab('data');
    setShowConfirmHome(false);
  };

  const saveHistory = () => {
    setHistory(prev => [...prev, { data: [...data], columns: [...columns], modifications: { ...modifications } }]);
  };

  const undo = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setData(lastState.data);
      setColumns(lastState.columns);
      setModifications(lastState.modifications);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setData(results.data as Record<string, any>[]);
          setColumns(results.meta.fields || []);
          setModifications({});
          setHistory([]);
          setActiveTab(pendingAction?.tab || 'data');
          setPendingAction(null);
          setIsProcessing(false);
        },
        error: () => {
          setIsProcessing(false);
        }
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const json = XLSX.utils.sheet_to_json(ws);
          if (json.length > 0) {
            setData(json as Record<string, any>[]);
            setColumns(Object.keys(json[0] as object));
            setModifications({});
            setHistory([]);
            setActiveTab(pendingAction?.tab || 'data');
            setPendingAction(null);
          }
        } catch (error) {
          console.error("Error parsing Excel file", error);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setIsProcessing(false);
      };
      reader.readAsBinaryString(file);
    } else {
      alert('Unsupported file format. Please upload CSV or Excel.');
      setPendingAction(null);
      setIsProcessing(false);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDropMissing = () => {
    saveHistory();
    const newData = data.filter(row => {
      return columns.every(col => row[col] !== null && row[col] !== undefined && row[col] !== '');
    });
    setData(newData);
  };

  const handleDropDuplicates = () => {
    saveHistory();
    const seen = new Set();
    const newData = data.filter(row => {
      const str = JSON.stringify(row);
      if (seen.has(str)) return false;
      seen.add(str);
      return true;
    });
    setData(newData);
  };

  const handleFillMissing = (column: string, method: 'mean' | 'median' | 'mode' | 'constant', constantValue?: string) => {
    saveHistory();
    let fillValue: any = null;
    const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined && v !== '');

    if (method === 'constant') {
      fillValue = isNaN(Number(constantValue)) ? constantValue : Number(constantValue);
    } else if (values.length > 0) {
      if (method === 'mean') {
        const sum = values.reduce((a, b) => Number(a) + Number(b), 0);
        fillValue = sum / values.length;
      } else if (method === 'median') {
        const sorted = [...values].map(Number).sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        fillValue = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      } else if (method === 'mode') {
        const counts: Record<string, number> = {};
        let maxCount = 0;
        values.forEach(v => {
          counts[v] = (counts[v] || 0) + 1;
          if (counts[v] > maxCount) {
            maxCount = counts[v];
            fillValue = v;
          }
        });
      }
    }

    if (fillValue !== null) {
      const newMods = { ...modifications };
      const newData = data.map((row, i) => {
        if (row[column] === null || row[column] === undefined || row[column] === '') {
          newMods[`${i}-${column}`] = { original: 'NaN', new: fillValue, type: 'filled' };
          return { ...row, [column]: fillValue };
        }
        return row;
      });
      setModifications(newMods);
      setData(newData);
    }
  };

  const handleEncode = (column: string, method: 'label' | 'onehot') => {
    saveHistory();
    if (method === 'label') {
      const uniqueValues = Array.from(new Set(data.map(row => String(row[column])))).sort();
      const mapping = Object.fromEntries(uniqueValues.map((v, i) => [v, i]));
      const newData = data.map(row => ({
        ...row,
        [column]: mapping[String(row[column])]
      }));
      setData(newData);
    } else if (method === 'onehot') {
      const uniqueValues = Array.from(new Set(data.map(row => String(row[column])))).filter(v => v !== 'null' && v !== 'undefined' && v !== '');
      const newCols = uniqueValues.map(v => `${column}_${v}`);
      
      const newData = data.map(row => {
        const newRow = { ...row };
        const val = String(row[column]);
        uniqueValues.forEach(uv => {
          newRow[`${column}_${uv}`] = val === uv ? 1 : 0;
        });
        delete newRow[column];
        return newRow;
      });
      
      const updatedColumns = [...columns.filter(c => c !== column), ...newCols];
      setColumns(updatedColumns);
      setData(newData);
    }
  };

  const handleScale = (column: string, method: 'minmax' | 'standard') => {
    saveHistory();
    const values = data.map(row => Number(row[column])).filter(v => !isNaN(v));
    if (values.length === 0) return;

    if (method === 'minmax') {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      if (range === 0) return;
      
      const newData = data.map(row => {
        const val = Number(row[column]);
        return {
          ...row,
          [column]: isNaN(val) ? row[column] : (val - min) / range
        };
      });
      setData(newData);
    } else if (method === 'standard') {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      if (stdDev === 0) return;

      const newData = data.map(row => {
        const val = Number(row[column]);
        return {
          ...row,
          [column]: isNaN(val) ? row[column] : (val - mean) / stdDev
        };
      });
      setData(newData);
    }
  };

  const handleAnomalies = (column: string, method: 'zscore' | 'iqr', action: 'drop' | 'cap') => {
    saveHistory();
    const values = data.map(row => Number(row[column])).filter(v => !isNaN(v));
    if (values.length === 0) return;

    let isAnomaly: (v: number) => boolean;
    let capValue: (v: number) => number;

    if (method === 'zscore') {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
      isAnomaly = (v) => Math.abs((v - mean) / std) > 3;
      capValue = (v) => {
        const z = (v - mean) / std;
        if (z > 3) return mean + 3 * std;
        if (z < -3) return mean - 3 * std;
        return v;
      };
    } else {
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      isAnomaly = (v) => v < lowerBound || v > upperBound;
      capValue = (v) => {
        if (v < lowerBound) return lowerBound;
        if (v > upperBound) return upperBound;
        return v;
      };
    }

    if (action === 'drop') {
      const newData = data.filter(row => {
        const val = Number(row[column]);
        if (isNaN(val)) return true;
        return !isAnomaly(val);
      });
      setData(newData);
    } else if (action === 'cap') {
      const newMods = { ...modifications };
      const newData = data.map((row, i) => {
        const val = Number(row[column]);
        if (isNaN(val)) return row;
        if (isAnomaly(val)) {
          const capped = capValue(val);
          newMods[`${i}-${column}`] = { original: val, new: Number(capped.toFixed(4)), type: 'capped' };
          return { ...row, [column]: capped };
        }
        return row;
      });
      setModifications(newMods);
      setData(newData);
    }
  };

  const handleFeatureEngineering = (type: 'polynomial' | 'interaction' | 'binning', col1: string, col2?: string, param?: number) => {
    saveHistory();
    
    if (type === 'polynomial') {
      const degree = param || 2;
      const newColName = `${col1}_poly${degree}`;
      const newData = data.map(row => {
        const val = Number(row[col1]);
        return {
          ...row,
          [newColName]: isNaN(val) ? null : Math.pow(val, degree)
        };
      });
      setColumns([...columns, newColName]);
      setData(newData);
    } else if (type === 'interaction' && col2) {
      const newColName = `${col1}_x_${col2}`;
      const newData = data.map(row => {
        const val1 = Number(row[col1]);
        const val2 = Number(row[col2]);
        return {
          ...row,
          [newColName]: (isNaN(val1) || isNaN(val2)) ? null : val1 * val2
        };
      });
      setColumns([...columns, newColName]);
      setData(newData);
    } else if (type === 'binning') {
      const bins = param || 5;
      const values = data.map(row => Number(row[col1])).filter(v => !isNaN(v));
      if (values.length === 0) return;
      
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binWidth = (max - min) / bins;
      const newColName = `${col1}_binned`;
      
      const newData = data.map(row => {
        const val = Number(row[col1]);
        if (isNaN(val)) return { ...row, [newColName]: null };
        
        const binIndex = Math.min(Math.floor((val - min) / binWidth), bins - 1);
        const binStart = (min + binIndex * binWidth).toFixed(2);
        const binEnd = (min + (binIndex + 1) * binWidth).toFixed(2);
        
        return {
          ...row,
          [newColName]: `${binStart} - ${binEnd}`
        };
      });
      setColumns([...columns, newColName]);
      setData(newData);
    }
  };

  const handleTextFormat = (column: string, action: 'trim' | 'lowercase' | 'uppercase' | 'remove_special') => {
    saveHistory();
    const newMods = { ...modifications };
    const newData = data.map((row, i) => {
      const val = row[column];
      if (typeof val !== 'string') return row;

      let newVal = val;
      if (action === 'trim') newVal = val.trim();
      else if (action === 'lowercase') newVal = val.toLowerCase();
      else if (action === 'uppercase') newVal = val.toUpperCase();
      else if (action === 'remove_special') newVal = val.replace(/[^a-zA-Z0-9 ]/g, '');

      if (newVal !== val) {
        newMods[`${i}-${column}`] = { original: val, new: newVal, type: 'formatted' };
        return { ...row, [column]: newVal };
      }
      return row;
    });
    setModifications(newMods);
    setData(newData);
  };

  const handleExport = () => {
    if (data.length === 0) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'cleaned_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={handleGoHome}
          >
            <div className="bg-indigo-600 px-2 py-1 rounded-lg text-white shadow-sm group-hover:bg-indigo-700 transition-colors font-black tracking-tighter text-xl leading-none">
              CMD
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-700 transition-colors hidden sm:block">cleanmydata</h1>
          </div>
          <div className="flex items-center gap-4">
            {history.length > 0 && (
              <button
                onClick={undo}
                aria-label="Undo last action"
                title="Undo last action"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
                Undo
              </button>
            )}
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              className="hidden"
              title="Upload dataset file"
              aria-label="Upload dataset file"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload dataset"
              title="Upload dataset"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              <Upload size={18} />
              Upload Dataset
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-700">
            <HeroCarousel />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white text-lg font-medium rounded-2xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 mb-16"
            >
              <Upload size={24} />
              Upload Dataset to Workspace
            </button>

            <div className="w-full max-w-6xl text-left space-y-12">
              {landingTools.map((section, idx) => (
                <div key={idx} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{section.category}</h3>
                    <p className="text-slate-500">{section.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {section.items.map((tool, tIdx) => (
                      <button
                        key={tIdx}
                        onClick={() => handleToolClick(tool)}
                        className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left group"
                      >
                        <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <tool.icon size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{tool.name}</h4>
                          <span className="text-xs text-slate-500 mt-1 block">
                            {tool.action === 'upload' ? 'Requires dataset' : 'Standalone tool'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 inline-flex">
              <button
                onClick={() => setActiveTab('data')}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  activeTab === 'data' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Wrench size={18} />
                Data Preparation
              </button>
              <button
                onClick={() => setActiveTab('visualize')}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  activeTab === 'visualize' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <BarChart3 size={18} />
                EDA & Visualizations
              </button>
              <button
                onClick={() => setActiveTab('modeling')}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  activeTab === 'modeling' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <BrainCircuit size={18} />
                Model Training
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'data' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="lg:col-span-1">
                  <ToolPanel
                    columns={columns}
                    onDropMissing={handleDropMissing}
                    onDropDuplicates={handleDropDuplicates}
                    onFillMissing={handleFillMissing}
                    onExport={handleExport}
                    onHandleAnomalies={handleAnomalies}
                    onTextFormat={handleTextFormat}
                    onEncode={handleEncode}
                    onScale={handleScale}
                    onFeatureEngineering={handleFeatureEngineering}
                    hasData={data.length > 0}
                  />
                </div>
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">Dataset Preview</h2>
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      {data.length} rows × {columns.length} columns
                    </span>
                  </div>
                  <DataViewer data={data} columns={columns} modifications={modifications} />
                </div>
              </div>
            )}

            {activeTab === 'visualize' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Visualization data={data} columns={columns} />
              </div>
            )}

            {activeTab === 'modeling' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Modeling data={data} columns={columns} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-slate-800 mt-auto text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-500 px-2 py-1 rounded-lg text-white font-black tracking-tighter text-lg leading-none">
                  CMD
                </div>
                <span className="text-white font-bold tracking-tight text-lg">cleanmydata</span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                The professional platform for data scientists and ML students to clean, visualize, engineer features, and train models directly in the browser. 100% free and secure.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => { if(data.length > 0) setActiveTab('data'); else handleGoHome(); }} className="hover:text-indigo-400 transition-colors">Data Workspace</button></li>
                <li><button onClick={() => { if(data.length > 0) setActiveTab('visualize'); else handleGoHome(); }} className="hover:text-indigo-400 transition-colors">Auto EDA Dashboard</button></li>
                <li><button onClick={() => { if(data.length > 0) setActiveTab('modeling'); else handleGoHome(); }} className="hover:text-indigo-400 transition-colors">ML Model Training</button></li>
                <li><button onClick={() => { if(data.length > 0) setActiveTab('data'); else handleGoHome(); }} className="hover:text-indigo-400 transition-colors">AI Data Assistant</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Free Tools</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => handleToolClick({action: 'convert', type: 'csv-json'})} className="hover:text-indigo-400 transition-colors">CSV to JSON Converter</button></li>
                <li><button onClick={() => handleToolClick({action: 'convert', type: 'excel-csv'})} className="hover:text-indigo-400 transition-colors">Excel to CSV Converter</button></li>
                <li><button onClick={() => handleToolClick({action: 'upload', tab: 'data'})} className="hover:text-indigo-400 transition-colors">Duplicate Remover</button></li>
                <li><button onClick={() => handleToolClick({action: 'upload', tab: 'data'})} className="hover:text-indigo-400 transition-colors">Text Formatter</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => setActiveModal('privacy')} className="hover:text-indigo-400 transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => setActiveModal('terms')} className="hover:text-indigo-400 transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div>&copy; {new Date().getFullYear()} cleanmydata. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="https://github.com/nitinyadav2188" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                <Github size={18} />
                <span>GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/nitin-yadav-681850299" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                <Linkedin size={18} />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showConfirmHome && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2">Return to Home?</h3>
              <p className="text-slate-600 mb-6">Are you sure you want to leave? All your unsaved progress, cleaned data, and models will be lost.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowConfirmHome(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button onClick={confirmGoHome} className="px-4 py-2 bg-rose-600 text-white font-medium hover:bg-rose-700 rounded-lg transition-colors">Yes, leave</button>
              </div>
            </motion.div>
          </div>
        )}

        {activeModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">
                  {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
                <button onClick={() => setActiveModal(null)} aria-label="Close modal" title="Close modal" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto text-slate-600 prose prose-sm max-w-none">
                {activeModal === 'privacy' ? (
                  <>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">1. Data Collection</h4>
                    <p className="mb-4">cleanmydata processes your data entirely in your browser. We do not store, collect, or transmit your datasets to any external servers unless explicitly required for a specific AI feature (like the chatbot), which only receives the prompts you send.</p>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">2. Usage Analytics</h4>
                    <p className="mb-4">We may collect anonymized usage data to improve the platform's performance and user experience.</p>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">3. Third-Party Services</h4>
                    <p className="mb-4">We use Google Gemini API for the chatbot functionality. By using the chatbot, you agree to their respective privacy policies.</p>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">1. Acceptance of Terms</h4>
                    <p className="mb-4">By accessing and using cleanmydata, you accept and agree to be bound by the terms and provision of this agreement.</p>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">2. Use License</h4>
                    <p className="mb-4">Permission is granted to temporarily use the cleanmydata platform for personal, non-commercial transitory viewing and processing only.</p>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">3. Disclaimer</h4>
                    <p className="mb-4">The materials on cleanmydata's website are provided on an 'as is' basis. cleanmydata makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                  </>
                )}
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button onClick={() => setActiveModal(null)} aria-label="Close modal" title="Close modal" className="px-6 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {activeModal === 'converter' && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <FileJson size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {converterType === 'csv-json' && 'CSV to JSON Converter'}
                    {converterType === 'excel-csv' && 'Excel to CSV Converter'}
                    {converterType === 'json-csv' && 'JSON to CSV Converter'}
                    {converterType === 'xml-json' && 'XML to JSON Converter'}
                  </h3>
                </div>
                <button onClick={() => setActiveModal(null)} aria-label="Close modal" title="Close modal" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <Upload size={32} className="mx-auto text-slate-400 group-hover:text-indigo-500 mb-4 transition-colors" />
                <p className="text-slate-600 font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-slate-400 text-sm">
                  {converterType === 'csv-json' && 'Upload .csv file'}
                  {converterType === 'excel-csv' && 'Upload .xlsx or .xls file'}
                  {converterType === 'json-csv' && 'Upload .json file'}
                  {converterType === 'xml-json' && 'Upload .xml file'}
                </p>
                <input 
                  type="file" 
                  className="hidden" 
                  id="converter-upload"
                  title="Upload file for conversion"
                  aria-label="Upload file for conversion"
                  accept={
                    converterType === 'csv-json' ? '.csv' : 
                    converterType === 'excel-csv' ? '.xlsx,.xls' : 
                    converterType === 'json-csv' ? '.json' : '.xml'
                  }
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    setIsProcessing(true);

                    const downloadFile = (content: string, filename: string, type: string) => {
                      const blob = new Blob([content], { type });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    };

                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      const content = evt.target?.result as string;
                      try {
                        if (converterType === 'csv-json') {
                          Papa.parse(file, {
                            header: true,
                            complete: (results) => {
                              downloadFile(JSON.stringify(results.data, null, 2), file.name.replace('.csv', '.json'), 'application/json');
                              setActiveModal(null);
                              setIsProcessing(false);
                            },
                            error: () => {
                              setIsProcessing(false);
                            }
                          });
                        } else if (converterType === 'excel-csv') {
                          const wb = XLSX.read(content, { type: 'binary' });
                          const wsname = wb.SheetNames[0];
                          const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wsname]);
                          downloadFile(csv, file.name.replace(/\.(xlsx|xls)$/, '.csv'), 'text/csv');
                          setActiveModal(null);
                          setIsProcessing(false);
                        } else if (converterType === 'json-csv') {
                          const json = JSON.parse(content);
                          const csv = Papa.unparse(json);
                          downloadFile(csv, file.name.replace('.json', '.csv'), 'text/csv');
                          setActiveModal(null);
                          setIsProcessing(false);
                        }
                      } catch (err) {
                        alert('Error converting file. Please check the format.');
                        setIsProcessing(false);
                      }
                    };
                    reader.onerror = () => {
                      setIsProcessing(false);
                    };

                    if (converterType === 'excel-csv') {
                      reader.readAsBinaryString(file);
                    } else {
                      reader.readAsText(file);
                    }
                  }}
                />
                <button 
                  onClick={() => document.getElementById('converter-upload')?.click()}
                  className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                  Select File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chatbot */}
      <Chatbot />

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Processing...</h3>
              <p className="text-slate-500 text-center">Please wait while we process your file.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
