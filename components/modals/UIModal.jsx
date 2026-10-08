'use client';

import React, { useEffect } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Lock, 
  HelpCircle, 
  X 
} from 'lucide-react';
import useFocusTrap from '../../lib/useFocusTrap';

export default function UIModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'info' | 'warning' | 'error' | 'success' | 'lock' | 'confirm'
  confirmText = 'Entendido',
  cancelText = null,
  isDestructive = false,
  actionLabel = null,
  onAction = null,
  onConfirm = null
}) {
  const modalCardRef = useFocusTrap(isOpen);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'lock':
        return <Lock size={26} style={{ color: '#f59e0b' }} />;
      case 'warning':
        return <AlertTriangle size={26} style={{ color: '#f59e0b' }} />;
      case 'error':
        return <AlertCircle size={26} style={{ color: '#ef4444' }} />;
      case 'success':
        return <CheckCircle2 size={26} style={{ color: '#10b981' }} />;
      case 'confirm':
        return <HelpCircle size={26} style={{ color: 'var(--primary)' }} />;
      case 'info':
      default:
        return <Info size={26} style={{ color: 'var(--primary)' }} />;
    }
  };

  const handleConfirmClick = () => {
    if (onConfirm) onConfirm();
    onClose(true);
  };

  const handleCancelClick = () => {
    onClose(false);
  };

  const handleActionClick = () => {
    if (onAction) onAction();
    onClose(false);
  };

  return (
    <div 
      className="ui-modal-overlay" 
      onClick={() => onClose(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'uiModalFadeIn 0.18s ease-out'
      }}
    >
      <div 
        ref={modalCardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ui-modal-title"
        tabIndex={-1}
        className="ui-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-bento, 20px)',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'uiModalScaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{
          padding: '22px 24px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <div style={{
            flexShrink: 0,
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: type === 'error' ? 'rgba(239, 68, 68, 0.14)' 
                      : (type === 'warning' || type === 'lock') ? 'rgba(245, 158, 11, 0.14)' 
                      : type === 'success' ? 'rgba(16, 185, 129, 0.14)' 
                      : 'rgba(99, 102, 241, 0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getIcon()}
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
            <h3 
              id="ui-modal-title"
              style={{
                margin: '0 0 6px 0',
                fontSize: '1.12rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.3
              }}
            >
              {title || (type === 'confirm' ? '¿Estás seguro?' : 'Aviso')}
            </h3>
            <div style={{
              margin: 0,
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              wordBreak: 'break-word',
              whiteSpace: 'pre-line'
            }}>
              {message}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onClose(false)}
            aria-label="Cerrar"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{
          padding: '14px 20px',
          background: 'var(--background)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px'
        }}>
          {actionLabel && (
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleActionClick}
              style={{ marginRight: 'auto' }}
            >
              {actionLabel}
            </button>
          )}

          {cancelText && (
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={handleCancelClick}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: isDestructive ? '#ef4444' : 'var(--primary)',
              borderColor: isDestructive ? '#ef4444' : 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              padding: '6px 16px'
            }}
            onClick={handleConfirmClick}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
