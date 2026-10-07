'use client';

import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, AlertCircle, CheckCircle2, X, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../../lib/supabaseSync';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Supabase redirige automáticamente al flujo de Google OAuth
    } catch (err) {
      let msg = err.message || 'Error al conectar con Google.';
      if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider') || msg.includes('disabled')) {
        msg = 'El inicio de sesión con Google no está disponible en este momento. Puedes usar tu correo y contraseña.';
      }
      setErrorMessage(msg);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (activeTab === 'signup' && password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'signin') {
        const { user } = await signInWithEmail(cleanEmail, password);
        setSuccessMessage(`¡Bienvenido de nuevo, ${user?.email || cleanEmail}!`);
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 1200);
      } else {
        const { user, session } = await signUpWithEmail(cleanEmail, password);
        if (session) {
          setSuccessMessage('¡Cuenta creada e iniciada con éxito!');
          setTimeout(() => {
            onAuthSuccess(user);
            onClose();
          }, 1200);
        } else {
          setSuccessMessage('¡Cuenta creada! Si tienes confirmación de correo activa en Supabase, revisa tu bandeja de entrada.');
          setTimeout(() => {
            setActiveTab('signin');
            setLoading(false);
          }, 2500);
        }
      }
    } catch (err) {
      let msg = err.message || 'Error al procesar la solicitud.';
      if (msg.includes('Invalid login credentials')) {
        msg = 'Correo electrónico o contraseña incorrectos.';
      } else if (msg.includes('User already registered')) {
        msg = 'Ya existe una cuenta registrada con este correo. Prueba iniciar sesión.';
      } else if (msg.includes('Email not confirmed')) {
        msg = 'Correo no confirmado. Por favor revisa tu bandeja de entrada para verificar tu cuenta.';
      } else if (msg.includes('Password should be at least 6')) {
        msg = 'La contraseña debe tener un mínimo de 6 caracteres.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)'
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--bg-card, #ffffff)',
          color: 'var(--text-main, #0f172a)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface, rgba(99, 102, 241, 0.05))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary, #6366f1)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                {activeTab === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta Segura'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Protege y sincroniza tu progreso con Google o Correo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 6,
              borderRadius: 6
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-main)'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMessage(null); setSuccessMessage(null); }}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'signin' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'signin' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'signin' ? 700 : 500,
              borderBottom: activeTab === 'signin' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setErrorMessage(null); setSuccessMessage(null); }}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'signup' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'signup' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'signup' ? 700 : 500,
              borderBottom: activeTab === 'signup' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: 24 }}>
          {errorMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger, #ef4444)',
              color: 'var(--danger, #ef4444)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--success, #10b981)',
              color: 'var(--success, #10b981)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-card, #ffffff)',
              color: 'var(--text-main, #0f172a)',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              cursor: googleLoading || loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'all 0.2s',
              marginBottom: 16
            }}
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.86c2.26-2.09 3.685-5.17 3.685-9.09z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.31 21.36 7.39 24 12 24z"/>
                <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.31 2.64 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
              </svg>
            )}
            <span>Continuar con Google</span>
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              o con correo electrónico
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: activeTab === 'signup' ? 16 : 20 }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
                Contraseña
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem'
                  }}
                />
              </div>
            </div>

            {activeTab === 'signup' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: 6 }}>
                  Confirmar Contraseña
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '0.92rem'
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: 8
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>{activeTab === 'signin' ? 'Iniciar Sesión' : 'Registrar Cuenta'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee Footer */}
          <div style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            background: 'var(--bg-main)',
            border: '1px dashed var(--border)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8
          }}>
            <ShieldCheck size={18} style={{ color: 'var(--success, #10b981)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>Privacidad y Seguridad Garantizada</strong>: Tu progreso queda protegido y ligado exclusivamente a tu cuenta de Google o correo. Nadie más tiene acceso a tus datos de estudio.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
