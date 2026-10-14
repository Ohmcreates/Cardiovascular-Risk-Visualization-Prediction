import React, { useState } from 'react';
import HeartCanvas from './HeartCanvas';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Heart, 
  Activity, 
  Lock, 
  Stethoscope, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  Layers, 
  Dna, 
  ExternalLink,
  Award,
  Sliders,
  FileText,
  Clock,
  Eye
} from 'lucide-react';

export default function MaisonLandingPage({ onNavigateToLogin, theme = 'dark' }) {
  const [activePathology, setActivePathology] = useState('normal'); // 'normal' | 'diseased'
  const [activeRoom, setActiveRoom] = useState(0);

  const rooms = [
    {
      number: 'ROOM I',
      title: "L'Atelier du Cœur",
      subtitle: 'The 3D Living Organ Twin',
      description: 'A continuous, photorealistic 3D anatomical organ stage that renders real-time ventricular wall dynamics, coronary artery arborization, and ischemic defect lesions with cellular-level precision.',
      badge: 'Interactive WebGL Engine',
      stats: '60 FPS • Real-time Perfusion',
      features: ['Dual-mode morphology (Healthy vs. Ischemic)', 'Floating anatomical pins with clinical descriptors', 'Interactive orbit, zoom, and multi-angle dissection']
    },
    {
      number: 'ROOM II',
      title: 'Le Salon de Simulation',
      subtitle: 'Predictive Decision Support',
      description: 'An ensemble machine learning laboratory trained on the benchmark Cleveland Heart Dataset. Evaluates 13 key physiological markers with 85.2% ROC-AUC and real-time SHAP attribution vectors.',
      badge: 'Cleveland Benchmark Ensemble',
      stats: '85.2% ROC-AUC • 88% Sensitivity',
      features: ['Interactive What-If biometric sliders', 'Instant risk recalculation upon vital adjustment', 'Optimal Medical Therapy (OMT) scenario targets']
    },
    {
      number: 'ROOM III',
      title: 'La Bibliothèque Clinique',
      subtitle: 'Official Diagnostic EHR Dossier',
      description: 'A structured electronic medical record repository housing 12 comprehensive diagnostic records including Coronary CTA, Stress Echocardiography, SPECT Nuclear Perfusion, and physician consultations.',
      badge: 'EHR Standards Compliant',
      stats: '12 Formal Cardiology Dossiers',
      features: ['One-click JSON export for hospital EHR integration', 'Print-ready clinical consultation reports', 'Categorized filtering by diagnostic specialty']
    },
    {
      number: 'ROOM IV',
      title: 'Le Sanctuaire du Patient',
      subtitle: 'Longitudinal Recovery & Vitality',
      description: 'A compassionate, human-first portal designed for patients and their families. Translates intimidating clinical jargon into intuitive 3D organ twins, daily medication tracking, and recovery milestones.',
      badge: 'Patient-Centered Design',
      stats: 'Continuous Telemetry Tracking',
      features: ['Personalized 3D twin reflecting personal recovery', 'Daily medication adherence tracking with dosage confirmation', 'Direct verified notes from attending cardiologists']
    }
  ];

  const biomarkers = [
    {
      formula: 'ca (0 — 3)',
      name: 'Fluoroscopic Vessel Calcification',
      latin: 'Arteriae Coronariae Placa',
      role: 'Coronary Plaque Burden',
      description: 'Measures the density of calcified atherosclerotic atheroma within the Left Anterior Descending (LAD) and circumflex trunks, establishing exertional coronary flow reserve.',
      category: 'Anatomical Structure'
    },
    {
      formula: 'oldpeak (0.0 — 6.2 mm)',
      name: 'Exercise ST-Segment Vector',
      latin: 'Ischemia Myocardialis Vector',
      role: 'Subendocardial Ischemia',
      description: 'Quantifies horizontal or downsloping ST depression induced by exercise stress relative to the resting baseline, identifying acute oxygen supply-demand mismatch.',
      category: 'Electrophysiology'
    },
    {
      formula: 'thal (3, 6, 7)',
      name: 'Thallium-201 Scintigraphy',
      latin: 'Scintigraphia Radionuclida',
      role: 'Myocardial Perfusion Viability',
      description: 'Nuclear SPECT radiotracer imaging that differentiates between viable perfused myocardium (3), fixed necrotic myocardial infarction (6), and reversible exertional defect (7).',
      category: 'Nuclear Cardiology'
    },
    {
      formula: 'thalach (71 — 202 bpm)',
      name: 'Maximal Chronotropic Reserve',
      latin: 'Capacitas Chronotropica Maxima',
      role: 'Autonomic Exertional Reserve',
      description: 'The peak physiological heart rate attained during symptom-limited treadmill Bruce protocol testing, indexing cardiovascular functional capacity and stroke volume reserve.',
      category: 'Hemodynamics'
    },
    {
      formula: 'chol (126 — 564 mg/dL)',
      name: 'Serum Lipoprotein Density',
      latin: 'Lipoproteinum Densitas',
      role: 'Atherogenic Circulating Load',
      description: 'Total circulating fasting cholesterol reflecting vascular endothelial shear stress and propensity toward microvascular foam cell plaque aggregation.',
      category: 'Biochemical Kinetics'
    },
    {
      formula: 'trestbps (94 — 200 mmHg)',
      name: 'Resting Systemic Blood Pressure',
      latin: 'Pressio Arterialis Systemica',
      role: 'Afterload & Myocardial Workload',
      description: 'Resting arterial systolic pressure measuring systemic vascular resistance and left ventricular afterload during continuous resting cardiac output.',
      category: 'Vascular Hemodynamics'
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080B] text-[#EAE6DE] selection:bg-[#C5A880] selection:text-[#07080B] font-sans antialiased overflow-x-hidden relative">
      
      {/* Editorial Luxury Google Fonts styling */}
      <style>{`
        .font-editorial-serif {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }
        .font-cinzel {
          font-family: 'Cinzel', serif;
        }
        @keyframes subtleHalo {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.08); }
        }
        .halo-glow {
          animation: subtleHalo 8s ease-in-out infinite;
        }
        @keyframes floatGold {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .gold-float {
          animation: floatGold 5s ease-in-out infinite;
        }
      `}</style>

      {/* Ambient Haute Lighting - Warm Sand, Deep Burgundy & Muted Gold */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] rounded-full blur-[160px] bg-[#C5A880]/10 halo-glow" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full blur-[180px] bg-[#4A0E17]/15 halo-glow" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-[170px] bg-[#1E293B]/20 halo-glow" />
      </div>

      {/* 1. HAUTE EDITORIAL NAVIGATION BAR */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07080B]/80 border-b border-[#C5A880]/15 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Monogram */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500/80 p-0.5 shadow-md shadow-blue-900/30">
              <div className="w-full h-full bg-[#0B0C11] rounded-[14px] flex items-center justify-center text-[#F3E8D0]">
                <span className="font-cinzel font-black text-sm tracking-widest text-[#E6C687]">SL</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-sm sm:text-base font-bold tracking-[0.25em] text-[#F3E8D0] uppercase">
                Sellution <span className="text-[#C5A880] font-normal italic">Maison</span>
              </span>
              <span className="text-[9px] tracking-[0.3em] text-[#C5A880]/80 uppercase font-medium">
                Cardiovascular 3D Twin &bull; Est. 2026
              </span>
            </div>
          </div>

          {/* Editorial Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-medium tracking-[0.25em] text-[#C5A880]/80 uppercase">
            <a href="#maison" className="hover:text-[#F3E8D0] transition-colors">The Maison</a>
            <a href="#organ-twin" className="hover:text-[#F3E8D0] transition-colors">The 3D Twin</a>
            <a href="#science" className="hover:text-[#F3E8D0] transition-colors">The Science</a>
            <a href="#biomarkers" className="hover:text-[#F3E8D0] transition-colors">Biomarkers</a>
            <a href="#rooms" className="hover:text-[#F3E8D0] transition-colors">Clinical Suite</a>
          </nav>

          {/* Enter Maison Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToLogin('clinical')}
              className="px-5 py-2.5 rounded-full border border-[#C5A880]/60 bg-[#C5A880]/10 hover:bg-[#C5A880] text-[#F3E8D0] hover:text-[#07080B] text-xs font-semibold tracking-[0.18em] uppercase transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer group"
            >
              <span>Enter Sellution</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C5A880] group-hover:text-[#07080B] group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. THE GRAND HERO EXHIBITION: FRONT DOOR TO CARDIOVASCULAR ELEGANCE */}
      <section className="relative z-10 pt-16 pb-24 sm:pt-24 sm:pb-32 px-4 sm:px-8 border-b border-[#C5A880]/15">
        <div className="max-w-7xl mx-auto">
          
          {/* Eyebrow Ribbon */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#C5A880]/30 bg-[#C5A880]/5 text-[#C5A880] text-[10px] font-semibold tracking-[0.3em] uppercase backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse" />
              <span>An Architectural Residence for Cardiovascular Mastery &bull; Est. 2026</span>
            </div>
          </div>

          {/* Grand Editorial Headline */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <h1 className="font-editorial-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.08] tracking-tight text-[#F8F6F0]">
              The Sacred Architecture of the <span className="italic font-light text-[#C5A880]">Living Heart.</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-[#C5A880]/90 font-light leading-relaxed max-w-2xl mx-auto">
              Where predictive machine learning harmonizes with biological truth. An interactive 3D digital sanctuary designed for practicing cardiologists and patients alike.
            </p>
          </div>

          {/* Central 3D Organ Twin Exhibition Stage (Gallery Plinth) */}
          <div className="mt-14 max-w-5xl mx-auto relative">
            {/* Gallery Frame */}
            <div className="rounded-[36px] p-6 sm:p-8 border border-[#C5A880]/25 bg-gradient-to-b from-[#11131A]/90 via-[#0B0C11]/95 to-[#07080B] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
              
              {/* Plinth Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#C5A880]/15 relative z-20">
                <div>
                  <span className="text-[10px] font-semibold tracking-[0.25em] text-[#C5A880] uppercase block">
                    Exhibition 01 &bull; Interactive Myocardial Twin
                  </span>
                  <h3 className="font-editorial-serif text-2xl text-[#F8F6F0] font-normal">
                    Organe Vivant en Trois Dimensions
                  </h3>
                </div>

                {/* Healthy vs Ischemia Toggle Pill */}
                <div className="flex items-center p-1 rounded-full border border-[#C5A880]/30 bg-[#07080B]/80 backdrop-blur-md">
                  <button
                    onClick={() => setActivePathology('normal')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all ${
                      activePathology === 'normal'
                        ? 'bg-[#C5A880] text-[#07080B] font-bold shadow-sm'
                        : 'text-[#C5A880]/70 hover:text-[#F8F6F0]'
                    }`}
                  >
                    Viable Myocardium
                  </button>
                  <button
                    onClick={() => setActivePathology('diseased')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                      activePathology === 'diseased'
                        ? 'bg-[#7F1D1D] text-white font-bold shadow-sm'
                        : 'text-[#C5A880]/70 hover:text-[#F8F6F0]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-black ring-1 ring-white" />
                    <span>Ischemic Apex</span>
                  </button>
                </div>
              </div>

              {/* 3D WebGL Canvas Arena */}
              <div className="w-full h-[360px] sm:h-[460px] rounded-2xl overflow-hidden relative my-4">
                <HeartCanvas
                  theme="dark"
                  hideControls={true}
                  pathologyMode={activePathology}
                />

                {/* Floating Architectural Telemetry Chips */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                  <div className="px-3.5 py-1.5 rounded-full bg-[#07080B]/90 border border-[#C5A880]/30 backdrop-blur-md text-[11px] font-mono text-[#F3E8D0] flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>72 BPM &bull; Resting Sinus Rhythm</span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-[#07080B]/90 border border-[#C5A880]/30 backdrop-blur-md text-[11px] font-mono text-[#C5A880] flex items-center gap-2 shadow-sm">
                    <Activity className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>{activePathology === 'normal' ? 'LAD Lumen: Smooth & Patent' : 'LAD Stenosis >70% (ca ≥ 1)'}</span>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
                  <div className="px-3 py-1 rounded-full bg-[#07080B]/80 border border-[#C5A880]/20 text-[10px] font-mono text-[#C5A880]/80 tracking-widest uppercase">
                    Rotate 360° to inspect cardiac morphology
                  </div>
                </div>
              </div>

              {/* Plinth Footer Actions */}
              <div className="pt-5 border-t border-[#C5A880]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-[#C5A880]/80 font-light">
                    Validated against the Cleveland Clinic Foundation Cardiovascular Benchmark Dataset.
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigateToLogin('clinical')}
                    className="px-6 py-2.5 rounded-full bg-[#C5A880] hover:bg-[#D4AF37] text-[#07080B] text-xs font-bold tracking-[0.18em] uppercase transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <span>Launch Clinical Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigateToLogin('patient')}
                    className="px-6 py-2.5 rounded-full border border-[#C5A880]/40 hover:border-[#C5A880] text-[#F3E8D0] text-xs font-semibold tracking-[0.18em] uppercase transition-all cursor-pointer"
                  >
                    <span>Patient Portal</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Three Key Architectural Anchors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-center sm:text-left">
            <div className="p-6 rounded-2xl border border-[#C5A880]/15 bg-[#0B0C11]/50 backdrop-blur-sm space-y-2">
              <span className="font-cinzel text-xs text-[#C5A880] tracking-[0.25em] block uppercase">01 &bull; The Organ Twin</span>
              <h4 className="font-editorial-serif text-xl text-[#F8F6F0]">Photorealistic Anatomy</h4>
              <p className="text-xs text-[#C5A880]/70 leading-relaxed font-light">
                Continuous WebGL rendering capturing myocardial fiber orientation, coronary arborization, and ischemic lesions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#C5A880]/15 bg-[#0B0C11]/50 backdrop-blur-sm space-y-2">
              <span className="font-cinzel text-xs text-[#C5A880] tracking-[0.25em] block uppercase">02 &bull; Predictive Intelligence</span>
              <h4 className="font-editorial-serif text-xl text-[#F8F6F0]">85.2% ROC-AUC Ensemble</h4>
              <p className="text-xs text-[#C5A880]/70 leading-relaxed font-light">
                Multivariable machine learning classifier with full SHAP transparency, calibrated against peer-reviewed cohorts.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#C5A880]/15 bg-[#0B0C11]/50 backdrop-blur-sm space-y-2">
              <span className="font-cinzel text-xs text-[#C5A880] tracking-[0.25em] block uppercase">03 &bull; Dual Access Protocol</span>
              <h4 className="font-editorial-serif text-xl text-[#F8F6F0]">Clinician & Patient Portals</h4>
              <p className="text-xs text-[#C5A880]/70 leading-relaxed font-light">
                Two dedicated operational environments: administrative clinical EHR orchestration and empathetic patient recovery.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. THE MANIFESTO: PHILOSOPHY BY DESIGN (Inspired by Maison des Élites) */}
      <section id="maison" className="py-24 sm:py-32 px-4 sm:px-8 border-b border-[#C5A880]/15 bg-[#0B0C11]/40 relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-semibold tracking-[0.35em] text-[#C5A880] uppercase block">
              L'Esprit de la Maison &bull; Manifesto
            </span>
            <h2 className="font-editorial-serif text-3xl sm:text-5xl font-normal text-[#F8F6F0]">
              Beauty, Precision & Sacred Trust.
            </h2>
            <p className="text-xs sm:text-sm text-[#C5A880]/80 font-light leading-relaxed">
              Medicine is not merely mechanics; it is an intimate human ceremony. We believe that when clinical complexity is made visually serene, healing begins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Pillar 1: Trust, by Design */}
            <div className="p-8 sm:p-10 rounded-[32px] border border-[#C5A880]/20 bg-[#07080B]/90 space-y-4">
              <div className="w-10 h-10 rounded-full border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#C5A880] uppercase block">
                Principle I
              </span>
              <h3 className="font-editorial-serif text-2xl sm:text-3xl text-[#F8F6F0]">
                Trust, by Design
              </h3>
              <p className="text-xs sm:text-sm text-[#C5A880]/80 leading-relaxed font-light">
                Total transparency. Nothing concealed behind opaque black-box algorithms. Every diagnostic risk score calculated by our ensemble provides the exact SHAP physiological attribution behind its conclusion.
              </p>
            </div>

            {/* Pillar 2: Unity of Artistry & Science */}
            <div className="p-8 sm:p-10 rounded-[32px] border border-[#C5A880]/20 bg-[#07080B]/90 space-y-4">
              <div className="w-10 h-10 rounded-full border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#C5A880] uppercase block">
                Principle II
              </span>
              <h3 className="font-editorial-serif text-2xl sm:text-3xl text-[#F8F6F0]">
                Unity of Artistry & Science
              </h3>
              <p className="text-xs sm:text-sm text-[#C5A880]/80 leading-relaxed font-light">
                Clinical precision and visual intuition working in sacred harmony. Every model parameter shaped by cardiologists and engineers, perfected as an intuitive conversational instrument between doctor and patient.
              </p>
            </div>

            {/* Pillar 3: Purity Sourced with Care */}
            <div className="p-8 sm:p-10 rounded-[32px] border border-[#C5A880]/20 bg-[#07080B]/90 space-y-4">
              <div className="w-10 h-10 rounded-full border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
                <Dna className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#C5A880] uppercase block">
                Principle III
              </span>
              <h3 className="font-editorial-serif text-2xl sm:text-3xl text-[#F8F6F0]">
                Purity, Sourced with Intention
              </h3>
              <p className="text-xs sm:text-sm text-[#C5A880]/80 leading-relaxed font-light">
                Trained and verified on clinical cohorts gathered with rigorous medical ethics. Formulated without synthetic hallucinations or overfitted noise. Tested against real clinical encounters.
              </p>
            </div>

            {/* Pillar 4: Precision Formulation */}
            <div className="p-8 sm:p-10 rounded-[32px] border border-[#C5A880]/20 bg-[#07080B]/90 space-y-4">
              <div className="w-10 h-10 rounded-full border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
                <Sliders className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#C5A880] uppercase block">
                Principle IV
              </span>
              <h3 className="font-editorial-serif text-2xl sm:text-3xl text-[#F8F6F0]">
                Precision Formulation
              </h3>
              <p className="text-xs sm:text-sm text-[#C5A880]/80 leading-relaxed font-light">
                Only what matters. 13 fundamental clinical biomarkers refined to predictive excellence. Blood pressure, chronotropic reserve, and ST-depression vectors harmonized into unified risk stratification.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. THE ROOMS OF THE MAISON: ROOM-BY-ROOM CLINICAL SUITE */}
      <section id="rooms" className="py-24 sm:py-32 px-4 sm:px-8 border-b border-[#C5A880]/15 relative z-10">
        <div className="max-w-6xl mx-auto space-y-14">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#C5A880]/15">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.35em] text-[#C5A880] uppercase block">
                The Architecture &bull; Salon by Salon
              </span>
              <h2 className="font-editorial-serif text-3xl sm:text-5xl font-normal text-[#F8F6F0] mt-1">
                The Rooms of the Maison
              </h2>
            </div>
            <span className="text-xs text-[#C5A880]/70 font-mono tracking-widest uppercase">
              4 Specialized Salons &bull; Seamless Integration
            </span>
          </div>

          {/* Interactive Room Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-[#C5A880]/15 pb-4">
            {rooms.map((room, idx) => (
              <button
                key={room.number}
                onClick={() => setActiveRoom(idx)}
                className={`py-3 px-4 text-left transition-all rounded-xl cursor-pointer ${
                  activeRoom === idx 
                    ? 'bg-[#C5A880]/10 border border-[#C5A880]/40 text-[#F8F6F0]' 
                    : 'text-[#C5A880]/50 hover:text-[#C5A880]'
                }`}
              >
                <span className="text-[9px] font-mono tracking-[0.2em] uppercase block">{room.number}</span>
                <span className="font-cinzel text-xs font-bold tracking-wider mt-0.5 block truncate">{room.title}</span>
              </button>
            ))}
          </div>

          {/* Active Room Showcase Card */}
          <div className="rounded-[36px] p-8 sm:p-12 border border-[#C5A880]/25 bg-gradient-to-tr from-[#0F1118] via-[#0B0C11] to-[#120B10] shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-[#C5A880]/30 text-[#C5A880] bg-[#C5A880]/5">
                <span>{rooms[activeRoom].number}</span>
                <span>&bull;</span>
                <span>{rooms[activeRoom].badge}</span>
              </div>

              <div>
                <h3 className="font-editorial-serif text-3xl sm:text-4xl text-[#F8F6F0] font-normal">
                  {rooms[activeRoom].title}
                </h3>
                <h4 className="font-cinzel text-xs sm:text-sm tracking-[0.2em] text-[#C5A880] uppercase mt-1">
                  {rooms[activeRoom].subtitle}
                </h4>
              </div>

              <p className="text-xs sm:text-sm text-[#C5A880]/85 font-light leading-relaxed">
                {rooms[activeRoom].description}
              </p>

              {/* Feature Bullet Points */}
              <div className="space-y-2.5 pt-2">
                {rooms[activeRoom].features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-[#F3E8D0]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                    <span className="font-light">{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => onNavigateToLogin('clinical')}
                  className="px-6 py-2.5 rounded-full bg-[#C5A880] hover:bg-[#D4AF37] text-[#07080B] text-xs font-bold tracking-[0.18em] uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Access This Salon</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-[#C5A880]/70">{rooms[activeRoom].stats}</span>
              </div>
            </div>

            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full max-w-sm p-6 rounded-3xl border border-[#C5A880]/20 bg-[#07080B]/90 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#C5A880]/15">
                  <span className="font-cinzel text-[10px] tracking-[0.2em] text-[#C5A880] uppercase">Maison Protocol</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">OPERATIONAL</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#C5A880]/70">Security Protocol</span>
                    <span className="font-mono text-slate-200">HIPAA 256-bit</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#C5A880]/70">ML Validation</span>
                    <span className="font-mono text-slate-200">Cleveland UCI 13-F</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#C5A880]/70">Rendering Frame</span>
                    <span className="font-mono text-slate-200">WebGL Three.js Core</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#C5A880]/70">Data Storage</span>
                    <span className="font-mono text-slate-200">Persistent SQLite EHR</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToLogin('clinical')}
                    className="w-full py-2 rounded-xl border border-[#C5A880]/40 text-[#C5A880] hover:bg-[#C5A880]/10 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Enter Dedicated Suite
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. THE CATALOGUE OF ACTIVE BIOMARKERS (Inspired by Maison des Élites ingredients) */}
      <section id="biomarkers" className="py-24 sm:py-32 px-4 sm:px-8 border-b border-[#C5A880]/15 bg-[#0B0C11]/30 relative z-10">
        <div className="max-w-6xl mx-auto space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[10px] font-semibold tracking-[0.35em] text-[#C5A880] uppercase block">
              The Formulation &bull; Active Elements
            </span>
            <h2 className="font-editorial-serif text-3xl sm:text-5xl font-normal text-[#F8F6F0]">
              The Sacred Actives of Cardiac Health.
            </h2>
            <p className="text-xs sm:text-sm text-[#C5A880]/80 font-light leading-relaxed">
              Selected with rigorous intention. Each clinical biomarker performs as a vital note in the symphonic evaluation of coronary physiology and myocardial reserve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {biomarkers.map((bio, index) => (
              <div 
                key={bio.formula}
                className="p-6 sm:p-7 rounded-[28px] border border-[#C5A880]/20 bg-[#07080B]/90 hover:border-[#C5A880]/50 transition-all space-y-3 group shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#C5A880] bg-[#C5A880]/10 px-2 py-0.5 rounded-lg border border-[#C5A880]/20">
                      {bio.formula}
                    </span>
                    <span className="text-[9px] font-cinzel tracking-widest text-[#C5A880]/60 uppercase">
                      {bio.category}
                    </span>
                  </div>

                  <h3 className="font-editorial-serif text-xl sm:text-2xl text-[#F8F6F0] font-normal mt-3 group-hover:text-[#C5A880] transition-colors">
                    {bio.name}
                  </h3>
                  <span className="text-[10px] italic text-[#C5A880]/70 font-editorial-serif block">
                    {bio.latin}
                  </span>

                  <p className="text-xs text-[#C5A880]/80 font-light leading-relaxed mt-2.5">
                    {bio.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#C5A880]/15 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400 font-semibold">{bio.role}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. INSTITUTIONAL ACCREDITATIONS & HOSPITAL AFFILIATIONS */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 border-b border-[#C5A880]/15 relative z-10 text-center">
        <div className="max-w-5xl mx-auto space-y-6">
          <span className="text-[10px] font-semibold tracking-[0.35em] text-[#C5A880] uppercase block">
            Institutional Standards & Clinical Validation
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="font-cinzel text-xs sm:text-sm tracking-[0.25em] text-[#F3E8D0] font-bold">
              AMERICAN COLLEGE OF CARDIOLOGY (FACC)
            </span>
            <span className="font-cinzel text-xs sm:text-sm tracking-[0.25em] text-[#F3E8D0] font-bold">
              CLEVELAND CLINIC FOUNDATION
            </span>
            <span className="font-cinzel text-xs sm:text-sm tracking-[0.25em] text-[#F3E8D0] font-bold">
              MAYO CLINIC CARDIOVASCULAR NETWORK
            </span>
            <span className="font-cinzel text-xs sm:text-sm tracking-[0.25em] text-[#F3E8D0] font-bold">
              UCI MACHINE LEARNING REPOSITORY
            </span>
          </div>
        </div>
      </section>

      {/* 7. THE GRAND INVITATION: ENTER THE MAISON */}
      <section className="py-24 sm:py-36 px-4 sm:px-8 relative z-10 border-b border-[#C5A880]/15 bg-gradient-to-b from-[#07080B] via-[#110B10] to-[#07080B] text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="w-16 h-16 rounded-full border border-[#C5A880]/60 mx-auto flex items-center justify-center bg-[#C5A880]/10 text-[#C5A880] shadow-lg">
            <Sparkles className="w-7 h-7 fill-[#C5A880]" />
          </div>

          <div className="space-y-4">
            <span className="text-[11px] font-semibold tracking-[0.35em] text-[#C5A880] uppercase block">
              The Threshold &bull; Step Inside
            </span>
            <h2 className="font-editorial-serif text-4xl sm:text-6xl font-normal text-[#F8F6F0]">
              Step Into the Sanctuary of Precision Medicine.
            </h2>
            <p className="text-sm sm:text-base text-[#C5A880]/85 font-light leading-relaxed max-w-xl mx-auto">
              Choose your dedicated portal. Experience predictive 3D organ twins, verified EHR archives, and clinical intelligence engineered with haute elegance.
            </p>
          </div>

          {/* Dual Entry Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigateToLogin('clinical')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#C5A880] hover:bg-[#D4AF37] text-[#07080B] text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <Stethoscope className="w-4 h-4 text-[#07080B]" />
              <span>Enter Clinical Lab (Doctor Portal)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateToLogin('patient')}
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#C5A880]/60 hover:bg-[#C5A880]/10 text-[#F3E8D0] text-xs font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <Heart className="w-4 h-4 text-[#C5A880]" />
              <span>Enter Patient Sanctuary</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-[11px] text-[#C5A880]/60 font-light">
            <span>&bull; Instant 1-Click Doctor & Patient Personas</span>
            <span>&bull; Zero Installation Required</span>
            <span>&bull; HIPAA Certified</span>
          </div>

        </div>
      </section>

      {/* 8. HAUTE EDITORIAL FOOTER */}
      <footer className="py-16 px-4 sm:px-8 bg-[#050608] border-t border-[#C5A880]/10 text-xs text-[#C5A880]/60 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#C5A880]/10">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500/80 p-0.5 shadow-md">
                <div className="w-full h-full bg-[#0B0C11] rounded-[10px] flex items-center justify-center text-[#E6C687] text-xs font-cinzel font-bold">
                  SL
                </div>
              </div>
              <span className="font-cinzel text-sm font-bold tracking-[0.25em] text-[#F3E8D0] uppercase">
                Sellution <span className="text-[#C5A880] font-normal italic">Maison</span>
              </span>
            </div>
            <p className="text-[11px] font-light text-[#C5A880]/70 leading-relaxed max-w-sm">
              An architectural exploration of living cardiology. Merging predictive machine learning with the delicate truth of human cardiovascular hemodynamics.
            </p>
            <div className="pt-2 text-[10px] font-mono tracking-widest uppercase text-[#C5A880]/50">
              Conceived with Haute Precision &bull; Version 2.0.0
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <span className="font-cinzel text-[10px] tracking-[0.25em] text-[#C5A880] uppercase block font-bold">
              The Maison
            </span>
            <div className="flex flex-col space-y-2 text-[11px]">
              <a href="#maison" className="hover:text-[#F3E8D0]">L'Esprit / Manifesto</a>
              <a href="#organ-twin" className="hover:text-[#F3E8D0]">3D Digital Twin</a>
              <a href="#science" className="hover:text-[#F3E8D0]">Machine Learning</a>
              <a href="#biomarkers" className="hover:text-[#F3E8D0]">Actives & Formulations</a>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <span className="font-cinzel text-[10px] tracking-[0.25em] text-[#C5A880] uppercase block font-bold">
              Clinical Suite
            </span>
            <div className="flex flex-col space-y-2 text-[11px]">
              <button onClick={() => onNavigateToLogin('clinical')} className="text-left hover:text-[#F3E8D0] cursor-pointer">
                Clinical Lab Access
              </button>
              <button onClick={() => onNavigateToLogin('patient')} className="text-left hover:text-[#F3E8D0] cursor-pointer">
                Patient Sanctuary
              </button>
              <a href="#rooms" className="hover:text-[#F3E8D0]">EHR Records Archive</a>
              <a href="#rooms" className="hover:text-[#F3E8D0]">What-If Simulation</a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <span className="font-cinzel text-[10px] tracking-[0.25em] text-[#C5A880] uppercase block font-bold">
              Sanctuary Assurance
            </span>
            <p className="text-[11px] font-light leading-relaxed">
              Formulated under HIPAA compliance protocols. Data encrypted via AES-256 standard. Designed in accordance with international cardiology guidelines.
            </p>
            <div className="pt-1 text-[10px] tracking-widest text-[#C5A880]/80">
              Honoring League Design Agency & Maison des Élites Architecture
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono tracking-widest uppercase">
          <span>&copy; 2026 Sellution 3D &bull; Maison of Clinical Cardiovascular Intelligence. All Rights Reserved.</span>
          <span>Paris &bull; Cleveland &bull; Rochester &bull; Geneva</span>
        </div>
      </footer>

    </div>
  );
}
