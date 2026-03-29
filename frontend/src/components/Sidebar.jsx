import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LogOut,
    Home,
    PieChart,
    User,
    Users,
    ChevronLeft,
    Shield,
    PlusCircle,
    LayoutDashboard as Layout,
    BarChart3,
    X
} from 'lucide-react';
import Logo from './Logo';

const Sidebar = ({ onShowCreateGroup, isOpen, onClose }) => {
    const { user: authUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { icon: Layout, label: 'Dashboard', path: '/', id: 'home' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics', id: 'analytics' },
        { icon: PieChart, label: 'Budgets', path: '/budgets', id: 'budgets' },
        { icon: User, label: 'Profile', path: '/profile', id: 'profile' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
            {/* Mobile Close Button */}
            <button className="mobile-close" onClick={onClose} style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'none' /* Handled in CSS */
            }}>
                <X size={24} />
            </button>

            <div className="sidebar-logo" style={{ marginBottom: '3rem', padding: '0 0.5rem' }}>
                <Logo size={32} />
            </div>

            <nav className="flex-1 overflow-y-auto pr-2">
                <div className="nav-section">
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em', paddingLeft: '1rem' }}>Menu</p>
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => {
                                navigate(item.path);
                                if (window.innerWidth <= 768) onClose();
                            }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                {authUser?.role === 'system_admin' && (
                    <div 
                        className="nav-item" 
                        onClick={() => {
                            navigate('/admin');
                            if (window.innerWidth <= 768) onClose();
                        }} 
                        style={{ marginTop: '1rem', border: '1px solid rgba(34, 211, 238, 0.2)', background: 'rgba(34, 211, 238, 0.05)', color: 'var(--accent)' }}
                    >
                        <Shield size={20} />
                        <span style={{ fontWeight: 700 }}>ADMIN PANEL</span>
                    </div>
                )}

                <div className="nav-section" style={{ marginTop: '2.5rem' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em', paddingLeft: '1rem' }}>Your Groups</p>
                    {authUser?.groups && authUser.groups.map(group => {
                        const isGroupActive = location.pathname === `/group/${group._id}`;
                        return (
                            <div
                                key={group._id}
                                className={`nav-item ${isGroupActive ? 'active' : ''}`}
                                onClick={() => {
                                    navigate(`/group/${group._id}`);
                                    if (window.innerWidth <= 768) onClose();
                                }}
                            >
                                <Users size={18} />
                                <span style={{ fontSize: '0.9rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.groupName}</span>
                            </div>
                        );
                    })}
                    
                    <div
                        className="nav-item"
                        style={{ color: 'var(--primary)', border: '1px dashed var(--border)', marginTop: '0.5rem' }}
                        onClick={onShowCreateGroup}
                    >
                        <PlusCircle size={18} />
                        <span style={{ fontWeight: 600 }}>New Group</span>
                    </div>
                </div>
            </nav>

            <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <button onClick={logout} className="nav-item" style={{ width: '100%', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <LogOut size={18} />
                    <span style={{ fontWeight: 600 }}>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
