import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Icon } from '@iconify/react';

export const Hero3DScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Motion values pour les cartes superposées en verre dépoli
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 18 });
  const cardRotateX = useTransform(springY, [-0.5, 0.5], ['10deg', '-10deg']);
  const cardRotateY = useTransform(springX, [-0.5, 0.5], ['-10deg', '10deg']);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- 1. INITIALISATION DE LA SCÈNE THREE.JS ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- 2. ÉCLAIRAGES DYNAMIQUES DU VERRE ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Lumière violette néon
    const pointLightPurple = new THREE.PointLight(0xa855f7, 4, 20);
    pointLightPurple.position.set(4, 4, 4);
    scene.add(pointLightPurple);

    // Lumière cyan néon
    const pointLightCyan = new THREE.PointLight(0x06b6d4, 4, 20);
    pointLightCyan.position.set(-4, -3, 3);
    scene.add(pointLightCyan);

    // Lumière d'accentuation magenta
    const pointLightMagenta = new THREE.PointLight(0xec4899, 3, 15);
    pointLightMagenta.position.set(0, 5, -2);
    scene.add(pointLightMagenta);

    // --- 3. GROUPE 3D PRINCIPAL FLOTTANT ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Matériau de verre dépoli haut de gamme (Frosted Glass / Physical Glass)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9333ea,
      emissive: 0x2e1065,
      emissiveIntensity: 0.2,
      roughness: 0.18,
      metalness: 0.1,
      transmission: 0.85, // Effet verre transparent
      ior: 1.52,          // Indice de réfraction du verre
      thickness: 1.5,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    // Cœur néon intérieur lumineux
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 2.5,
      roughness: 0.2,
      metalness: 0.8,
    });

    // Objet central : Cube en verre à arêtes biseautées
    const boxGeometry = new THREE.BoxGeometry(2.3, 2.3, 2.3);
    const glassCube = new THREE.Mesh(boxGeometry, glassMaterial);
    mainGroup.add(glassCube);

    // Lignes d'arêtes holographiques lumineuses (Wireframe d'orfèvre)
    const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.7,
      linewidth: 1.5,
    });
    const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    glassCube.add(edgesMesh);

    // Sphère d'énergie flottant au centre du cube
    const coreGeometry = new THREE.IcosahedronGeometry(0.7, 2);
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    mainGroup.add(coreMesh);

    // Anneau orbital externe (Gyroscope / Torus)
    const ringGeometry = new THREE.TorusGeometry(2.4, 0.04, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 1.2,
      metalness: 0.9,
      roughness: 0.1,
    });
    const ringMesh1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh1.rotation.x = Math.PI / 3;
    mainGroup.add(ringMesh1);

    const ringMesh2 = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh2.rotation.y = Math.PI / 3;
    ringMesh2.scale.set(1.15, 1.15, 1.15);
    mainGroup.add(ringMesh2);

    // Petits satellites de données en orbite
    const satelliteGroup = new THREE.Group();
    mainGroup.add(satelliteGroup);

    const satMaterial = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 2,
    });

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 2.8;
      const satGeo = new THREE.SphereGeometry(0.09, 16, 16);
      const sat = new THREE.Mesh(satGeo, satMaterial);
      sat.position.set(Math.cos(angle) * radius, (Math.sin(angle) * radius) * 0.4, Math.sin(angle) * radius);
      satelliteGroup.add(sat);
    }

    // Nuage de particules de fond (Constellation scolaire connectée)
    const particlesCount = 70;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // --- 4. GESTION DES MOUVEMENTS DE LA SOURIS ---
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      mouseRef.current.targetX = (x - 0.5) * 1.5;
      mouseRef.current.targetY = (y - 0.5) * 1.5;

      mouseX.set(x - 0.5);
      mouseY.set(y - 0.5);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Redimensionnement fluide
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // --- 5. BOUCLE DE RENDU 60 FPS ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Interpolation fluide (Damping) vers la position de la souris
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Rotation de la scène influencée par la souris + auto-rotation naturelle
      mainGroup.rotation.y = elapsedTime * 0.25 + mouseRef.current.x * 0.8;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15 + mouseRef.current.y * 0.6;
      mainGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.18; // Flottement organique vertical

      // Mouvement du cœur d'énergie et des anneaux
      coreMesh.rotation.y = -elapsedTime * 0.8;
      coreMesh.rotation.z = elapsedTime * 0.5;
      ringMesh1.rotation.z = elapsedTime * 0.4;
      ringMesh2.rotation.x = -elapsedTime * 0.3;
      satelliteGroup.rotation.y = elapsedTime * 0.6;

      // Légère oscillation des lumières
      pointLightPurple.position.x = Math.sin(elapsedTime) * 3 + 3;
      pointLightCyan.position.y = Math.cos(elapsedTime * 0.8) * 3 - 2;

      renderer.render(scene, camera);
    };

    animate();

    // --- 6. NETTOYAGE LORS DU DÉMONTAGE ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      renderer.dispose();
      boxGeometry.dispose();
      glassMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      edgesGeometry.dispose();
      edgesMaterial.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[540px] flex items-center justify-center select-none">
      {/* Conteneur WebGL Three.js */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
      />

      {/* Cartes holographiques en verre dépoli flottant au-dessus de la 3D */}
      <motion.div
        style={{
          rotateX: cardRotateX,
          rotateY: cardRotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-10 w-full max-w-[420px] pointer-events-none px-4"
      >
        {/* Badge Flottant Supérieur : Paiements Wave / OM en direct */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="absolute -top-12 -left-4 sm:-left-8 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-3 shadow-2xl shadow-cyan-950/60 flex items-center gap-3"
          style={{ transform: 'translateZ(40px)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
            <Icon icon="solar:wallet-money-bold-duotone" className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-mono font-black uppercase text-cyan-300">Wave & OM Reçus</span>
            </div>
            <p className="text-sm font-black text-white">+ 245 000 FCFA</p>
            <p className="text-[9px] text-slate-400">Scolarité validée à l'instant</p>
          </div>
        </motion.div>

        {/* Badge Flottant Inférieur Droit : Présences & Appel Direct */}
        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -bottom-10 -right-2 sm:-right-6 bg-slate-900/85 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-3.5 shadow-2xl shadow-purple-950/70 flex items-center gap-3"
          style={{ transform: 'translateZ(50px)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Icon icon="solar:shield-check-bold-duotone" className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono font-bold text-purple-300">CONTRÔLE ACCÈS</span>
              <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                TEMPS RÉEL
              </span>
            </div>
            <p className="text-sm font-black text-white">1 240 Élèves sur site</p>
            <p className="text-[9px] text-slate-400">Portique QR Badge Sécurisé</p>
          </div>
        </motion.div>

        {/* Badge Flottant Central : Réseau Multi-Campus */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-2xl border border-white/15 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5"
          style={{ transform: 'translateZ(30px)' }}
        >
          <Icon icon="solar:global-bold-duotone" className="text-purple-400 text-base" />
          <span className="text-[11px] font-bold text-slate-300">
            Dakar • Thiès • Saint-Louis • Ziguinchor
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </motion.div>
      </motion.div>
    </div>
  );
};

