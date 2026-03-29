import React from 'react';
import { PlusCircle } from 'lucide-react';

const EmptyState = ({ icon: Icon, title, message, actionText, onAction }) => {
    return (
        <div className="empty-state container-glass animate-slide-up" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '4rem 2rem', 
            textAlign: 'center', 
            background: 'var(--bg-card)', 
            border: '1px dashed var(--border)',
            borderRadius: '2rem',
            margin: '2rem 0',
            width: '100%',
            gridColumn: '1 / -1'
        }}>
            <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '24px', 
                background: 'rgba(99, 102, 241, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '2rem',
                color: 'var(--primary)',
                boxShadow: '0 0 30px rgba(99, 102, 241, 0.1)'
            }}>
                {Icon && <Icon size={40} />}
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>{title}</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', lineHeight: 1.6, marginBottom: '2.5rem', fontWeight: 500 }}>{message}</p>
            {actionText && (
                <button onClick={onAction} className="btn btn-primary hover-lift neon-glow" style={{ padding: '0 20px', height: '3.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlusCircle size={20} />
                    {actionText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
