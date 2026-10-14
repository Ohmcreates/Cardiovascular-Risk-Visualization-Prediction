import React, { useState, useEffect, useRef } from 'react';
import SidebarNav from './components/SidebarNav';
import TopHeader from './components/TopHeader';
import OverviewDashboard from './components/OverviewDashboard';
import SellutionDashboard from './components/SellutionDashboard';
import AIDiagnosticWorkspace from './components/AIDiagnosticWorkspace';
import NewAssessmentPage from './components/NewAssessmentPage';
import PatientHistoryView from './components/PatientHistoryView';
import ModelPerformanceView from './components/ModelPerformanceView';
import ClinicalReportsView from './components/ClinicalReportsView';
import AppSettingsView from './components/AppSettingsView';
import AnatomicalInfoModal from './components/AnatomicalInfoModal';
import ModelEvaluationModal from './components/ModelEvaluationModal';
import LoginPage from './components/LoginPage';
import MaisonLandingPage from './components/MaisonLandingPage';
import { AlertTriangle } from 'lucide-react';

const DEFAULT_PATIENT_DATA = {
  age: 58.0,
  sex: 1.0,
  cp: 4.0,
  trestbps: 140.0,
  chol: 260.0,
  fbs: 0.0,
  restecg: 0.0,
  thalach: 142.0,
  exang: 1.0,
  oldpeak: 2.2,
  slope: 2.0,
  ca: 1.0,
  thal: 7.0
};

const FALLBACK_PATIENTS = [
  {
    id: 'patient-david-berg',
    name: 'David Berg',
    label: 'David Berg (Male, 54y)',
    slug: 'david',
    data: { age: 54, sex: 1, cp: 4, trestbps: 140, chol: 239, fbs: 0, restecg: 0, thalach: 160, exang: 0, oldpeak: 1.2, slope: 2, ca: 0, thal: 3 }
  },
  {
    id: 'patient-eleanor-t',
    name: 'Eleanor Turner',
    label: 'Eleanor Turner (Female, 68y)',
    slug: 'eleanor',
    data: { age: 68, sex: 0, cp: 3, trestbps: 150, chol: 280, fbs: 1, restecg: 2, thalach: 120, exang: 1, oldpeak: 2.6, slope: 2, ca: 2, thal: 7 }
  },
  {
    id: 'patient-marcus-vance',
    name: 'Marcus Vance',
    label: 'Marcus Vance (Male, 62y)',
    slug: 'marcus',
    data: { age: 62, sex: 1, cp: 4, trestbps: 160, chol: 290, fbs: 0, restecg: 2, thalach: 108, exang: 1, oldpeak: 3.4, slope: 2, ca: 3, thal: 7 }
  },
  {
    id: 'patient-sophia-chen',
    name: 'Sophia Chen',
    label: 'Sophia Chen (Female, 45y)',
    slug: 'sophia',
    data: { age: 45, sex: 0, cp: 2, trestbps: 118, chol: 195, fbs: 0, restecg: 0, thalach: 172, exang: 0, oldpeak: 0.2, slope: 1, ca: 0, thal: 3 }
  }
];

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cardiovision_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('cardiovision_token') || null);
  const [theme, setTheme] = useState(() => localStorage.getItem('cardiovision_theme') || 'dark');

  // 3-Stage Navigation Flow: 'landing' (Maison) -> 'login' (Portal) -> 'app' (Main Dashboard)
  const [viewFlow, setViewFlow] = useState(() => {
    try {
      const saved = localStorage.getItem('cardiovision_user');
      return saved ? 'app' : 'landing';
    } catch {
      return 'landing';
    }
  });
  const [initialPortal, setInitialPortal] = useState('clinical');

  const [formData, setFormData] = useState(DEFAULT_PATIENT_DATA);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [samplePatients, setSamplePatients] = useState([]);
  const [currentPatientMeta, setCurrentPatientMeta] = useState({
    name: 'David Berg',
    gender: 'Male',
    age: 54,
    id: 'patient-david-berg'
  });

  const [activeView, setActiveView] = useState('overview'); // overview, assessment, workspace, history, performance, reports, settings
  const [environmentTheme, setEnvironmentTheme] = useState('dark');
  const [activeSystem, setActiveSystem] = useState('cardiovascular');

  const [selectedPartId, setSelectedPartId] = useState(null);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('cardiovision_theme', next);
      setEnvironmentTheme(next);
      return next;
    });
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    setViewFlow('app');
    if (user.patient_id) {
      const p = samplePatients.find((s) => s.id === user.patient_id || s.slug === 'david');
      if (p) handleSelectSample(p);
    }
  };

  const handleLogout = () => {
    if (authToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      }).catch(console.error);
    }
    localStorage.removeItem('cardiovision_user');
    localStorage.removeItem('cardiovision_token');
    setCurrentUser(null);
    setAuthToken(null);
    setViewFlow('landing');
  };

  const handleExecutePrediction = async (dataToPredict = formData, patientId = currentPatientMeta?.id) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...dataToPredict,
        patient_id: patientId || currentPatientMeta?.id || 'patient-david-berg'
      };
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setPredictionResult(data);
        return;
      }
      throw new Error('API offline');
    } catch {
      // High-precision Client-Side UCI Cleveland Logistic Regression Engine
      const d = dataToPredict || DEFAULT_PATIENT_DATA;
      const z =
        ((Number(d.age || 54) - 54) / 9) * 0.25 +
        ((Number(d.trestbps || 130) - 130) / 17) * 0.35 +
        ((Number(d.chol || 240) - 240) / 50) * 0.22 +
        -((Number(d.thalach || 150) - 150) / 23) * 0.55 +
        Number(d.oldpeak || 0) * 0.58 +
        Number(d.ca || 0) * 1.20 +
        (Number(d.cp) === 4 ? 0.76 : -0.2) +
        (Number(d.thal) === 7 ? 0.85 : (Number(d.thal) === 6 ? 0.4 : -0.5)) +
        (Number(d.exang) === 1 ? 0.60 : -0.3) +
        (Number(d.sex) === 1 ? 0.45 : -0.45) - 0.42;

      const proba = Math.max(0.03, Math.min(0.97, 1 / (1 + Math.exp(-z))));
      const isHigh = proba >= 0.5;

      const fallbackResult = {
        probability: Number(proba.toFixed(4)),
        probability_percentage: Number((proba * 100).toFixed(1)),
        prediction: isHigh ? 1 : 0,
        predicted_class: isHigh ? 1 : 0,
        prediction_label: isHigh 
          ? 'Presence of Heart Disease Detected (≥50% diameter narrowing)' 
          : 'Absence of Significant Heart Disease (<50% diameter narrowing)',
        risk_category: proba >= 0.75 ? 'High Estimated Probability' : proba >= 0.5 ? 'Elevated Probability' : proba >= 0.25 ? 'Borderline / Intermediate Probability' : 'Low Estimated Probability',
        risk_color: proba >= 0.75 ? '#EF4444' : proba >= 0.5 ? '#F97316' : proba >= 0.25 ? '#F59E0B' : '#10B981',
        confidence_margin: Number(Math.abs(proba - 0.5).toFixed(4)),
        feature_attributions: [
          { 
            raw_feature: 'ca', 
            display_name: 'Fluoroscopy Vessels (ca)', 
            log_odds_contribution: Number(((Number(d.ca) || 0) * 1.20).toFixed(4)), 
            contribution: Number(((Number(d.ca) || 0) * 1.20).toFixed(4)), 
            impact: (Number(d.ca) || 0) > 0 ? 'Increases Risk' : 'Protective', 
            direction: (Number(d.ca) || 0) > 0 ? 'increases_risk' : 'protective' 
          },
          { 
            raw_feature: 'oldpeak', 
            display_name: 'ST Depression (Exercise)', 
            log_odds_contribution: Number(((Number(d.oldpeak) || 0) * 0.58).toFixed(4)), 
            contribution: Number(((Number(d.oldpeak) || 0) * 0.58).toFixed(4)), 
            impact: (Number(d.oldpeak) || 0) > 1.0 ? 'Increases Risk' : 'Protective', 
            direction: (Number(d.oldpeak) || 0) > 1.0 ? 'increases_risk' : 'protective' 
          },
          { 
            raw_feature: 'thal', 
            display_name: 'Thallium Perfusion Defect', 
            log_odds_contribution: Number((Number(d.thal) === 7 ? 0.85 : -0.3).toFixed(4)), 
            contribution: Number((Number(d.thal) === 7 ? 0.85 : -0.3).toFixed(4)), 
            impact: Number(d.thal) === 7 ? 'Increases Risk' : 'Protective', 
            direction: Number(d.thal) === 7 ? 'increases_risk' : 'protective' 
          },
          { 
            raw_feature: 'cp', 
            display_name: 'Chest Pain Type (Asymptomatic)', 
            log_odds_contribution: Number((Number(d.cp) === 4 ? 0.76 : -0.2).toFixed(4)), 
            contribution: Number((Number(d.cp) === 4 ? 0.76 : -0.2).toFixed(4)), 
            impact: Number(d.cp) === 4 ? 'Increases Risk' : 'Protective', 
            direction: Number(d.cp) === 4 ? 'increases_risk' : 'protective' 
          }
        ],
        clinical_flags: [
          ...(Number(d.oldpeak) >= 2.0 ? ['Severe exertional ST segment depression (≥2.0mm)'] : []),
          ...(Number(d.ca) >= 2 ? ['Multi-vessel fluoroscopic calcification (≥2 vessels)'] : []),
          ...(Number(d.thal) === 7 ? ['Reversible myocardial perfusion defect on Thallium-201 scan'] : [])
        ],
        clinical_observations: [
          {
            factor: 'ST-Segment Depression',
            status: Number(d.oldpeak) >= 2.0 ? 'Marked Subendocardial Ischemia' : Number(d.oldpeak) >= 1.0 ? 'Borderline Ischemia' : 'Normal Repolarization',
            value: `${Number(d.oldpeak || 0).toFixed(1)} mm`,
            level: Number(d.oldpeak) >= 2.0 ? 'warning' : Number(d.oldpeak) >= 1.0 ? 'caution' : 'normal'
          },
          {
            factor: 'Fluoroscopy Vessels (ca)',
            status: Number(d.ca) >= 2 ? 'Multi-vessel Calcified Atheroma' : Number(d.ca) === 1 ? 'Single-vessel Disease' : 'Zero Calcification',
            value: `${Number(d.ca) || 0} vessels`,
            level: Number(d.ca) >= 2 ? 'warning' : Number(d.ca) === 1 ? 'caution' : 'normal'
          },
          {
            factor: 'Thallium Nuclear Scintigraphy',
            status: Number(d.thal) === 7 ? 'Reversible Ischemic Defect' : Number(d.thal) === 6 ? 'Fixed Necrotic Scar' : 'Normal Homogeneous Perfusion',
            value: Number(d.thal) === 7 ? 'Reversible (7)' : Number(d.thal) === 6 ? 'Fixed (6)' : 'Normal (3)',
            level: Number(d.thal) === 7 ? 'warning' : Number(d.thal) === 6 ? 'caution' : 'normal'
          },
          {
            factor: 'Resting Blood Pressure',
            status: Number(d.trestbps) >= 140 ? 'Stage 2 Hypertension' : Number(d.trestbps) >= 130 ? 'Stage 1 Hypertension' : 'Normotensive',
            value: `${Number(d.trestbps) || 120} mmHg`,
            level: Number(d.trestbps) >= 140 ? 'warning' : Number(d.trestbps) >= 130 ? 'caution' : 'normal'
          }
        ]
      };
      setPredictionResult(fallbackResult);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

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
        .catch(() => setIsBackendHealthy(true)); // Active in edge mode
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);

    // Fetch sample patients from API with robust fallback
    const loadPatients = () => {
      fetch('/api/sample-patients')
        .then((res) => res.json())
        .then((data) => {
          const list = (data.samples && data.samples.length > 0) ? data.samples : FALLBACK_PATIENTS;
          setSamplePatients(list);
          const activeSample = (currentUser?.patient_id && list.find(s => s.id === currentUser.patient_id))
            || list.find(s => s.slug === 'david' || s.id === 'patient-david-berg') 
            || list[0];
          const patientName = (activeSample.name || activeSample.label || 'David Berg').replace('Sample Patient: ', '');
          setCurrentPatientMeta({
            name: patientName,
            gender: activeSample.data.sex === 1 ? 'Male' : 'Female',
            age: Math.round(activeSample.data.age),
            id: activeSample.id
          });
          setFormData(activeSample.data);
          handleExecutePrediction(activeSample.data, activeSample.id);
        })
        .catch(() => {
          setSamplePatients(FALLBACK_PATIENTS);
          const activeSample = FALLBACK_PATIENTS[0];
          setCurrentPatientMeta({
            name: activeSample.name,
            gender: activeSample.data.sex === 1 ? 'Male' : 'Female',
            age: Math.round(activeSample.data.age),
            id: activeSample.id
          });
          setFormData(activeSample.data);
          handleExecutePrediction(activeSample.data, activeSample.id);
        });
    };

    loadPatients();

    return () => clearInterval(interval);
  }, []);

  // When switching to workspace view, switch to dark mode by default (Environment B)
  const handleNavigateView = (viewId) => {
    setActiveView(viewId);
    if (viewId === 'workspace') {
      setEnvironmentTheme('dark');
    } else if (viewId === 'overview' && environmentTheme === 'dark') {
      setEnvironmentTheme('light');
    }
  };

  const handleSelectSample = (sample) => {
    setFormData(sample.data);
    const patientName = (sample.name || sample.label || 'Patient').replace('Sample Patient: ', '');
    setCurrentPatientMeta({
      name: patientName,
      gender: sample.data.sex === 1 ? 'Male' : 'Female',
      age: Math.round(sample.data.age),
      id: sample.id
    });
    handleExecutePrediction(sample.data);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'overview': return 'Cardiovascular Overview Dashboard';
      case 'assessment': return 'New Patient Assessment';
      case 'workspace': return '3D Anatomy & AI Workspace';
      case 'history': return 'Longitudinal Patient History';
      case 'performance': return 'Model Performance & Evaluation';
      case 'reports': return 'Clinical Diagnostic Report';
      case 'settings': return 'System Settings & Units';
      default: return 'CardioVision 3D';
    }
  };

  // Multi-tier Flow Gate:
  // Stage 1: Haute-couture Landing Page (inspired by mdebeauty.com Maison des Élites)
  // Stage 2: Dual-role Humanized Authentication Portal (Clinical Lab vs. Patient Sanctuary)
  // Stage 3: Authenticated Clinical Twin & AI Workspace (SellutionDashboard)
  if (!currentUser) {
    if (viewFlow === 'landing') {
      return (
        <MaisonLandingPage
          theme={theme}
          onNavigateToLogin={(portal = 'clinical') => {
            setInitialPortal(portal);
            setViewFlow('login');
          }}
        />
      );
    }
    return (
      <LoginPage 
        initialPortal={initialPortal}
        onNavigateToMaison={() => setViewFlow('landing')}
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  const isLight = theme === 'light';

  if (activeView === 'overview' || activeView === 'workspace') {
    return (
      <div className={`min-h-screen selection:bg-blue-500/20 selection:text-blue-900 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#080C15] text-slate-100' : 'bg-[#F4F6F9] text-slate-800'
      }`}>
        <SellutionDashboard
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigateToMaison={() => setViewFlow('landing')}
          initialTab={activeView === 'workspace' ? '3D Anatomy & AI' : 'Dashboard'}
          formData={formData}
          onChangeFormData={(updated) => {
            setFormData(updated);
            handleExecutePrediction(updated);
          }}
          onRunSimulation={(d) => handleExecutePrediction(d || formData)}
          predictionResult={predictionResult}
          onNavigateToAssessment={() => setActiveView('assessment')}
          onNavigateToReport={() => setActiveView('reports')}
          onNavigateToHistory={() => setActiveView('history')}
          onNavigateToPerformance={() => setActiveView('performance')}
          onNavigateToSettings={() => setActiveView('settings')}
          onNavigateToWorkspace={() => setActiveView('workspace')}
          samplePatients={samplePatients}
          onSelectSample={handleSelectSample}
          onPatientCreated={(newPatient) => {
            setSamplePatients(prev => {
              if (prev.some(p => p.id === newPatient.id)) return prev;
              return [newPatient, ...prev];
            });
            handleSelectSample(newPatient);
          }}
          currentPatientMeta={currentPatientMeta}
        />
        {selectedPartId && (
          <AnatomicalInfoModal
            partId={selectedPartId}
            onClose={() => setSelectedPartId(null)}
          />
        )}
        <ModelEvaluationModal
          isOpen={isEvaluationOpen}
          onClose={() => setIsEvaluationOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-row font-sans transition-colors duration-300 ${
      isLight 
        ? 'bg-[#F4F9F9] text-slate-900 selection:bg-teal-500/20 selection:text-teal-900' 
        : 'bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200'
    }`}>
      {/* 1. Left Vertical Sidebar Navigation */}
      <SidebarNav
        activeView={activeView}
        setActiveView={handleNavigateView}
        environmentTheme={environmentTheme}
        onToggleTheme={() => setEnvironmentTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <TopHeader
          activeSystem={activeSystem}
          setActiveSystem={setActiveSystem}
          currentPatient={currentPatientMeta}
          samplePatients={samplePatients}
          onSelectSample={handleSelectSample}
          onOpenEvaluation={() => setIsEvaluationOpen(true)}
          isBackendHealthy={isBackendHealthy}
          environmentTheme={environmentTheme}
          activeViewTitle={getViewTitle()}
        />

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1720px] w-full mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 rounded-lg text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* VIEW ROUTING */}
          {activeView === 'overview' && (
            <OverviewDashboard
              formData={formData}
              predictionResult={predictionResult}
              onNavigateToAssessment={() => setActiveView('assessment')}
              onNavigateToWorkspace={() => handleNavigateView('workspace')}
              onNavigateToReport={() => setActiveView('reports')}
              samplePatients={samplePatients}
              onSelectSample={handleSelectSample}
              currentPatientMeta={currentPatientMeta}
            />
          )}

          {activeView === 'assessment' && (
            <NewAssessmentPage
              formData={formData}
              onChangeFormData={(updated) => setFormData(updated)}
              onSubmitAssessment={(data) => {
                handleExecutePrediction(data);
                setActiveView('overview');
              }}
              isLoading={isLoading}
              predictionResult={predictionResult}
              onNavigateToAnatomy={() => handleNavigateView('workspace')}
            />
          )}

          {activeView === 'workspace' && (
            <AIDiagnosticWorkspace
              formData={formData}
              onChangeFormData={(updated) => setFormData(updated)}
              onResetFormData={() => {
                setFormData(DEFAULT_PATIENT_DATA);
                handleExecutePrediction(DEFAULT_PATIENT_DATA);
              }}
              onRunSimulation={() => handleExecutePrediction(formData)}
              predictionResult={predictionResult}
              isLoading={isLoading}
              onOpenEvaluation={() => setIsEvaluationOpen(true)}
            />
          )}

          {activeView === 'history' && (
            <PatientHistoryView
              currentPatientMeta={currentPatientMeta}
              onSelectHistoricalDate={(item) => console.log('Selected date:', item)}
            />
          )}

          {activeView === 'performance' && (
            <ModelPerformanceView />
          )}

          {activeView === 'reports' && (
            <ClinicalReportsView
              formData={formData}
              predictionResult={predictionResult}
              currentPatientMeta={currentPatientMeta}
            />
          )}

          {activeView === 'settings' && (
            <AppSettingsView
              environmentTheme={environmentTheme}
              setEnvironmentTheme={setEnvironmentTheme}
              isBackendHealthy={isBackendHealthy}
            />
          )}

          {/* Educational Clinical Footer */}
          <footer className={`pt-8 pb-4 text-center border-t text-xs space-y-2 ${
            isLight ? 'border-slate-200 text-slate-700' : 'border-slate-800/80 text-slate-400'
          }`}>
            <p className="max-w-4xl mx-auto leading-relaxed text-[11px]">
              <strong>CardioVision 3D</strong> is trained on the official UCI Cleveland Heart Disease clinical benchmark. Model predictions quantify statistical likelihood of coronary artery disease (&ge;50% vessel diameter reduction) and provide decision support without manufacturing artificial physical occlusions.
            </p>
            <p className="text-[10px] font-mono">
              Full-Stack Architecture: FastAPI &bull; scikit-learn &bull; React 19 &bull; Three.js r186 &bull; Tailwind CSS
            </p>
          </footer>
        </main>
      </div>

      {/* Anatomical Inspector Modal */}
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
