import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeartCanvas, { ANATOMICAL_PARTS } from './components/HeartCanvas';
import PatientForm from './components/PatientForm';
import PredictionResultCard from './components/PredictionResultCard';
import RiskFactorsBreakdown from './components/RiskFactorsBreakdown';
import AnatomicalInfoModal from './components/AnatomicalInfoModal';
import ModelEvaluationModal from './components/ModelEvaluationModal';
import { Heart, Activity, AlertTriangle, Info, Sparkles, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

function App() {
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [samplePatients, setSamplePatients] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);
  const heartRef = useRef(null);

  // Poll backend health and fetch sample patients on initial mount
  useEffect(() => {
    const checkHealth = () => {
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'healthy' && data.model_loaded) {
            setIsBackendHealthy(true);
          }
        })
        .catch(() => setIsBackendHealthy(false));
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);

    // Fetch sample patients
    fetch('/api/sample-patients')
      .then((res) => res.json())
      .then((data) => {
        if (data.samples) {
          setSamplePatients(data.samples);
          // Auto-run first sample patient on launch for immediate demonstration
          if (data.samples.length > 0) {
            handleFormSubmit(data.samples[0].data);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load sample patients:', err);
      });

    return () => clearInterval(interval);
  }, []);

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Inference request failed');
      }

      const data = await response.json();
      setPredictionResult(data);
    } catch (err) {
      console.error('Prediction failed:', err);
      setError(err.message || 'An error occurred while connecting to the inference engine.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample) => {
    // Optional focus on corresponding anatomical area
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        onOpenEvaluation={() => setIsEvaluationOpen(true)}
        isBackendHealthy={isBackendHealthy}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error notification banner */}
        {error && (
          <div className="p-4 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-rose-300 text-sm flex items-center justify-between shadow-lg animate-shake">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="px-3 py-1 bg-rose-900/40 hover:bg-rose-900/70 rounded-lg text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Grid: 3D Visualization + Patient Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: 3D Heart Visualizer & Quick Anatomy Explorer (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Interactive 3D Cardiovascular Model
              </h2>
              <span className="text-xs text-slate-400">
                Drag to orbit &bull; Scroll to zoom &bull; Click to inspect
              </span>
            </div>

            {/* 3D Canvas Box */}
            <div className="h-[460px] w-full">
              <HeartCanvas
                ref={heartRef}
                predictionData={predictionResult}
                selectedPartId={selectedPartId}
                onSelectPart={(partId) => setSelectedPartId(partId)}
              />
            </div>

            {/* Anatomical Structure Quick Select Chips */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                Anatomy:
              </span>
              {Object.values(ANATOMICAL_PARTS).map((part) => (
                <button
                  key={part.id}
                  onClick={() => {
                    setSelectedPartId(part.id);
                    if (heartRef.current) heartRef.current.focusPart(part.id);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg transition font-medium border ${
                    selectedPartId === part.id
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {part.name.split(' (')[0]}
                </button>
              ))}
            </div>

            {/* Prediction Result Gauge Card */}
            <PredictionResultCard
              result={predictionResult}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Patient Input Form (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <PatientForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              samplePatients={samplePatients}
              onSelectSample={handleSelectSample}
            />
          </div>
        </div>

        {/* Bottom Section: Risk Factors & Model Feature Attributions */}
        {predictionResult && (
          <section className="pt-2">
            <RiskFactorsBreakdown result={predictionResult} />
          </section>
        )}

        {/* Educational Clinical Footer Banner */}
        <footer className="pt-8 pb-4 text-center border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
          <p className="max-w-3xl mx-auto leading-relaxed">
            <strong>CardioVision 3D</strong> is built using the official UCI Machine Learning Repository Heart Disease Dataset (Cleveland Clinic Foundation). Model outputs reflect statistical correlation with angiographic diagnostic status ($\ge 50\%$ vessel narrowing) within this historical cohort and must not be used for direct clinical treatment or diagnosis without qualified medical evaluation.
          </p>
          <p className="text-[11px] text-slate-400">
            Machine Learning Pipeline: scikit-learn &bull; Backend: FastAPI &bull; Frontend: React 19 + Three.js &bull; Styling: Tailwind CSS
          </p>
        </footer>
      </main>

      {/* Anatomical Detail Modal */}
      {selectedPartId && (
        <AnatomicalInfoModal
          partId={selectedPartId}
          onClose={() => setSelectedPartId(null)}
        />
      )}

      {/* Model Empirical Evaluation Modal */}
      <ModelEvaluationModal
        isOpen={isEvaluationOpen}
        onClose={() => setIsEvaluationOpen(false)}
      />
    </div>
  );
}

export default App;
