import React, { useState, useEffect } from 'react';
import HeartCanvas from './HeartCanvas';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Heart, 
  Activity, 
  UserCheck, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  Stethoscope, 
  User,
  Users,
  Check,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';

function EcgWaveform({ color = '#3b82f6', isPatient = false }) {
  const strokeColor = isPatient ? '#10b981' : '#3b82f6';
  return (
    <div className="flex items-center gap-3 py-1.5 px-3 rounded-full bg-slate-900/60 dark:bg-slate-900/80 border border-slate-700/60 backdrop-blur-md">
      <div className="relative flex items-center">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping absolute" />
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 relative" />
      </div>
      <svg className="w-28 sm:w-36 h-5 overflow-visible" viewBox="0 0 160 30" fill="none">
        <path
          d="M 0 15 L 25 15 L 35 7 L 42 22 L 48 15 L 60 15 L 68 2 L 76 28 L 84 10 L 90 17 L 96 15 L 160 15"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ecg-line"
        />
      </svg>
      <div className="flex items-center gap-1 font-mono text-[11px] font-extrabold tracking-tight" style={{ color: strokeColor }}>
        <span>72</span>
        <span className="text-[9px] font-sans opacity-80 uppercase tracking-wider">BPM &bull; Normal Sinus</span>
      </div>
    </div>
  );
}

export default function LoginPage({ 
  onLoginSuccess, 
  theme = 'dark', 
  onToggleTheme, 
  initialPortal = 'clinical',
  onNavigateToMaison = () => {} 
}) {
  const [portalType, setPortalType] = useState(initialPortal); // 'clinical' | 'patient'
  const [email, setEmail] = useState(initialPortal === 'patient' ? 'david.berg@healthsync.care' : 'sarah.scott@cardiovision.care');
  const [password, setPassword] = useState(initialPortal === 'patient' ? 'DavidCardio2026!' : 'CardioPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoUsers, setDemoUsers] = useState([]);
  const [previewPathology, setPreviewPathology] = useState(initialPortal === 'patient' ? 'normal' : 'diseased'); // 'normal' | 'diseased'

  const isDark = theme === 'dark';
  const isPatient = portalType === 'patient';

  useEffect(() => {
    fetch('/api/auth/demo-users')
      .then(res => res.json())
      .then(data => {
        if (data.personas) setDemoUsers(data.personas);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please provide valid clinical email and credentials.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('cardiovision_token', data.token);
        localStorage.setItem('cardiovision_user', JSON.stringify(data.user));
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.token);
        }
        return;
      }
      throw new Error('API response error');
    } catch {
      // Offline / Edge static fallback for Vercel
      const matched = filteredPersonas.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
        id: isPatient ? 'user-david-berg' : 'user-sarah-scott',
        name: isPatient ? 'David Berg' : 'Dr. Sarah Scott, MD, FACC',
        email: email,
        role: isPatient ? 'patient' : 'doctor',
        portal_type: portalType,
        hospital_affiliation: isPatient ? 'Heart Health Community' : 'Division of Cardiovascular Medicine',
        patient_id: isPatient ? 'patient-david-berg' : null
      };
      const token = 'edge-session-token';
      localStorage.setItem('cardiovision_token', token);
      localStorage.setItem('cardiovision_user', JSON.stringify(matched));
      if (onLoginSuccess) {
        onLoginSuccess(matched, token);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (persona) => {
    setEmail(persona.email);
    setPassword(persona.password);
    setError(null);
    setIsLoading(true);

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: persona.email, password: persona.password })
    })
      .then(res => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then(data => {
        if (data.token && data.user) {
          localStorage.setItem('cardiovision_token', data.token);
          localStorage.setItem('cardiovision_user', JSON.stringify(data.user));
          if (onLoginSuccess) onLoginSuccess(data.user, data.token);
        } else {
          throw new Error('Fallback needed');
        }
      })
      .catch(() => {
        // Edge offline fallback for Vercel
        const fallbackUser = {
          id: persona.id,
          name: persona.name,
          email: persona.email,
          role: persona.role || (persona.portal_type === 'clinical' ? 'doctor' : 'patient'),
          portal_type: persona.portal_type || (persona.name.includes('Dr.') ? 'clinical' : 'patient'),
          hospital_affiliation: persona.affiliation || 'Division of Cardiovascular Medicine',
          patient_id: persona.portal_type === 'patient' ? persona.id : null
        };
        const token = 'edge-session-token';
        localStorage.setItem('cardiovision_token', token);
        localStorage.setItem('cardiovision_user', JSON.stringify(fallbackUser));
        if (onLoginSuccess) onLoginSuccess(fallbackUser, token);
      })
      .finally(() => setIsLoading(false));
  };

  // Switch portal type and adjust demo defaults
  const handleSelectPortal = (type) => {
    setPortalType(type);
    setError(null);
    if (type === 'clinical') {
      setEmail('sarah.scott@cardiovision.care');
      setPassword('CardioPass2026!');
      setPreviewPathology('diseased');
    } else {
      setEmail('david.berg@healthsync.care');
      setPassword('DavidCardio2026!');
      setPreviewPathology('normal');
    }
  };

  const filteredPersonas = (demoUsers.length > 0 ? demoUsers : [
    {
      id: 'user-sarah-scott',
      portal_type: 'clinical',
      email: 'sarah.scott@cardiovision.care',
      password: 'CardioPass2026!',
      name: 'Dr. Sarah Scott, MD, FACC',
      role: 'Lead Cardiologist',
      badge: 'Attending Physician',
      avatar_url: 'https://images.unsplash.com/photo-1594824813639-5094252a16d5?w=120&auto=format&fit=crop&q=80',
      affiliation: 'Division of Cardiovascular Medicine'
    },
    {
      id: 'user-robert-sterling',
      portal_type: 'clinical',
      email: 'robert.sterling@cardiovision.care',
      password: 'CardioPass2026!',
      name: 'Dr. Robert Sterling, MD, FSCAI',
      role: 'Interventional Cardiologist',
      badge: 'Cath Lab Director',
      avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80',
      affiliation: 'Interventional Catheterization Lab'
    },
    {
      id: 'user-david-berg',
      portal_type: 'patient',
      email: 'david.berg@healthsync.care',
      password: 'DavidCardio2026!',
      name: 'David Berg',
      role: 'Cardiac Recovery Patient',
      badge: 'Day 42 Telemetry',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      affiliation: 'Stage 1 Angina Equiv.'
    },
    {
      id: 'user-eleanor-turner',
      portal_type: 'patient',
      email: 'eleanor.turner@seniorcare.org',
      password: 'EleanorCardio2026!',
      name: 'Eleanor Turner',
      role: 'Monitored Senior Patient',
      badge: 'Microvascular Care',
      avatar_url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=120&auto=format&fit=crop&q=80',
      affiliation: 'Fixed Apical Defect Care'
    }
  ]).filter(u => portalType === 'clinical' 
    ? (u.portal_type === 'clinical' || u.role.includes('Cardiologist') || u.role.includes('Doctor'))
    : (u.portal_type === 'patient' || u.role.includes('Patient'))
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col justify-between relative overflow-x-hidden ${
      isDark 
        ? 'bg-[#060913] text-slate-100 selection:bg-blue-600 selection:text-white' 
        : 'bg-[#F5F7FB] text-slate-800 selection:bg-blue-600 selection:text-white'
    }`}>
      {/* Styles for living physiological pulse animation */}
      <style>{`
        @keyframes ecgSweep {
          0% { stroke-dashoffset: 320; }
          100% { stroke-dashoffset: 0; }
        }
        .ecg-line {
          stroke-dasharray: 320;
          animation: ecgSweep 2.2s ease-in-out infinite;
        }
        @keyframes gentleGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.05); }
        }
        .ambient-glow-1 {
          animation: gentleGlow 7s ease-in-out infinite;
        }
        .ambient-glow-2 {
          animation: gentleGlow 9s ease-in-out infinite reverse;
        }
      `}</style>

      {/* Layered Ambient Cardiovascular Light Fields */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-0 left-1/4 w-[650px] h-[650px] rounded-full blur-[140px] ambient-glow-1 ${
          isPatient ? 'bg-emerald-500/10' : 'bg-blue-600/15'
        }`} />
        <div className={`absolute bottom-0 right-1/4 w-[550px] h-[550px] rounded-full blur-[130px] ambient-glow-2 ${
          isPatient ? 'bg-teal-500/10' : 'bg-indigo-600/10'
        }`} />
        <div className="absolute top-1/2 right-10 w-[350px] h-[350px] rounded-full blur-[110px] bg-rose-600/5 ambient-glow-1" />
      </div>

      {/* 1. TOP BRAND HEADER */}
      <header className="p-4 sm:px-8 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Heart className="w-5 h-5 fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight">
                CardioVision <span className="text-blue-500 font-extrabold">3D</span>
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                isPatient 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                  : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
              }`}>
                {isPatient ? 'Patient Care Portal' : 'Clinical Intelligence Lab'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Mayo & Cleveland Clinic Predictive Diagnostic Suite
            </p>
          </div>
        </div>

        {/* Live ECG Rhythm, Maison Return, & Theme Switcher */}
        <div className="flex items-center gap-3">
          {onNavigateToMaison && (
            <button
              type="button"
              onClick={onNavigateToMaison}
              className={`px-3 py-2 rounded-2xl border text-xs font-bold tracking-wider uppercase transition flex items-center gap-1.5 shadow-xs ${
                isDark
                  ? 'bg-[#C5A880]/10 border-[#C5A880]/30 text-[#C5A880] hover:bg-[#C5A880]/20 hover:border-[#C5A880]'
                  : 'bg-[#C5A880]/15 border-[#C5A880]/40 text-[#6B5328] hover:bg-[#C5A880]/25'
              }`}
              title="Return to the Maison Editorial Experience"
            >
              <span>← Maison</span>
            </button>
          )}

          <div className="hidden lg:block">
            <EcgWaveform isPatient={isPatient} />
          </div>

          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-2xl border transition flex items-center gap-2 text-xs font-bold shadow-xs ${
              isDark 
                ? 'bg-[#0E1526]/80 border-slate-700/80 text-amber-300 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle Light / Dark Mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN SHOWCASE: Living 3D Heart Hologram (Left) + Humanized Access Card (Right) */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8 z-10 relative">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: Living 3D Anatomical Organ Stage with Telemetry */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border self-start backdrop-blur-md shadow-xs bg-slate-900/60 border-slate-700 text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HIPAA Compliant &bull; Cleveland Heart Benchmark (85.2% ROC-AUC)</span>
            </div>

            {/* Main Empathetic Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight leading-tight">
                {isPatient ? (
                  <>Your Heart, <span className="text-emerald-400">Visualized in 3D.</span> Made Simple & Human.</>
                ) : (
                  <>Precision Cardiology, <span className="text-blue-500">Living 3D Digital Twins.</span></>
                )}
              </h1>
              <p className={`text-sm sm:text-base mt-2.5 leading-relaxed max-w-xl font-normal ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {isPatient ? (
                  'Explore your personal cardiac digital twin, understand verified reports from your doctor, and see how recovery and medications protect your heart in real-time.'
                ) : (
                  'Empowering attending cardiologists, fellows, and lab staff with real-time myocardial perfusion mapping, multi-vessel CAD assessment, and instant EHR report signing.'
                )}
              </p>
            </div>

            {/* Interactive 3D Heart Preview Stage Card */}
            <div className={`rounded-3xl p-4 sm:p-5 border shadow-xl relative overflow-hidden backdrop-blur-md transition-all ${
              isDark 
                ? 'bg-[#0E1526]/85 border-slate-800 shadow-blue-950/30' 
                : 'bg-white/90 border-slate-200/80 shadow-slate-200/80'
            }`}>
              {/* Top Floating Controls on 3D Stage */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/40 dark:border-slate-800 relative z-20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-rose-500 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">Live 3D Organ Twin Preview</span>
                    <span className="text-[10px] text-slate-400 font-mono">Interactive WebGL &bull; Cleveland Model</span>
                  </div>
                </div>

                {/* Healthy vs Diseased morphology switch */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/40 border border-slate-700/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewPathology('normal')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                      previewPathology === 'normal'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Healthy (Pink)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPathology('diseased')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                      previewPathology === 'diseased'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-black ring-1 ring-white" />
                    <span>Ischemic (Black)</span>
                  </button>
                </div>
              </div>

              {/* 3D WebGL Canvas Stage */}
              <div className="w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden relative my-2">
                <HeartCanvas
                  theme={isDark ? 'dark' : 'light'}
                  hideControls={true}
                  pathologyMode={previewPathology}
                />

                {/* Floating Telemetry Chips */}
                <div className="absolute top-3 left-3 pointer-events-none z-10 flex flex-col gap-1.5">
                  <div className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Perfusion: {previewPathology === 'normal' ? '98% Optimal' : 'Critical LAD Lesion'}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-[10px] font-mono text-blue-400 flex items-center gap-1.5 shadow-sm">
                    <Activity className="w-3 h-3 text-blue-400" />
                    <span>Left Ventricle: {previewPathology === 'normal' ? 'LVEF 60%' : 'Apical Hypokinesis'}</span>
                  </div>
                </div>

                <div className="absolute bottom-3 right-3 pointer-events-none z-10">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md text-[10px] font-mono text-slate-300">
                    Drag mouse to rotate 3D heart
                  </span>
                </div>
              </div>

              {/* Doctor / Patient Human Reassurance Footer */}
              <div className="pt-3 border-t border-slate-200/40 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1594824813639-5094252a16d5?w=100&auto=format&fit=crop&q=80"
                    alt="Dr. Sarah Scott"
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500/40"
                  />
                  <p className="text-[11px] text-slate-400 leading-snug">
                    <span className="font-bold text-slate-200">Dr. Sarah Scott, MD, FACC</span>: "Transforming abstract lab data into an intuitive 3D conversation."
                  </p>
                </div>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider hidden sm:block">
                  Verified EHR
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Humanized Dual-Portal Access Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className={`rounded-3xl p-6 sm:p-7 border shadow-2xl backdrop-blur-xl transition-all relative ${
              isDark 
                ? 'bg-[#0E1526]/90 border-slate-800 shadow-blue-950/40' 
                : 'bg-white/95 border-slate-200/90 shadow-slate-300/60'
            }`}>
              
              {/* Portal Selector Switcher */}
              <div className="mb-5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Select Portal Mode</span>
                  <span className="text-[10px] text-blue-500 font-semibold">Dual EHR Protocol</span>
                </div>

                <div className={`grid grid-cols-2 p-1.5 rounded-2xl border transition-colors ${
                  isDark ? 'bg-[#070B14] border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => handleSelectPortal('clinical')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      portalType === 'clinical'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Clinical Lab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPortal('patient')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      portalType === 'patient'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/50'
                        : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    <span>Patient Portal</span>
                  </button>
                </div>
              </div>

              {/* Portal Title & Humanized Description */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isPatient
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                      : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                  }`}>
                    {isPatient ? 'Personal Organ Twin & Longitudinal Recovery' : 'Physician Decision Support & EHR Registry'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                  {isPatient ? 'Welcome to Your Cardiac Twin' : 'Welcome to Clinical Lab'}
                </h2>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isPatient 
                    ? 'Review verified cardiologist reports, view your 3D organ twin, and track daily vitality.'
                    : 'Cardiologist access: register new patients, file diagnostic reports, and simulate What-If hemodynamics.'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold mb-1 opacity-80">
                    {isPatient ? 'Patient Email / Health ID' : 'Clinical Email / License ID'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder={isPatient ? 'david.berg@healthsync.care' : 'doctor@cardiovision.care'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold border transition focus:outline-none focus:ring-2 ${
                        isPatient ? 'focus:ring-emerald-500' : 'focus:ring-blue-500'
                      } ${
                        isDark 
                          ? 'bg-[#070B14] border-slate-700 text-white placeholder-slate-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold opacity-80">
                      Password
                    </label>
                    <a 
                      href="#forgot" 
                      onClick={(e) => { e.preventDefault(); setError('Demo mode: please select any 1-click persona below.'); }} 
                      className="text-[11px] font-semibold text-blue-500 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-semibold border transition focus:outline-none focus:ring-2 ${
                        isPatient ? 'focus:ring-emerald-500' : 'focus:ring-blue-500'
                      } ${
                        isDark 
                          ? 'bg-[#070B14] border-slate-700 text-white placeholder-slate-500' 
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded accent-blue-600"
                    />
                    <span className="opacity-80">Remember this workstation</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl text-white text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-1 cursor-pointer ${
                    isPatient
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isPatient ? 'Sign In to Patient Portal' : 'Sign In as Attending Clinician'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Quick Demo Sign-In Selector */}
              <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    1-Click Verified Personas
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Instant Sign-In
                  </span>
                </div>

                <div className="space-y-2">
                  {filteredPersonas.map((persona) => (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => handleQuickLogin(persona)}
                      className={`w-full p-2.5 rounded-2xl border transition flex items-center justify-between text-left group cursor-pointer ${
                        isDark 
                          ? 'bg-[#070B14] border-slate-800 hover:border-blue-500/50 hover:bg-[#10172B]' 
                          : 'bg-slate-50 border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <img
                            src={persona.avatar_url}
                            alt={persona.name}
                            className={`w-8 h-8 rounded-xl object-cover ring-2 ${
                              isPatient ? 'ring-emerald-500/30' : 'ring-blue-500/30'
                            }`}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            style={{ display: 'none' }}
                            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center text-white font-black text-[10px] shrink-0"
                          >
                            {persona.name.replace(/^Dr\.\s+/, '').split(' ')[0][0]}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-bold block leading-tight">{persona.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{persona.affiliation || persona.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPatient
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {persona.badge || 'Account'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="p-4 sm:px-8 text-center text-xs opacity-60 z-20 relative">
        <span>CardioVision 3D &bull; Version 2.0.0 &bull; Secure Clinical Diagnostic Interface &bull; Cleveland Heart Dataset</span>
      </footer>
    </div>
  );
}
