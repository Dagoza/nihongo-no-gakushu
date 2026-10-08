'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

/**
 * ZenDaruma3D
 * Mascota 3D interactiva procedural inspirada en el Daruma tradicional japonés.
 * Estilo: Kawaii japonés moderno, elegante, sereno y táctil (acabado mate claymorphism).
 * Comportamiento: Oscilación tipo 'Okiagari-koboshi' (muñeco tentetieso), seguimiento
 * suave de la mirada al cursor, reacción al toque/clic y lluvia de pétalos de sakura al celebrar.
 */
export default function ZenDaruma3D({ 
  celebrate = false,
  onInteract = null,
  size = 280,
  mood = 'happy' // 'happy' | 'focused' | 'proud'
}) {
  const containerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const darumaGroupRef = useRef(null);
  const eyeLeftRef = useRef(null);
  const eyeRightRef = useRef(null);
  const pupilsRef = useRef([]);
  const sakuraParticlesRef = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [speechBubble, setSpeechBubble] = useState('¡Ganbatte! (がんばって)');

  // Frases de aliento que dice el Daruma al interactuar
  const cheerfulPhrases = [
    '¡Ganbatte! (がんばって ✨)',
    '¡Muy bien! (よくできました 🌸)',
    'Paso a paso (一歩一歩 ⛩️)',
    '¡La perseverancia vence! (七転び八起き 🎋)',
    '¡Vamos con todo! (いっしょに学ぼう 💫)',
    '¡Eres genial! (すごいですね！ 🍡)'
  ];

  // Coordenadas objetivo del puntero (normalizadas -1 a 1)
  const targetPointer = useRef({ x: 0, y: 0 });
  const currentPointer = useRef({ x: 0, y: 0 });
  const wobblePhase = useRef(0);
  const bounceY = useRef(0);
  const bounceVelocity = useRef(0);
  const isWinking = useRef(false);

  const handleClick = useCallback(() => {
    // Impulso de salto / rebote elástico
    bounceVelocity.current = 0.12;
    isWinking.current = true;
    setTimeout(() => {
      isWinking.current = false;
    }, 750);

    const nextPhrase = cheerfulPhrases[(clickCount + 1) % cheerfulPhrases.length];
    setSpeechBubble(nextPhrase);
    setClickCount(prev => prev + 1);

    if (onInteract) {
      onInteract();
    }
  }, [clickCount, onInteract]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detectar soporte WebGL
    try {
      const canvasTest = document.createElement('canvas');
      const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
      if (!gl) return;
    } catch {
      return;
    }

    const width = container.clientWidth || size;
    const height = container.clientHeight || size;

    // 1. Escena & Cámara
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.2);
    camera.lookAt(0, 0.1, 0);

    // 2. Renderer con canal alfa (fondo transparente)
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = false;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Iluminación suave tipo Clay / Zen Studio
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.4); // Luz cálida suave
    scene.add(ambientLight);

    const dirLightTop = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLightTop.position.set(2, 4, 3);
    scene.add(dirLightTop);

    const dirLightFill = new THREE.DirectionalLight(0xfce7f3, 0.6); // Luz de relleno sakura
    dirLightFill.position.set(-3, -1, 2);
    scene.add(dirLightFill);

    // 4. Grupo Principal del Daruma (Pivote en la base)
    const darumaGroup = new THREE.Group();
    darumaGroup.position.y = -0.55;
    scene.add(darumaGroup);
    darumaGroupRef.current = darumaGroup;

    // Materiales Estilo Arcilla Mate (Clay / Kawaii)
    const redMat = new THREE.MeshLambertMaterial({ 
      color: 0xeb3b5a, // Bermellón japonés Shu-iro cálido
    });
    const faceMat = new THREE.MeshLambertMaterial({ 
      color: 0xfdfaf7, // Crema suave marfil
    });
    const blushMat = new THREE.MeshBasicMaterial({ 
      color: 0xfb7185, // Rosa suave para mejillas
      transparent: true,
      opacity: 0.75
    });
    const darkMat = new THREE.MeshBasicMaterial({ 
      color: 0x1e1b4b // Índigo tinta sumi oscura para ojos
    });
    const whiteMat = new THREE.MeshBasicMaterial({ 
      color: 0xffffff // Brillo blanco en ojos
    });
    const goldMat = new THREE.MeshLambertMaterial({ 
      color: 0xf59e0b // Acento dorado suave
    });

    // --- A. CUERPO (Esfera achatada / Tentetieso tradicional) ---
    const bodyGeo = new THREE.SphereGeometry(1.0, 32, 32);
    bodyGeo.scale(1.0, 1.15, 0.98); // Ligeramente estilizado y ovalado
    const bodyMesh = new THREE.Mesh(bodyGeo, redMat);
    bodyMesh.position.y = 0.95;
    darumaGroup.add(bodyMesh);

    // Base de apoyo invisible/plana
    const baseGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.1, 24);
    const baseMesh = new THREE.Mesh(baseGeo, redMat);
    baseMesh.position.y = 0.05;
    darumaGroup.add(baseMesh);

    // --- B. PLACA FACIAL (Cara redonda crema incrustada) ---
    const faceGeo = new THREE.SphereGeometry(0.72, 32, 32);
    faceGeo.scale(0.95, 0.95, 0.55);
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.set(0, 1.1, 0.55);
    darumaGroup.add(faceMesh);

    // --- C. MEJILLAS KAWAII (Rubor rosado) ---
    const blushGeo = new THREE.CircleGeometry(0.12, 20);
    
    const blushLeft = new THREE.Mesh(blushGeo, blushMat);
    blushLeft.position.set(-0.35, 1.0, 0.85);
    blushLeft.rotation.y = -0.15;
    darumaGroup.add(blushLeft);

    const blushRight = new THREE.Mesh(blushGeo, blushMat);
    blushRight.position.set(0.35, 1.0, 0.85);
    blushRight.rotation.y = 0.15;
    darumaGroup.add(blushRight);

    // --- D. OJOS KAWAII GRANDES & EXPRESIVOS ---
    const eyeGeo = new THREE.CircleGeometry(0.11, 24);
    const pupilList = [];

    // Ojo Izquierdo
    const eyeLeftGroup = new THREE.Group();
    eyeLeftGroup.position.set(-0.24, 1.18, 0.86);
    eyeLeftGroup.rotation.y = -0.12;

    const eyeLeft = new THREE.Mesh(eyeGeo, darkMat);
    const glintLeft1 = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), whiteMat);
    glintLeft1.position.set(0.035, 0.035, 0.002);
    const glintLeft2 = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), whiteMat);
    glintLeft2.position.set(-0.035, -0.035, 0.002);
    eyeLeft.add(glintLeft1);
    eyeLeft.add(glintLeft2);
    eyeLeftGroup.add(eyeLeft);
    darumaGroup.add(eyeLeftGroup);
    eyeLeftRef.current = eyeLeftGroup;
    pupilList.push(eyeLeft);

    // Ojo Derecho
    const eyeRightGroup = new THREE.Group();
    eyeRightGroup.position.set(0.24, 1.18, 0.86);
    eyeRightGroup.rotation.y = 0.12;

    const eyeRight = new THREE.Mesh(eyeGeo, darkMat);
    const glintRight1 = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), whiteMat);
    glintRight1.position.set(0.035, 0.035, 0.002);
    const glintRight2 = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), whiteMat);
    glintRight2.position.set(-0.035, -0.035, 0.002);
    eyeRight.add(glintRight1);
    eyeRight.add(glintRight2);
    eyeRightGroup.add(eyeRight);
    darumaGroup.add(eyeRightGroup);
    eyeRightRef.current = eyeRightGroup;
    pupilList.push(eyeRight);

    pupilsRef.current = pupilList;

    // --- E. CEJAS / TRAZOS DE PINCEL (Estilo grulla tradicional pero tierno) ---
    const browGeo = new THREE.BoxGeometry(0.18, 0.035, 0.02);
    
    const browLeft = new THREE.Mesh(browGeo, darkMat);
    browLeft.position.set(-0.25, 1.34, 0.84);
    browLeft.rotation.set(0, -0.12, 0.18);
    darumaGroup.add(browLeft);

    const browRight = new THREE.Mesh(browGeo, darkMat);
    browRight.position.set(0.25, 1.34, 0.84);
    browRight.rotation.set(0, 0.12, -0.18);
    darumaGroup.add(browRight);

    // --- F. BIGOTITO KAWAII / BOCA SUAVE ---
    const mouthGeo = new THREE.TorusGeometry(0.05, 0.015, 8, 16, Math.PI);
    const mouthMesh = new THREE.Mesh(mouthGeo, darkMat);
    mouthMesh.position.set(0, 1.02, 0.87);
    mouthMesh.rotation.set(Math.PI, 0, 0); // Sonrisa curva feliz
    darumaGroup.add(mouthMesh);

    // --- G. MEDALLÓN DORADO EN EL PECHO (Símbolo de Buena Fortuna 'Fuku' / Éxito) ---
    const crestGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.03, 24);
    const crestMesh = new THREE.Mesh(crestGeo, goldMat);
    crestMesh.position.set(0, 0.45, 0.88);
    crestMesh.rotation.x = Math.PI / 2.2;
    darumaGroup.add(crestMesh);

    // Detalles dorados en el borde
    const rimGeo = new THREE.TorusGeometry(0.27, 0.02, 8, 24);
    const rimMesh = new THREE.Mesh(rimGeo, goldMat);
    rimMesh.position.set(0, 0.45, 0.89);
    rimMesh.rotation.x = Math.PI / 2.2;
    darumaGroup.add(rimMesh);

    // --- H. SISTEMA DE PÉTALOS DE SAKURA (Para celebración de victorias) ---
    const petalCount = 35;
    const petalGeo = new THREE.PlaneGeometry(0.12, 0.09);
    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xfbcfe8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });

    const sakuraGroup = new THREE.Group();
    const petalData = [];

    for (let i = 0; i < petalCount; i++) {
      const petal = new THREE.Mesh(petalGeo, petalMat);
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 1.5;
      petal.position.set(
        Math.cos(angle) * radius,
        -1.0 + Math.random() * 3.0,
        Math.sin(angle) * radius * 0.7
      );
      petal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      sakuraGroup.add(petal);
      petalData.push({
        mesh: petal,
        speedY: 0.008 + Math.random() * 0.015,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        swaySpeed: 1 + Math.random() * 2,
        swayAmp: 0.005 + Math.random() * 0.008
      });
    }
    sakuraGroup.visible = celebrate;
    scene.add(sakuraGroup);
    sakuraParticlesRef.current = { group: sakuraGroup, data: petalData };

    // --- I. BUCLE DE ANIMACIÓN (60 FPS con física elástica) ---
    let lastTime = performance.now();

    const animate = (time) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Suavizado lerp del puntero
      currentPointer.current.x += (targetPointer.current.x - currentPointer.current.x) * 0.08;
      currentPointer.current.y += (targetPointer.current.y - currentPointer.current.y) * 0.08;

      // 2. Respiración y oscilación suave natural
      wobblePhase.current += 1.8 * delta;
      const naturalSway = Math.sin(wobblePhase.current) * 0.035;

      // 3. Física de rebote elástico al hacer clic
      bounceY.current += bounceVelocity.current;
      bounceVelocity.current -= 0.65 * delta; // gravedad
      if (bounceY.current <= 0) {
        bounceY.current = 0;
        bounceVelocity.current = 0;
      }

      // 4. Inclinación del Daruma tipo Okiagari-koboshi
      if (darumaGroupRef.current) {
        const tiltZ = -currentPointer.current.x * 0.28 + naturalSway;
        const tiltX = -currentPointer.current.y * 0.22;
        
        darumaGroupRef.current.rotation.z = tiltZ;
        darumaGroupRef.current.rotation.x = tiltX;
        darumaGroupRef.current.position.y = -0.55 + bounceY.current;
      }

      // 5. Mirada de las pupilas siguiendo el cursor
      pupilsRef.current.forEach(eye => {
        if (eye) {
          const eyeShiftX = currentPointer.current.x * 0.03;
          const eyeShiftY = currentPointer.current.y * 0.025;
          eye.position.x = eyeShiftX;
          eye.position.y = eyeShiftY;
        }
      });

      // 6. Animación de guiño / parpadeo
      if (eyeLeftRef.current && eyeRightRef.current) {
        if (isWinking.current) {
          eyeRightRef.current.scale.y = 0.12; // Guiño tierno del ojo derecho
        } else {
          eyeRightRef.current.scale.y = 1.0;
        }
      }

      // 7. Animación de pétalos de Sakura
      if (sakuraParticlesRef.current && sakuraParticlesRef.current.group.visible) {
        sakuraParticlesRef.current.data.forEach(p => {
          p.mesh.position.y += p.speedY;
          p.mesh.position.x += Math.sin(time * 0.002 * p.swaySpeed) * p.swayAmp;
          p.mesh.rotation.x += p.rotSpeed;
          p.mesh.rotation.y += p.rotSpeed * 1.5;

          // Reciclar pétalo al subir demasiado
          if (p.mesh.position.y > 2.5) {
            p.mesh.position.y = -1.2;
            p.mesh.position.x = (Math.random() - 0.5) * 3;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Manejadores de puntero interactivo
    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetPointer.current.x = Math.max(-1, Math.min(1, x));
      targetPointer.current.y = Math.max(-1, Math.min(1, y));
    };

    const handlePointerLeave = () => {
      targetPointer.current.x = 0;
      targetPointer.current.y = 0;
      setIsHovered(false);
    };

    const handlePointerEnter = () => {
      setIsHovered(true);
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('pointerenter', handlePointerEnter);

    // Redimensionamiento elástico
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Limpieza estricta de memoria en unmount
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('pointerenter', handlePointerEnter);
      resizeObserver.disconnect();

      // Desechar geometrías y materiales
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  // Sincronizar visibilidad de sakura al cambiar celebrate
  useEffect(() => {
    if (sakuraParticlesRef.current) {
      sakuraParticlesRef.current.group.visible = celebrate;
    }
  }, [celebrate]);

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {/* Globo de diálogo flotante Zen Kawaii */}
      <div 
        className="zen-daruma-bubble"
        style={{
          transform: isHovered ? 'scale(1.04) translateY(-2px)' : 'scale(1)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <span className="text-xs font-semibold tracking-wide text-indigo-950 dark:text-indigo-100">
          {speechBubble}
        </span>
        <div className="zen-daruma-bubble-tail" />
      </div>

      {/* Contenedor del Canvas 3D */}
      <div
        ref={containerRef}
        onClick={handleClick}
        className="zen-daruma-canvas-wrapper cursor-pointer"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          touchAction: 'none'
        }}
        title="¡Haz clic en el Daruma para saludarlo!"
      />

      {/* Micro-pistas de interacción */}
      <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium tracking-tight mt-1 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping inline-block" />
        Toca el Daruma o mueve el cursor
      </span>
    </div>
  );
}
