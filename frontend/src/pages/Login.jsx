import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
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
        <div className="auth-container">
            <div className="auth-card">
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h2>
                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <div className="input-group">
                            <label>Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                    )}
                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        {isRegister ? 'Sign Up' : 'Login'}
                    </button>
                </form>
                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <span
                        style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister ? 'Login' : 'Sign Up'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;
