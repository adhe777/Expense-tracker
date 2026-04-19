import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { budgetService, groupService } from '../services/api';
import toast from 'react-hot-toast';
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
    X,
    Plus
} from 'lucide-react';
import Logo from './Logo';

const Sidebar = ({ isOpen, onClose }) => {
    const { user: authUser, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [hasExceededBudget, setHasExceededBudget] = useState(false);
    const [groupAlerts, setGroupAlerts] = useState({});

    // Group Modal State
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        try {
            setIsSubmitting(true);
            await groupService.createGroup({ groupName: newGroupName, groupDescription: newGroupDescription });
            setNewGroupName('');
            setNewGroupDescription('');
            setShowCreateGroup(false);
            toast.success('Group created successfully!');
            await refreshUser();
            if (authUser.role === 'system_admin') navigate('/admin');
        } catch (err) {
            console.error("Create group error:", err);
            toast.error(err.response?.data?.message || 'Failed to create group');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (authUser && authUser.role !== 'system_admin') {
            const checkBudgets = async () => {
                try {
                    const budgets = await budgetService.getBudgets();
                    setHasExceededBudget(budgets.some(b => b.limit > 0 && b.spent >= b.limit));
                } catch (error) {
                    console.error("Failed to check budgets for sidebar:", error);
                }
            };
            
            const checkSettlements = async () => {
                if (!authUser.groups || authUser.groups.length === 0) return;
                try {
                    const alerts = {};
                    await Promise.all(authUser.groups.map(async (group) => {
                        const settlements = await groupService.getSettlements(group._id);
                        const userInvolved = settlements.some(s => s.fromId === authUser._id || s.toId === authUser._id);
                        if (userInvolved) {
                            alerts[group._id] = true;
                        }
                    }));
                    setGroupAlerts(alerts);
                } catch (error) {
                    console.error("Failed to check settlements for sidebar:", error);
                }
            };

            checkBudgets();
            checkSettlements();
        }
    }, [authUser, location.pathname]); 

    const isActive = (path) => location.pathname === path;

    const navItems = authUser?.role === 'system_admin' ? [] : [
        { icon: Layout, label: 'Dashboard', path: '/', id: 'home' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics', id: 'analytics' },
        { icon: PieChart, label: 'Budgets', path: '/budgets', id: 'budgets', alert: hasExceededBudget },
        { icon: User, label: 'Profile', path: '/profile', id: 'profile' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'active' : ''}`} style={{ zIndex: 10000 }}>
            {/* Mobile Close Button */}
            <button className="mobile-close" onClick={onClose}>
                <X size={24} />
            </button>

            <div className="sidebar-logo" style={{ marginBottom: '3rem', padding: '0 0.5rem' }}>
                <Logo size={32} />
            </div>

            <nav className="flex-1 overflow-y-auto pr-2" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="nav-section">
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em', paddingLeft: '1rem' }}>Menu</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => {
                                    if (window.innerWidth <= 768) onClose();
                                }}
                                style={{ position: 'relative' }}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                                {item.alert && (
                                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 10px var(--danger)' }}></span>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {authUser?.role === 'system_admin' && (
                    <Link 
                        to="/admin"
                        className="nav-item" 
                        onClick={() => {
                            if (window.innerWidth <= 768) onClose();
                        }} 
                        style={{ border: '1px solid rgba(34, 211, 238, 0.2)', background: 'rgba(34, 211, 238, 0.05)', color: 'var(--accent)' }}
                    >
                        <Shield size={20} />
                        <span style={{ fontWeight: 700 }}>ADMIN PANEL</span>
                    </Link>
                )}

                {authUser?.role !== 'system_admin' && (
                    <div className="nav-section">
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em', paddingLeft: '1rem' }}>Your Groups</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {authUser?.groups && authUser.groups.map(group => {
                                const isGroupActive = location.pathname === `/group/${group._id}`;
                                const hasAlert = groupAlerts[group._id];
                                return (
                                    <Link
                                        key={group._id}
                                        to={`/group/${group._id}`}
                                        className={`nav-item ${isGroupActive ? 'active' : ''}`}
                                        onClick={() => {
                                            if (window.innerWidth <= 768) onClose();
                                        }}
                                        style={{ position: 'relative' }}
                                    >
                                        <Users size={18} />
                                        <span style={{ fontSize: '0.9rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.groupName}</span>
                                        {hasAlert && (
                                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', boxShadow: '0 0 10px var(--warning)' }}></span>
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {authUser?.role !== 'system_admin' && (
                    <div className="nav-section">
                        <button
                            className="nav-item"
                            style={{ 
                                width: '100%', 
                                color: 'var(--primary)', 
                                border: '1px dashed var(--border)', 
                                background: 'transparent',
                                textAlign: 'left',
                                justifyContent: 'flex-start'
                            }}
                            onClick={() => setShowCreateGroup(true)}
                        >
                            <PlusCircle size={18} />
                            <span style={{ fontWeight: 600 }}>New Group</span>
                        </button>
                    </div>
                )}
            </nav>

            <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <button onClick={logout} className="nav-item" style={{ width: '100%', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <LogOut size={18} />
                    <span style={{ fontWeight: 600 }}>Sign Out</span>
                </button>
            </div>

            {showCreateGroup && (
                <div 
                    className="modal-overlay" 
                    style={{ zIndex: 999999 }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShowCreateGroup(false);
                    }}
                >
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Plus size={24} color="var(--primary)" />
                            Create New Group
                        </h3>
                        <form onSubmit={handleCreateGroup}>
                            <div className="modern-input-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Group Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dream Housemates"
                                    className="form-input"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="modern-input-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Description (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Shared expenses for Goa Trip"
                                    className="form-input"
                                    value={newGroupDescription}
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '3.5rem' }}>{isSubmitting ? 'Creating...' : 'Create Group'}</button>
                                <button type="button" onClick={() => setShowCreateGroup(false)} className="btn" style={{ flex: 1, height: '3.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
