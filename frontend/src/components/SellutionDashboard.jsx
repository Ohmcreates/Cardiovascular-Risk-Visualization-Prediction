import React, { useRef, useState, useEffect } from 'react';
import HeartCanvas, { ANATOMICAL_PARTS } from './HeartCanvas';
import RiskNetworkGraph from './RiskNetworkGraph';
import ForecastTimeline from './ForecastTimeline';
import RiskFactorsBreakdown from './RiskFactorsBreakdown';
import { 
  Heart, 
  Activity, 
  Search, 
  Plus, 
  Minus, 
  X, 
  Calendar, 
  Mail, 
  Bell, 
  ChevronDown, 
  ArrowUpRight, 
  RotateCw, 
  Maximize2, 
  MoreVertical, 
  Pill, 
  Phone, 
  MessageSquare, 
  Check, 
  ShieldCheck, 
  Settings, 
  FileText, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Zap,
  Sliders,
  TrendingUp,
  Droplets,
  Clock,
  AlertTriangle,
  Flame,
  Compass,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Layers,
  GitFork,
  Dna,
  Stethoscope,
  Eye,
  Info,
  Save,
  Download,
  Printer,
  RefreshCw,
  ExternalLink,
  Sun,
  Moon,
  LogOut,
  User,
  UserPlus,
  Users
} from 'lucide-react';

export default function SellutionDashboard({ 
  formData = {}, 
  onChangeFormData = () => {},
  onRunSimulation = () => {},
  predictionResult = null, 
  onNavigateToAssessment = () => {}, 
  onNavigateToReport = () => {},
  onNavigateToHistory = () => {},
  onNavigateToPerformance = () => {},
  onNavigateToSettings = () => {},
  onNavigateToWorkspace = () => {},
  samplePatients = [],
  onSelectSample = () => {},
  onPatientCreated = () => {},
  currentPatientMeta = {},
  initialTab = 'Dashboard',
  theme = 'light',
  onToggleTheme = () => {},
  currentUser = null,
  onLogout = () => {},
  onNavigateToMaison = null
}) {
  const isDark = theme === 'dark';
  const [showUserMenu, setShowUserMenu] = useState(false);
  const heartRef = useRef(null);
  const [activeTab, setActiveTab] = useState(initialTab || 'Dashboard'); // 'Dashboard', 'Vitals', '3D Anatomy & AI', 'Lab Results', 'Medication', 'Reports'
  const [activeCameraAngle, setActiveCameraAngle] = useState('anterior'); // 'anterior', 'lateral', 'posterior', 'superior'
  const [pathologyView, setPathologyView] = useState('diseased'); // 'diseased' | 'normal'
  const [selectedDay, setSelectedDay] = useState(5); // 5 Tue
  const [selectedPartId, setSelectedPartId] = useState('lv');
  const [centerMode, setCenterMode] = useState('3d'); // '3d' vs 'graph'

  // Production Database Integration State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [dbReports, setDbReports] = useState([]);
  const [dbMedications, setDbMedications] = useState([]);
  const [dbLabs, setDbLabs] = useState([]);
  const [dbVitalsHistory, setDbVitalsHistory] = useState([]);
  const [activeReportModal, setActiveReportModal] = useState(null);
  const [reportFilter, setReportFilter] = useState('All');
  const [isSavingVital, setIsSavingVital] = useState(false);
  const [newMedModal, setNewMedModal] = useState(false);
  const [newMedForm, setNewMedForm] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    time_of_day: '08:00 AM',
    indication: ''
  });

  const isPatient = currentUser?.role === 'patient';
  const isClinician = !isPatient;

  // New Patient Registration State
  const [newPatientModal, setNewPatientModal] = useState(false);
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: 58,
    sex: 1,
    email: '',
    phone: '',
    clinical_summary: 'Referred for comprehensive clinical cardiovascular assessment and 3D organ twin telemetry.',
    primary_condition: 'Exertional Angina & CAD Evaluation',
    trestbps: 138,
    chol: 248,
    cp: 2,
    thalach: 142,
    fbs: 0,
    restecg: 0,
    exang: 1,
    oldpeak: 1.8,
    slope: 2,
    ca: 1,
    thal: 7
  });

  // New Clinical Report Filing State
  const [newReportModal, setNewReportModal] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [newReportForm, setNewReportForm] = useState({
    title: '',
    report_type: 'Cardiology Consultation',
    physician_name: currentUser?.name || 'Dr. Sarah Scott, MD, FACC',
    department: 'Division of Cardiovascular Medicine',
    findings: 'Patient exhibits moderate exertional ischemic changes with apical hypoperfusion on stress analysis. Resting blood pressure stable, coronary CTA indicates localized atheroma stenosis.',
    impression: 'Stage 1-2 ischemic heart disease with preserved ejection fraction (55%). Hemodynamically stable at rest, exertional rate-pressure product indicates myocardial strain.',
    recommendations: '1. Initiate anti-ischemic medical therapy (Beta-blocker + Statin). 2. Low-sodium Mediterranean diet. 3. Repeat exercise stress test in 6 months.',
    status: 'Finalized'
  });

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3800);
  };

  const patientId = currentPatientMeta?.id || 'patient-david-berg';

  // Synchronize with persistent SQLite / PostgreSQL backend
  useEffect(() => {
    // 1. Fetch 12 diagnostic reports
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        if (data.reports) setDbReports(data.reports);
      })
      .catch(console.error);

    // 2. Fetch medications for active patient
    fetch(`/api/patients/${patientId}/medications`)
      .then(res => res.json())
      .then(data => {
        if (data.medications) setDbMedications(data.medications);
      })
      .catch(console.error);

    // 3. Fetch labs for active patient
    fetch(`/api/patients/${patientId}/labs`)
      .then(res => res.json())
      .then(data => {
        if (data.labs) setDbLabs(data.labs);
      })
      .catch(console.error);

    // 4. Fetch vitals history for active patient
    fetch(`/api/patients/${patientId}/vitals?limit=15`)
      .then(res => res.json())
      .then(data => {
        if (data.vitals) setDbVitalsHistory(data.vitals);
      })
      .catch(console.error);
  }, [patientId]);

  const handleSaveVitalsToDB = async () => {
    setIsSavingVital(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systolic_bp: Math.round(fd.trestbps ?? 140),
          diastolic_bp: Math.round(80 + ((fd.trestbps ?? 140) - 120) * 0.25),
          heart_rate: Math.round(fd.thalach ?? 142),
          cholesterol: Math.round(fd.chol ?? 260),
          st_depression: Number(Number(fd.oldpeak ?? 2.2).toFixed(1)),
          oxygen_saturation: 98.0,
          respiratory_rate: 16,
          notes: 'Ambulatory vital recorded via Clinical Difference Engine'
        })
      });
      if (res.ok) {
        showToast(`Vitals recorded to database for ${currentPatientMeta?.name || 'David Berg'}!`, 'success');
        fetch(`/api/patients/${patientId}/vitals?limit=15`)
          .then(r => r.json())
          .then(d => { if (d.vitals) setDbVitalsHistory(d.vitals); });
      } else {
        showToast('Failed to save vitals to database', 'error');
      }
    } catch (err) {
      showToast('Database connection error: ' + err.message, 'error');
    } finally {
      setIsSavingVital(false);
    }
  };

  const handleTakeMedication = async (medId) => {
    try {
      const res = await fetch(`/api/medications/${medId}/take`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json();
        setDbMedications(prev => prev.map(m => m.id === medId ? updated : m));
        showToast(`Dose taken! Adherence rate updated to ${updated.adherence_pct}% in database.`, 'success');
      }
    } catch (e) {
      showToast('Error recording medication dose', 'error');
    }
  };

  const handleCreateMedication = async (e) => {
    e.preventDefault();
    if (!newMedForm.name || !newMedForm.dosage) return;
    try {
      const res = await fetch(`/api/patients/${patientId}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedForm)
      });
      if (res.ok) {
        const newMed = await res.json();
        setDbMedications(prev => [...prev, newMed]);
        setNewMedModal(false);
        setNewMedForm({ name: '', dosage: '', frequency: 'Once daily', time_of_day: '08:00 AM', indication: '' });
        showToast(`Prescription '${newMed.name}' registered to database!`, 'success');
      }
    } catch (e) {
      showToast('Failed to save prescription', 'error');
    }
  };

  const handleCreatePatient = async (e) => {
    if (e) e.preventDefault();
    if (!newPatientForm.name.trim()) {
      showToast('Please enter patient full name', 'error');
      return;
    }
    setIsSubmittingPatient(true);
    try {
      const payload = {
        name: newPatientForm.name.trim(),
        age: parseInt(newPatientForm.age, 10),
        sex: parseInt(newPatientForm.sex, 10),
        email: newPatientForm.email.trim() || `${newPatientForm.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@healthsync.care`,
        phone: newPatientForm.phone.trim() || '+1 (555) 019-2834',
        clinical_summary: newPatientForm.clinical_summary,
        primary_condition: newPatientForm.primary_condition,
        cp: parseFloat(newPatientForm.cp),
        trestbps: parseFloat(newPatientForm.trestbps),
        chol: parseFloat(newPatientForm.chol),
        fbs: parseFloat(newPatientForm.fbs),
        restecg: parseFloat(newPatientForm.restecg),
        thalach: parseFloat(newPatientForm.thalach),
        exang: parseFloat(newPatientForm.exang),
        oldpeak: parseFloat(newPatientForm.oldpeak),
        slope: parseFloat(newPatientForm.slope),
        ca: parseFloat(newPatientForm.ca),
        thal: parseFloat(newPatientForm.thal)
      };

      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to register patient');
      }

      const created = await res.json();
      showToast(`Patient "${created.name}" registered in clinical registry!`, 'success');
      setNewPatientModal(false);

      // Reset form
      setNewPatientForm({
        name: '',
        age: 58,
        sex: 1,
        email: '',
        phone: '',
        clinical_summary: 'Referred for comprehensive clinical cardiovascular assessment and 3D organ twin telemetry.',
        primary_condition: 'Exertional Angina & CAD Evaluation',
        trestbps: 138,
        chol: 248,
        cp: 2,
        thalach: 142,
        fbs: 0,
        restecg: 0,
        exang: 1,
        oldpeak: 1.8,
        slope: 2,
        ca: 1,
        thal: 7
      });

      const sampleObj = {
        id: created.id,
        name: created.name,
        label: created.name,
        slug: created.slug || created.id,
        data: created.data || {
          age: created.age,
          sex: created.sex,
          cp: created.cp,
          trestbps: created.trestbps,
          chol: created.chol,
          fbs: created.fbs,
          restecg: created.restecg,
          thalach: created.thalach,
          exang: created.exang,
          oldpeak: created.oldpeak,
          slope: created.slope,
          ca: created.ca,
          thal: created.thal
        }
      };

      // Switch to this new patient
      if (onPatientCreated) {
        onPatientCreated(sampleObj);
      } else {
        onSelectSample(sampleObj);
      }
    } catch (err) {
      showToast(err.message || 'Error registering patient', 'error');
    } finally {
      setIsSubmittingPatient(false);
    }
  };

  const handleCreateReport = async (e) => {
    if (e) e.preventDefault();
    if (!newReportForm.title.trim()) {
      showToast('Please enter report title', 'error');
      return;
    }
    setIsSubmittingReport(true);
    try {
      const activePid = currentPatientMeta?.id || patientId;
      const res = await fetch(`/api/patients/${activePid}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newReportForm.title.trim(),
          report_type: newReportForm.report_type,
          physician_name: newReportForm.physician_name || currentUser?.name || 'Dr. Sarah Scott, MD, FACC',
          department: newReportForm.department || 'Division of Cardiovascular Medicine',
          findings: newReportForm.findings,
          impression: newReportForm.impression,
          recommendations: newReportForm.recommendations,
          status: newReportForm.status || 'Finalized'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to file report');
      }

      const createdReport = await res.json();
      setDbReports(prev => [createdReport, ...prev]);
      showToast(`Report "${createdReport.title}" filed into EHR!`, 'success');
      setNewReportModal(false);
      // Immediately open report dossier
      setActiveReportModal(createdReport);
    } catch (err) {
      showToast(err.message || 'Error filing report', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleExportDossierJSON = async () => {
    try {
      const res = await fetch(`/api/export/${patientId}`);
      if (res.ok) {
        const dossier = await res.json();
        const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cardiovision_dossier_${patientId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('EHR Medical Dossier exported successfully!', 'success');
      }
    } catch (e) {
      showToast('Export failed', 'error');
    }
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const getGreetingName = () => {
    if (!currentUser?.name) return 'David';
    const parts = currentUser.name.split(' ');
    if (parts[0] === 'Dr.' && parts.length > 1) {
      return `Dr. ${parts[1]}`;
    }
    return parts[0];
  };

  const getUserInitials = (name) => {
    if (!name) return 'DB';
    const clean = name.replace(/^Dr\.\s+/, '');
    const bits = clean.split(' ').filter(b => !['MD', 'FACC', 'FSCAI'].includes(b.replace(',', '')));
    return ((bits[0]?.[0] || '') + (bits[1]?.[0] || '')).toUpperCase();
  };

  const fd = formData || {};

  const prob = predictionResult?.probability ? Math.round(predictionResult.probability * 100) : 78;
  const isHighRisk = prob >= 65;
  const isModRisk = prob >= 35 && prob < 65;

  // Baseline Tracking for Clinical Difference Engine
  const [baselineData, setBaselineData] = useState(() => ({ ...formData }));
  const [baselineProb, setBaselineProb] = useState(() => prob);

  const lastPatientIdRef = useRef(currentPatientMeta?.id);
  useEffect(() => {
    if (currentPatientMeta?.id !== lastPatientIdRef.current) {
      lastPatientIdRef.current = currentPatientMeta?.id;
      setBaselineData({ ...formData });
      setBaselineProb(prob);
    }
  }, [currentPatientMeta?.id, formData, prob]);

  // Quantitative Deltas (Current Simulated vs Baseline)
  const deltaRisk = prob - baselineProb;
  const deltaBP = Math.round((fd.trestbps ?? 140) - (baselineData.trestbps ?? 140));
  const deltaChol = Math.round((fd.chol ?? 260) - (baselineData.chol ?? 260));
  const deltaHR = Math.round((fd.thalach ?? 142) - (baselineData.thalach ?? 142));
  const deltaST = Number(((fd.oldpeak ?? 2.2) - (baselineData.oldpeak ?? 2.2)).toFixed(1));

  const handleResetBaseline = () => {
    onChangeFormData({ ...baselineData });
    onRunSimulation(baselineData);
  };

  const handleApplyScenario = (scenario) => {
    let updated = { ...fd };
    if (scenario === 'bp') {
      updated.trestbps = 120;
    } else if (scenario === 'statin') {
      updated.chol = 175;
    } else if (scenario === 'omt') {
      updated.trestbps = 120;
      updated.chol = 175;
      updated.oldpeak = 0.5;
    }
    onChangeFormData(updated);
    onRunSimulation(updated);
  };

  const handleUpdateVital = (key, val) => {
    const updated = { ...fd, [key]: val };
    onChangeFormData(updated);
    onRunSimulation(updated);
  };

  // Disease-aware Cardiovascular Performance & Telemetry Score
  const isDiseasedMode = pathologyView === 'diseased';

  // In diseased state, performance is heavily compromised by ischemia (ST depression, LAD plaque, and risk probability)
  // When diseased: 28% to 42%; When normal: 92% to 98%
  const performancePct = isDiseasedMode
    ? Math.max(26, Math.min(46, Math.round(100 - (prob * 0.52 + (fd.oldpeak ?? 2.2) * 8 + (fd.ca ?? 1) * 7))))
    : Math.max(90, Math.min(99, Math.round(100 - (prob * 0.1))));

  const performanceLabel = isDiseasedMode
    ? performancePct < 35 
      ? 'Critical Ischemic Strain (LAD Stenosis)' 
      : 'Impaired Myocardial Perfusion & Hypokinesis'
    : 'Optimal Efficiency (Viable Perfusion)';

  const performanceGradient = isDiseasedMode
    ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500'
    : 'bg-gradient-to-r from-lime-400 to-emerald-500';

  const telemetryScore = isDiseasedMode
    ? Math.max(28, Math.min(42, Math.round(performancePct * 0.94)))
    : Math.max(88, Math.min(97, Math.round(performancePct * 0.96)));

  const daysOfWeek = [
    { day: 3, name: 'Sun' },
    { day: 4, name: 'Mon' },
    { day: 5, name: 'Tue' },
    { day: 6, name: 'Wed' },
    { day: 7, name: 'Thu' },
    { day: 8, name: 'Fri' },
    { day: 9, name: 'Sat' },
  ];

  // Equalizer bar heights for telemetry
  const barHeights = [45, 60, 35, 75, 90, 65, 80, 50, 70, 85, 95, 60, 75, 85, 50, 65, 80, 90, 70, 55, 60, 75, 45, 65];

  const getSubheading = () => {
    switch (activeTab) {
      case 'Patients': return `EHR Patient Registry & Directory • ${samplePatients?.length || 0} active cardiovascular cohorts under monitoring`;
      case 'Vitals': return 'Clinical Vitals & Interactive Physiological Difference Engine';
      case '3D Anatomy & AI': return 'Interactive 3D Anatomical Twin & AI Diagnostic Workspace';
      case 'Lab Results': return 'Laboratory Diagnostics & Myocardial Biomarkers';
      case 'Medication': return 'Daily Cardiovascular Regimen & Medication Adherence';
      case 'Reports': return 'Verified Clinical Diagnostic Dossiers & Consultation Archive';
      default: return isClinician 
        ? `Cardiology Decision Support • Active Case: ${currentPatientMeta?.name || 'David Berg'} • ${samplePatients?.length || 8} Enrolled Cohorts` 
        : `Your Personal 3D Heart Twin • Recovery Day 42 • Preserved Ejection Fraction`;
    }
  };

  return (
    <div className={`min-h-screen font-sans p-3 sm:p-5 lg:p-6 flex flex-col justify-between transition-colors duration-300 relative ${
      isDark ? 'bg-[#080C15] text-slate-100' : 'bg-[#F4F6F9] text-slate-800'
    }`}>
      {/* 1. TOP HEADER (Art-Directed Medical Workspace) */}
      <header className={`rounded-3xl p-3 sm:px-6 shadow-sm border flex items-center justify-between gap-4 mb-6 transition-colors ${
        isDark ? 'bg-[#111726] border-slate-800 shadow-blue-950/20' : 'bg-white border-slate-100'
      }`}>
        {/* Brand Logo: Sparkle Blue Icon + Sellution */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className={`font-extrabold text-lg tracking-tight flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Sellution <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">3D Cardio</span>
              {isClinician ? (
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-blue-400" />
                  Clinical Lab
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-emerald-400" />
                  Patient Portal
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Center Pill Tabs (Dashboard, Vitals, 3D Anatomy & AI, Lab Results, Medication, Reports 12) */}
        <nav className={`hidden md:flex items-center gap-1 p-1 rounded-2xl border transition-colors ${
          isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200/60'
        }`}>
          {[
            { id: 'Dashboard', label: 'Dashboard' },
            ...(isClinician ? [{ id: 'Patients', label: 'Patient Registry', badge: samplePatients.length ? String(samplePatients.length) : undefined }] : []),
            { id: 'Vitals', label: 'Vitals' },
            { id: '3D Anatomy & AI', label: '3D Anatomy & AI' },
            { id: 'Lab Results', label: 'Lab Results' },
            { id: 'Medication', label: 'Medication' },
            { id: 'Reports', label: 'Reports', badge: dbReports.length ? String(dbReports.length) : '12' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons: Add Patient, Theme Toggle, Mail, Notification Bell, User Profile Dropdown */}
        <div className="flex items-center gap-2.5">
          {/* Add Patient Button for Clinicians */}
          {isClinician && (
            <button
              onClick={() => setNewPatientModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
              title="Register New Patient into Clinical Database"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Patient</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Clinical Theme' : 'Switch to Dark Diagnostic AI Workspace'}
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition shadow-2xs ${
              isDark 
                ? 'bg-[#0B0F19] border-slate-800 text-amber-300 hover:bg-slate-800' 
                : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          <button
            onClick={handleExportDossierJSON}
            title="Export Medical Dossier (JSON)"
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition shadow-2xs ${
              isDark 
                ? 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' 
                : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4" />
          </button>

          <button className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition shadow-2xs relative ${
            isDark 
              ? 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' 
              : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}>
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* User Profile Chip with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-2xl border transition ${
                isDark 
                  ? 'border-slate-800 hover:bg-slate-800/60' 
                  : 'border-transparent hover:bg-slate-100'
              }`}
            >
              <div className="relative">
                <img
                  src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1594824813639-5094252a16d5?w=100&auto=format&fit=crop&q=80"}
                  alt={currentUser?.name || "David Berg"}
                  className="w-9 h-9 rounded-2xl object-cover ring-2 ring-blue-500/30"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  style={{ display: 'none' }}
                  className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white font-extrabold text-xs ring-2 ring-blue-500/30 shrink-0"
                >
                  {getUserInitials(currentUser?.name)}
                </div>
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentUser?.name || 'David Berg'}
                </span>
                <span className="text-[10px] text-blue-500 font-semibold">
                  {currentUser?.role ? currentUser.role.toUpperCase() : '@dave_b'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className={`absolute right-0 top-12 w-56 rounded-2xl border shadow-xl p-2 z-50 animate-fadeIn backdrop-blur-md ${
                isDark ? 'bg-[#111726]/95 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="px-3 py-2 border-b border-slate-200/50 dark:border-slate-800">
                  <span className="text-xs font-black block">{currentUser?.name || 'David Berg'}</span>
                  <span className="text-[10px] text-slate-400 block">{currentUser?.email || 'david.berg@healthsync.care'}</span>
                  <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">
                    {currentUser?.hospital_affiliation || 'Division of Cardiovascular Medicine'}
                  </span>
                </div>
                
                <button
                  onClick={() => { onToggleTheme(); setShowUserMenu(false); }}
                  className="w-full mt-1 px-3 py-2 text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
                    <span>Theme: {isDark ? 'Dark Mode' : 'Light Mode'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{isDark ? 'Dark' : 'Light'}</span>
                </button>

                {onNavigateToMaison && (
                  <button
                    onClick={() => { setShowUserMenu(false); onNavigateToMaison(); }}
                    className="w-full mt-1 px-3 py-2 text-left text-xs font-semibold text-[#C5A880] hover:bg-[#C5A880]/10 rounded-xl transition flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Maison Experience</span>
                    </span>
                    <span className="text-[10px] text-[#C5A880]/70 uppercase tracking-wider font-semibold">Editorial</span>
                  </button>
                )}

                <button
                  onClick={() => { setShowUserMenu(false); onLogout(); }}
                  className="w-full mt-1 px-3 py-2 text-left text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT: Left Floating Dock + Center Workspace */}
      <div className="flex-1 flex gap-5 items-start">
        {/* LEFT FLOATING VERTICAL DOCK */}
        <aside className={`w-14 rounded-3xl p-2 shadow-sm border flex flex-col items-center gap-3 shrink-0 py-4 transition-colors ${
          isDark ? 'bg-[#111726] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <button 
            onClick={() => setActiveTab('Dashboard')}
            title="Dashboard Overview"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
              activeTab === 'Dashboard' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          {isClinician && (
            <button 
              onClick={() => setActiveTab('Patients')}
              title="Clinical Patient Registry & Directory"
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition ${
                activeTab === 'Patients' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={() => setActiveTab('Vitals')}
            title="Cardiovascular Vitals & Difference"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition ${
              activeTab === 'Vitals' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setActiveTab('3D Anatomy & AI')}
            title="3D Anatomy & AI Workspace"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition ${
              activeTab === '3D Anatomy & AI' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          <button 
            onClick={onNavigateToAssessment}
            title="New Patient Assessment"
            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setActiveTab('Reports')}
            title="Medical Reports"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition ${
              activeTab === 'Reports' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
          </button>

          <button 
            onClick={onNavigateToHistory}
            title="Patient History & Appointments"
            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition"
          >
            <Calendar className="w-4 h-4" />
          </button>

          <button 
            onClick={onNavigateToPerformance}
            title="Model Performance & Evaluation"
            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          <button 
            onClick={onNavigateToSettings}
            title="Application Settings & Units"
            className="w-10 h-10 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="mt-auto pt-6">
            <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* CENTER & RIGHT WORKSPACE */}
        <div className="flex-1 flex flex-col space-y-5 min-w-0">
          {/* Greeting Heading */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Hey, {getGreetingName()}!
              </h1>
              <p className={`text-base font-medium -mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {getSubheading()}
              </p>
            </div>

            {/* Quick Case Switcher / Patient Indicator */}
            {isClinician ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Active Patient:</span>
                <select
                  value={currentPatientMeta?.id || ''}
                  onChange={(e) => {
                    const selected = samplePatients.find(p => p.id === e.target.value);
                    if (selected) onSelectSample(selected);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition focus:outline-blue-500 cursor-pointer ${
                    isDark 
                      ? 'bg-[#111726] border-slate-700 text-white hover:border-slate-600' 
                      : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {samplePatients?.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} &bull; {sp.gender || (sp.data?.sex === 1 ? 'Male' : 'Female')}, {Math.round(sp.age || sp.data?.age || 50)}y &bull; {sp.primary_condition || 'Cardiovascular Case'}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setNewPatientModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                  title="Add new patient into clinical EHR registry"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Register Patient</span>
                </button>
                <button
                  onClick={() => setActiveTab('Patients')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    isDark
                      ? 'bg-[#111726] text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                  title="View full clinical patient directory"
                >
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>Directory ({samplePatients.length})</span>
                </button>
              </div>
            ) : (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                isDark ? 'bg-blue-900/20 border-blue-800/80 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>Verified Personal Health Record &bull; MRN: {currentPatientMeta?.id || 'PT-2026'}</span>
              </div>
            )}
          </div>

          {/* TAB 1: MAIN DASHBOARD VIEW */}
          {activeTab === 'Dashboard' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* COLUMN 1: 3D Anatomical Hero Stage with Floating Pins (5 cols) */}
              <div className={`lg:col-span-5 rounded-3xl p-5 shadow-sm border relative overflow-hidden flex flex-col justify-between min-h-[580px] ${
                isDark ? 'bg-[#111726] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
              }`}>
                {/* Top Pathology Mode Selector Toggle Pill */}
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-1.5 rounded-2xl mb-2 z-20 gap-2 relative border ${
                  isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <div className="flex items-center gap-1.5 pl-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${pathologyView === 'diseased' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className={`text-[11px] font-extrabold tracking-tight ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Heart Morphology:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPathologyView('normal')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        pathologyView === 'normal'
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Normal Healthy
                    </button>
                    <button
                      onClick={() => setPathologyView('diseased')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        pathologyView === 'diseased'
                          ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/40 ring-1 ring-rose-500/50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white inline-block" />
                      Diseased (Black Area)
                    </button>
                  </div>
                </div>

                {/* Floating Pin Callout 1 (Top-Left): Dynamic based on Pathology */}
                <div className="absolute top-16 left-6 z-20 animate-fadeIn pointer-events-auto">
                  {pathologyView === 'diseased' ? (
                    <div className="bg-amber-500/95 text-slate-950 rounded-2xl p-3 shadow-lg shadow-amber-500/30 border border-amber-300 backdrop-blur-md flex flex-col max-w-[210px]">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-extrabold flex items-center gap-1 text-slate-950">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-900" />
                          LAD Plaque Blockage
                        </span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-400">
                          ca: {fd.ca ?? 1}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-900 leading-tight mt-1">
                        Calcified atheroma ring blocking LAD coronary blood flow
                      </span>
                    </div>
                  ) : (
                    <div className="bg-blue-600 text-white rounded-2xl p-3 shadow-lg shadow-blue-600/30 border border-blue-400/40 backdrop-blur-md flex flex-col max-w-[200px]">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-blue-100 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                          Patent LAD Artery
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-200" />
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-black tracking-tight">100% Lumen</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">
                          No Plaque
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="relative mt-2 ml-8">
                    <div className={`w-5 h-5 rounded-full shadow-md animate-ping absolute ${pathologyView === 'diseased' ? 'bg-amber-400 border-4 border-amber-600' : 'bg-white/90 border-4 border-blue-600'}`} />
                    <div className={`w-5 h-5 rounded-full shadow-md relative ${pathologyView === 'diseased' ? 'bg-amber-400 border-4 border-amber-600' : 'bg-white border-4 border-blue-600'}`} />
                  </div>
                </div>

                {/* Floating Pin Callout 2 (Bottom-Right): Dynamic based on Pathology */}
                <div className="absolute bottom-20 right-6 z-20 animate-fadeIn pointer-events-auto">
                  <div className="relative mb-2 ml-4">
                    <div className={`w-5 h-5 rounded-full shadow-md animate-ping absolute ${pathologyView === 'diseased' ? 'bg-rose-500 border-4 border-slate-900' : 'bg-emerald-400 border-4 border-emerald-600'}`} />
                    <div className={`w-5 h-5 rounded-full shadow-md relative ${pathologyView === 'diseased' ? 'bg-rose-600 border-4 border-slate-900' : 'bg-white border-4 border-emerald-600'}`} />
                  </div>
                  {pathologyView === 'diseased' ? (
                    <div className="bg-slate-950 text-white rounded-2xl p-3 shadow-2xl border border-rose-500/60 flex flex-col max-w-[220px]">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-extrabold text-rose-400 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-rose-500" />
                          Black Ischemic Zone
                        </span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                          Infarct
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300 leading-tight mt-1">
                        Dark necrotic territory on LV apex: Hypoperfused cold defect (ST: {fd.oldpeak ?? 2.2}mm)
                      </span>
                    </div>
                  ) : (
                    <div className="bg-white/95 text-slate-800 rounded-2xl p-3 shadow-lg border border-emerald-200 flex flex-col max-w-[200px]">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Viable Myocardium
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 mt-1">
                        Uniform Pink Perfusion (ST: 0.0mm)
                      </span>
                    </div>
                  )}
                </div>

                {/* Vertical Camera Controls */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center bg-white/90 border border-slate-200 rounded-2xl p-1 gap-1 shadow-md">
                  <button 
                    onClick={() => heartRef.current?.resetView()}
                    title="Search & Focus"
                    className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => heartRef.current?.zoomIn()}
                    title="Zoom In"
                    className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => heartRef.current?.zoomOut()}
                    title="Zoom Out"
                    className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => heartRef.current?.resetView()}
                    title="Reset Camera"
                    className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Center 3D Anatomical Organ Model */}
                <div className="w-full h-[420px] rounded-2xl overflow-hidden relative">
                  <HeartCanvas
                    ref={heartRef}
                    theme={isDark ? 'dark' : 'light'}
                    hideControls={true}
                    predictionData={predictionResult}
                    selectedPartId={selectedPartId}
                    onSelectPart={(partId) => setSelectedPartId(partId)}
                    pathologyMode={pathologyView}
                  />
                </div>

                {/* Bottom Cardiac Camera Presets (Replaced Lungs/Brain) */}
                <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-100 z-10">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">View:</span>
                  {[
                    { id: 'anterior', label: 'Anterior' },
                    { id: 'lateral', label: 'Lateral' },
                    { id: 'posterior', label: 'Posterior' },
                    { id: 'superior', label: 'Superior' }
                  ].map((angle) => {
                    const isActive = activeCameraAngle === angle.id;
                    return (
                      <button
                        key={angle.id}
                        onClick={() => {
                          setActiveCameraAngle(angle.id);
                          heartRef.current?.setCameraPreset(angle.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        {angle.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COLUMN 2: Performance, Recovery & Calendar (4 cols) */}
              <div className="lg:col-span-4 space-y-5">
                {/* 1. Cardiovascular Performance Card - Dynamically linked to Disease State */}
                <div className={`rounded-3xl p-5 shadow-sm border space-y-3 ${
                  isDark ? 'bg-[#111726] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Cardiovascular Performance</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isDiseasedMode 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {isDiseasedMode ? 'Compromised' : 'Optimal'}
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black ${isDiseasedMode ? 'text-rose-500' : isDark ? 'text-white' : 'text-slate-900'}`}>
                      {performancePct}%
                    </span>
                    <span className={`text-xs font-semibold ${isDiseasedMode ? 'text-rose-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {performanceLabel}
                    </span>
                  </div>

                  <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
                    isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-100 border-slate-200/60'
                  }`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${performanceGradient}`}
                      style={{ width: `${performancePct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>0</span>
                    <span className={isDiseasedMode ? 'text-rose-400 font-bold' : isDark ? 'text-slate-300 font-semibold' : 'text-slate-600 font-semibold'}>
                      {performancePct}% ({isDiseasedMode ? 'Ischemia' : 'Normal'})
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                {/* 2. Heart Recovery & Telemetry Card - Dynamic based on disease */}
                {isDiseasedMode ? (
                  <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 rounded-3xl p-5 text-white shadow-xl border border-rose-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          <h3 className="text-sm font-extrabold tracking-tight text-white">Heart Telemetry & Ischemia Monitor</h3>
                        </div>
                        <p className="text-[11px] text-rose-200 font-medium leading-snug mt-1">
                          Severe exertional myocardial ischemia detected: ST depression ({fd.oldpeak ?? 2.2}mm) & LAD perfusion deficit
                        </p>
                      </div>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    </div>

                    <div className="h-16 flex items-end justify-between gap-1 py-1">
                      {barHeights.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-full transition-all bg-gradient-to-t from-rose-600/80 to-amber-400/80"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-rose-900/60 text-xs">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Ischemic Load</span>
                      </div>
                      <span className="font-bold text-rose-300 tracking-wider">
                        {telemetryScore} / 100 <span className="text-[10px] opacity-80">(Critical Strain)</span>
                      </span>
                      <RotateCw className="w-3.5 h-3.5 text-rose-400 cursor-pointer hover:rotate-180 transition-transform duration-500" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-md shadow-blue-600/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold tracking-tight">Heart Recovery & Telemetry</h3>
                        <p className="text-[11px] text-blue-100 font-medium leading-snug mt-0.5">
                          Your cardiovascular system has recovered well (resting ECG normal, 0.0mm ST depression)
                        </p>
                      </div>
                      <MoreVertical className="w-4 h-4 text-blue-200" />
                    </div>

                    <div className="h-16 flex items-end justify-between gap-1 py-1">
                      {barHeights.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-white/70 rounded-full hover:bg-white transition-all"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-blue-500/50 text-xs">
                      <Calendar className="w-4 h-4 text-blue-200" />
                      <span className="font-bold text-white tracking-wider">{telemetryScore} / 100</span>
                      <RotateCw className="w-3.5 h-3.5 text-blue-200 cursor-pointer hover:rotate-180 transition-transform duration-500" />
                    </div>
                  </div>
                )}

                {/* 3. Upcoming Appointments Card */}
                <div className={`rounded-3xl p-5 shadow-sm border space-y-4 ${
                  isDark ? 'bg-[#111726] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Upcoming Appointments</span>
                    <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
                    {daysOfWeek.map((d) => {
                      const isSelected = selectedDay === d.day;
                      return (
                        <button
                          key={d.day}
                          onClick={() => setSelectedDay(d.day)}
                          className={`flex flex-col items-center py-2 px-2.5 rounded-2xl transition ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                              : isDark
                              ? 'text-slate-400 hover:bg-slate-800'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs">{d.day}</span>
                          <span className="text-[10px] opacity-80">{d.name}</span>
                        </button>
                      );
                    })}
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div className={`border rounded-2xl p-3.5 flex items-center justify-between gap-3 ${
                    isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200/80'
                  }`}>
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1594824813639-5094252a16d5?w=100&auto=format&fit=crop&q=80"
                        alt="Dr. Sarah Scott"
                        className="w-10 h-10 rounded-2xl object-cover ring-2 ring-blue-500/30"
                      />
                      <div>
                        <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Sarah Scott</span>
                        <span className="text-[11px] text-slate-400 block">Cardiologist</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">May 5th, 2026</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>02:30 - 03:00 pm</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition shadow-sm">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                        isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}>
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMN 3: My Profiles & Medication Reminder (3 cols) */}
              <div className="lg:col-span-3 space-y-5">
                <div className={`rounded-3xl p-5 shadow-sm border space-y-4 ${
                  isDark ? 'bg-[#111726] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>My profiles</span>
                    <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-2xl border ${
                    isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="relative shrink-0">
                      <img
                        src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                        alt={currentUser?.name || "David Berg"}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/30"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div 
                        style={{ display: 'none' }}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white font-black text-sm ring-2 ring-blue-500/30 shrink-0"
                      >
                        {getUserInitials(currentUser?.name)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Patient Persona</span>
                      <span className={`text-sm font-black block leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {currentUser?.name || 'David Berg'}
                      </span>
                      <span className="text-[11px] font-semibold text-rose-400 block mt-0.5">
                        {fd.trestbps >= 140 ? 'Mild Hypertension' : 'Normotensive'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className={`border rounded-2xl p-3 flex items-center justify-between ${
                      isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200/70'
                    }`}>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block">Vascular Stability</span>
                        <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {isDiseasedMode ? `${fd.trestbps ?? 140} / 90 mmHg` : '120 / 80 mmHg'}
                        </span>
                        <span className={`text-[10px] font-bold block ${isDiseasedMode ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isDiseasedMode ? 'Hypertensive Shear Stress' : 'Normal Arterial Hemodynamics'}
                        </span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className={`border rounded-2xl p-3 flex items-center justify-between ${
                      isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200/70'
                    }`}>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block">Exercise ST Depression</span>
                        <span className={`text-sm font-black ${isDiseasedMode ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isDiseasedMode ? `${fd.oldpeak ?? 2.2} mm` : '0.0 mm'}
                        </span>
                        <span className={`text-[10px] font-bold block ${isDiseasedMode ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isDiseasedMode ? 'Subendocardial Ischemia' : 'Normal Isoelectric Repolarization'}
                        </span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl p-5 shadow-sm border space-y-3 ${
                  isDark ? 'bg-[#111726] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Medication Reminder</span>
                    <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div className={`flex items-start gap-3 p-3.5 rounded-2xl border ${
                    isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200/70'
                  }`}>
                    <div className="w-9 h-9 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Take your antihypertensive
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Medication at 3:00 PM
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Normal vs. Diseased Heart Pathology Comparison Guide */}
            <PathologyComparisonGuide
              pathologyView={pathologyView}
              setPathologyView={setPathologyView}
              fd={fd}
              prob={prob}
              isDark={isDark}
            />
          </div>
        )}

          {/* TAB 2: VITALS VIEW — CLINICAL DIFFERENCE ENGINE */}
          {activeTab === 'Vitals' && (
            <div className="space-y-5">
              {/* Prominent Clinical Difference Hero Banner */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Baseline Badge */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 px-4 flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Baseline Risk</span>
                      <span className="text-xl font-black text-slate-700">{baselineProb}%</span>
                    </div>
                  </div>

                  {/* Arrow + Delta Pill */}
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className={`px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-sm flex items-center gap-1.5 ${
                      deltaRisk < 0 
                        ? 'bg-emerald-500 text-white' 
                        : deltaRisk > 0 
                        ? 'bg-rose-500 text-white' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {deltaRisk < 0 ? (
                        <>↓ {Math.abs(deltaRisk)}% Absolute Risk Reduction</>
                      ) : deltaRisk > 0 ? (
                        <>↑ +{deltaRisk}% Risk Increase</>
                      ) : (
                        <>Identical to Baseline</>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* Simulated Current Badge */}
                  <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3 px-4 flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Simulated Risk</span>
                      <span className={`text-xl font-black ${isHighRisk ? 'text-rose-600' : isModRisk ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {prob}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scenario & Reset Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Quick Scenario:</span>
                  <button
                    onClick={() => handleApplyScenario('bp')}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
                  >
                    BP 120 Target
                  </button>
                  <button
                    onClick={() => handleApplyScenario('statin')}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
                  >
                    Statin Chol 175
                  </button>
                  <button
                    onClick={() => handleApplyScenario('omt')}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 transition"
                  >
                    Optimal Therapy (OMT)
                  </button>
                  <button
                    onClick={handleResetBaseline}
                    title="Restore Baseline Patient Values"
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 transition flex items-center gap-1.5 ml-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Baseline
                  </button>
                </div>
              </div>

              {/* 3-Column Grid for Difference Engine */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* COLUMN 1: 3D Anatomical Organ Model with Difference Pins (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
                  {/* Top Pathology Mode Selector Toggle Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 border border-slate-200/80 p-1.5 rounded-2xl mb-2 z-20 gap-2 relative">
                    <div className="flex items-center gap-1.5 pl-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${pathologyView === 'diseased' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className="text-[11px] font-extrabold text-slate-700 tracking-tight">Heart Morphology:</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPathologyView('normal')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          pathologyView === 'normal'
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Normal Healthy
                      </button>
                      <button
                        onClick={() => setPathologyView('diseased')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          pathologyView === 'diseased'
                            ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/40 ring-1 ring-rose-500/50'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white inline-block" />
                        Diseased (Black Area)
                      </button>
                    </div>
                  </div>

                  {/* Top-Left Pin: Simulated Arterial Pressure & LAD Plaque Status */}
                  <div className="absolute top-16 left-6 z-20 animate-fadeIn pointer-events-auto">
                    {pathologyView === 'diseased' ? (
                      <div className="bg-amber-500/95 text-slate-950 rounded-2xl p-3 shadow-lg shadow-amber-500/30 border border-amber-300 backdrop-blur-md flex flex-col max-w-[210px]">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-extrabold flex items-center gap-1 text-slate-950">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-900" />
                            LAD Plaque Blockage
                          </span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-400">
                            ca: {fd.ca ?? 1}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-black">{fd.trestbps ?? 140} mmHg</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${deltaBP < 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
                            Δ {deltaBP > 0 ? '+' : ''}{deltaBP}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-600 text-white rounded-2xl p-3 shadow-lg shadow-blue-600/30 border border-blue-400/40 backdrop-blur-md flex flex-col max-w-[200px]">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-semibold text-blue-100 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                            Patent LAD Artery
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-blue-200" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-sm font-black tracking-tight">{fd.trestbps ?? 140} / 90</span>
                          <span className="text-xs text-blue-200">mmHg</span>
                        </div>
                      </div>
                    )}
                    <div className="relative mt-2 ml-8">
                      <div className={`w-5 h-5 rounded-full shadow-md animate-ping absolute ${pathologyView === 'diseased' ? 'bg-amber-400 border-4 border-amber-600' : 'bg-white/90 border-4 border-blue-600'}`} />
                      <div className={`w-5 h-5 rounded-full shadow-md relative ${pathologyView === 'diseased' ? 'bg-amber-400 border-4 border-amber-600' : 'bg-white border-4 border-blue-600'}`} />
                    </div>
                  </div>

                  {/* Bottom-Right Pin: Exertional HR & Black Necrotic Ischemia */}
                  <div className="absolute bottom-20 right-6 z-20 animate-fadeIn pointer-events-auto">
                    <div className="relative mb-2 ml-4">
                      <div className={`w-5 h-5 rounded-full shadow-md animate-ping absolute ${pathologyView === 'diseased' ? 'bg-rose-500 border-4 border-slate-900' : 'bg-emerald-400 border-4 border-emerald-600'}`} />
                      <div className={`w-5 h-5 rounded-full shadow-md relative ${pathologyView === 'diseased' ? 'bg-rose-600 border-4 border-slate-900' : 'bg-white border-4 border-emerald-600'}`} />
                    </div>
                    {pathologyView === 'diseased' ? (
                      <div className="bg-slate-950 text-white rounded-2xl p-3 shadow-2xl border border-rose-500/60 flex flex-col max-w-[220px]">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-extrabold text-rose-400 flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-rose-500" />
                            Black Ischemic Zone
                          </span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                            Infarct
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1 text-slate-300">
                          <span className="text-xs font-bold text-white">{fd.thalach ?? 142} bpm</span>
                          <span className="text-[10px] text-rose-300 font-semibold">ST: {fd.oldpeak ?? 2.2}mm</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/95 text-slate-800 rounded-2xl p-3 shadow-lg border border-emerald-200 flex flex-col max-w-[200px]">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Viable Myocardium
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 mt-1">
                          {fd.thalach ?? 142} bpm (Normal Flow)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Vertical Zoom Controls */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center bg-white/90 border border-slate-200 rounded-2xl p-1 gap-1 shadow-md">
                    <button 
                      onClick={() => heartRef.current?.resetView()}
                      title="Search & Focus"
                      className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => heartRef.current?.zoomIn()}
                      title="Zoom In"
                      className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => heartRef.current?.zoomOut()}
                      title="Zoom Out"
                      className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => heartRef.current?.resetView()}
                      title="Reset Camera"
                      className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 3D Heart Model Canvas */}
                  <div className="w-full h-[420px] rounded-2xl overflow-hidden relative">
                    <HeartCanvas
                      ref={heartRef}
                      theme={isDark ? 'dark' : 'light'}
                      hideControls={true}
                      predictionData={predictionResult}
                      selectedPartId={selectedPartId}
                      onSelectPart={(partId) => setSelectedPartId(partId)}
                      pathologyMode={pathologyView}
                    />
                  </div>

                  {/* Bottom Cardiac Camera Presets (Replaced Lungs/Brain) */}
                  <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-100 z-10">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">View:</span>
                    {[
                      { id: 'anterior', label: 'Anterior' },
                      { id: 'lateral', label: 'Lateral' },
                      { id: 'posterior', label: 'Posterior' },
                      { id: 'superior', label: 'Superior' }
                    ].map((angle) => {
                      const isActive = activeCameraAngle === angle.id;
                      return (
                        <button
                          key={angle.id}
                          onClick={() => {
                            setActiveCameraAngle(angle.id);
                            heartRef.current?.setCameraPreset(angle.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/30'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Compass className="w-3.5 h-3.5" />
                          {angle.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COLUMN 2: Clinician Direct Input & Sliders (4 cols) */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Input 1: Blood Pressure */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                        Resting Blood Pressure (`trestbps`)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        deltaBP < 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : deltaBP > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {deltaBP === 0 ? 'Baseline: ' + (baselineData.trestbps ?? 140) : `Δ ${deltaBP > 0 ? '+' : ''}${deltaBP} mmHg`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="90"
                        max="200"
                        value={fd.trestbps ?? 140}
                        onChange={(e) => handleUpdateVital('trestbps', Number(e.target.value))}
                        className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-blue-500"
                      />
                      <span className="text-xs text-slate-500 font-semibold">mmHg Systolic</span>
                    </div>

                    <input
                      type="range"
                      min="90"
                      max="200"
                      step="1"
                      value={fd.trestbps ?? 140}
                      onChange={(e) => handleUpdateVital('trestbps', Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>90 (Optimal)</span>
                      <span>120 (Target)</span>
                      <span>140 (Baseline)</span>
                      <span>200</span>
                    </div>
                  </div>

                  {/* Input 2: Serum Cholesterol */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-blue-600" />
                        Serum Cholesterol (`chol`)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        deltaChol < 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : deltaChol > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {deltaChol === 0 ? 'Baseline: ' + (baselineData.chol ?? 260) : `Δ ${deltaChol > 0 ? '+' : ''}${deltaChol} mg/dL`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="120"
                        max="450"
                        value={fd.chol ?? 260}
                        onChange={(e) => handleUpdateVital('chol', Number(e.target.value))}
                        className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-blue-500"
                      />
                      <span className="text-xs text-slate-500 font-semibold">mg/dL Total</span>
                    </div>

                    <input
                      type="range"
                      min="120"
                      max="450"
                      step="1"
                      value={fd.chol ?? 260}
                      onChange={(e) => handleUpdateVital('chol', Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>120</span>
                      <span>200 (Desirable)</span>
                      <span>260 (Baseline)</span>
                      <span>450</span>
                    </div>
                  </div>

                  {/* Input 3: Peak Exertional HR */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-500" />
                        Max Heart Rate Achieved (`thalach`)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        deltaHR > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : deltaHR < 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {deltaHR === 0 ? 'Baseline: ' + (baselineData.thalach ?? 142) : `Δ ${deltaHR > 0 ? '+' : ''}${deltaHR} bpm`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="70"
                        max="210"
                        value={fd.thalach ?? 142}
                        onChange={(e) => handleUpdateVital('thalach', Number(e.target.value))}
                        className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-blue-500"
                      />
                      <span className="text-xs text-slate-500 font-semibold">bpm on Stress ECG</span>
                    </div>

                    <input
                      type="range"
                      min="70"
                      max="210"
                      step="1"
                      value={fd.thalach ?? 142}
                      onChange={(e) => handleUpdateVital('thalach', Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Input 4: ST Depression */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                        Exercise ST Depression (`oldpeak`)
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        deltaST < 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : deltaST > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {deltaST === 0 ? 'Baseline: ' + (baselineData.oldpeak ?? 2.2) : `Δ ${deltaST > 0 ? '+' : ''}${deltaST} mm`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="6.0"
                        step="0.1"
                        value={fd.oldpeak ?? 2.2}
                        onChange={(e) => handleUpdateVital('oldpeak', Number(e.target.value))}
                        className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-blue-500"
                      />
                      <span className="text-xs text-slate-500 font-semibold">mm ST segment depression</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="6.0"
                      step="0.1"
                      value={fd.oldpeak ?? 2.2}
                      onChange={(e) => handleUpdateVital('oldpeak', Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                    />
                  </div>
                </div>

                {/* COLUMN 3: Clinical Diagnostic Inputs & Difference Comparison Table (3 cols) */}
                <div className="lg:col-span-3 space-y-5">
                  {/* Clinical Diagnostic Selectors */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                    <span className="text-xs font-bold text-slate-900 block">Diagnostic Clinical Inputs</span>

                    {/* Chest Pain Type */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 block">Chest Pain Presentation (`cp`):</label>
                      <select
                        value={fd.cp ?? 4}
                        onChange={(e) => handleUpdateVital('cp', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-blue-500"
                      >
                        <option value={1}>1: Typical Angina</option>
                        <option value={2}>2: Atypical Angina</option>
                        <option value={3}>3: Non-Anginal Pain</option>
                        <option value={4}>4: Asymptomatic</option>
                      </select>
                    </div>

                    {/* Exertional Angina */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 block">Exertional Angina (`exang`):</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateVital('exang', 0)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition ${
                            fd.exang === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          No (0)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateVital('exang', 1)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition ${
                            fd.exang === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          Yes (1)
                        </button>
                      </div>
                    </div>

                    {/* Fasting Blood Sugar */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 block">Fasting Blood Sugar (`fbs`):</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateVital('fbs', 0)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                            fd.fbs === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          ≤ 120 mg/dL
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateVital('fbs', 1)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                            fd.fbs === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          &gt; 120 mg/dL
                        </button>
                      </div>
                    </div>

                    {/* Calcified Vessels */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 block">Calcified Vessels (`ca`):</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[0, 1, 2, 3].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleUpdateVital('ca', v)}
                            className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                              fd.ca === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Thallium Stress Scan */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 block">Thallium Scintigraphy (`thal`):</label>
                      <select
                        value={fd.thal ?? 7}
                        onChange={(e) => handleUpdateVital('thal', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-blue-500"
                      >
                        <option value={3}>3: Normal Perfusion</option>
                        <option value={6}>6: Fixed Perfusion Defect</option>
                        <option value={7}>7: Reversible Defect (Ischemia)</option>
                      </select>
                    </div>
                  </div>

                  {/* Comprehensive Difference Comparison Card */}
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block">Baseline vs. Current Difference</span>
                    
                    <div className="space-y-2 text-xs">
                      {[
                        { label: 'Systolic BP', base: `${baselineData.trestbps ?? 140} mmHg`, curr: `${fd.trestbps ?? 140} mmHg`, delta: deltaBP, unit: 'mmHg' },
                        { label: 'Cholesterol', base: `${baselineData.chol ?? 260} mg/dL`, curr: `${fd.chol ?? 260} mg/dL`, delta: deltaChol, unit: 'mg/dL' },
                        { label: 'Max HR', base: `${baselineData.thalach ?? 142} bpm`, curr: `${fd.thalach ?? 142} bpm`, delta: deltaHR, unit: 'bpm', inverse: true },
                        { label: 'ST Depression', base: `${baselineData.oldpeak ?? 2.2} mm`, curr: `${fd.oldpeak ?? 2.2} mm`, delta: deltaST, unit: 'mm' },
                      ].map((row, idx) => {
                        const isFavorable = row.inverse ? row.delta > 0 : row.delta < 0;
                        const hasChange = row.delta !== 0;
                        return (
                          <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">{row.label}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-slate-500 text-[11px] line-through">{row.base}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <strong className="text-slate-900 text-xs">{row.curr}</strong>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              !hasChange 
                                ? 'bg-slate-200 text-slate-600' 
                                : isFavorable 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {!hasChange ? '0' : `${row.delta > 0 ? '+' : ''}${row.delta} ${row.unit}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Normal vs. Diseased Heart Pathology Comparison Guide */}
            <PathologyComparisonGuide
              pathologyView={pathologyView}
              setPathologyView={setPathologyView}
              fd={fd}
              prob={prob}
              isDark={isDark}
            />
          </div>
        )}

        {/* TAB: 3D ANATOMY & AI WORKSPACE */}
        {activeTab === '3D Anatomy & AI' && (
          <div className="space-y-5">
            {/* Top Workspace Control Bar */}
            <div className="bg-white rounded-3xl p-4 sm:px-6 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left: Mode Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200/80">
                  <button
                    onClick={() => setCenterMode('3d')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      centerMode === '3d'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    3D Anatomical Twin
                  </button>
                  <button
                    onClick={() => setCenterMode('graph')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      centerMode === 'graph'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    AI Neural Risk Graph
                  </button>
                </div>

                {/* Pathology Mode Switcher */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200/80">
                  <button
                    onClick={() => setPathologyView('normal')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      pathologyView === 'normal'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Normal Heart
                  </button>
                  <button
                    onClick={() => setPathologyView('diseased')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      pathologyView === 'diseased'
                        ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/40 ring-1 ring-rose-500/50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white inline-block" />
                    Diseased (Black Area)
                  </button>
                </div>
              </div>

              {/* Right: Camera Presets & Model Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Angle:</span>
                  {[
                    { id: 'anterior', label: 'Anterior' },
                    { id: 'lateral', label: 'Lateral' },
                    { id: 'posterior', label: 'Posterior' },
                    { id: 'superior', label: 'Superior' }
                  ].map((angle) => (
                    <button
                      key={angle.id}
                      onClick={() => {
                        setActiveCameraAngle(angle.id);
                        heartRef.current?.setCameraPreset(angle.id);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                        activeCameraAngle === angle.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      {angle.label}
                    </button>
                  ))}
                </div>

                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Cleveland Ensemble • 85.2% ROC-AUC
                </span>
              </div>
            </div>

            {/* Anatomical Structure Quick Selector Strip */}
            <div className="bg-white rounded-3xl p-3.5 px-5 shadow-sm border border-slate-100 flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Select Structure:
              </span>
              {Object.values(ANATOMICAL_PARTS).map((part) => {
                const isSelected = selectedPartId === part.id;
                const isBlackInfarct = part.id === 'infarct';
                const isPlaque = part.id === 'plaque';
                return (
                  <button
                    key={part.id}
                    onClick={() => {
                      setSelectedPartId(part.id);
                      if (heartRef.current) heartRef.current.focusPart(part.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                      isSelected
                        ? isBlackInfarct
                          ? 'bg-slate-900 text-white border-rose-500 shadow-md ring-2 ring-rose-500/30'
                          : isPlaque
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md'
                          : 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {isBlackInfarct && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                    {isPlaque && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                    {part.name.split(' (')[0]}
                  </button>
                );
              })}
            </div>

            {/* Main Workspace 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* COLUMN 1: Interactive 3D Canvas / Graph + Selected Structure Card (5 cols) */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
                  {/* Floating Pins for 3D View */}
                  {centerMode === '3d' && (
                    <>
                      {/* Top-Left Pin */}
                      <div className="absolute top-6 left-6 z-20 animate-fadeIn pointer-events-auto">
                        {pathologyView === 'diseased' ? (
                          <div className="bg-amber-500/95 text-slate-950 rounded-2xl p-3 shadow-lg border border-amber-300 backdrop-blur-md flex flex-col max-w-[210px]">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-extrabold flex items-center gap-1 text-slate-950">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-900" />
                                LAD Plaque Blockage
                              </span>
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-400">
                                ca: {fd.ca ?? 1}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-900 mt-1 leading-tight">
                              Calcified atheroma narrowing LAD lumen
                            </span>
                          </div>
                        ) : (
                          <div className="bg-blue-600 text-white rounded-2xl p-3 shadow-lg border border-blue-400/40 backdrop-blur-md flex flex-col max-w-[200px]">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <span className="font-semibold text-blue-100 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                Patent LAD Artery
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-blue-200" />
                            </div>
                            <span className="text-xs font-bold mt-1">100% Open Lumen</span>
                          </div>
                        )}
                        <div className="relative mt-2 ml-8">
                          <div className={`w-5 h-5 rounded-full shadow-md animate-ping absolute ${pathologyView === 'diseased' ? 'bg-amber-400 border-4 border-amber-600' : 'bg-white/90 border-4 border-blue-600'}`} />
                          <div className={`w-5 h-5 rounded-full shadow-md relative ${pathologyView === 'diseased' ? 'bg-amber-400 border-4 border-amber-600' : 'bg-white border-4 border-blue-600'}`} />
                        </div>
                      </div>

                      {/* Bottom-Right Pin */}
                      <div className="absolute bottom-16 right-6 z-20 animate-fadeIn pointer-events-auto">
                        <div className="relative mb-2 ml-4">
                          <div className={`w-5 h-5 rounded-full shadow-md animate-ping absolute ${pathologyView === 'diseased' ? 'bg-rose-500 border-4 border-slate-900' : 'bg-emerald-400 border-4 border-emerald-600'}`} />
                          <div className={`w-5 h-5 rounded-full shadow-md relative ${pathologyView === 'diseased' ? 'bg-rose-600 border-4 border-slate-900' : 'bg-white border-4 border-emerald-600'}`} />
                        </div>
                        {pathologyView === 'diseased' ? (
                          <div className="bg-slate-950 text-white rounded-2xl p-3 shadow-2xl border border-rose-500/60 flex flex-col max-w-[220px]">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="font-extrabold text-rose-400 flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5 text-rose-500" />
                                Black Ischemic Zone
                              </span>
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                                Infarct
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-300 mt-1 leading-tight">
                              Hypoperfused necrotic apical territory (ST: {fd.oldpeak ?? 2.2}mm)
                            </span>
                          </div>
                        ) : (
                          <div className="bg-white/95 text-slate-800 rounded-2xl p-3 shadow-lg border border-emerald-200 flex flex-col max-w-[200px]">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Viable Myocardium
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 mt-1">Normal Perfusion (SaO2 &gt; 98%)</span>
                          </div>
                        )}
                      </div>

                      {/* Vertical Camera Controls */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center bg-white/90 border border-slate-200 rounded-2xl p-1 gap-1 shadow-md">
                        <button 
                          onClick={() => heartRef.current?.resetView()}
                          title="Reset View"
                          className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => heartRef.current?.zoomIn()}
                          title="Zoom In"
                          className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => heartRef.current?.zoomOut()}
                          title="Zoom Out"
                          className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => heartRef.current?.resetView()}
                          title="Reset Camera"
                          className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Canvas Area */}
                  <div className="w-full h-[460px] rounded-2xl overflow-hidden relative">
                    {centerMode === '3d' ? (
                      <HeartCanvas
                        ref={heartRef}
                        theme={isDark ? 'dark' : 'light'}
                        hideControls={true}
                        predictionData={predictionResult}
                        selectedPartId={selectedPartId}
                        onSelectPart={(partId) => setSelectedPartId(partId)}
                        pathologyMode={pathologyView}
                      />
                    ) : (
                      <RiskNetworkGraph
                        predictionResult={predictionResult}
                        formData={fd}
                        onSelectPart={(partId) => {
                          setSelectedPartId(partId);
                          setCenterMode('3d');
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Selected Anatomical Structure Diagnostic Intelligence Card */}
                {selectedPartId && ANATOMICAL_PARTS[selectedPartId] && (
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {ANATOMICAL_PARTS[selectedPartId].category}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">ID: {selectedPartId}</span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 mt-1">
                          {ANATOMICAL_PARTS[selectedPartId].name}
                        </h4>
                      </div>
                      <button
                        onClick={() => heartRef.current?.focusPart(selectedPartId)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        Focus 3D Camera
                      </button>
                    </div>

                    <div className="text-xs space-y-2 text-slate-600 leading-relaxed">
                      <p>{ANATOMICAL_PARTS[selectedPartId].description}</p>
                      <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-slate-800">
                        <strong className="text-blue-900 block mb-0.5">Clinical Relevance to Current Patient:</strong>
                        <span>{ANATOMICAL_PARTS[selectedPartId].clinicalSignificance}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* COLUMN 2: What-If Simulation Controls, SHAP Drivers & Forecast (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Interactive What-If Simulation Sliders Card */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-black text-slate-900 tracking-tight">
                          Interactive What-If Simulation & Biometric Tuning
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Adjust patient physiological vitals to recalculate AI risk and visualize anatomical response.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-sm flex items-center gap-1.5 ${
                        isHighRisk ? 'bg-rose-500 text-white' : isModRisk ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        {prob}% Risk ({isHighRisk ? 'Elevated' : isModRisk ? 'Moderate' : 'Low'})
                      </div>
                    </div>
                  </div>

                  {/* Quick Clinical Scenarios */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Quick Scenarios:</span>
                    <button
                      onClick={() => handleApplyScenario('bp')}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
                    >
                      Target BP 120 mmHg
                    </button>
                    <button
                      onClick={() => handleApplyScenario('statin')}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
                    >
                      Statin (Chol 175 mg/dL)
                    </button>
                    <button
                      onClick={() => handleApplyScenario('omt')}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 transition"
                    >
                      Optimal Medical Therapy (OMT)
                    </button>
                    <button
                      onClick={handleResetBaseline}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 transition flex items-center gap-1.5 ml-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Baseline
                    </button>
                  </div>

                  {/* 2x2 Grid of Vital Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* BP Slider */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Resting Blood Pressure</span>
                        <span className="font-mono font-black text-slate-900">{fd.trestbps ?? 140} mmHg</span>
                      </div>
                      <input
                        type="range"
                        min="90"
                        max="200"
                        value={fd.trestbps ?? 140}
                        onChange={(e) => handleUpdateVital('trestbps', Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>90</span>
                        <span>120 (Optimal)</span>
                        <span>200</span>
                      </div>
                    </div>

                    {/* Cholesterol Slider */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Serum Cholesterol</span>
                        <span className="font-mono font-black text-slate-900">{fd.chol ?? 260} mg/dL</span>
                      </div>
                      <input
                        type="range"
                        min="120"
                        max="450"
                        value={fd.chol ?? 260}
                        onChange={(e) => handleUpdateVital('chol', Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>120</span>
                        <span>200 (Desirable)</span>
                        <span>450</span>
                      </div>
                    </div>

                    {/* Exertional HR Slider */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Peak Exertional HR</span>
                        <span className="font-mono font-black text-slate-900">{fd.thalach ?? 142} bpm</span>
                      </div>
                      <input
                        type="range"
                        min="70"
                        max="210"
                        value={fd.thalach ?? 142}
                        onChange={(e) => handleUpdateVital('thalach', Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>70</span>
                        <span>140 (Reserve)</span>
                        <span>210</span>
                      </div>
                    </div>

                    {/* ST Depression Slider */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">ST-Segment Depression</span>
                        <span className="font-mono font-black text-slate-900">{fd.oldpeak ?? 2.2} mm</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="6.0"
                        step="0.1"
                        value={fd.oldpeak ?? 2.2}
                        onChange={(e) => handleUpdateVital('oldpeak', Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>0.0 (Normal)</span>
                        <span>1.0 (Ischemic threshold)</span>
                        <span>6.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Calcified Vessels & Thallium Scan Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Calcified Vessels on Fluoroscopy (`ca`):
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[0, 1, 2, 3].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleUpdateVital('ca', v)}
                            className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                              fd.ca === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {v} {v === 0 ? 'None' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Thallium Nuclear Scintigraphy (`thal`):
                      </label>
                      <select
                        value={fd.thal ?? 7}
                        onChange={(e) => handleUpdateVital('thal', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-blue-500"
                      >
                        <option value={3}>3: Normal Perfusion (thal = 3)</option>
                        <option value={6}>6: Fixed Perfusion Defect (thal = 6)</option>
                        <option value={7}>7: Reversible Defect - Ischemia (thal = 7)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SHAP Feature Drivers & Attributions */}
                {predictionResult && (
                  <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                    <RiskFactorsBreakdown result={predictionResult} />
                  </div>
                )}

                {/* 10-Year Longitudinal Risk Forecast Timeline */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                  <ForecastTimeline />
                </div>
              </div>
            </div>

            {/* Normal vs. Diseased Heart Pathology Comparison Guide */}
            <PathologyComparisonGuide
              pathologyView={pathologyView}
              setPathologyView={setPathologyView}
              fd={fd}
              prob={prob}
              isDark={isDark}
            />
          </div>
        )}

          {/* TAB 3: LAB RESULTS VIEW (Connected to Database) */}
          {activeTab === 'Lab Results' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-black text-slate-900">Laboratory Diagnostics & Biomarker Panels</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time clinical laboratory results from hospital EHR &bull; Patient: {currentPatientMeta?.name || 'David Berg'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportDossierJSON}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Labs
                  </button>
                  <button
                    onClick={onNavigateToAssessment}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Edit Biomarkers
                  </button>
                </div>
              </div>

              {/* Lab Panel Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(dbLabs.length > 0 ? dbLabs : [
                  { test_name: 'High-Sensitivity Cardiac Troponin-I (hs-cTnI)', category: 'Cardiac Markers', value: 11.2, unit: 'ng/L', reference_range: '< 14.0 ng/L', status: 'normal', interpretation: 'Baseline resting levels within safe margin; re-evaluate post-stress test.' },
                  { test_name: 'High-Sensitivity C-Reactive Protein (hs-CRP)', category: 'Inflammatory', value: 2.8, unit: 'mg/L', reference_range: '< 1.0 mg/L', status: 'elevated', interpretation: 'Moderate systemic vascular inflammation consistent with atheroma progression.' },
                  { test_name: 'Low-Density Lipoprotein (LDL-C)', category: 'Lipid Profile', value: 148.0, unit: 'mg/dL', reference_range: '< 70.0 mg/dL', status: 'elevated', interpretation: 'Target < 70 mg/dL recommended for high-risk CAD category.' },
                  { test_name: 'High-Density Lipoprotein (HDL-C)', category: 'Lipid Profile', value: 42.0, unit: 'mg/dL', reference_range: '> 40.0 mg/dL', status: 'normal', interpretation: 'Adequate reverse cholesterol transport capacity.' },
                  { test_name: 'Serum Triglycerides', category: 'Lipid Profile', value: 195.0, unit: 'mg/dL', reference_range: '< 150.0 mg/dL', status: 'elevated', interpretation: 'Hypertriglyceridemia; dietary refinement and omega-3 indicated.' },
                  { test_name: 'N-Terminal Pro-BNP (NT-proBNP)', category: 'Cardiac Markers', value: 88.0, unit: 'pg/mL', reference_range: '< 125.0 pg/mL', status: 'normal', interpretation: 'No signs of decompensated congestive heart failure.' },
                ]).map((item, idx) => {
                  const isCrit = item.status === 'critical';
                  const isElev = item.status === 'elevated';
                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isCrit 
                              ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                              : isElev 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">{item.test_name}</h4>
                      </div>

                      <div className="my-3 pt-2 border-t border-slate-200/60">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-2xl font-black ${isCrit ? 'text-rose-600' : isElev ? 'text-amber-600' : 'text-slate-900'}`}>
                            {item.value}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">Reference: {item.reference_range}</span>
                      </div>

                      {item.interpretation && (
                        <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/70 leading-relaxed">
                          {item.interpretation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MEDICATION VIEW (Connected to Database) */}
          {activeTab === 'Medication' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-rose-500" />
                    <h3 className="text-lg font-black text-slate-900">Cardiovascular Prescriptions & Adherence</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Active pharmacotherapy regimen for {currentPatientMeta?.name || 'David Berg'} &bull; Database-backed adherence tracking
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNewMedModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Prescription
                  </button>
                </div>
              </div>

              {/* Medication Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(dbMedications.length > 0 ? dbMedications : [
                  { id: 'm1', name: 'Atorvastatin Calcium', dosage: '20 mg', frequency: 'Once daily', time_of_day: '09:00 PM', indication: 'Atherosclerotic Plaque Stabilization', adherence_pct: 94.0 },
                  { id: 'm2', name: 'Metoprolol Tartrate', dosage: '25 mg', frequency: 'Twice daily', time_of_day: '08:00 AM', indication: 'Exertional Rate-Pressure Product Control', adherence_pct: 92.5 },
                  { id: 'm3', name: 'Enteric-Coated Aspirin', dosage: '81 mg', frequency: 'Once daily', time_of_day: '08:30 AM', indication: 'Secondary Antiplatelet Thromboprophylaxis', adherence_pct: 98.0 },
                  { id: 'm4', name: 'Nitroglycerin Sublingual', dosage: '0.4 mg', frequency: 'PRN', time_of_day: 'PRN', indication: 'Acute Anginal Relief', adherence_pct: 100.0 }
                ]).map((med) => (
                  <div key={med.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                          <Pill className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {med.status || 'Active'}
                        </span>
                      </div>

                      <div className="mt-3">
                        <h4 className="text-sm font-black text-slate-900 leading-snug">{med.name}</h4>
                        <span className="text-xs font-semibold text-blue-600 block mt-0.5">{med.dosage} &bull; {med.frequency}</span>
                        {med.indication && (
                          <span className="text-[11px] text-slate-500 block mt-1">{med.indication}</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-200/60">
                      {/* Adherence Rate */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold mb-1">
                          <span className="text-slate-500">Adherence Rate:</span>
                          <span className="font-mono font-bold text-slate-900">{Math.round(med.adherence_pct || 94)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, med.adherence_pct || 94)}%` }} 
                          />
                        </div>
                      </div>

                      {/* Scheduled Time & Take Dose Button */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{med.time_of_day}</span>
                        </div>
                        <button
                          onClick={() => handleTakeMedication(med.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Take Dose
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PATIENT REGISTRY & EHR DIRECTORY (CLINICIAN ONLY) */}
          {activeTab === 'Patients' && (
            <div className={`rounded-3xl p-6 shadow-sm border space-y-6 ${
              isDark ? 'bg-[#111726] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
            }`}>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight">Clinical EHR Patient Registry & Directory</h3>
                    <span className="text-xs font-bold text-white bg-blue-600 px-2.5 py-0.5 rounded-full">
                      {samplePatients?.length || 0} Patients
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage enrolled cardiovascular patients, register new admissions, review risk stratifications, and switch active 3D organ twins.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name, MRN, condition..."
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                      className={`pl-8 pr-3 py-1.5 rounded-xl text-xs font-semibold border transition focus:outline-blue-500 w-56 ${
                        isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => setNewPatientModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Register New Patient</span>
                  </button>
                </div>
              </div>

              {/* Registry KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Cohort</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-blue-500">{samplePatients?.length || 0}</span>
                    <span className="text-xs font-semibold text-slate-400">Enrolled</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">High Ischemia Risk</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-rose-500">
                      {samplePatients?.filter(p => (p.data?.oldpeak >= 1.5 || p.data?.ca >= 1)).length || 0}
                    </span>
                    <span className="text-xs font-semibold text-rose-400">Cases</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Organ Twins</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-emerald-500">{samplePatients?.length || 0}</span>
                    <span className="text-xs font-semibold text-emerald-400">Simulating</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200/80'
                }`}>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Diagnostic Reports</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-indigo-500">{dbReports?.length || 12}</span>
                    <span className="text-xs font-semibold text-indigo-400">Filed</span>
                  </div>
                </div>
              </div>

              {/* Patient List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {samplePatients
                  ?.filter(p => {
                    if (!patientSearchTerm.trim()) return true;
                    const q = patientSearchTerm.toLowerCase();
                    return (
                      (p.name && p.name.toLowerCase().includes(q)) ||
                      (p.id && p.id.toLowerCase().includes(q)) ||
                      (p.primary_condition && p.primary_condition.toLowerCase().includes(q))
                    );
                  })
                  .map((p) => {
                    const isSelected = currentPatientMeta?.id === p.id;
                    const isHigh = (p.data?.oldpeak >= 1.8) || (p.data?.ca >= 2);
                    return (
                      <div
                        key={p.id}
                        className={`rounded-2xl p-5 border transition flex flex-col justify-between space-y-4 ${
                          isSelected
                            ? isDark
                              ? 'bg-blue-950/20 border-blue-500 ring-2 ring-blue-500/30'
                              : 'bg-blue-50/40 border-blue-400 ring-2 ring-blue-400/20'
                            : isDark
                            ? 'bg-[#0B0F19] border-slate-800 hover:border-slate-700'
                            : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          {/* Top row: Avatar + Name + Active badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm shrink-0">
                                {getUserInitials(p.name)}
                              </div>
                              <div>
                                <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {p.name}
                                </h4>
                                <span className="text-[11px] text-slate-400 font-mono block">
                                  MRN: {p.id} &bull; {p.gender || (p.data?.sex === 1 ? 'Male' : 'Female')}, {Math.round(p.age || p.data?.age || 50)}y
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                                Active Twin
                              </span>
                            )}
                          </div>

                          {/* Primary Condition */}
                          <div className="mt-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                              Clinical Condition
                            </span>
                            <p className={`text-xs font-semibold leading-snug ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {p.primary_condition || 'Cardiovascular CAD Evaluation'}
                            </p>
                          </div>

                          {/* Biomarkers Strip */}
                          <div className="mt-3 grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/60 text-center text-[10px]">
                            <div>
                              <span className="text-slate-400 block font-semibold">BP</span>
                              <span className="font-mono font-bold">{Math.round(p.data?.trestbps || 130)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold">CHOL</span>
                              <span className="font-mono font-bold">{Math.round(p.data?.chol || 220)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold">HR</span>
                              <span className="font-mono font-bold">{Math.round(p.data?.thalach || 140)}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold">ST DEP</span>
                              <span className={`font-mono font-bold ${isHigh ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {p.data?.oldpeak ?? 1.2}mm
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800 flex items-center gap-2">
                          <button
                            onClick={() => {
                              onSelectSample(p);
                              setActiveTab('Dashboard');
                              showToast(`Switched active 3D organ twin to ${p.name}!`, 'success');
                            }}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white'
                            }`}
                          >
                            <Heart className="w-3.5 h-3.5" />
                            <span>{isSelected ? 'Viewing Twin' : 'Select Patient'}</span>
                          </button>

                          <button
                            onClick={() => {
                              onSelectSample(p);
                              setNewReportModal(true);
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-bold transition bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs"
                            title="File new clinical report for this patient"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 5: REPORTS (12) ARCHIVE VIEW (Connected to Database) */}
          {activeTab === 'Reports' && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-black text-slate-900">Clinical Diagnostic Reports Archive</h3>
                    <span className="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full">
                      {dbReports.length || 12}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official Cardiology Consultation, Stress Testing, Coronary CTA, Echocardiogram & SPECT Nuclear Records
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isClinician && (
                    <button
                      onClick={() => setNewReportModal(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> File New Report
                    </button>
                  )}
                  {isPatient && (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                      Verified Clinical Records
                    </span>
                  )}
                  <button
                    onClick={handleExportDossierJSON}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export All JSON
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print Reports
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2 pb-2">
                {['All', 'Cardiology Consultation', 'Stress Testing', 'Coronary CTA', 'Echocardiography', 'Nuclear Cardiology'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setReportFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      reportFilter === filter
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {filter === 'All' ? `All (${dbReports.length || 12})` : filter}
                  </button>
                ))}
              </div>

              {/* Reports List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(dbReports.length > 0 ? dbReports : [
                  { id: 'r1', title: 'Comprehensive 3D Cardiovascular Intelligence Dossier', report_type: 'Cardiology Consultation', physician_name: 'Dr. Sarah Scott, MD, FACC', department: 'Division of Cardiovascular Medicine', findings: 'Patient exhibits mild apical hypokinesis on stress echocardiography with 2.2mm horizontal ST-segment depression in inferolateral leads. Calcium scoring demonstrates isolated LAD atheroma ring (ca: 1).', impression: 'Moderate-to-high risk coronary ischemia with preserved global left ventricular ejection fraction (LVEF 55%). Impaired myocardial reserve under maximal exertion.', recommendations: '1. Up-titrate Atorvastatin to 40mg nightly. 2. Continue Metoprolol 25mg BID. 3. Schedule coronary fractional flow reserve (FFR-CT) imaging within 4 weeks.', status: 'Finalized', created_at: new Date().toISOString() }
                ])
                  .filter(r => reportFilter === 'All' || (r.report_type && r.report_type.toLowerCase().includes(reportFilter.toLowerCase())))
                  .map((rep) => (
                    <div 
                      key={rep.id} 
                      className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {rep.report_type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {rep.created_at ? new Date(rep.created_at).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-slate-900 leading-snug">{rep.title}</h4>
                        <span className="text-xs text-slate-500 block">
                          {rep.physician_name} &bull; <span className="text-slate-400">{rep.department || 'Cardiovascular Medicine'}</span>
                        </span>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                          {rep.findings}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {rep.status || 'Finalized'}
                        </span>
                        <button
                          onClick={() => setActiveReportModal(rep)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Full Report
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. TOAST NOTIFICATION CONTAINER */}
      {toast.visible && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 backdrop-blur-md transition-all animate-bounce">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* 4. CLINICAL REPORT DOSSIER MODAL */}
      {activeReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {activeReportModal.report_type}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{activeReportModal.title}</h3>
                <span className="text-xs text-slate-500 block">
                  {activeReportModal.physician_name} &bull; {activeReportModal.department || 'Division of Cardiovascular Medicine'}
                </span>
              </div>
              <button
                onClick={() => setActiveReportModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <strong className="text-slate-900 font-bold block mb-1">Clinical Findings & Observations:</strong>
                <p className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-sans">
                  {activeReportModal.findings}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 font-bold block mb-1">Diagnostic Impression:</strong>
                <p className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 text-blue-900 leading-relaxed font-sans font-medium">
                  {activeReportModal.impression}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 font-bold block mb-1">Recommendations & Management Plan:</strong>
                <p className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 text-emerald-900 leading-relaxed font-sans">
                  {activeReportModal.recommendations}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Status: {activeReportModal.status || 'Finalized'} &bull; Confidential Medical Record
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Dossier
                </button>
                <button
                  onClick={() => setActiveReportModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD PRESCRIPTION MODAL */}
      {newMedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateMedication}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-black text-slate-900">Add Cardiovascular Prescription</h3>
              </div>
              <button
                type="button"
                onClick={() => setNewMedModal(false)}
                className="w-7 h-7 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Medication Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carvedilol"
                  value={newMedForm.name}
                  onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dosage:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12.5 mg"
                  value={newMedForm.dosage}
                  onChange={(e) => setNewMedForm({ ...newMedForm, dosage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frequency:</label>
                  <select
                    value={newMedForm.frequency}
                    onChange={(e) => setNewMedForm({ ...newMedForm, frequency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-blue-500"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="PRN (As needed)">PRN (As needed)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scheduled Time:</label>
                  <input
                    type="text"
                    value={newMedForm.time_of_day}
                    onChange={(e) => setNewMedForm({ ...newMedForm, time_of_day: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Indication:</label>
                <input
                  type="text"
                  placeholder="e.g. Beta-blockade for exertional rate control"
                  value={newMedForm.indication}
                  onChange={(e) => setNewMedForm({ ...newMedForm, indication: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-blue-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewMedModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30"
              >
                Save Prescription
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. REGISTER NEW PATIENT MODAL (CLINICAL EHR REGISTRY) */}
      {newPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleCreatePatient}
            className={`rounded-3xl max-w-2xl w-full p-6 shadow-2xl border space-y-4 my-8 ${
              isDark ? 'bg-[#111726] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Register New Patient Record</h3>
                  <p className="text-xs text-slate-400">Clinical Cardiology EHR Registry & 3D Organ Twin Intake</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewPatientModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Demographics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Margaret Sullivan"
                    value={newPatientForm.name}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                      isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Age (Years) *</label>
                  <input
                    type="number"
                    min="18"
                    max="105"
                    required
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                      isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Biological Sex *</label>
                  <select
                    value={newPatientForm.sex}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, sex: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                      isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value={1}>Male (1)</option>
                    <option value={0}>Female (0)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="m.sullivan@care.org"
                    value={newPatientForm.email}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                      isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 234-5678"
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                      isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Primary Cardiac Condition / Indication</label>
                <input
                  type="text"
                  placeholder="e.g. Exertional Angina with suspected LAD ischemia"
                  value={newPatientForm.primary_condition}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, primary_condition: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Clinical Intake Summary</label>
                <textarea
                  rows={2}
                  value={newPatientForm.clinical_summary}
                  onChange={(e) => setNewPatientForm({ ...newPatientForm, clinical_summary: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Baseline Cardiac Parameters (UCI Cleveland standard) */}
              <div className="pt-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 block mb-2">
                  Baseline UCI Cardiovascular Biomarkers
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1">Resting BP (mm Hg)</label>
                    <input
                      type="number"
                      value={newPatientForm.trestbps}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, trestbps: e.target.value })}
                      className={`w-full px-2.5 py-1.5 rounded-xl font-semibold border text-xs ${
                        isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Cholesterol (mg/dL)</label>
                    <input
                      type="number"
                      value={newPatientForm.chol}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, chol: e.target.value })}
                      className={`w-full px-2.5 py-1.5 rounded-xl font-semibold border text-xs ${
                        isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Max HR (bpm)</label>
                    <input
                      type="number"
                      value={newPatientForm.thalach}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, thalach: e.target.value })}
                      className={`w-full px-2.5 py-1.5 rounded-xl font-semibold border text-xs ${
                        isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">ST Dep. (oldpeak mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newPatientForm.oldpeak}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, oldpeak: e.target.value })}
                      className={`w-full px-2.5 py-1.5 rounded-xl font-semibold border text-xs ${
                        isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Chest Pain Type</label>
                    <select
                      value={newPatientForm.cp}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, cp: e.target.value })}
                      className={`w-full px-2 py-1.5 rounded-xl font-semibold border text-xs ${
                        isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value={1}>Typical Angina (1)</option>
                      <option value={2}>Atypical Angina (2)</option>
                      <option value={3}>Non-anginal Pain (3)</option>
                      <option value={4}>Asymptomatic (4)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Exertional Angina</label>
                    <select
                      value={newPatientForm.exang}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, exang: e.target.value })}
                      className={`w-full px-2 py-1.5 rounded-xl font-semibold border text-xs ${
                        isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value={0}>No (0)</option>
                      <option value={1}>Yes (1)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Fluoroscopy Vessels</label>
                    <select
                      value={newPatientForm.ca}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, ca: e.target.value })}
                      className={`w-full px-2 py-1.5 rounded-xl font-semibold border text-xs ${
                        isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value={0}>0 Major Vessels</option>
                      <option value={1}>1 Major Vessel</option>
                      <option value={2}>2 Major Vessels</option>
                      <option value={3}>3 Major Vessels</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">Thallium Scan</label>
                    <select
                      value={newPatientForm.thal}
                      onChange={(e) => setNewPatientForm({ ...newPatientForm, thal: e.target.value })}
                      className={`w-full px-2 py-1.5 rounded-xl font-semibold border text-xs ${
                        isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value={3}>Normal (3)</option>
                      <option value={6}>Fixed Defect (6)</option>
                      <option value={7}>Reversible Defect (7)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewPatientModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPatient}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmittingPatient ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Registering Patient...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register Patient</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. FILE CLINICAL REPORT MODAL (CLINICIAN ONLY) */}
      {newReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleCreateReport}
            className={`rounded-3xl max-w-2xl w-full p-6 shadow-2xl border space-y-4 my-8 ${
              isDark ? 'bg-[#111726] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">File Official Clinical Report</h3>
                  <p className="text-xs text-slate-400">
                    Patient: {currentPatientMeta?.name || 'Selected Patient'} &bull; MRN: {currentPatientMeta?.id || patientId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewReportModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="font-bold block mb-1">Report Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Comprehensive 3D Cardiovascular Intelligence Dossier"
                  value={newReportForm.title}
                  onChange={(e) => setNewReportForm({ ...newReportForm, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Report Category</label>
                  <select
                    value={newReportForm.report_type}
                    onChange={(e) => setNewReportForm({ ...newReportForm, report_type: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                      isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Cardiology Consultation">Cardiology Consultation</option>
                    <option value="Stress Testing">Stress Testing (Exercise ECG)</option>
                    <option value="Coronary CTA">Coronary CTA & Calcium Scoring</option>
                    <option value="Echocardiography">Transthoracic Echocardiogram (TTE)</option>
                    <option value="Nuclear Cardiology">SPECT Myocardial Perfusion Scan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Signing Physician</label>
                  <input
                    type="text"
                    value={newReportForm.physician_name}
                    onChange={(e) => setNewReportForm({ ...newReportForm, physician_name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                      isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Department</label>
                <input
                  type="text"
                  value={newReportForm.department}
                  onChange={(e) => setNewReportForm({ ...newReportForm, department: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Clinical Findings & Biomarker Evidence</label>
                <textarea
                  rows={3}
                  value={newReportForm.findings}
                  onChange={(e) => setNewReportForm({ ...newReportForm, findings: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Diagnostic Impression</label>
                <textarea
                  rows={2}
                  value={newReportForm.impression}
                  onChange={(e) => setNewReportForm({ ...newReportForm, impression: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Recommendations & Treatment Plan</label>
                <textarea
                  rows={2}
                  value={newReportForm.recommendations}
                  onChange={(e) => setNewReportForm({ ...newReportForm, recommendations: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl font-semibold border focus:outline-blue-500 ${
                    isDark ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewReportModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReport}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmittingReport ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Filing Report...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>File & Sign Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function PathologyComparisonGuide({ pathologyView, setPathologyView, fd = {}, prob = 78, isDark = false }) {
  return (
    <div className={`rounded-3xl p-6 shadow-sm border space-y-6 ${
      isDark ? 'bg-[#111726] border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
    }`}>
      {/* Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Clinical Diagnostic Pathology
            </span>
            <span className="text-xs text-slate-400 font-medium">3D Anatomical Analysis</span>
          </div>
          <h3 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Normal Heart vs. Diseased Heart: Key Differences
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Understanding why the diseased territory appears black (ischemic/necrotic deficit) versus healthy viable pink myocardium.
          </p>
        </div>

        {/* 3D Model Quick Switch Buttons */}
        <div className={`flex items-center gap-2 self-start md:self-auto p-1.5 rounded-2xl border ${
          isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <button
            onClick={() => setPathologyView('normal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              pathologyView === 'normal'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Show Normal Heart in 3D
          </button>
          <button
            onClick={() => setPathologyView('diseased')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              pathologyView === 'diseased'
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/40 ring-2 ring-rose-500/50'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white inline-block" />
            Show Diseased (Black Zone) in 3D
          </button>
        </div>
      </div>

      {/* Side-by-Side Architectural Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Normal Healthy Heart */}
        <div className={`rounded-3xl p-5 border transition-all ${
          pathologyView === 'normal' 
            ? isDark 
              ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/30 shadow-md text-emerald-100'
              : 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-md' 
            : isDark 
            ? 'bg-[#0B0F19] border-slate-800 text-slate-300'
            : 'bg-slate-50/80 border-slate-200/70'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Heart className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h4 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Normal Healthy Heart</h4>
                <span className="text-[10px] font-semibold text-emerald-400">Patent & Fully Perfused</span>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
              isDark 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}>
              Healthy Viable State
            </span>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <strong className={`block ${isDark ? 'text-white' : 'text-slate-900'}`}>Tissue Appearance & Color:</strong>
                <span className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Uniform vibrant muscular pink (<code className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded">#9b1c1c</code>). Rich microvascular capillary saturation with continuous arterial oxygen delivery (<span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>SaO₂ &gt; 98%</span>).
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <strong className={`block ${isDark ? 'text-white' : 'text-slate-900'}`}>Coronary Artery Patency (LAD):</strong>
                <span className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Unobstructed, flexible arterial lumen without calcification (<span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>ca = 0</span>). Full laminar hemodynamics without downstream hypoperfusion.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <strong className={`block ${isDark ? 'text-white' : 'text-slate-900'}`}>Systolic Wall Motion:</strong>
                <span className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Concentric, synchronous contraction across anterior LV and apex. Normal ejection fraction (<span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>LVEF ≥ 60%</span>) and stroke volume.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <div>
                <strong className={`block ${isDark ? 'text-white' : 'text-slate-900'}`}>Stress ECG & Scintigraphy:</strong>
                <span className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Isoelectric flat ST segment (<span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>oldpeak = 0.0 mm</span>), upright T-waves. Homogeneous Thallium SPECT radiotracer uptake without cold defects (<span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>thal = 3</span>).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Diseased / Ischemic Heart (Black Area) */}
        <div className={`rounded-3xl p-5 border transition-all ${
          pathologyView === 'diseased' 
            ? 'bg-slate-900 border-rose-500/70 text-white ring-2 ring-rose-500/30 shadow-xl' 
            : 'bg-slate-800/80 border-slate-700 text-slate-200'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Diseased Heart (Ischemic Territory)</h4>
                <span className="text-[10px] font-semibold text-rose-400">Black Apical Necrosis / Cold Defect</span>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-950 text-rose-300 border border-rose-800">
              Infarction / Ischemia
            </span>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
              <div>
                <strong className="text-rose-200 block">Black Ischemic Defect Territory:</strong>
                <span className="text-slate-300 leading-relaxed">
                  Rendered in <strong className="text-white bg-slate-950 px-1 py-0.5 rounded border border-rose-500/40">stark dark black (#090d16)</strong> on the anterior Left Ventricle & apex. Represents necrotic/hypoperfused tissue deprived of coronary blood flow.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1 shrink-0" />
              <div>
                <strong className="text-amber-200 block">LAD Atherosclerotic Plaque Blockage:</strong>
                <span className="text-slate-300 leading-relaxed">
                  Calcified atheroma plaque ring on the mid-LAD (<span className="font-semibold text-amber-300">ca: {fd.ca ?? 1} vessel(s)</span>) producing critical luminal stenosis (&gt;70%) and upstream resistance.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
              <div>
                <strong className="text-rose-200 block">Regional Wall Hypokinesis:</strong>
                <span className="text-slate-300 leading-relaxed">
                  The dark black ischemic zone experiences contractility failure (hypokinesis / akinesis) due to ATP depletion, lowering effective ejection fraction.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
              <div>
                <strong className="text-rose-200 block">ST Depression & Thallium Cold Defect:</strong>
                <span className="text-slate-300 leading-relaxed">
                  Profound exercise-induced ST depression (<span className="font-semibold text-rose-400">oldpeak = {fd.oldpeak ?? 2.2} mm</span>) and non-viable Thallium cold perfusion defect (<span className="font-semibold text-rose-400">thal = {fd.thal ?? 7}</span>).
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Systematic Clinical Difference Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className={`border-b text-[11px] uppercase tracking-wider font-bold ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}>
              <th className={`py-2.5 px-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Diagnostic Dimension</th>
              <th className={`py-2.5 px-3 rounded-tl-xl ${
                isDark ? 'text-emerald-300 bg-emerald-950/40 border-b border-emerald-800/40' : 'text-emerald-700 bg-emerald-50/70'
              }`}>Normal Healthy Heart</th>
              <th className={`py-2.5 px-3 rounded-tr-xl ${
                isDark ? 'text-rose-300 bg-rose-950/40 border-b border-rose-800/40' : 'text-rose-700 bg-rose-50/70'
              }`}>Diseased Heart (Black Ischemic Area)</th>
              <th className={`py-2.5 px-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Pathophysiological Mechanism</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${
            isDark ? 'divide-slate-800 text-slate-300' : 'divide-slate-100 text-slate-700'
          }`}>
            <tr>
              <td className={`py-3 px-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Anatomical Appearance</td>
              <td className={`py-3 px-3 font-semibold ${
                isDark ? 'bg-emerald-950/20 text-emerald-300' : 'bg-emerald-50/30 text-emerald-900'
              }`}>
                Uniform pink-red viable myocardium (#9b1c1c)
              </td>
              <td className={`py-3 px-3 font-bold flex items-center gap-1.5 ${
                isDark ? 'bg-rose-950/20 text-rose-300' : 'bg-rose-50/30 text-rose-950'
              }`}>
                <span className="w-2 h-2 rounded-full bg-black ring-1 ring-rose-500 inline-block" />
                Dark black ischemic / infarcted zone (#090d16)
              </td>
              <td className={`py-3 px-3 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Severe oxygen deprivation causes myocyte necrosis and lack of capillary perfusion.
              </td>
            </tr>
            <tr>
              <td className={`py-3 px-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Coronary Arteries (LAD)</td>
              <td className={`py-3 px-3 font-semibold ${
                isDark ? 'bg-emerald-950/20 text-emerald-300' : 'bg-emerald-50/30 text-emerald-900'
              }`}>
                Smooth, pliable, patent lumen (ca = 0)
              </td>
              <td className={`py-3 px-3 font-bold ${
                isDark ? 'bg-rose-950/20 text-rose-300' : 'bg-rose-50/30 text-rose-950'
              }`}>
                Calcified plaque ring with &gt;70% lumen stenosis (ca ≥ 1)
              </td>
              <td className={`py-3 px-3 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Atherosclerotic plaque limits exertional coronary flow reserve.
              </td>
            </tr>
            <tr>
              <td className={`py-3 px-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Systolic Wall Motion</td>
              <td className={`py-3 px-3 font-semibold ${
                isDark ? 'bg-emerald-950/20 text-emerald-300' : 'bg-emerald-50/30 text-emerald-900'
              }`}>
                Concentric, vigorous synchronous contraction
              </td>
              <td className={`py-3 px-3 font-bold ${
                isDark ? 'bg-rose-950/20 text-rose-300' : 'bg-rose-50/30 text-rose-950'
              }`}>
                Apical hypokinesis / akinesis (impaired pulsation)
              </td>
              <td className={`py-3 px-3 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ATP starvation impairs actin-myosin cross-bridge cycling.
              </td>
            </tr>
            <tr>
              <td className={`py-3 px-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Stress ECG (oldpeak)</td>
              <td className={`py-3 px-3 font-semibold ${
                isDark ? 'bg-emerald-950/20 text-emerald-300' : 'bg-emerald-50/30 text-emerald-900'
              }`}>
                Flat isoelectric ST segment (0.0 mm)
              </td>
              <td className={`py-3 px-3 font-bold ${
                isDark ? 'bg-rose-950/20 text-rose-300' : 'bg-rose-50/30 text-rose-950'
              }`}>
                ST-segment depression ({fd.oldpeak ?? 2.2} mm horizontal)
              </td>
              <td className={`py-3 px-3 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Subendocardial injury current generates electrical vector shift.
              </td>
            </tr>
            <tr>
              <td className={`py-3 px-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Nuclear Scan (thal)</td>
              <td className={`py-3 px-3 font-semibold ${
                isDark ? 'bg-emerald-950/20 text-emerald-300' : 'bg-emerald-50/30 text-emerald-900'
              }`}>
                Uniform Thallium-201 uptake (thal = 3)
              </td>
              <td className={`py-3 px-3 font-bold ${
                isDark ? 'bg-rose-950/20 text-rose-300' : 'bg-rose-50/30 text-rose-950'
              }`}>
                Fixed or reversible cold defect (thal = {fd.thal ?? 7})
              </td>
              <td className={`py-3 px-3 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Radiotracer cannot penetrate non-perfused necrotic apical tissue.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
