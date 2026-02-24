import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import './index.css';

const AppContent = () => {
    const { user, loading } = useAuth();
    const [path, setPath] = React.useState(window.location.pathname);

    React.useEffect(() => {
        const handlePathChange = () => setPath(window.location.pathname);
        window.addEventListener('popstate', handlePathChange);
        window.addEventListener('pushstate_change', handlePathChange);
        return () => {
            window.removeEventListener('popstate', handlePathChange);
            window.removeEventListener('pushstate_change', handlePathChange);
        };
    }, []);

    const navigate = (newPath) => {
        window.history.pushState({}, '', newPath);
        setPath(newPath);
        window.dispatchEvent(new Event('pushstate_change'));
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>Loading...</div>;

    if (!user) return <Login title="Personal Finance Tracker" />;

    if (path === '/budgets') {
        return <Budgets onBack={() => navigate('/')} />;
    }

    return (
        <Dashboard
            onBudgets={() => navigate('/budgets')}
        />
    );
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
