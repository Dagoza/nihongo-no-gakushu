'use client';

import React, { useState } from 'react';
import { 
  Eye, 
  Link as LinkIcon, 
  Zap, 
  CheckCircle2, 
  X, 
  Volume2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import audioManager from '../../lib/audioManager';

// Catálogo curado de pares de kanjis visualmente confusos con método See-Link-Go
export const CONFUSING_KANJI_PAIRS = [
  {
    kanjiA: '隠',
    kanjiB: '穏',
    meaningA: 'Ocultar / Esconder',
    meaningB: 'Calmado / Sereno / Tranquilo',
    readingsA: 'イン (in) / かく・す',
    readingsB: 'オン (on) / おだ・やか',
    radicalA: '阝 (こざとへん · Colina / Muro)',
    radicalB: '禾 (のぎへん · Espiga de Arroz)',
    sharedPart: '爫 (garra) + 心 (corazón)',
    wordA: '隠す (かくす · Ocultar)',
    wordB: '穏やか (おだやか · Sereno)',
    seeNote: '隠 tiene a la izquierda 阝 (colina/muro de piedra); 穏 tiene 禾 (espiga vegetal de cereal). La parte derecha (爫+心) es exactamente idéntica.',
    linkNote: 'Te OCULTAS (隠) detrás de una colina (阝); mientras la espiga madura de trigo (禾) descansa en PAZ y calma (穏).',
    goNote: 'Imagínate escondido tras un inmenso muro de piedra conteniendo la respiración para no ser visto; mientras al otro lado, un monje acaricia una espiga dorada de arroz en absoluta serenidad.'
  },
  {
    kanjiA: '待',
    kanjiB: '持',
    meaningA: 'Esperar',
    meaningB: 'Sostener / Poseer / Llevar',
    readingsA: 'タイ (tai) / ま・つ',
    readingsB: 'ジ (ji) / も・つ',
    radicalA: '彳 (ぎょうにんべん · Pasos / Caminar)',
    radicalB: '扌 (てへん · Mano)',
    sharedPart: '寺 (templo budista)',
    wordA: '待つ (まつ · Esperar)',
    wordB: '持つ (もつ · Sostener / Tener)',
    seeNote: '待 usa 彳 (pasos); 持 usa 扌 (mano de tres trazos). Ambos comparten 寺 (templo) a la derecha.',
    linkNote: 'ESPERAS (待) dando pasos impacientes (彳) ante el templo; SOSTIENES (持) un amuleto sagrado con tu mano (扌) dentro del templo.',
    goNote: 'Tus pies no paran de dar pasos de lado a lado esperando que abra el templo; de repente aparece un gigante sosteniendo una campana de 500 kilos en una sola mano.'
  },
  {
    kanjiA: '未',
    kanjiB: '末',
    meaningA: 'Aún no / Todavía no',
    meaningB: 'Fin / Extremo / Final',
    readingsA: 'ミ (mi) / いま・だ',
    readingsB: 'マツ (matsu) / すえ',
    radicalA: 'Trazo horizontal superior CORTO',
    radicalB: 'Trazo horizontal superior LARGO',
    sharedPart: 'Estructura de árbol 木 con trazo adicional',
    wordA: '未来 (みらい · Futuro)',
    wordB: '週末 (しゅうまつ · Fin de semana)',
    seeNote: '未 tiene el trazo horizontal de arriba más corto que el inferior (aún no ha terminado de brotar); 末 tiene el trazo superior notablemente más largo.',
    linkNote: 'La rama superior es corta porque AÚN NO (未) terminó de crecer; la rama es larga porque ya alcanzó el EXTREMO o FIN (末) del árbol.',
    goNote: 'Un arbolito diminuto diciendo "¡espera, aún no crezco todo!"; frente a un árbol de 100 metros cuya copa gigantesca marca el final del horizonte.'
  },
  {
    kanjiA: '買',
    kanjiB: '売',
    meaningA: 'Comprar',
    meaningB: 'Vender',
    readingsA: 'バイ (bai) / か・う',
    readingsB: 'バイ (bai) / う・る',
    radicalA: '罒 (red) + 貝 (concha / dinero)',
    radicalB: '士 (erudito) + 冖 + 儿 (piernas)',
    sharedPart: 'Forma general comercial',
    wordA: '買い物 (かいもの · Compras)',
    wordB: '売店 (ばいてん · Quiosco / Tienda)',
    seeNote: '買 tiene 貝 (conchas/monedas antiguas en la base); 売 tiene 儿 (piernas en movimiento en la base).',
    linkNote: 'Para COMPRAR (買) debes soltar conchas de dinero (貝); cuando VENDES (売) sales corriendo con tus piernas (儿) con el dinero.',
    goNote: 'Una montaña de conchas marinas cayendo en el mostrador para comprar; y un vendedor con piernas gigantes corriendo a toda velocidad.'
  },
  {
    kanjiA: '犬',
    kanjiB: '太',
    meaningA: 'Perro',
    meaningB: 'Gordo / Grueso',
    readingsA: 'ケン (ken) / いぬ',
    readingsB: 'タイ (tai) / ふと・い',
    radicalA: 'Punto arriba a la derecha',
    radicalB: 'Punto abajo en el centro',
    sharedPart: '大 (grande)',
    wordA: '子犬 (こいぬ · Cachorro)',
    wordB: '太陽 (たいよう · Sol / Gran astro)',
    seeNote: '犬 tiene el punto arriba sobre el hombro derecho; 太 tiene el punto abajo entre las piernas.',
    linkNote: 'El PERRO (犬) tiene una pulga saltando en su oreja (arriba); la persona GORDA (太) tiene una gran gota de sudor en la barriga (abajo).',
    goNote: 'Visualiza un perro con una pulga gigante zumbando en su oreja derecha; y al lado a un luchador de sumo con una medalla gorda colgando de su ombligo.'
  },
  {
    kanjiA: '右',
    kanjiB: '左',
    meaningA: 'Derecha',
    meaningB: 'Izquierda',
    readingsA: 'ウ (u) / みぎ',
    readingsB: 'サ (sa) / ひだり',
    radicalA: '口 (boca)',
    radicalB: '工 (herramienta / trabajo)',
    sharedPart: '一 + 丿 (mano extendida)',
    wordA: '右手 (みぎて · Mano derecha)',
    wordB: '左手 (ひだりて · Mano izquierda)',
    seeNote: '右 contiene 口 (boca); 左 contiene 工 (regla de carpintero / herramienta).',
    linkNote: 'Con la DERECHA (右) te llevas la comida a la BOCA (口); con la IZQUIERDA (左) sujetas la herramienta de TRABAJO (工).',
    goNote: 'Usa tu mano derecha para meterte un bocado gigante de sushi en la boca; con la mano izquierda sujetas un martillo de carpintero.'
  },
  {
    kanjiA: '借',
    kanjiB: '貸',
    meaningA: 'Pedir prestado',
    meaningB: 'Prestar',
    readingsA: 'シャク (shaku) / か・りる',
    readingsB: 'タイ (tai) / か・す',
    radicalA: '亻 (persona) + 昔 (antiguo / pasado)',
    radicalB: '代 (sustituto) + 貝 (conchas / dinero)',
    sharedPart: 'Verbos de préstamo financiero',
    wordA: '借金 (しゃっきん · Deuda)',
    wordB: '貸出 (かしだし · Préstamo de libros)',
    seeNote: '借 usa 昔 (pasado); 貸 usa 貝 (dinero).',
    linkNote: 'Pides PRESTADO (借) a un amigo de los viejos tiempos (昔); PRESTAS (貸) esperando recibir conchas de dinero (貝) de vuelta.',
    goNote: 'Un amigo del pasado que regresa en máquina del tiempo pidiéndote dinero; y tú prestando conchas relucientes con intereses.'
  },
  {
    kanjiA: '間',
    kanjiB: '聞',
    meaningA: 'Intervalo / Espacio / Entre',
    meaningB: 'Escuchar / Oír / Preguntar',
    readingsA: 'カン (kan) / あいだ / ま',
    readingsB: 'ブン (bun) / き・く',
    radicalA: '門 (puerta) + 日 (sol)',
    radicalB: '門 (puerta) + 耳 (oreja)',
    sharedPart: '門 (puertas dobles)',
    wordA: '時間 (じかん · Tiempo)',
    wordB: '新聞 (しんぶん · Periódico)',
    seeNote: 'Ambos tienen 門 (puerta). 間 encierra 日 (sol); 聞 encierra 耳 (oreja).',
    linkNote: 'Ves la luz del SOL (日) entrar por la rendija del INTERVALO (間) de la puerta; pegas tu OREJA (耳) a la puerta para ESCUCHAR (聞).',
    goNote: 'Un rayo de sol quemándote los ojos por una rendija de la puerta; y una oreja gigante pegada a la madera espiando una conversación.'
  }
];

export function findConfusionMatch(targetChar) {
  if (!targetChar) return null;
  const pair = CONFUSING_KANJI_PAIRS.find(p => p.kanjiA === targetChar || p.kanjiB === targetChar);
  if (pair) {
    const isA = pair.kanjiA === targetChar;
    return {
      target: isA ? pair.kanjiA : pair.kanjiB,
      targetMeaning: isA ? pair.meaningA : pair.meaningB,
      targetRadical: isA ? pair.radicalA : pair.radicalB,
      targetWord: isA ? pair.wordA : pair.wordB,
      targetReadings: isA ? pair.readingsA : pair.readingsB,
      confusing: isA ? pair.kanjiB : pair.kanjiA,
      confusingMeaning: isA ? pair.meaningB : pair.meaningA,
      confusingRadical: isA ? pair.radicalB : pair.radicalA,
      confusingWord: isA ? pair.wordB : pair.wordA,
      confusingReadings: isA ? pair.readingsB : pair.readingsA,
      sharedPart: pair.sharedPart,
      seeNote: pair.seeNote,
      linkNote: pair.linkNote,
      goNote: pair.goNote
    };
  }
  return null;
}

/**
 * Modal e intervención pedagógica See-Link-Go para destrabar confusiones visuales en kanjis sanguijuela (Leeches)
 */
export default function ConfusionComparator({
  targetKanji,
  onClose,
  isOpen = true
}) {
  const [activeStep, setActiveStep] = useState(1); // 1: Ver, 2: Vincular, 3: Exagerar
  const match = findConfusionMatch(targetKanji);

  if (!isOpen) return null;

  const data = match || {
    target: targetKanji || '漢',
    targetMeaning: 'Carácter evaluado',
    targetRadical: 'Componente característico',
    targetWord: `${targetKanji || '漢'}字`,
    targetReadings: 'Onyomi / Kunyomi',
    confusing: '字',
    confusingMeaning: 'Carácter con grafía o radical similar',
    confusingRadical: 'Componente contrastante',
    confusingWord: '漢字',
    confusingReadings: 'Onyomi / Kunyomi',
    sharedPart: 'Componentes y trazos base',
    seeNote: `Identifica el radical específico que diferencia a ${targetKanji} de otros ideogramas con trazos parecidos.`,
    linkNote: `Conecta mentalmente la función semántica de ${targetKanji} con su radical diferenciador.`,
    goNote: `Visualiza una escena cómica o dramática donde el componente clave sea el protagonista indiscutible.`
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'var(--bg-main, #ffffff)',
          color: 'var(--text-main, #1e293b)',
          borderRadius: 16,
          maxWidth: 620,
          width: '100%',
          boxShadow: '0 20px 45px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          border: '2px solid rgba(239, 68, 68, 0.35)',
          animation: 'fadeIn 0.25s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#ef4444',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                Intervención See-Link-Go (Antídoto a Leeches)
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Destraba la confusión visual entre kanjis similares
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '50%', width: 32, height: 32, padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Comparación lado a lado de ambos Kanjis */}
        <div style={{ padding: '20px 20px 14px 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 12,
            alignItems: 'center',
            marginBottom: 20
          }}>
            {/* Tarjeta Objetivo */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.06)',
              border: '2px solid var(--primary)',
              borderRadius: 12,
              padding: '16px 12px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Tu Tarjeta FSRS
              </span>
              <div className="jp-text" style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1.1, margin: '6px 0', color: 'var(--primary)' }}>
                {data.target}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 4 }}>
                {data.targetMeaning}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                {data.targetReadings}
              </div>
              <div style={{
                fontSize: '0.72rem',
                background: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--primary)',
                padding: '4px 8px',
                borderRadius: 6,
                fontWeight: 700
              }}>
                Radical: {data.targetRadical}
              </div>
              <button
                type="button"
                onClick={() => audioManager.speak(data.target)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
              >
                <Volume2 size={13} /> {data.targetWord}
              </button>
            </div>

            {/* Separador VS */}
            <div style={{ textAlign: 'center' }}>
              <span style={{
                display: 'inline-block',
                background: 'var(--border)',
                color: 'var(--text-muted)',
                fontWeight: 900,
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: 9999
              }}>
                VS
              </span>
            </div>

            {/* Tarjeta Confundible */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '2px solid rgba(239, 68, 68, 0.5)',
              borderRadius: 12,
              padding: '16px 12px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                El Kanji Confundible
              </span>
              <div className="jp-text" style={{ fontSize: '3.6rem', fontWeight: 900, lineHeight: 1.1, margin: '6px 0', color: '#ef4444' }}>
                {data.confusing}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 4 }}>
                {data.confusingMeaning}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                {data.confusingReadings}
              </div>
              <div style={{
                fontSize: '0.72rem',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                padding: '4px 8px',
                borderRadius: 6,
                fontWeight: 700
              }}>
                Radical: {data.confusingRadical}
              </div>
              <button
                type="button"
                onClick={() => audioManager.speak(data.confusing)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
              >
                <Volume2 size={13} /> {data.confusingWord}
              </button>
            </div>
          </div>

          {/* Selector de los 3 pasos See-Link-Go */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            <button
              type="button"
              className={`btn btn-xs ${activeStep === 1 ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveStep(1)}
              style={{ flex: 1, gap: 5, borderRadius: 8, padding: '7px 4px' }}
            >
              <Eye size={13} /> 1. Ver (See)
            </button>
            <button
              type="button"
              className={`btn btn-xs ${activeStep === 2 ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveStep(2)}
              style={{ flex: 1, gap: 5, borderRadius: 8, padding: '7px 4px' }}
            >
              <LinkIcon size={13} /> 2. Vincular (Link)
            </button>
            <button
              type="button"
              className={`btn btn-xs ${activeStep === 3 ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveStep(3)}
              style={{ flex: 1, gap: 5, borderRadius: 8, padding: '7px 4px' }}
            >
              <Zap size={13} /> 3. Exagerar (Go)
            </button>
          </div>

          {/* Contenido del paso seleccionado */}
          <div style={{
            background: 'var(--bg-subtle, #f8fafc)',
            padding: '14px 16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            minHeight: 90
          }}>
            {activeStep === 1 && (
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: 4 }}>
                  👁️ Paso 1: Aislar la diferencia gráfica (See)
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.5 }}>
                  {data.seeNote}
                </p>
              </div>
            )}

            {activeStep === 2 && (
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#8b5cf6', marginBottom: 4 }}>
                  🔗 Paso 2: Vincular componente con el significado (Link)
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.5 }}>
                  {data.linkNote}
                </p>
              </div>
            )}

            {activeStep === 3 && (
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ef4444', marginBottom: 4 }}>
                  🚀 Paso 3: Fijar con una escena dramática o absurda (Go)
                </div>
                <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.5 }}>
                  {data.goNote}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer con avance y cierre */}
        <div style={{
          padding: '12px 20px',
          background: 'var(--bg-subtle, #f8fafc)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Parte idéntica compartida: <strong>{data.sharedPart}</strong>
          </span>

          <div style={{ display: 'flex', gap: 8 }}>
            {activeStep < 3 ? (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setActiveStep(prev => prev + 1)}
                style={{ gap: 4 }}
              >
                <span>Siguiente Paso</span>
                <ArrowRight size={14} />
              </button>
            ) : null}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onClose}
              style={{ gap: 6 }}
            >
              <CheckCircle2 size={15} />
              <span>Entendido, Continuar Repaso</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
