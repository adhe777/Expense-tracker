import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, variant = 'danger' }) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            iconBg: 'rgba(239, 68, 68, 0.15)',
            iconColor: '#ef4444',
            btnBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
            btnShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            btnHoverShadow: '0 6px 20px rgba(239, 68, 68, 0.6)'
        },
        warning: {
            iconBg: 'rgba(245, 158, 11, 0.15)',
            iconColor: '#f59e0b',
            btnBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
            btnShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
            btnHoverShadow: '0 6px 20px rgba(245, 158, 11, 0.6)'
        },
        success: {
            iconBg: 'rgba(16, 185, 129, 0.15)',
            iconColor: '#10b981',
            btnBg: 'linear-gradient(135deg, #10b981, #059669)',
            btnShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            btnHoverShadow: '0 6px 20px rgba(16, 185, 129, 0.6)'
        }
    };

    const style = variantStyles[variant] || variantStyles.danger;

    return (
        <div
            className="modal-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 20000,
                animation: 'fadeIn 0.2s ease'
            }}
            onClick={onCancel}
        >
            <div
                className="card"
                style={{
                    width: '360px',
                    height: 'fit-content',
                    minHeight: 'auto',
                    padding: '2rem',
                    borderRadius: '1rem',
                    animation: 'slideUp 0.25s ease',
                    border: '1px solid var(--border)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                    <X size={18} />
                </button>

                {/* Icon */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: style.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <AlertTriangle size={28} color={style.iconColor} />
                    </div>
                </div>

                {/* Text */}
                <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)'
                }}>
                    {title}
                </h3>
                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    lineHeight: 1.6,
                    marginBottom: '1.75rem'
                }}>
                    {message}
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            background: style.btnBg,
                            color: 'white',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            boxShadow: style.btnShadow,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = style.btnHoverShadow;
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = style.btnShadow;
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
