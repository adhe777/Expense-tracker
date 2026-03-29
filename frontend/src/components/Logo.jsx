import React from 'react';

const Logo = ({ size = 40, showText = true, className = "", textColor = "#FFFFFF" }) => {
    return (
        <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6C5CE7" />
                            <stop offset="100%" stopColor="#00CEC9" />
                        </linearGradient>
                        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    
                    {/* Outer stylized brain/vault shape */}
                    <path 
                        d="M20 4C11.1634 4 4 11.1634 4 20C4 28.8366 11.1634 36 20 36C28.8366 36 36 28.8366 36 20C36 11.1634 28.8366 4 20 4Z" 
                        stroke="url(#logoGrad)" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 2"
                        opacity="0.3"
                    />
                    
                    {/* Inner Wallet/Finance Core */}
                    <path 
                        d="M10 18C10 15.7909 11.7909 14 14 14H26C28.2091 14 30 15.7909 30 18V28C30 30.2091 28.2091 32 26 32H14C11.7909 32 10 30.2091 10 28V18Z" 
                        fill="url(#logoGrad)" 
                        opacity="0.15"
                    />
                    <path 
                        d="M10 20H30M13 14V11C13 9.89543 13.8954 9 15 9H25C26.1046 9 27 9.89543 27 11V14" 
                        stroke="url(#logoGrad)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                    />
                    
                    {/* AI Neuron/Pulse Line */}
                    <path 
                        d="M15 24H18L20 20L22 28L24 24H27" 
                        stroke="url(#logoGrad)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        filter="url(#neonGlow)"
                    />
                </svg>
            </div>
            {showText && (
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                    <span style={{ 
                        fontSize: size * 0.45, 
                        fontWeight: 900, 
                        letterSpacing: '-0.03em', 
                        color: textColor,
                        textTransform: 'uppercase'
                    }}>
                        AI <span style={{ color: '#00CEC9' }}>FINMATE</span>
                    </span>
                    <span style={{ 
                        fontSize: size * 0.18, 
                        fontWeight: 600, 
                        color: '#B2BEC3', 
                        letterSpacing: '0.15em',
                        marginTop: '0.2rem',
                        textTransform: 'uppercase'
                    }}>
                        Smart Finance
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
