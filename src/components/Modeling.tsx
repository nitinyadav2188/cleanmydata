import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Play, CheckCircle2, Terminal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface ModelingProps {
  data: any[];
  columns: string[];
}

export function Modeling({ data, columns }: ModelingProps) {
  const [targetCol, setTargetCol] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [modelType, setModelType] = useState('random_forest');
  const [isTraining, setIsTraining] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleTrain = () => {
    setIsTraining(true);
    setResults(null);
    setLogs(['Initializing training environment...']);
    
    const trainingSteps = [
      `Loading dataset with ${data.length} rows and ${features.length + 1} columns...`,
      `Preprocessing data: handling missing values and encoding categorical variables...`,
      `Splitting data into train (80%) and test (20%) sets...`,
      `Initializing ${modelType.replace('_', ' ').toUpperCase()} model...`,
      `Training model on ${Math.floor(data.length * 0.8)} samples...`,
      `Optimizing hyperparameters...`,
      `Evaluating model on ${Math.ceil(data.length * 0.2)} test samples...`,
      `Generating performance metrics and feature importance...`,
      `Training complete!`
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < trainingSteps.length) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${trainingSteps[step]}`]);
        step++;
      } else {
        clearInterval(interval);
        setIsTraining(false);
        
        // Mock results
        const mockFeatureImportance = features.map(f => ({
          name: f.length > 10 ? f.substring(0, 10) + '...' : f,
          importance: Math.random() * 100
        })).sort((a, b) => b.importance - a.importance);

        const mockLossCurve = Array.from({ length: 20 }, (_, i) => ({
          epoch: i + 1,
          loss: Math.max(0.1, 1 - Math.log(i + 1) / 3 + (Math.random() * 0.1 - 0.05)),
          val_loss: Math.max(0.15, 1 - Math.log(i + 1) / 3.2 + (Math.random() * 0.15 - 0.05))
        }));

        setResults({
          accuracy: (Math.random() * 15 + 80).toFixed(2),
          f1Score: (Math.random() * 15 + 80).toFixed(2),
          precision: (Math.random() * 15 + 80).toFixed(2),
          recall: (Math.random() * 15 + 80).toFixed(2),
          featureImportance: mockFeatureImportance,
          lossCurve: mockLossCurve
        });
      }
    }, 600);
  };

  const toggleFeature = (col: string) => {
    if (features.includes(col)) {
      setFeatures(features.filter(f => f !== col));
    } else {
      setFeatures([...features, col]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <BrainCircuit size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Model Training</h2>
          <p className="text-sm text-slate-500">Train machine learning models directly in your browser</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Variable (y)</label>
            <select 
              value={targetCol} 
              onChange={(e) => setTargetCol(e.target.value)}
              title="Select target variable"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select target...</option>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Features (X)</label>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
              {columns.filter(c => c !== targetCol).map(col => (
                <label key={col} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={features.includes(col)}
                    onChange={() => toggleFeature(col)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700">{col}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Model Type</label>
            <select 
              value={modelType} 
              onChange={(e) => setModelType(e.target.value)}
              title="Select model type"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="random_forest">Random Forest Classifier</option>
              <option value="logistic_regression">Logistic Regression</option>
              <option value="decision_tree">Decision Tree</option>
              <option value="gradient_boosting">Gradient Boosting</option>
            </select>
          </div>

          <button
            onClick={handleTrain}
            disabled={!targetCol || features.length === 0 || isTraining}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isTraining ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Training Model...
              </>
            ) : (
              <>
                <Play size={18} />
                Train Model
              </>
            )}
          </button>
        </div>

        <div className="lg:col-span-2">
          {isTraining ? (
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 h-full flex flex-col font-mono text-sm text-green-400 shadow-inner">
              <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-800 pb-2">
                <Terminal size={16} />
                <span>Training Console</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="animate-in fade-in slide-in-from-bottom-2">{log}</div>
                ))}
                <div ref={logsEndRef} />
                <div className="flex items-center gap-2 mt-2">
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </div>
          ) : results ? (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 h-full overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="text-green-500" size={24} />
                <h3 className="text-lg font-semibold text-slate-800">Training Complete</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Accuracy</div>
                  <div className="text-3xl font-bold text-indigo-600">{results.accuracy}%</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">F1 Score</div>
                  <div className="text-3xl font-bold text-indigo-600">{results.f1Score}%</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Precision</div>
                  <div className="text-3xl font-bold text-indigo-600">{results.precision}%</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Recall</div>
                  <div className="text-3xl font-bold text-indigo-600">{results.recall}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">Feature Importance</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.featureImportance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} />
                        <Bar dataKey="importance" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">Training vs Validation Loss</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.lossCurve} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="epoch" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="loss" stroke="#4f46e5" strokeWidth={2} dot={false} name="Training Loss" />
                        <Line type="monotone" dataKey="val_loss" stroke="#f43f5e" strokeWidth={2} dot={false} name="Validation Loss" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 h-full flex flex-col items-center justify-center text-center text-slate-500">
              <BrainCircuit size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No Model Trained Yet</h3>
              <p className="max-w-md">Select a target variable and features, then click "Train Model" to see performance metrics and feature importance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
