import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

const AppContent = () => {
    const { user, loading } = useAuth();
    const [view, setView] = useState('user'); // 'user' or 'admin'

    // Intercept window.location.href changes if needed, 
    // but for now, we use state for simplicity since React Router isn't here.
    React.useEffect(() => {
        const handlePathChange = () => {
            if (window.location.pathname === '/admin' && user?.isAdmin) {
                setView('admin');
            } else {
                setView('user');
            }
        };
        handlePathChange();
        window.addEventListener('popstate', handlePathChange);
        return () => window.removeEventListener('popstate', handlePathChange);
    }, [user]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>Loading System...</div>;

    if (!user) return <Login />;

    if (view === 'admin' && user.isAdmin) {
        return <AdminDashboard onBack={() => {
            window.history.pushState({}, '', '/');
            setView('user');
        }} />;
    }

    return <Dashboard onAdmin={() => {
        window.history.pushState({}, '', '/admin');
        setView('admin');
    }} />;
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
