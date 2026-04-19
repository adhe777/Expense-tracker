import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User as UserIcon, ArrowRight, TrendingUp, Zap, Shield, Cpu, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isRegister) {
                await register(name, email, password);
                toast.success('Welcome to AI FINMATE!');
            } else {
                await login(email, password);
                toast.success('Login successful. Welcome back!');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page animate-fade-in">
            <div className="auth-sidebar" style={{ 
                background: 'linear-gradient(160deg, #1A1A2E 0%, #6C5CE7 100%)',
                position: 'relative'
            }}>
                <div className="auth-sidebar-dots" style={{ opacity: 0.4 }}></div>
                
                <div style={{ position: 'relative', zIndex: 5, maxWidth: '440px' }}>
                    <Logo size={48} className="animate-slide-up" />
                    
                    <div style={{ marginTop: '4rem' }}>
                        <h1 className="animate-slide-up" style={{ 
                            fontSize: '3.5rem', 
                            fontWeight: 900, 
                            lineHeight: 1, 
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.04em'
                        }}>
                            Smart Finance <span style={{ color: '#00CEC9' }}>Management.</span>
                        </h1>
                        <p className="animate-slide-up" style={{ 
                            fontSize: '1.1rem', 
                            lineHeight: 1.6, 
                            color: 'rgba(255,255,255,0.7)', 
                            marginBottom: '3.5rem',
                            animationDelay: '0.1s'
                        }}>
                            Manage your personal and group expenses easily with AI-powered insights and real-time tracking.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }} className="animate-slide-up">
                            {[
                                { icon: <TrendingUp size={20} />, title: "Smart Analytics", desc: "Predicted spending trends for the next 6 months." },
                                { icon: <Zap size={20} />, title: "Easy Payments", desc: "Settle group debts instantly with one click." },
                                { icon: <Cpu size={20} />, title: "AI Assistant", desc: "Personalized tips to help you save more." }
                            ].map((item, idx) => (
                                <div key={idx} style={{ 
                                    display: 'flex', 
                                    gap: '1rem', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    padding: '1.25rem', 
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'transform 0.3s ease'
                                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(10px)'}
                                   onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                                    <div style={{ color: '#00CEC9' }}>{item.icon}</div>
                                    <div>
                                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{item.title}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-content">
                <div className="auth-card-premium animate-scale-in">
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00CEC9', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <Shield size={14} />
                            <span>Secure Connection</span>
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.025em', marginBottom: '0.5rem' }}>
                            {isRegister ? 'Create Account' : 'Login'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            {isRegister ? 'Enter your details to create a new account.' : 'Please login to access your dashboard.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {isRegister && (
                            <div className="modern-input-group">
                                <label>Full Name</label>
                                <div className="icon-input-wrapper">
                                    <UserIcon className="input-icon" size={18} color="var(--primary)" />
                                    <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                            </div>
                        )}
                        <div className="modern-input-group">
                            <label>Email Address</label>
                            <div className="icon-input-wrapper">
                                <Mail className="input-icon" size={18} color="var(--primary)" />
                                <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </div>
                        <div className="modern-input-group">
                            <label>Password</label>
                            <div className="icon-input-wrapper">
                                <Lock className="input-icon" size={18} color="var(--primary)" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-modern-submit" disabled={isLoading} style={{ 
                            marginTop: '1rem', 
                            height: '3.75rem',
                            background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
                            boxShadow: '0 8px 16px rgba(108, 92, 231, 0.3)'
                        }}>
                            {isLoading ? 'Processing...' : (
                                <>
                                    <span style={{ fontWeight: 800 }}>{isRegister ? 'SIGN UP' : 'LOGIN'}</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {isRegister ? 'Already have an account?' : "New here?"}
                            <button
                                type="button"
                                onClick={() => setIsRegister(!isRegister)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: '#00CEC9', 
                                    fontWeight: 800, 
                                    marginLeft: '0.5rem', 
                                    cursor: 'pointer', 
                                    fontSize: '0.9rem',
                                    textTransform: 'uppercase',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 206, 201, 0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                                {isRegister ? 'Login' : 'Sign Up'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
