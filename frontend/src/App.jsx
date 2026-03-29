import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import AnalyticsPage from './pages/AnalyticsPage';
import GroupDashboard from './pages/GroupDashboard';
import ProfileSettings from './pages/ProfileSettings';
import AdminDashboard from './pages/AdminDashboard';
import GroupAdminDashboard from './pages/GroupAdminDashboard';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const GroupViewWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    return <GroupDashboard groupId={id} onBack={() => navigate(-1)} />;
};

const GroupAdminWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    return <GroupAdminDashboard groupId={id} onBack={() => navigate(-1)} />;
};

const AppContent = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login title="Personal Finance Tracker" />} />
            
            <Route path="/" element={
                <ProtectedRoute>
                    <Dashboard
                        onBudgets={() => navigate('/budgets')}
                        onProfile={() => navigate('/profile')}
                        onAdmin={() => navigate('/admin')}
                        onGroupAdmin={(id) => navigate(`/group-admin/${id}`)}
                        onGroupView={(id) => navigate(`/group/${id}`)}
                    />
                </ProtectedRoute>
            } />

            <Route path="/analytics" element={
                <ProtectedRoute>
                    <AnalyticsPage />
                </ProtectedRoute>
            } />

            <Route path="/budgets" element={
                <ProtectedRoute>
                    <Budgets onBack={() => navigate(-1)} />
                </ProtectedRoute>
            } />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <ProfileSettings onBack={() => navigate(-1)} />
                </ProtectedRoute>
            } />

            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminDashboard onBack={() => navigate(-1)} />
                </ProtectedRoute>
            } />

            <Route path="/group/:id" element={
                <ProtectedRoute>
                    <GroupViewWrapper />
                </ProtectedRoute>
            } />

            <Route path="/group-admin/:id" element={
                <ProtectedRoute>
                    <GroupAdminWrapper />
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
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
