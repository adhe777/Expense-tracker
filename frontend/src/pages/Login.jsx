import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';

const Login = ({ title = "FINANCE TRACKER" }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                await register(name, email, password);
            } else {
                await login(email, password);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Authentication failed');
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-card-premium">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'var(--primary)', borderRadius: '1rem', marginBottom: '1rem', boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)' }}>
                        <ShieldCheck size={36} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
                        {isRegister ? 'Create an Account' : 'Welcome Back'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                        {isRegister ? 'Enter your details to construct your financial hub.' : 'Enter your credentials to access your dashboard.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {isRegister && (
                        <div className="modern-input-group">
                            <label>Full Name</label>
                            <div className="icon-input-wrapper">
                                <UserIcon className="input-icon" size={18} />
                                <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                        </div>
                    )}
                    <div className="modern-input-group">
                        <label>Email Address</label>
                        <div className="icon-input-wrapper">
                            <Mail className="input-icon" size={18} />
                            <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>
                    <div className="modern-input-group">
                        <label>Password</label>
                        <div className="icon-input-wrapper">
                            <Lock className="input-icon" size={18} />
                            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </div>

                    <button type="submit" className="btn-modern-submit" style={{ marginTop: '1rem' }}>
                        {isRegister ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            type="button"
                            onClick={() => setIsRegister(!isRegister)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, marginLeft: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            {isRegister ? 'Sign In' : 'Register Now'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
