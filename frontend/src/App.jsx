import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import GroupDashboard from './pages/GroupDashboard';
import ProfileSettings from './pages/ProfileSettings';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
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

    if (path.startsWith('/group/')) {
        const groupId = path.split('/')[2];
        return <GroupDashboard groupId={groupId} onBack={() => navigate('/')} />;
    }

    if (path === '/profile') {
        return <ProfileSettings onBack={() => navigate('/')} />;
    }

    return (
        <Dashboard
            onBudgets={() => navigate('/budgets')}
            onProfile={() => navigate('/profile')}
            onGroupView={(groupId) => navigate(`/group/${groupId}`)}
        />
    );
};

function App() {
    return (
        <ThemeProvider>
            <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />
            <BrowserRouter>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
