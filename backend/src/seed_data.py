"""
CardioVision 3D - Production Database Seeder
Initializes database schema and seeds realistic clinical data:
patients, historical assessments, longitudinal vitals, medications, 12 diagnostic reports, and lab panels.
"""
from datetime import datetime, timedelta
import json
from database import engine, SessionLocal, Base
from models_db import (
    PatientModel, AssessmentRecordModel, VitalLogModel,
    MedicationModel, LabResultModel, ClinicalReportModel, AuditLogModel,
    UserModel, hash_password
)

def init_db():
    """Create all tables in the database."""
    Base.metadata.create_all(bind=engine)

def seed_users_if_needed(db):
    """Seed default clinician and patient users for authentication."""
    if db.query(UserModel).count() == 0:
        sarah_user = UserModel(
            id="user-sarah-scott",
            email="sarah.scott@cardiovision.care",
            password_hash=hash_password("CardioPass2026!"),
            name="Dr. Sarah Scott, MD, FACC",
            role="cardiologist",
            license_number="MD-98412-FACC",
            hospital_affiliation="Division of Cardiovascular Medicine",
            avatar_url="https://images.unsplash.com/photo-1594824813639-5094252a16d5?w=120&auto=format&fit=crop&q=80",
            token="demo-token-sarah-scott-2026"
        )
        david_user = UserModel(
            id="user-david-berg",
            email="david.berg@healthsync.care",
            password_hash=hash_password("DavidCardio2026!"),
            name="David Berg",
            role="patient",
            patient_id="patient-david-berg",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
            token="demo-token-david-berg-2026"
        )
        robert_user = UserModel(
            id="user-robert-sterling",
            email="robert.sterling@cardiovision.care",
            password_hash=hash_password("CardioPass2026!"),
            name="Dr. Robert Sterling, MD, FSCAI",
            role="cardiologist",
            license_number="MD-45129-FSCAI",
            hospital_affiliation="Interventional Catheterization Lab",
            avatar_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&auto=format&fit=crop&q=80",
            token="demo-token-robert-sterling-2026"
        )
        eleanor_user = UserModel(
            id="user-eleanor-turner",
            email="eleanor.turner@seniorcare.org",
            password_hash=hash_password("EleanorCardio2026!"),
            name="Eleanor T.",
            role="patient",
            patient_id="patient-eleanor-t",
            avatar_url="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=120&auto=format&fit=crop&q=80",
            token="demo-token-eleanor-turner-2026"
        )
        db.add_all([sarah_user, david_user, robert_user, eleanor_user])
        db.commit()
        print("Default clinician and patient credentials seeded.")

def seed_database():
    """Seed production database with realistic cardiology cohorts and records."""
    init_db()
    db = SessionLocal()
    try:
        seed_users_if_needed(db)

        if db.query(PatientModel).count() > 0:
            print("Database already contains patient data. Skipping patient seed.")
            return

        print("Seeding production cardiology clinical database...")
        now = datetime.utcnow()

        # -------------------------------------------------------------
        # 1. DAVID BERG (Primary Interactive Patient)
        # -------------------------------------------------------------
        david = PatientModel(
            id="patient-david-berg",
            name="David Berg",
            slug="david",
            age=54,
            sex=1,
            email="david.berg@healthsync.care",
            phone="+1 (555) 234-8901",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
            clinical_summary="54-year-old male with mild exertional shortness of breath, borderline Stage 1 systolic hypertension, moderate hyperlipidemia, and reversible apical hypokinesis on stress scan.",
            primary_condition="Stage 1 Hypertension & Exertional Angina Equiv.",
            expected_risk="Intermediate (~46% Ischemic Risk)",
            is_demo=True,
            cp=2.0,
            trestbps=140.0,
            chol=260.0,
            fbs=0.0,
            restecg=0.0,
            thalach=142.0,
            exang=1.0,
            oldpeak=2.2,
            slope=2.0,
            ca=1.0,
            thal=7.0
        )
        db.add(david)

        # -------------------------------------------------------------
        # 2. SARAH J. (Low Risk Female)
        # -------------------------------------------------------------
        sarah = PatientModel(
            id="patient-sarah-j",
            name="Sarah J.",
            slug="sarah",
            age=42,
            sex=0,
            email="sarah.jenkins@biomed.org",
            phone="+1 (555) 345-6789",
            avatar_url="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
            clinical_summary="42-year-old active female presenting for routine executive cardiovascular physical. Non-anginal atypical chest sensation, normal resting ECG, patent coronary tree.",
            primary_condition="Normotensive / No Known CAD",
            expected_risk="Low (< 12%)",
            is_demo=True,
            cp=3.0,
            trestbps=115.0,
            chol=178.0,
            fbs=0.0,
            restecg=0.0,
            thalach=172.0,
            exang=0.0,
            oldpeak=0.2,
            slope=1.0,
            ca=0.0,
            thal=3.0
        )
        db.add(sarah)

        # -------------------------------------------------------------
        # 3. ROBERT M. (High Risk Male)
        # -------------------------------------------------------------
        robert = PatientModel(
            id="patient-robert-m",
            name="Robert M.",
            slug="robert",
            age=63,
            sex=1,
            email="robert.miller@enterprise.org",
            phone="+1 (555) 890-1234",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
            clinical_summary="63-year-old male with silent ischemia presentation, asymptomatic chest tightness, severe hypertension (152/96), multi-vessel calcification, and 2.6mm ST depression.",
            primary_condition="Multi-Vessel Coronary Artery Disease & Ischemia",
            expected_risk="High (> 85%)",
            is_demo=True,
            cp=4.0,
            trestbps=152.0,
            chol=285.0,
            fbs=1.0,
            restecg=2.0,
            thalach=118.0,
            exang=1.0,
            oldpeak=2.6,
            slope=2.0,
            ca=2.0,
            thal=7.0
        )
        db.add(robert)

        # -------------------------------------------------------------
        # 4. ELEANOR T. (Elevated Risk Elderly)
        # -------------------------------------------------------------
        eleanor = PatientModel(
            id="patient-eleanor-t",
            name="Eleanor T.",
            slug="eleanor",
            age=71,
            sex=0,
            email="eleanor.turner@seniorcare.org",
            phone="+1 (555) 678-9012",
            avatar_url="https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=120&auto=format&fit=crop&q=80",
            clinical_summary="71-year-old female with typical anginal chest episodes, controlled blood pressure, 1 fluoroscopic calcified vessel, and fixed apical perfusion defect.",
            primary_condition="Microvascular Angina & Fixed Apical Defect",
            expected_risk="Elevated (~68%)",
            is_demo=True,
            cp=1.0,
            trestbps=128.0,
            chol=242.0,
            fbs=0.0,
            restecg=1.0,
            thalach=130.0,
            exang=0.0,
            oldpeak=1.4,
            slope=2.0,
            ca=1.0,
            thal=6.0
        )
        db.add(eleanor)

        db.commit()

        # -------------------------------------------------------------
        # 5. SEED VITALS HISTORY (Longitudinal Trend)
        # -------------------------------------------------------------
        patients = [david, sarah, robert, eleanor]
        for p in patients:
            for days_ago in range(14, -1, -1):
                t = now - timedelta(days=days_ago, hours=3)
                variance = (days_ago % 3) - 1
                bp_sys = int(p.trestbps + variance * 3)
                bp_dia = int(85 + (p.trestbps - 120) * 0.25 + variance * 2)
                hr = int(p.thalach * 0.55 + variance * 2)
                v = VitalLogModel(
                    patient_id=p.id,
                    systolic_bp=bp_sys,
                    diastolic_bp=bp_dia,
                    heart_rate=hr,
                    cholesterol=int(p.chol + variance * 4),
                    st_depression=round(max(0.0, p.oldpeak + variance * 0.1), 1),
                    oxygen_saturation=98.0 if p.id == sarah.id else 96.5,
                    respiratory_rate=16,
                    notes=f"Routine ambulatory recording (Day -{days_ago})",
                    logged_at=t
                )
                db.add(v)

        # -------------------------------------------------------------
        # 6. SEED MEDICATIONS
        # -------------------------------------------------------------
        medications_data = [
            # David Berg
            (david.id, "Atorvastatin Calcium", "20 mg", "Once daily", "09:00 PM", "Atherosclerotic Plaque Stabilization", "active", 94.0),
            (david.id, "Metoprolol Tartrate", "25 mg", "Twice daily", "08:00 AM", "Exertional Heart Rate & Rate-Pressure Product Control", "active", 92.5),
            (david.id, "Enteric-Coated Aspirin", "81 mg", "Once daily with breakfast", "08:30 AM", "Secondary Antiplatelet Thromboprophylaxis", "active", 98.0),
            (david.id, "Nitroglycerin Sublingual", "0.4 mg", "PRN as needed", "PRN", "Acute Anginal Relief", "active", 100.0),

            # Sarah J.
            (sarah.id, "Vitamin D3 + K2", "2000 IU", "Once daily", "08:00 AM", "Vascular Endothelial Health", "active", 96.0),
            (sarah.id, "Omega-3 Ethyl Esters", "1000 mg", "Once daily", "12:00 PM", "Triglyceride & Lipid Optimization", "active", 98.5),

            # Robert M.
            (robert.id, "Rosuvastatin Zinc", "40 mg", "Once daily at bedtime", "10:00 PM", "Intensive LDL-C Lowering (< 55 mg/dL)", "active", 88.0),
            (robert.id, "Carvedilol", "12.5 mg", "Twice daily with meals", "08:00 AM", "Cardiomyopathy & Afterload Reduction", "active", 91.0),
            (robert.id, "Ramipril", "10 mg", "Once daily morning", "08:00 AM", "ACE Inhibition & Renoprotection", "active", 89.5),
            (robert.id, "Clopidogrel", "75 mg", "Once daily", "09:00 AM", "Dual Antiplatelet Post-Ischemia Regimen", "active", 95.0),

            # Eleanor T.
            (eleanor.id, "Amlodipine Besylate", "5 mg", "Once daily morning", "08:00 AM", "Calcium Channel Vasodilation for Microvascular Angina", "active", 95.0),
            (eleanor.id, "Atorvastatin", "10 mg", "Once daily", "09:00 PM", "Cardiovascular Primary Prevention", "active", 94.0),
        ]

        for p_id, name, dose, freq, tod, ind, status, adh in medications_data:
            med = MedicationModel(
                patient_id=p_id,
                name=name,
                dosage=dose,
                frequency=freq,
                time_of_day=tod,
                indication=ind,
                status=status,
                adherence_pct=adh,
                last_taken_at=now - timedelta(hours=4)
            )
            db.add(med)

        # -------------------------------------------------------------
        # 7. SEED LAB BIOMARKER PANELS
        # -------------------------------------------------------------
        labs_data = [
            # David Berg
            (david.id, "High-Sensitivity Cardiac Troponin-I (hs-cTnI)", "Cardiac Markers", 11.2, "ng/L", "< 14.0 ng/L", "normal", "Baseline resting levels within safe margin; re-evaluate post-stress test."),
            (david.id, "High-Sensitivity C-Reactive Protein (hs-CRP)", "Inflammatory", 2.8, "mg/L", "< 1.0 mg/L", "elevated", "Moderate systemic vascular inflammation consistent with atheroma progression."),
            (david.id, "Low-Density Lipoprotein (LDL-C)", "Lipid Profile", 148.0, "mg/dL", "< 70.0 mg/dL", "elevated", "Target < 70 mg/dL recommended for high-risk CAD category."),
            (david.id, "High-Density Lipoprotein (HDL-C)", "Lipid Profile", 42.0, "mg/dL", "> 40.0 mg/dL", "normal", "Adequate reverse cholesterol transport capacity."),
            (david.id, "Serum Triglycerides", "Lipid Profile", 195.0, "mg/dL", "< 150.0 mg/dL", "elevated", "Hypertriglyceridemia; dietary refinement and omega-3 indicated."),
            (david.id, "N-Terminal Pro-BNP (NT-proBNP)", "Cardiac Markers", 88.0, "pg/mL", "< 125.0 pg/mL", "normal", "No signs of decompensated congestive heart failure."),
            (david.id, "Hemoglobin A1c (HbA1c)", "Glycemic", 5.6, "%", "< 5.7 %", "normal", "Normoglycemic; low insulin resistance profile."),

            # Robert M.
            (robert.id, "High-Sensitivity Cardiac Troponin-I (hs-cTnI)", "Cardiac Markers", 28.4, "ng/L", "< 14.0 ng/L", "critical", "Subclinical myocardial micro-necrosis and ischemic strain detected."),
            (robert.id, "Low-Density Lipoprotein (LDL-C)", "Lipid Profile", 172.0, "mg/dL", "< 55.0 mg/dL", "critical", "Severe atherogenic dyslipidemia; high plaque destabilization risk."),
            (robert.id, "NT-proBNP", "Cardiac Markers", 240.0, "pg/mL", "< 125.0 pg/mL", "elevated", "Ventricular diastolic filling pressure elevation."),

            # Sarah J.
            (sarah.id, "High-Sensitivity Cardiac Troponin-I (hs-cTnI)", "Cardiac Markers", 3.1, "ng/L", "< 14.0 ng/L", "normal", "Excellent cardiac biomarker profile without active necrosis."),
            (sarah.id, "Low-Density Lipoprotein (LDL-C)", "Lipid Profile", 88.0, "mg/dL", "< 100.0 mg/dL", "normal", "Optimal lipid profile with low cardiovascular event risk.")
        ]

        for p_id, test, cat, val, unit, ref, stat, interp in labs_data:
            lab = LabResultModel(
                patient_id=p_id,
                test_name=test,
                category=cat,
                value=val,
                unit=unit,
                reference_range=ref,
                status=stat,
                interpretation=interp,
                tested_at=now - timedelta(days=2)
            )
            db.add(lab)

        # -------------------------------------------------------------
        # 8. SEED 12 CLINICAL DIAGNOSTIC REPORTS (Matching 'Reports 12' tab!)
        # -------------------------------------------------------------
        reports_templates = [
            {
                "patient_id": david.id,
                "title": "Comprehensive 3D Cardiovascular Intelligence Dossier",
                "report_type": "Cardiology Consultation",
                "physician_name": "Dr. Sarah Scott, MD, FACC",
                "findings": "Patient exhibits mild apical hypokinesis on stress echocardiography with 2.2mm horizontal ST-segment depression in inferolateral leads. Calcium scoring demonstrates isolated LAD atheroma ring (ca: 1).",
                "impression": "Moderate-to-high risk coronary ischemia with preserved global left ventricular ejection fraction (LVEF 55%). Impaired myocardial reserve under maximal exertion.",
                "recommendations": "1. Up-titrate Atorvastatin to 40mg nightly. 2. Continue Metoprolol 25mg BID. 3. Schedule coronary fractional flow reserve (FFR-CT) imaging within 4 weeks.",
                "days_ago": 1
            },
            {
                "patient_id": david.id,
                "title": "Exercise Treadmill Stress ECG & Hemodynamic Report",
                "report_type": "Stress Testing",
                "physician_name": "Dr. Marcus Vance, MD",
                "findings": "Bruce Protocol completed to Stage 3 (7 mins 14 secs). Peak exertional heart rate 142 bpm (85% of age-predicted maximum). Horizontal ST depression of 2.2mm noted at peak stress, persisting 4 minutes into recovery.",
                "impression": "Positive stress electrocardiogram for exertional myocardial ischemia without ventricular dysrhythmia.",
                "recommendations": "Medical optimization recommended prior to vigorous unmonitored cardiovascular conditioning.",
                "days_ago": 4
            },
            {
                "patient_id": david.id,
                "title": "High-Resolution Coronary CT Angiography (CCTA)",
                "report_type": "Coronary CTA",
                "physician_name": "Dr. Elena Rostova, MD, FSCCT",
                "findings": "Left Main: Unremarkable. LAD: Mixed calcified/non-calcified eccentric plaque causing 50-65% luminal narrowing at mid-segment. LCx & RCA: Mild luminal irregularities (< 25%). CAD-RADS: 3/P2.",
                "impression": "Intermediate anatomical stenosis of mid-LAD with high-risk plaque features.",
                "recommendations": "Plaque stabilization protocol, lipid target LDL < 70 mg/dL, follow-up scan in 12 months.",
                "days_ago": 7
            },
            {
                "patient_id": david.id,
                "title": "Transthoracic Echocardiogram (TTE) Volumetric Analysis",
                "report_type": "Echocardiography",
                "physician_name": "Dr. Sarah Scott, MD, FACC",
                "findings": "Normal left ventricular cavity dimensions. Normal wall thickness. LVEF estimated at 56%. Mild regional hypokinesis of the anterior apical wall segment. Normal diastolic filling pattern (E/A 1.1).",
                "impression": "Preserved systolic ejection fraction with isolated segmental anterior apical hypokinesis.",
                "recommendations": "Monitor wall motion index annually or upon change in anginal symptoms.",
                "days_ago": 12
            },
            {
                "patient_id": david.id,
                "title": "Advanced Lipid Particle & ApoB Biomarker Profile",
                "report_type": "Biomarker Review",
                "physician_name": "Dr. Aris Thorne, MD",
                "findings": "Total Cholesterol 260 mg/dL, LDL-C 148 mg/dL, ApoB 118 mg/dL (elevated), hs-CRP 2.8 mg/L (elevated), Lipoprotein(a) 32 nmol/L (normal).",
                "impression": "Elevated atherogenic particle burden and ongoing vascular endothelial inflammation.",
                "recommendations": "Aggressive statin escalation and dietary Mediterranean adherence.",
                "days_ago": 15
            },
            {
                "patient_id": david.id,
                "title": "24-Hour Ambulatory Holter Rhythm Monitoring",
                "report_type": "Electrophysiology",
                "physician_name": "Dr. Marcus Vance, MD",
                "findings": "Predominant sinus rhythm throughout 24-hour recording period. Average HR 68 bpm (range 52-114 bpm). Rare isolated premature ventricular contractions (PVC count 48 / 24h, < 0.1%). No sustained runs of VT.",
                "impression": "Normal ambulatory cardiac rhythm profile. Low arrhythmic burden.",
                "recommendations": "No antiarrhythmic therapy indicated. Reassurance provided.",
                "days_ago": 20
            },
            {
                "patient_id": david.id,
                "title": "Nuclear SPECT Myocardial Perfusion Scintigraphy (Thallium-201)",
                "report_type": "Nuclear Cardiology",
                "physician_name": "Dr. Elena Rostova, MD",
                "findings": "Stress SPECT images demonstrate a moderate-sized, moderate-intensity reversible defect in the anterior and anteroseptal myocardial segments, completely redistributing on resting images (thal: 7).",
                "impression": "Reversible anterior myocardial ischemia involving approximately 14% of the left ventricular myocardium.",
                "recommendations": "Clinical correlation with coronary anatomy. Medical therapy escalation.",
                "days_ago": 24
            },
            {
                "patient_id": david.id,
                "title": "Cardiovascular Prevention & Nutrition Counseling Summary",
                "report_type": "Preventive Cardiology",
                "physician_name": "Dr. Sarah Scott, MD, FACC",
                "findings": "Patient reviewed sodium restriction (< 2000mg/day) and DASH dietary guidelines. Exercise regimen prescribed at 30 mins moderate walking 5x/week with target heart rate cap of 125 bpm.",
                "impression": "Patient receptive to behavioral modifications. Blood pressure diary instituted.",
                "recommendations": "Follow-up telehealth check-in 2 weeks post medication adjustment.",
                "days_ago": 28
            },
            {
                "patient_id": robert.id,
                "title": "Urgent Catheterization & Invasive Coronary Angiogram Summary",
                "report_type": "Interventional Cardiology",
                "physician_name": "Dr. Robert Sterling, MD, FSCAI",
                "findings": "Severe multi-vessel disease: LAD 85% proximal stenosis, RCA 75% mid-segment stenosis with collateral circulation.",
                "impression": "High-risk multi-vessel coronary artery disease with significant myocardium at jeopardy.",
                "recommendations": "Heart Team conference convened; candidate for drug-eluting stent (DES) revascularization vs CABG.",
                "days_ago": 3
            },
            {
                "patient_id": sarah.id,
                "title": "Executive Annual Cardiovascular Clearance",
                "report_type": "Cardiology Consultation",
                "physician_name": "Dr. Sarah Scott, MD, FACC",
                "findings": "Resting ECG completely normal. Calcium score Agatston = 0. Stress treadmill achieved 12 METs without ST deviation or ischemic symptoms.",
                "impression": "Zero coronary calcium; low 10-year atherosclerotic cardiovascular event risk (< 1%).",
                "recommendations": "Maintain current fitness routine and Mediterranean dietary pattern. Routine re-evaluation in 3 years.",
                "days_ago": 5
            },
            {
                "patient_id": eleanor.id,
                "title": "Microvascular Angina Assessment & Endothelial Function Study",
                "report_type": "Cardiology Consultation",
                "physician_name": "Dr. Sarah Scott, MD, FACC",
                "findings": "Non-obstructive coronary arteries on CTA. CFR (Coronary Flow Reserve) reduced at 1.8, indicating coronary microvascular dysfunction (INOCA).",
                "impression": "Ischemia with Non-Obstructive Coronary Arteries (INOCA) secondary to microvascular spasm and endothelial stiffness.",
                "recommendations": "Initiate Calcium channel blocker (Amlodipine) and statin for endothelial stabilization.",
                "days_ago": 8
            },
            {
                "patient_id": david.id,
                "title": "Initial Cardiology Intake & Risk Stratification Consultation",
                "report_type": "Cardiology Consultation",
                "physician_name": "Dr. Sarah Scott, MD, FACC",
                "findings": "Initial clinic evaluation for exertional substernal chest heaviness over past 3 months. Family history notable for paternal myocardial infarction at age 58.",
                "impression": "New-onset exertional angina in patient with multiple modifiable atherosclerotic risk factors.",
                "recommendations": "Baseline ECG, complete lipid & cardiac enzyme panel, and outpatient stress test ordered.",
                "days_ago": 35
            }
        ]

        for rep in reports_templates:
            report_obj = ClinicalReportModel(
                patient_id=rep["patient_id"],
                title=rep["title"],
                report_type=rep["report_type"],
                physician_name=rep["physician_name"],
                findings=rep["findings"],
                impression=rep["impression"],
                recommendations=rep["recommendations"],
                status="Finalized",
                is_confidential=True,
                created_at=now - timedelta(days=rep["days_ago"])
            )
            db.add(report_obj)

        # -------------------------------------------------------------
        # 9. SEED INITIAL ASSESSMENT RUNS
        # -------------------------------------------------------------
        david_shap = [
            {"feature": "Exercise ST Depression (oldpeak = 2.2mm)", "attribution": "+0.28", "category": "Electrophysiologic Ischemia", "impact": "High Adverse"},
            {"feature": "Calcified Fluoroscopy Vessels (ca = 1)", "attribution": "+0.22", "category": "Anatomical Stenosis", "impact": "High Adverse"},
            {"feature": "Reversible Thallium Defect (thal = 7)", "attribution": "+0.19", "category": "Perfusion Deficit", "impact": "Moderate Adverse"},
            {"feature": "Resting Blood Pressure (140 mmHg)", "attribution": "+0.12", "category": "Hemodynamic Afterload", "impact": "Moderate Adverse"},
            {"feature": "Serum Cholesterol (260 mg/dL)", "attribution": "+0.09", "category": "Atherogenic Lipids", "impact": "Mild Adverse"},
            {"feature": "Exertional Heart Rate (142 bpm)", "attribution": "-0.06", "category": "Chronotropic Reserve", "impact": "Protective"}
        ]
        
        david_assess = AssessmentRecordModel(
            patient_id=david.id,
            age=david.age,
            sex=david.sex,
            cp=david.cp,
            trestbps=david.trestbps,
            chol=david.chol,
            fbs=david.fbs,
            restecg=david.restecg,
            thalach=david.thalach,
            exang=david.exang,
            oldpeak=david.oldpeak,
            slope=david.slope,
            ca=david.ca,
            thal=david.thal,
            prediction_label=1,
            probability=0.78,
            risk_tier="High Risk",
            model_version="Cleveland-Ensemble-v1.0",
            shap_drivers_json=json.dumps(david_shap),
            clinical_recommendations_json=json.dumps([
                "Initiate high-intensity statin therapy (Atorvastatin 40mg daily).",
                "Optimize blood pressure to target < 120/80 mmHg with ACE-i / beta-blocker.",
                "Refer for invasive coronary angiography or functional FFR-CT.",
                "Prescribe sublingual nitroglycerin PRN for acute anginal episodes."
            ]),
            notes="Baseline clinical prediction on clinic intake.",
            created_at=now - timedelta(days=1)
        )
        db.add(david_assess)

        # 10. Audit log
        db.add(AuditLogModel(
            action="database_initialized",
            patient_id="system",
            details_json=json.dumps({"message": "Production database initialized with 4 cohorts and 12 reports"}),
            ip_address="127.0.0.1",
            timestamp=now
        ))

        db.commit()
        print("Production database seeded successfully with 4 patients, 12 reports, vitals, medications, and labs!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
