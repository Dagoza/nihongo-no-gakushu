'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * ZenDaruma3D (Mascota Zen Kawaii Japonesa)
 * Renderizado interactivo en Canvas de alta resolución (Retina / 4K).
 * Estilo: Kawaii Japonés moderno, elegante y sereno (acabado arcilla/cerámica tradicional).
 * Física: Tentetieso japonés (Okiagari-koboshi) con inercia elástica, seguimiento
 * de mirada al puntero/toque, expresiones faciales reactivas y lluvia de sakura.
 */
export default function ZenDaruma3D({ 
  celebrate = false,
  onInteract = null,
  size = 240
}) {
  const canvasRef = useRef(null);
  const animIdRef = useRef(null);
  const [speechBubble, setSpeechBubble] = useState('¡Ganbatte! (がんばって ✨)');
  const [clickCount, setClickCount] = useState(0);

  // Frases de aliento que dice el Daruma
  const phrases = [
    '¡Ganbatte! (がんばって ✨)',
    '¡Muy bien! (よくできました 🌸)',
    'Paso a paso (一歩一歩 ⛩️)',
    '¡La perseverancia vence! (七転び八起き 🎋)',
    '¡Vamos con todo! (いっしょに学ぼう 💫)',
    '¡Eres genial! (すごいですね！ 🍡)'
  ];

  // Estado físico del personaje
  const state = useRef({
    targetTiltX: 0,
    targetTiltY: 0,
    currentTiltX: 0,
    currentTiltY: 0,
    wobblePhase: 0,
    bounceY: 0,
    bounceVelocity: 0,
    isWinking: false,
    petals: []
  });

  // Generar pétalos de sakura
  useEffect(() => {
    const petals = [];
    for (let i = 0; i < 24; i++) {
      petals.push({
        x: Math.random() * size,
        y: Math.random() * size,
        size: 5 + Math.random() * 6,
        speedY: 0.8 + Math.random() * 1.5,
        speedX: (Math.random() - 0.5) * 0.8,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        alpha: 0.4 + Math.random() * 0.5
      });
    }
    state.current.petals = petals;
  }, [size]);

  // Manejo de clic / toque
  const handleClick = useCallback(() => {
    state.current.bounceVelocity = -12;
    state.current.isWinking = true;
    setTimeout(() => {
      state.current.isWinking = false;
    }, 700);

    const nextPhrase = phrases[(clickCount + 1) % phrases.length];
    setSpeechBubble(nextPhrase);
    setClickCount(prev => prev + 1);

    if (onInteract) {
      onInteract();
    }
  }, [clickCount, onInteract, phrases]);

  // Bucle de renderizado
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const s = state.current;
      const now = performance.now() * 0.001;

      // 1. Movimiento autónomo orgánico continuo (sin requerir pasar el mouse)
      const isPointerActive = s.isPointerActive && (now - s.lastPointerTime < 2.0);

      if (!isPointerActive) {
        // Balanceo rítmico continuo de tentetieso tradicional japonés (Okiagari-koboshi)
        const autoSwayX = Math.sin(now * 1.8) * 0.55 + Math.sin(now * 3.4) * 0.15;
        const autoSwayY = Math.cos(now * 1.3) * 0.28 + Math.sin(now * 2.1) * 0.12;

        s.targetTiltX = autoSwayX;
        s.targetTiltY = autoSwayY;

        // Saltitos alegres espontáneos cada 6 a 9 segundos
        if (!s.nextIdleActionTime || now > s.nextIdleActionTime) {
          s.bounceVelocity = -6.5;
          s.nextIdleActionTime = now + 6.5 + Math.random() * 3.5;
        }
      }

      // Parpadeo orgánico natural cada ~3.6s (dura 140ms)
      const blinkCycle = now % 3.6;
      s.isAutoBlink = blinkCycle < 0.14;

      // Suavizado lerp (inercia orgánica)
      s.currentTiltX += (s.targetTiltX - s.currentTiltX) * 0.09;
      s.currentTiltY += (s.targetTiltY - s.currentTiltY) * 0.09;

      // 2. Respiración suave y oscilación natural
      s.wobblePhase += 0.045;
      const breathe = Math.sin(s.wobblePhase) * 2.8;
      const naturalTilt = Math.sin(s.wobblePhase * 0.8) * 0.08;

      // 3. Física de salto/rebote elástico
      s.bounceY += s.bounceVelocity;
      s.bounceVelocity += 0.9; // gravedad
      if (s.bounceY > 0) {
        s.bounceY = 0;
        s.bounceVelocity = 0;
      }

      // Limpiar lienzo
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      // --- PÉTALOS DE SAKURA DE FONDO (SI CELEBRA) ---
      if (celebrate && s.petals.length > 0) {
        s.petals.forEach(p => {
          p.y += p.speedY;
          p.x += Math.sin(p.y * 0.03) * p.speedX;
          p.rot += p.rotSpeed;
          if (p.y > size) {
            p.y = -10;
            p.x = Math.random() * size;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = `rgba(251, 113, 133, ${p.alpha})`;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.3, p.size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // --- DIBUJO DEL DARUMA ---
      const cx = size / 2;
      const cy = size / 2 + 14 + s.bounceY;
      const tiltAngle = (s.currentTiltX * 0.32) + naturalTilt;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tiltAngle);

      // Sombra suave en la base
      ctx.beginPath();
      ctx.ellipse(0, 72 - s.bounceY * 0.4, 64, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.fill();

      // A. CUERPO ROJO (Gradiente esférico cálido Shu-iro)
      const bodyGrad = ctx.createRadialGradient(-18, -24, 15, 0, 0, 85);
      bodyGrad.addColorStop(0, '#f43f5e'); // iluminado suave
      bodyGrad.addColorStop(0.55, '#e11d48'); // bermellón principal
      bodyGrad.addColorStop(1, '#9f1239'); // sombra carmesí profunda

      ctx.beginPath();
      // Forma de huevo redondeada tradicional del tentetieso
      ctx.ellipse(0, 0, 76, 80 + breathe * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.shadowColor = 'rgba(225, 29, 72, 0.25)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Base recortada del muñeco
      const baseGrad = ctx.createLinearGradient(-40, 60, 40, 74);
      baseGrad.addColorStop(0, '#be123c');
      baseGrad.addColorStop(1, '#881337');
      ctx.beginPath();
      ctx.ellipse(0, 70, 42, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = baseGrad;
      ctx.fill();

      // B. PLACA FACIAL (Blanco marfil suave con forma de corazón japonés)
      const faceGrad = ctx.createRadialGradient(0, -20, 10, 0, -10, 60);
      faceGrad.addColorStop(0, '#ffffff');
      faceGrad.addColorStop(0.85, '#fef9f3');
      faceGrad.addColorStop(1, '#fdeee0');

      ctx.save();
      // Ligero desplazamiento facial según la mirada del puntero (parallax)
      const faceShiftX = s.currentTiltX * 7;
      const faceShiftY = s.currentTiltY * 5;
      ctx.translate(faceShiftX, faceShiftY - 12);

      ctx.beginPath();
      // Óvalo facial tierno
      ctx.ellipse(0, 0, 52, 44, 0, 0, Math.PI * 2);
      ctx.fillStyle = faceGrad;
      ctx.fill();

      // C. MEJILLAS KAWAII (Rubor rosado difuso)
      ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
      // Mejilla izquierda
      ctx.beginPath();
      ctx.ellipse(-30, 8, 9, 6, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Mejilla derecha
      ctx.beginPath();
      ctx.ellipse(30, 8, 9, 6, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // D. CEJAS DE PINCEL (Estilo grulla estilizada pero dulce)
      ctx.strokeStyle = '#1e1b4b';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';

      // Ceja izq
      ctx.beginPath();
      ctx.arc(-22, -18, 12, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Ceja der
      ctx.beginPath();
      ctx.arc(22, -18, 12, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // E. OJOS KAWAII GRANDES & EXPRESIVOS
      const eyeLookX = s.currentTiltX * 4;
      const eyeLookY = s.currentTiltY * 3;

      // OJO IZQUIERDO
      ctx.save();
      ctx.translate(-20, -2);
      if (s.isAutoBlink) {
        // Parpadeo orgánico natural (^◡^)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 2, 8, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        // Brillos de luz en el ojo izquierdo (pupilas anime brillantes)
        ctx.beginPath();
        ctx.arc(-2.5 + eyeLookX * 0.4, -3 + eyeLookY * 0.4, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(2.5 + eyeLookX * 0.4, 3 + eyeLookY * 0.4, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      ctx.restore();

      // OJO DERECHO (Normal o Guiño)
      ctx.save();
      ctx.translate(20, -2);

      if (s.isWinking || s.isAutoBlink) {
        // Guiño tierno o parpadeo (^◡^)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 2, 8, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-2.5 + eyeLookX * 0.4, -3 + eyeLookY * 0.4, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(2.5 + eyeLookX * 0.4, 3 + eyeLookY * 0.4, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      ctx.restore();

      // F. BOCA / SONRISA FELIZ
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 12, 7, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();

      ctx.restore(); // Fin de traslación facial

      // G. MEDALLÓN DORADO EN EL PECHO (Símbolo de Buena Fortuna / 福)
      const crestGrad = ctx.createLinearGradient(-18, 28, 18, 54);
      crestGrad.addColorStop(0, '#fef08a');
      crestGrad.addColorStop(0.5, '#f59e0b');
      crestGrad.addColorStop(1, '#d97706');

      ctx.beginPath();
      ctx.ellipse(0, 42, 22, 17, 0, 0, Math.PI * 2);
      ctx.fillStyle = crestGrad;
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Kanji dorado de la buena fortuna 「福」 o 「達」
      ctx.fillStyle = '#78350f';
      ctx.font = '900 13px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('福', 0, 43);

      ctx.restore(); // Fin de rotación Daruma

      ctx.restore(); // Fin de scale dpr

      animIdRef.current = requestAnimationFrame(render);
    };

    render();

    // Eventos de interacción con el cursor / touch
    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      state.current.targetTiltX = Math.max(-1, Math.min(1, x));
      state.current.targetTiltY = Math.max(-1, Math.min(1, y));
      state.current.isPointerActive = true;
      state.current.lastPointerTime = performance.now() * 0.001;
    };

    const handlePointerLeave = () => {
      state.current.isPointerActive = false;
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      isRunning = false;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [size, celebrate]);

  return (
    <div className="home-mascot-container">
      {/* Globo de diálogo interactivo */}
      <div className="zen-daruma-bubble">
        <span>{speechBubble}</span>
        <div className="zen-daruma-bubble-tail" />
      </div>

      {/* Canvas interactivo */}
      <div 
        className="zen-daruma-canvas-wrapper"
        onClick={handleClick}
        style={{ width: `${size}px`, height: `${size}px` }}
        title="¡Haz clic en el Daruma para saludarlo!"
      >
        <canvas 
          ref={canvasRef} 
          style={{ width: `${size}px`, height: `${size}px`, display: 'block' }} 
        />
      </div>

      <span className="zen-daruma-tip">
        <span className="home-pulse-dot" style={{ width: 6, height: 6 }} />
        Toca o haz clic en el Daruma ✨
      </span>
    </div>
  );
}
