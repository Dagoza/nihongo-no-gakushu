/**
 * Canvas Confetti & Celebratory Sound Effects Engine
 * 
 * Extraído y adaptado de la funcionalidad interactiva de celebración:
 * - Renderizado en Canvas 2D acelerado por hardware (sin dependencias externas).
 * - Paleta pastel kawaii y festiva: Sakura pink, lavanda, durazno, menta y dorado.
 * - Efectos de sonido sintetizados nativos con Web Audio API (chime de éxito y fanfarria).
 * - Modo Gran Celebración (multicañón escalonado) para finalización de módulos.
 * - Modo Ánimo (cheer burst) para aprender palabras y sumar puntos de experiencia (XP).
 * - Control de activación/desactivación persistente vía configuración.
 */

// Paletas de color oficiales
export const CHEER_COLORS = ['#FF8FAB', '#C8B6FF', '#FFC8DD', '#B9FBC0', '#FDE047'];
export const GRAND_COLORS = ['#FF8FAB', '#C8B6FF', '#FF69B4', '#6366F1', '#34D399', '#FBBF24', '#FB7185'];

let activeCanvas = null;
let activeCtx = null;
let particles = [];
let animationFrameId = null;
let lastCheerTimestamp = 0;
let lastGrandTimestamp = 0;

let audioCtxInstance = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioCtxInstance) {
    try {
      audioCtxInstance = new AudioCtx();
    } catch {
      return null;
    }
  }
  if (audioCtxInstance && audioCtxInstance.state === 'suspended') {
    audioCtxInstance.resume().catch(() => {});
  }
  return audioCtxInstance;
}

/**
 * Generador de beeps melódicos sintetizados mediante osciladores
 */
export function playCuteBeep(freq, duration = 0.1, type = 'sine', volume = 0.08) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silencioso en caso de bloqueo de autoplay
  }
}

/**
 * Chime alegre ascendente (C5 -> E5 -> G5) para puntos y palabras aprendidas
 */
export function playSuccessChime() {
  playCuteBeep(523.25, 0.12, 'sine', 0.08); // C5
  setTimeout(() => playCuteBeep(659.25, 0.14, 'sine', 0.08), 75); // E5
  setTimeout(() => playCuteBeep(783.99, 0.22, 'sine', 0.09), 150); // G5
}

/**
 * Fanfarria triunfal mayor (D5 -> F#5 -> A5 -> D6) para módulos completados
 */
export function playGrandFanfare() {
  playCuteBeep(587.33, 0.12, 'triangle', 0.09); // D5
  setTimeout(() => playCuteBeep(739.99, 0.12, 'triangle', 0.09), 90); // F#5
  setTimeout(() => playCuteBeep(880.00, 0.16, 'triangle', 0.10), 180); // A5
  setTimeout(() => playCuteBeep(1174.66, 0.38, 'sine', 0.12), 290); // D6
}

/**
 * Comprobar si el usuario tiene el confeti activado
 */
export function isConfettiEnabled(state = null) {
  if (state && typeof state.confettiEnabled === 'boolean') {
    return state.confettiEnabled;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('nihongo_confetti_enabled');
      if (stored !== null) {
        return stored !== 'false';
      }
    } catch {}
  }
  return true; // Activado por defecto
}

function ensureCanvas() {
  if (typeof document === 'undefined') return null;

  if (!activeCanvas || !document.body.contains(activeCanvas)) {
    activeCanvas = document.createElement('canvas');
    activeCanvas.id = '__nihongo_confetti_canvas';
    activeCanvas.style.position = 'fixed';
    activeCanvas.style.top = '0';
    activeCanvas.style.left = '0';
    activeCanvas.style.width = '100vw';
    activeCanvas.style.height = '100vh';
    activeCanvas.style.pointerEvents = 'none';
    activeCanvas.style.zIndex = '999999';
    activeCanvas.style.transform = 'translate3d(0, 0, 0)';
    document.body.appendChild(activeCanvas);

    activeCtx = activeCanvas.getContext('2d', { alpha: true });

    const handleResize = () => {
      if (!activeCanvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      activeCanvas.width = window.innerWidth * dpr;
      activeCanvas.height = window.innerHeight * dpr;
    };

    window.addEventListener('resize', handleResize);
    handleResize();
  }

  return activeCanvas;
}

/**
 * Motor central de confeti en Canvas 2D
 */
export function confetti(options = {}) {
  if (typeof window === 'undefined') return;

  const canvas = ensureCanvas();
  if (!canvas || !activeCtx) return;

  const width = canvas.width;
  const height = canvas.height;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const particleCount = options.particleCount || 50;
  const angle = options.angle !== undefined ? options.angle : 90; // 90° es hacia arriba
  const spread = options.spread || 70;
  const startVelocity = (options.startVelocity || 38) * dpr;
  const colors = options.colors && options.colors.length > 0 ? options.colors : CHEER_COLORS;
  const origin = options.origin || { x: 0.5, y: 0.6 };
  const ticks = options.ticks || 200;
  const gravity = (options.gravity !== undefined ? options.gravity : 0.65) * dpr;
  const scalar = (options.scalar || 1) * dpr;
  const shapes = options.shapes || ['square', 'circle'];

  const originX = origin.x * width;
  const originY = origin.y * height;

  const radBase = (angle * Math.PI) / 180;
  const radSpread = (spread * Math.PI) / 180;

  for (let i = 0; i < particleCount; i++) {
    const pAngle = radBase + (Math.random() - 0.5) * radSpread;
    const velocity = startVelocity * (0.6 + Math.random() * 0.7);

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(pAngle) * velocity,
      vy: -Math.sin(pAngle) * velocity,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      size: (5 + Math.random() * 6) * scalar,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      wobble: Math.random() * 10,
      wobbleSpeed: 0.08 + Math.random() * 0.1,
      gravity,
      drag: 0.95,
      opacity: 1,
      decay: 1 / ticks
    });
  }

  if (!animationFrameId) {
    runAnimationLoop();
  }
}

function runAnimationLoop() {
  if (!activeCanvas || !activeCtx) {
    animationFrameId = null;
    return;
  }

  const width = activeCanvas.width;
  const height = activeCanvas.height;

  activeCtx.clearRect(0, 0, width, height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.vx *= p.drag;
    p.vy = p.vy * p.drag + p.gravity;
    p.x += p.vx;
    p.y += p.vy;

    p.wobble += p.wobbleSpeed;
    p.rotation += p.rotationSpeed;
    p.opacity -= p.decay;

    if (p.opacity <= 0 || p.y > height + 40) {
      particles.splice(i, 1);
      continue;
    }

    activeCtx.save();
    activeCtx.translate(p.x, p.y);
    activeCtx.rotate((p.rotation * Math.PI) / 180);
    activeCtx.scale(Math.cos(p.wobble), 1);
    activeCtx.fillStyle = p.color;
    activeCtx.globalAlpha = Math.max(0, p.opacity);

    if (p.shape === 'circle') {
      activeCtx.beginPath();
      activeCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      activeCtx.fill();
    } else {
      activeCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
    }

    activeCtx.restore();
  }

  if (particles.length > 0) {
    animationFrameId = requestAnimationFrame(runAnimationLoop);
  } else {
    activeCtx.clearRect(0, 0, width, height);
    animationFrameId = null;
  }
}

/**
 * Disparar Confeti de Ánimo (Palabras aprendidas, puntos XP ganados)
 */
export function triggerCheerConfetti(options = {}) {
  const { force = false, sound = true } = options;
  if (!force && !isConfettiEnabled()) return;

  const now = Date.now();
  // Evitar saturación por clicks rápidos (throttle de 250ms)
  if (!force && now - lastCheerTimestamp < 250) return;
  lastCheerTimestamp = now;

  if (sound) {
    playSuccessChime();
  }

  confetti({
    particleCount: options.particleCount || 48,
    spread: options.spread || 75,
    origin: options.origin || { x: 0.5, y: 0.62 },
    colors: options.colors || CHEER_COLORS,
    startVelocity: 36
  });
}

/**
 * Disparar Gran Celebración (Módulo de currículum completado, gran hito)
 * Realiza una salva central y dos cañones laterales escalonados.
 */
export function triggerGrandConfetti(options = {}) {
  const { force = false, sound = true } = options;
  if (!force && !isConfettiEnabled()) return;

  const now = Date.now();
  if (!force && now - lastGrandTimestamp < 1200) return;
  lastGrandTimestamp = now;
  lastCheerTimestamp = now + 1200; // Suprimir cheers menores durante la gran fanfarria

  if (sound) {
    playGrandFanfare();
  }

  // 1. Salva central grande
  confetti({
    particleCount: options.particleCount || 100,
    spread: 100,
    origin: { x: 0.5, y: 0.52 },
    colors: GRAND_COLORS,
    startVelocity: 44
  });

  // 2. Cañón lateral izquierdo
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 60,
      origin: { x: 0.12, y: 0.65 },
      colors: CHEER_COLORS,
      startVelocity: 42
    });
  }, 140);

  // 3. Cañón lateral derecho
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 60,
      origin: { x: 0.88, y: 0.65 },
      colors: GRAND_COLORS,
      startVelocity: 42
    });
  }, 280);
}

// Inyección global en window para interoperabilidad transparente
if (typeof window !== 'undefined') {
  window.confetti = confetti;
  window.__nihongoTriggerCheerConfetti = triggerCheerConfetti;
  window.__nihongoTriggerGrandConfetti = triggerGrandConfetti;
}

export default confetti;
