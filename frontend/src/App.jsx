import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import AnalyticsPage from './pages/AnalyticsPage';
import GroupDashboard from './pages/GroupDashboard';
import ProfileSettings from './pages/ProfileSettings';
import AdminDashboard from './pages/AdminDashboard';
import GroupAdminDashboard from './pages/GroupAdminDashboard';
import ChatAssistant from './components/ChatAssistant';
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';
import { Routes, Route, useNavigate, useParams, Navigate, Outlet } from 'react-router-dom';
import './index.css';

const ProtectedRoute = ({ children }) => {
    const auth = useAuth() || {};
    const { user, loading } = auth;
    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
            <div className="neon-glow" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    return children;
};

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    return (
        <div className="app-layout">
            <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
            </button>

            <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
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

function App() {
    const auth = useAuth();
    const user = auth?.user;
    const navigate = useNavigate();

    return (
        <>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login title="Personal Finance Tracker" />} />
                
                {/* Protected Routes with Layout */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path="/" element={
                        user?.role === 'system_admin' ? (
                            <AdminDashboard />
                        ) : (
                            <Dashboard
                                onBudgets={() => navigate('/budgets')}
                                onProfile={() => navigate('/profile')}
                                onAdmin={() => navigate('/admin')}
                                onGroupAdmin={(id) => navigate(`/group-admin/${id}`)}
                                onGroupView={(id) => navigate(`/group/${id}`)}
                            />
                        )
                    } />

                    <Route path="/analytics" element={
                        user?.role === 'system_admin' ? <Navigate to="/" /> : <AnalyticsPage />
                    } />

                    <Route path="/budgets" element={
                        user?.role === 'system_admin' ? <Navigate to="/" /> : <Budgets onBack={() => navigate(-1)} />
                    } />

                    <Route path="/profile" element={
                        <ProfileSettings onBack={() => navigate(-1)} />
                    } />

                    <Route path="/admin" element={
                        user?.role === 'system_admin' ? <AdminDashboard /> : <Navigate to="/" />
                    } />

                    <Route path="/group/:id" element={
                        <GroupViewWrapper />
                    } />

                    <Route path="/group-admin/:id" element={
                        <GroupAdminWrapper />
                    } />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <ChatAssistant />
        </>
    );
}

export default App;
