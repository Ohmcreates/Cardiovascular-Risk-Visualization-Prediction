import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Eye, RotateCcw, Activity, ShieldAlert, Layers, Compass, ZoomIn, Info } from 'lucide-react';

export const ANATOMICAL_PARTS = {
  lv: {
    id: 'lv',
    name: 'Left Ventricle (LV)',
    category: 'Chamber / Myocardium',
    description: 'The thickest muscular chamber of the heart. Responsible for pumping oxygen-rich blood through the aortic valve into the systemic circulation under high systolic pressure (100-140 mmHg).',
    clinicalSignificance: 'Most vulnerable chamber to myocardial ischemia and infarction. Elevated ST depression on exercise ECG (oldpeak) often reflects subendocardial ischemia in the left ventricular wall.'
  },
  rv: {
    id: 'rv',
    name: 'Right Ventricle (RV)',
    category: 'Chamber / Myocardium',
    description: 'Low-pressure chamber (systolic ~20-30 mmHg) that pumps deoxygenated blood through the pulmonary valve into the pulmonary trunk for oxygenation in the lungs.',
    clinicalSignificance: 'Perfused primarily during both systole and diastole by the Right Coronary Artery (RCA). Sensitive to pulmonary hypertension.'
  },
  la: {
    id: 'la',
    name: 'Left Atrium (LA)',
    category: 'Chamber',
    description: 'Posterior-superior chamber receiving oxygenated pulmonary venous return from the four pulmonary veins. Empties into the left ventricle via the mitral valve.',
    clinicalSignificance: 'Subject to remodeling and dilation in chronic left ventricular diastolic dysfunction or mitral valve pathology.'
  },
  ra: {
    id: 'ra',
    name: 'Right Atrium (RA)',
    category: 'Chamber',
    description: 'Receives systemic venous blood from the Superior Vena Cava (SVC), Inferior Vena Cava (IVC), and coronary sinus. Contains the sinoatrial (SA) node pacemaker.',
    clinicalSignificance: 'Site of primary cardiac pacemaking. Elevated central venous pressure causes RA enlargement.'
  },
  aorta: {
    id: 'aorta',
    name: 'Ascending Aorta & Arch',
    category: 'Great Vessel',
    description: 'The primary systemic arterial outflow tract emerging from the left ventricle. Gives rise to coronary arteries at the sinuses of Valsalva and systemic branches (brachiocephalic, left common carotid, subclavian).',
    clinicalSignificance: 'Directly bears systemic systolic blood pressure. High resting blood pressure (trestbps) increases vascular shear stress and wall stiffness.'
  },
  pulmonary: {
    id: 'pulmonary',
    name: 'Pulmonary Trunk & Arteries',
    category: 'Great Vessel',
    description: 'Arises anterior to the aorta from the right ventricle infundibulum and bifurcates into left and right pulmonary arteries beneath the aortic arch.',
    clinicalSignificance: 'Carries deoxygenated blood to the alveolar capillary beds. Normal pulmonary pressures are low (~15-20 mmHg mean).'
  },
  lad: {
    id: 'lad',
    name: 'Left Anterior Descending Artery (LAD)',
    category: 'Coronary Artery',
    description: 'Branch of the Left Main Coronary Artery coursing along the anterior interventricular sulcus down to the cardiac apex. Supplies ~50% of left ventricular myocardium, anterior septum, and apex.',
    clinicalSignificance: 'Often referred to as the "widow-maker" artery in cardiology due to the extensive myocardial territory it perfuses. In UCI dataset, fluoroscopic vessels colored (ca) assesses calcification and patency.'
  },
  lcx: {
    id: 'lcx',
    name: 'Left Circumflex Artery (LCx)',
    category: 'Coronary Artery',
    description: 'Courses leftward in the coronary sulcus, wrapping around the obtuse margin to supply the lateral and posterior walls of the left ventricle.',
    clinicalSignificance: 'Supplies the posterolateral myocardium. Stenosis can present with atypical exertional symptoms and lateral lead ECG changes (I, aVL, V5-V6).'
  },
  rca: {
    id: 'rca',
    name: 'Right Coronary Artery (RCA)',
    category: 'Coronary Artery',
    description: 'Originates from the right aortic sinus, traverses the right atrioventricular groove to supply the right atrium, right ventricle, sinus node (in 60%), and AV node (in 90%).',
    clinicalSignificance: 'Crucial for electrical conduction and inferior wall perfusion. Occlusion often causes inferior myocardial ischemia and bradyarrhythmias.'
  },
  svc: {
    id: 'svc',
    name: 'Superior Vena Cava (SVC)',
    category: 'Great Vessel',
    description: 'Large venous channel draining deoxygenated blood from the upper extremities, neck, and head directly into the anterosuperior right atrium.',
    clinicalSignificance: 'Monitored clinically for central venous catheterization and venous pressure measurement.'
  },
  infarct: {
    id: 'infarct',
    name: 'Ischemic Infarction Territory (Black Defect Zone)',
    category: 'Myocardial Pathology',
    description: 'Dark / black hypoperfused myocardial territory resulting from critical stenosis in the upstream coronary artery (LAD). Corresponds to cold perfusion defect on Thallium scan and ST-segment depression.',
    clinicalSignificance: 'Represents ischemic tissue with impaired contractility (hypokinesis) and potential non-viability. Rapid revascularization and medical therapy prevent transmural completion.'
  },
  plaque: {
    id: 'plaque',
    name: 'Coronary Atherosclerotic Plaque (Stenosis)',
    category: 'Arterial Lesion',
    description: 'Atheromatous plaque causing focal luminal narrowing in the Left Anterior Descending coronary artery. Impedes hemodynamic flow during peak myocardial metabolic demand.',
    clinicalSignificance: 'Major driver of exertional angina (exang = 1) and inducible myocardial ischemia on exercise stress ECG.'
  }
};

const HeartCanvas = forwardRef(({ predictionData, onSelectPart, selectedPartId, theme = 'dark', hideControls = false, pathologyMode = 'auto' }, ref) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const meshMapRef = useRef(new Map());
  const animationFrameIdRef = useRef(null);

  const [activeView, setActiveView] = useState('anterior');
  const [isPulsing, setIsPulsing] = useState(true);
  const [pulseRate, setPulseRate] = useState(72);
  const [overlayMode, setOverlayMode] = useState('anatomy'); // 'anatomy' | 'risk_territory'
  const [hoveredPart, setHoveredPart] = useState(null);

  // Sync heart rate with patient data if available
  useEffect(() => {
    if (predictionData?.thalach) {
      // Scale pulse rate to realistic resting rate display (60 - 100 bpm)
      const mappedRate = Math.round(predictionData.thalach * 0.5 + 20);
      setPulseRate(Math.min(110, Math.max(55, mappedRate)));
    }
  }, [predictionData]);

  // Set camera angle preset
  const setCameraPreset = (preset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActiveView(preset);
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (preset) {
      case 'anterior':
        cam.position.set(0, 0, 14);
        break;
      case 'lateral':
        cam.position.set(-14, 2, 4);
        break;
      case 'posterior':
        cam.position.set(0, 3, -14);
        break;
      case 'superior':
        cam.position.set(0, 14, 3);
        break;
      default:
        cam.position.set(0, 0, 14);
    }
    cam.lookAt(0, 0, 0);
    ctrl.target.set(0, 0, 0);
    ctrl.update();
  };

  useImperativeHandle(ref, () => ({
    resetCamera: () => setCameraPreset('anterior'),
    resetView: () => setCameraPreset('anterior'),
    setCameraPreset: (preset) => setCameraPreset(preset),
    zoomIn: () => {
      if (cameraRef.current) {
        cameraRef.current.position.multiplyScalar(0.85);
        controlsRef.current?.update();
      }
    },
    zoomOut: () => {
      if (cameraRef.current) {
        cameraRef.current.position.multiplyScalar(1.15);
        controlsRef.current?.update();
      }
    },
    focusPart: (partId) => {
      const partMesh = meshMapRef.current.get(partId);
      if (partMesh && controlsRef.current) {
        controlsRef.current.target.copy(partMesh.position);
        controlsRef.current.update();
      }
    }
  }));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    if (theme === 'light') {
      scene.background = null; // transparent, blends with card background
    } else {
      scene.background = new THREE.Color(0x090d16);
    }

    // CAMERA SETUP
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);
    cameraRef.current = camera;

    // RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 24;
    controls.maxPolarAngle = Math.PI * 0.9;
    controlsRef.current = controls;

    // LIGHTING SETUP
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(8, 12, 10);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.6); // Cool fill light
    dirLight2.position.set(-10, -5, -8);
    scene.add(dirLight2);

    const rimLight = new THREE.PointLight(0xf43f5e, 1.2, 20); // Warm rim light
    rimLight.position.set(0, -6, 6);
    scene.add(rimLight);

    // Subtle grid/pedestal in background for spatial orientation
    const gridHelper = new THREE.GridHelper(16, 16, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -5.5;
    scene.add(gridHelper);

    // HEART ROOT GROUP
    const heartGroup = new THREE.Group();
    heartGroup.position.set(0, 0.2, 0);
    heartGroup.rotation.y = 0.15; // Natural anatomical tilt
    heartGroup.rotation.z = -0.1;
    scene.add(heartGroup);

    // MATERIALS
    const myocardiumMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9b1c1c, // Deep anatomical muscular crimson
      roughness: 0.45,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      emissive: 0x330000,
      emissiveIntensity: 0.2
    });

    const rightHeartMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x7f1d1d,
      roughness: 0.5,
      metalness: 0.08,
      clearcoat: 0.2
    });

    const aortaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd946ef, // Arterial bright crimson-rose
      roughness: 0.3,
      metalness: 0.15,
      clearcoat: 0.4
    });

    const pulmonaryMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6, // Deoxygenated venous blue
      roughness: 0.35,
      metalness: 0.1,
      clearcoat: 0.3
    });

    const svcMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      roughness: 0.4,
      metalness: 0.1
    });

    const coronaryMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3b30, // Bright coronary red
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x770000,
      emissiveIntensity: 0.4
    });

    const cardiacVeinMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.4,
      metalness: 0.1
    });

    meshMapRef.current.clear();

    // 1. LEFT VENTRICLE (Conical, muscular apex)
    const lvGeo = new THREE.SphereGeometry(1.9, 32, 32);
    lvGeo.scale(1.0, 1.45, 0.95);
    const lvMesh = new THREE.Mesh(lvGeo, myocardiumMaterial.clone());
    lvMesh.position.set(-0.55, -1.2, 0.1);
    lvMesh.rotation.z = 0.2;
    lvMesh.userData = { id: 'lv' };
    heartGroup.add(lvMesh);
    meshMapRef.current.set('lv', lvMesh);

    // 2. RIGHT VENTRICLE (Crescent shaped, anterior-right)
    const rvGeo = new THREE.SphereGeometry(1.65, 32, 32);
    rvGeo.scale(0.9, 1.25, 0.75);
    const rvMesh = new THREE.Mesh(rvGeo, rightHeartMaterial.clone());
    rvMesh.position.set(1.05, -0.9, 0.55);
    rvMesh.rotation.z = -0.15;
    rvMesh.userData = { id: 'rv' };
    heartGroup.add(rvMesh);
    meshMapRef.current.set('rv', rvMesh);

    // 3. LEFT ATRIUM (Posterior base)
    const laGeo = new THREE.SphereGeometry(1.25, 28, 28);
    laGeo.scale(1.1, 0.9, 0.95);
    const laMesh = new THREE.Mesh(laGeo, myocardiumMaterial.clone());
    laMesh.position.set(-0.85, 1.15, -0.7);
    laMesh.userData = { id: 'la' };
    heartGroup.add(laMesh);
    meshMapRef.current.set('la', laMesh);

    // 4. RIGHT ATRIUM (Anterior-right base)
    const raGeo = new THREE.SphereGeometry(1.35, 28, 28);
    raGeo.scale(0.95, 1.1, 0.9);
    const raMesh = new THREE.Mesh(raGeo, rightHeartMaterial.clone());
    raMesh.position.set(1.35, 0.8, -0.1);
    raMesh.userData = { id: 'ra' };
    heartGroup.add(raMesh);
    meshMapRef.current.set('ra', raMesh);

    // 5. ASCENDING AORTA & AORTIC ARCH
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0.8, 0.15),
      new THREE.Vector3(-0.05, 2.2, 0.05),
      new THREE.Vector3(-0.5, 3.2, -0.2),
      new THREE.Vector3(-1.3, 3.0, -0.8),
      new THREE.Vector3(-1.5, 1.5, -1.2)
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 40, 0.62, 20, false);
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMaterial.clone());
    aortaMesh.userData = { id: 'aorta' };
    heartGroup.add(aortaMesh);
    meshMapRef.current.set('aorta', aortaMesh);

    // Aortic arch branch vessels (Brachiocephalic, Left Carotid, Left Subclavian)
    const archBranches = [
      { start: new THREE.Vector3(-0.25, 3.1, -0.1), end: new THREE.Vector3(0.1, 4.3, 0.0), rad: 0.18 },
      { start: new THREE.Vector3(-0.7, 3.2, -0.3), end: new THREE.Vector3(-0.6, 4.25, -0.2), rad: 0.14 },
      { start: new THREE.Vector3(-1.1, 3.1, -0.55), end: new THREE.Vector3(-1.3, 4.2, -0.4), rad: 0.15 }
    ];
    archBranches.forEach((b) => {
      const bCurve = new THREE.CatmullRomCurve3([b.start, b.end]);
      const bGeo = new THREE.TubeGeometry(bCurve, 12, b.rad, 12, false);
      const bMesh = new THREE.Mesh(bGeo, aortaMaterial.clone());
      bMesh.userData = { id: 'aorta' };
      heartGroup.add(bMesh);
    });

    // 6. PULMONARY TRUNK & BIFURCATION
    const pulmonaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.5, 0.8, 0.85),
      new THREE.Vector3(0.2, 1.8, 0.65),
      new THREE.Vector3(-0.2, 2.3, 0.15)
    ]);
    const pulmonaryGeo = new THREE.TubeGeometry(pulmonaryCurve, 30, 0.52, 18, false);
    const pulmonaryMesh = new THREE.Mesh(pulmonaryGeo, pulmonaryMaterial.clone());
    pulmonaryMesh.userData = { id: 'pulmonary' };
    heartGroup.add(pulmonaryMesh);
    meshMapRef.current.set('pulmonary', pulmonaryMesh);

    // Left and right pulmonary artery branches
    const leftBranchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 2.3, 0.15),
      new THREE.Vector3(-1.6, 2.4, -0.7)
    ]);
    const rightBranchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.2, 2.3, 0.15),
      new THREE.Vector3(1.5, 2.1, -0.5)
    ]);
    const leftBranchMesh = new THREE.Mesh(new THREE.TubeGeometry(leftBranchCurve, 15, 0.32, 14, false), pulmonaryMaterial.clone());
    const rightBranchMesh = new THREE.Mesh(new THREE.TubeGeometry(rightBranchCurve, 15, 0.32, 14, false), pulmonaryMaterial.clone());
    leftBranchMesh.userData = { id: 'pulmonary' };
    rightBranchMesh.userData = { id: 'pulmonary' };
    heartGroup.add(leftBranchMesh);
    heartGroup.add(rightBranchMesh);

    // 7. SUPERIOR VENA CAVA (SVC)
    const svcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.4, 3.6, -0.4),
      new THREE.Vector3(1.45, 1.6, -0.2)
    ]);
    const svcGeo = new THREE.TubeGeometry(svcCurve, 20, 0.42, 16, false);
    const svcMesh = new THREE.Mesh(svcGeo, svcMaterial.clone());
    svcMesh.userData = { id: 'svc' };
    heartGroup.add(svcMesh);
    meshMapRef.current.set('svc', svcMesh);

    // 8. CORONARY ARTERIES:
    // A. Left Anterior Descending (LAD)
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0.9, 0.7),
      new THREE.Vector3(0.05, 0.2, 0.95),
      new THREE.Vector3(0.0, -0.6, 1.15),
      new THREE.Vector3(-0.35, -1.5, 1.05),
      new THREE.Vector3(-0.55, -2.4, 0.65) // Down to apex
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 36, 0.11, 12, false);
    const ladMesh = new THREE.Mesh(ladGeo, coronaryMaterial.clone());
    ladMesh.userData = { id: 'lad' };
    heartGroup.add(ladMesh);
    meshMapRef.current.set('lad', ladMesh);

    // LAD Diagonal branch
    const ladDiagCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, -0.6, 1.15),
      new THREE.Vector3(-0.7, -1.0, 1.0),
      new THREE.Vector3(-1.1, -1.4, 0.7)
    ]);
    const ladDiagMesh = new THREE.Mesh(new THREE.TubeGeometry(ladDiagCurve, 18, 0.075, 10, false), coronaryMaterial.clone());
    ladDiagMesh.userData = { id: 'lad' };
    heartGroup.add(ladDiagMesh);

    // B. Left Circumflex (LCx)
    const lcxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.25, 0.85, 0.65),
      new THREE.Vector3(-0.85, 0.7, 0.5),
      new THREE.Vector3(-1.45, 0.4, 0.1),
      new THREE.Vector3(-1.55, -0.3, -0.4),
      new THREE.Vector3(-1.3, -1.0, -0.7)
    ]);
    const lcxGeo = new THREE.TubeGeometry(lcxCurve, 30, 0.095, 12, false);
    const lcxMesh = new THREE.Mesh(lcxGeo, coronaryMaterial.clone());
    lcxMesh.userData = { id: 'lcx' };
    heartGroup.add(lcxMesh);
    meshMapRef.current.set('lcx', lcxMesh);

    // C. Right Coronary Artery (RCA)
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 0.8, 0.65),
      new THREE.Vector3(0.85, 0.5, 0.75),
      new THREE.Vector3(1.35, -0.1, 0.65),
      new THREE.Vector3(1.25, -0.9, 0.4),
      new THREE.Vector3(0.65, -1.6, 0.1),
      new THREE.Vector3(0.1, -1.9, -0.4)
    ]);
    const rcaGeo = new THREE.TubeGeometry(rcaCurve, 36, 0.1, 12, false);
    const rcaMesh = new THREE.Mesh(rcaGeo, coronaryMaterial.clone());
    rcaMesh.userData = { id: 'rca' };
    heartGroup.add(rcaMesh);
    meshMapRef.current.set('rca', rcaMesh);

    // D. Great Cardiac Vein (Anterior cardiac venous drainage)
    const gcvCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.5, -2.1, 0.7),
      new THREE.Vector3(-0.25, -1.3, 1.1),
      new THREE.Vector3(0.12, -0.5, 1.2),
      new THREE.Vector3(-0.1, 0.3, 1.0),
      new THREE.Vector3(-0.9, 0.8, 0.6)
    ]);
    const gcvGeo = new THREE.TubeGeometry(gcvCurve, 30, 0.08, 10, false);
    const gcvMesh = new THREE.Mesh(gcvGeo, cardiacVeinMaterial);
    heartGroup.add(gcvMesh);

    // 9. ISCHEMIC NECROTIC TISSUE / INFARCT ZONE (Black defect zone on antero-apical LV)
    const infarctGeo = new THREE.SphereGeometry(1.94, 32, 24, 0, Math.PI * 0.75, Math.PI * 0.35, Math.PI * 0.45);
    infarctGeo.scale(1.01, 1.46, 0.96);
    const infarctMaterial = new THREE.MeshStandardMaterial({
      color: 0x090d16, // Stark black / charcoal necrotic ischemic tissue
      roughness: 0.9,
      metalness: 0.05,
      emissive: 0x030712,
      emissiveIntensity: 0.2
    });
    const infarctMesh = new THREE.Mesh(infarctGeo, infarctMaterial);
    infarctMesh.position.set(-0.55, -1.2, 0.1);
    infarctMesh.rotation.z = 0.2;
    infarctMesh.rotation.y = -0.35;
    infarctMesh.userData = { id: 'infarct' };
    heartGroup.add(infarctMesh);
    meshMapRef.current.set('infarct', infarctMesh);

    // 10. CORONARY ATHEROSCLEROTIC PLAQUE / CALCIFICATION RING (Stenosis on LAD)
    const plaqueGeo = new THREE.TorusGeometry(0.18, 0.065, 16, 24);
    const plaqueMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber-gold calcified atheroma plaque
      roughness: 0.25,
      metalness: 0.45,
      emissive: 0x78350f,
      emissiveIntensity: 0.3
    });
    const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMaterial);
    plaqueMesh.position.set(0.0, -0.6, 1.15);
    plaqueMesh.rotation.x = Math.PI * 0.45;
    plaqueMesh.userData = { id: 'plaque' };
    heartGroup.add(plaqueMesh);
    meshMapRef.current.set('plaque', plaqueMesh);

    // RAYCASTING FOR INTERACTION
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = Array.from(meshMapRef.current.values());
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const hitId = intersects[0].object.userData.id;
        if (hitId && ANATOMICAL_PARTS[hitId]) {
          container.style.cursor = 'pointer';
          setHoveredPart(ANATOMICAL_PARTS[hitId]);
          return;
        }
      }
      container.style.cursor = 'default';
      setHoveredPart(null);
    };

    const handleClick = (event) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = Array.from(meshMapRef.current.values());
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const hitId = intersects[0].object.userData.id;
        if (hitId && onSelectPart) {
          onSelectPart(hitId);
        }
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // RESIZE LISTENER
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION LOOP (Cardiac cycle pulse & smooth rendering)
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Cardiac contraction simulation
      if (isPulsing) {
        // Frequency in Hz based on pulseRate bpm
        const freq = (pulseRate / 60) * Math.PI * 2;
        // Wiggers cycle: rapid ventricular systole followed by longer diastole
        const rawPulse = Math.sin(elapsedTime * freq);
        const systolicFactor = Math.pow(Math.max(0, rawPulse), 3);
        const pulseScale = 1.0 + systolicFactor * 0.045;

        // Ventricles contract slightly inward and upward during systole
        lvMesh.scale.set(1.0 * pulseScale, 1.45 * (2 - pulseScale * 0.95), 0.95 * pulseScale);
        rvMesh.scale.set(0.9 * pulseScale, 1.25 * (2 - pulseScale * 0.95), 0.75 * pulseScale);

        // Black ischemic territory exhibits ischemic hypokinesis (diminished sluggish wall motion)
        if (infarctMesh) {
          const hypokineticScale = 1.0 + systolicFactor * 0.012;
          infarctMesh.scale.set(1.01 * hypokineticScale, 1.46 * (2 - hypokineticScale * 0.95), 0.96 * hypokineticScale);
        }

        // Atria expand slightly during ventricular systole (reciprocal filling)
        const atrialFactor = 1.0 + (1.0 - systolicFactor) * 0.025;
        laMesh.scale.set(1.1 * atrialFactor, 0.9 * atrialFactor, 0.95 * atrialFactor);
        raMesh.scale.set(0.95 * atrialFactor, 1.1 * atrialFactor, 0.9 * atrialFactor);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [pulseRate, isPulsing]);

  // UPDATE MATERIAL HIGHLIGHTS WHEN SELECTION OR OVERLAY CHANGES
  useEffect(() => {
    meshMapRef.current.forEach((mesh, partId) => {
      if (!mesh || !mesh.material) return;

      const isSelected = selectedPartId === partId;
      const isHovered = hoveredPart?.id === partId;

      if (overlayMode === 'risk_territory' && predictionData) {
        // Statistical Risk Association projection:
        // High predicted probability highlights Left Ventricular myocardium and LAD territory
        const prob = predictionData.probability || 0;
        if (partId === 'lv' || partId === 'lad') {
          if (prob > 0.6) {
            mesh.material.emissive = new THREE.Color(0xd97706); // Amber warning
            mesh.material.emissiveIntensity = 0.5 + prob * 0.3;
          } else {
            mesh.material.emissive = new THREE.Color(0x059669); // Low risk green
            mesh.material.emissiveIntensity = 0.3;
          }
        } else {
          mesh.material.emissive = new THREE.Color(0x000000);
          mesh.material.emissiveIntensity = 0.0;
        }
      } else {
        // Standard Anatomical Inspection Mode
        if (isSelected) {
          mesh.material.emissive = new THREE.Color(0x38bdf8); // Cyan selection
          mesh.material.emissiveIntensity = 0.6;
        } else if (isHovered) {
          mesh.material.emissive = new THREE.Color(0xfacc15); // Yellow hover
          mesh.material.emissiveIntensity = 0.4;
        } else {
          // Restore base emissive
          if (partId === 'lad' || partId === 'rca' || partId === 'lcx') {
            mesh.material.emissive = new THREE.Color(0x770000);
            mesh.material.emissiveIntensity = 0.4;
          } else if (partId === 'lv') {
            mesh.material.emissive = new THREE.Color(0x330000);
            mesh.material.emissiveIntensity = 0.2;
          } else {
            mesh.material.emissive = new THREE.Color(0x000000);
            mesh.material.emissiveIntensity = 0.0;
          }
        }
      }
    });

    // Dynamic Pathology / Disease State Transformation:
    const isDiseased = pathologyMode === 'diseased' 
      ? true 
      : pathologyMode === 'normal' 
      ? false 
      : ((predictionData?.probability ?? 0.78) >= 0.50 || (predictionData?.oldpeak ?? 0) >= 1.0 || (predictionData?.ca ?? 0) > 0);

    // Infarct black defect mesh
    const infarctMesh = meshMapRef.current.get('infarct');
    if (infarctMesh) {
      infarctMesh.visible = isDiseased;
      if (selectedPartId === 'infarct') {
        infarctMesh.material.emissive.setHex(0x38bdf8);
        infarctMesh.material.emissiveIntensity = 0.5;
      } else {
        infarctMesh.material.emissive.setHex(0x050505);
        infarctMesh.material.emissiveIntensity = 0.2;
      }
    }

    // Atherosclerotic plaque blockage
    const plaqueMesh = meshMapRef.current.get('plaque');
    if (plaqueMesh) {
      plaqueMesh.visible = isDiseased;
      if (selectedPartId === 'plaque') {
        plaqueMesh.material.emissive.setHex(0x38bdf8);
        plaqueMesh.material.emissiveIntensity = 0.6;
      } else {
        plaqueMesh.material.emissive.setHex(0x78350f);
        plaqueMesh.material.emissiveIntensity = 0.3;
      }
    }

    // Left Ventricle color shift: Normal vascular pink vs Strained ischemic myocardium
    const lvMesh = meshMapRef.current.get('lv');
    if (lvMesh) {
      if (isDiseased) {
        lvMesh.material.color.setHex(0x6b1d1d); // Strained ischemic myocardium
      } else {
        lvMesh.material.color.setHex(0x9b1c1c); // Healthy pink/crimson
      }
    }

    // LAD coronary artery lumen: Patent bright red vs Stenotic darkened
    const ladMesh = meshMapRef.current.get('lad');
    if (ladMesh) {
      if (isDiseased) {
        ladMesh.material.color.setHex(0x7f1d1d); // Darkened stenotic lumen
      } else {
        ladMesh.material.color.setHex(0xff3b30); // Bright patent red
      }
    }
  }, [selectedPartId, hoveredPart, overlayMode, predictionData, pathologyMode]);

  const isLight = theme === 'light';

  return (
    <div className={`relative w-full h-full min-h-[360px] ${
      isLight 
        ? 'bg-transparent' 
        : 'bg-slate-950 border border-slate-800'
    } rounded-2xl overflow-hidden flex flex-col`}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full flex-1 touch-none" />

      {/* Top Floating Control Bar */}
      {!hideControls && (
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Anatomical Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl pointer-events-auto shadow-lg">
            <button
              onClick={() => setOverlayMode('anatomy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                overlayMode === 'anatomy'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Anatomy View
            </button>
            <button
              onClick={() => setOverlayMode('risk_territory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                overlayMode === 'risk_territory'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Perfusion Association
            </button>
          </div>

          {/* Camera Orientation Presets */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl pointer-events-auto shadow-lg">
            <span className="text-[10px] uppercase font-semibold text-slate-500 px-2 flex items-center gap-1">
              <Compass className="w-3 h-3" /> View:
            </span>
            {['anterior', 'lateral', 'posterior', 'superior'].map((view) => (
              <button
                key={view}
                onClick={() => setCameraPreset(view)}
                className={`px-2.5 py-1 rounded-md text-xs capitalize font-medium transition ${
                  activeView === view
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {view}
              </button>
            ))}
            <button
              onClick={() => setCameraPreset('anterior')}
              title="Reset View"
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Hover/Tooltip Card */}
      {hoveredPart && (
        <div className="absolute top-16 left-4 max-w-xs p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl pointer-events-none transition-all duration-150">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-sky-400">{hoveredPart.name}</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              {hoveredPart.category}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-snug">{hoveredPart.description}</p>
          <div className="mt-1.5 text-[10px] text-amber-400/90 flex items-center gap-1">
            <span>💡 Click to inspect clinical correlation</span>
          </div>
        </div>
      )}

      {/* Bottom Bar: Heart Rate & Disclaimers */}
      {!hideControls && (
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Pulsing Rate Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl pointer-events-auto shadow-md">
            <div className={`w-2.5 h-2.5 rounded-full ${isPulsing ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
            <span className="text-xs font-mono font-medium text-slate-300">
              {pulseRate} <span className="text-[10px] text-slate-500">BPM</span>
            </span>
            <button
              onClick={() => setIsPulsing(!isPulsing)}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline ml-1"
            >
              {isPulsing ? 'Pause' : 'Pulse'}
            </button>
          </div>

          {/* Clinical Transparency Notice */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/40 border border-amber-800/40 text-amber-300/90 rounded-xl text-[11px] pointer-events-auto backdrop-blur-md">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>
              <strong>Clinical Boundary:</strong> 3D geometry is an educational reference. Statistical risk does not represent direct CT/angiographic visualization of arterial lesions.
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default HeartCanvas;
