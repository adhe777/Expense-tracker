import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, groupAnalyticsService } from '../services/api';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
    Users, 
    Layout, 
    CreditCard, 
    Trash2, 
    BarChart2, 
    Shield, 
    Activity, 
    Globe, 
    Database, 
    HardDrive, 
    Cpu, 
    ChevronDown, 
    ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import GroupAdminDashboard from './GroupAdminDashboard';
import ThemeToggle from '../components/ThemeToggle';

const CHART_COLORS = ['#6366F1', '#22D3EE', '#F59E0B', '#10B981', '#EF4444'];

const AdminDashboard = () => {
    const auth = useAuth();
    const currentUser = auth?.user;
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [groupAnalytics, setGroupAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', confirmText: 'Confirm', variant: 'danger', onConfirm: () => { }
    });

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const [statsRes, usersRes, groupsRes] = await Promise.all([
                adminService.getStats(),
                adminService.getUsers(),
                adminService.getGroups()
            ]);
            setStats(statsRes);
            setUsers(usersRes);
            setGroups(groupsRes);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch admin data');
            setLoading(false);
        }
    };

    const handleDeleteUser = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete User',
            message: 'Are you sure you want to permanently delete this user? This action cannot be undone.',
            confirmText: 'Delete User',
            variant: 'danger',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    await adminService.deleteUser(id); 
                    toast.success('User deleted');
                    fetchAdminData();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to delete user');
                }
            }
        });
    };

    const handleDeleteGroup = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Group',
            message: 'Are you sure you want to delete this group? All shared financial history for this hub will be purged.',
            confirmText: 'Delete Group',
            variant: 'danger',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    await adminService.deleteGroup(id);
                    toast.success('Group deleted');
                    fetchAdminData();
                    if (expandedGroup === id) {
                        setExpandedGroup(null);
                        setGroupAnalytics(null);
                    }
                } catch (error) {
                    toast.error('Failed to delete group');
                }
            }
        });
    };

    const handleExpandGroup = async (id) => {
        if (expandedGroup === id) {
            setExpandedGroup(null);
            setGroupAnalytics(null);
            return;
        }
        setExpandedGroup(id);
        setLoadingAnalytics(true);
        try {
            const data = await groupAnalyticsService.getAnalytics(id);
            setGroupAnalytics(data);
        } catch (error) {
            toast.error('Could not load group details. Please try again.');
        } finally {
            setLoadingAnalytics(false);
        }
    };

    if (loading || !stats) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                <div className="neon-glow" style={{ width: '40px', height: '40px', border: '3px solid var(--warning)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Initializing Analytics...</p>
            </div>
        );
    }

    if (selectedGroupId) {
        return (
            <GroupAdminDashboard 
                groupId={selectedGroupId} 
                onBack={() => {
                    setSelectedGroupId(null);
                    fetchAdminData();
                }} 
            />
        );
    }

    const CHART_COLORS = ['#6C5CE7', '#00CEC9', '#e84393', '#fdcb6e', '#55efc4'];

    return (
        <>
            {/* Admin Header */}
            <header className="animate-fade-in page-header" style={{ zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ background: 'var(--primary-gradient)', padding: '0.6rem', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={20} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', marginBottom: '0.1rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <Cpu size={12} />
                            <span>System Control Interface</span>
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Analytics Core</h1>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <ThemeToggle />
                    <div className="hide-mobile" style={{ textAlign: 'right', paddingRight: '1rem', borderRight: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', justifyContent: 'flex-end' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Operational</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>NODE: PRIMARY-01</p>
                    </div>
                </div>
            </header>

            <div className="page-inner">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {/* Navigation Tabs */}
                    <div className="animate-fade-in" style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', padding: '0.5rem', background: 'var(--bg-sidebar)', borderRadius: '1.25rem', border: '1px solid var(--border)', width: 'fit-content', maxWidth: '100%', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                        {[
                            { id: 'overview', icon: Layout, label: 'Platform Stats' },
                            { id: 'users', icon: Users, label: 'User Management' },
                            { id: 'groups', icon: Globe, label: 'Group Management' },
                            { id: 'system', icon: Cpu, label: 'Status' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.85rem',
                                    border: 'none',
                                    background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                                    color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                                    fontSize: '0.85rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                className={activeTab !== tab.id ? "hover-opacity" : "neon-glow"}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'overview' && (
                        <div className="animate-slide-up">
                            {/* Summary Metrics */}
                            <div className="responsive-grid-4" style={{ marginBottom: '3rem' }}>
                                <div className="card hover-lift" style={{ borderLeft: '4px solid var(--primary)', padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <Users color="var(--primary)" size={24} />
                                        <div style={{ background: 'rgba(108, 92, 231, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>+12%</div>
                                    </div>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stats.totalUsers}</h2>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Active Users</p>
                                </div>
                                <div className="card hover-lift" style={{ borderLeft: '4px solid var(--accent)', padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <Globe color="var(--accent)" size={24} />
                                        <div style={{ background: 'rgba(0, 206, 201, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)' }}>Stable</div>
                                    </div>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stats.totalGroups}</h2>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Active Groups</p>
                                </div>
                                <div className="card hover-lift" style={{ borderLeft: '4px solid var(--success)', padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <CreditCard color="var(--success)" size={24} />
                                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--success)' }}>Active</div>
                                    </div>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stats.totalTransactions || 0}</h2>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Total Transactions</p>
                                </div>
                                <div className="card hover-lift" style={{ borderLeft: '4px solid var(--warning)', padding: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <Activity color="var(--warning)" size={24} />
                                        <div style={{ background: 'rgba(253, 203, 110, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--warning)' }}>99.9%</div>
                                    </div>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>₹{(stats.totalAmountSpent || 0).toLocaleString()}</h2>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Total Activity</p>
                                </div>
                            </div>

                            {/* Main Charts */}
                            <div className="main-dashboard-layout">
                                <div className="card" style={{ padding: '2.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <BarChart2 size={20} color="var(--primary)" />
                                        New User Growth
                                    </h3>
                                    <div style={{ height: '350px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={stats.userGrowth || []}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} fontWeight={700} axisLine={false} tickLine={false} />
                                                <YAxis stroke="var(--text-muted)" fontSize={12} fontWeight={700} axisLine={false} tickLine={false} />
                                                <Tooltip 
                                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                                    itemStyle={{ color: 'var(--primary)', fontWeight: 800 }}
                                                />
                                                <Line type="monotone" dataKey="count" name="New Users" stroke="var(--primary)" strokeWidth={4} dot={{ fill: 'var(--primary)', r: 6 }} activeDot={{ r: 8, stroke: 'white', strokeWidth: 2 }} animationDuration={2000} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="card" style={{ padding: '2.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Shield size={20} color="var(--accent)" />
                                        Spending by Category
                                    </h3>
                                    <div style={{ height: '350px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.categoryStats || []}
                                                    innerRadius={80}
                                                    outerRadius={110}
                                                    paddingAngle={8}
                                                    dataKey="count"
                                                    nameKey="name"
                                                    stroke="none"
                                                >
                                                    {(stats.categoryStats || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} cornerRadius={8} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '2rem' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="animate-slide-up card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontWeight: 900 }}>User Management</h3>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>{users.length} TOTAL IDENTITIES</div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ textAlign: 'left', padding: '1.5rem 2.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Identity</th>
                                            <th style={{ textAlign: 'left', padding: '1.5rem 2.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact</th>
                                            <th style={{ textAlign: 'left', padding: '1.5rem 2.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Permissions</th>
                                            <th style={{ textAlign: 'left', padding: '1.5rem 2.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joined</th>
                                            <th style={{ textAlign: 'center', padding: '1.5rem 2.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Protocols</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user._id} className="ledger-row" style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1.5rem 2.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--primary)' }}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 800 }}>{user.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.5rem 2.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{user.email}</td>
                                                <td style={{ padding: '1.5rem 2.5rem' }}>
                                                    <span style={{ 
                                                        padding: '0.4rem 0.8rem', 
                                                        borderRadius: '0.5rem', 
                                                        fontSize: '0.7rem', 
                                                        fontWeight: 900, 
                                                        background: user.role === 'system_admin' ? 'rgba(253, 203, 110, 0.1)' : 'rgba(108, 92, 231, 0.1)',
                                                        color: user.role === 'system_admin' ? 'var(--warning)' : 'var(--primary)'
                                                    }}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.5rem 2.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
                                                    {user._id !== currentUser?._id && (
                                                        <button 
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            style={{ background: 'rgba(239, 68, 68, 0.05)', border: 'none', color: 'var(--danger)', padding: '0.6rem', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.3s' }}
                                                            className="hover-lift"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'groups' && (
                        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {groups.map(group => (
                                <div key={group._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedGroup === group._id ? 'var(--bg-sidebar)' : 'transparent' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                                                <Globe size={28} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 900 }}>{group.groupName}</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                                    <span>{group.members.length} MEMBERS</span>
                                                    <span>•</span>
                                                    <span>EST. {new Date(group.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <button 
                                                onClick={() => setSelectedGroupId(group._id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}
                                                className="hover-lift"
                                            >
                                                <Globe size={18} />
                                                MANAGE GROUP
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteGroup(group._id)}
                                                style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '0.75rem', cursor: 'pointer' }}
                                                className="hover-lift"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedGroup === group._id && (
                                        <div className="animate-fade-in" style={{ padding: '2.5rem', borderTop: '1px solid var(--border)', background: 'rgba(108, 92, 231, 0.02)' }}>
                                            {loadingAnalytics ? (
                                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                                    <div className="neon-glow" style={{ width: '30px', height: '30px', border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                                                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)' }}>Loading Group Details...</p>
                                                </div>
                                            ) : groupAnalytics && (
                                                <div className="grid-cols-4" style={{ gap: '2rem' }}>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Spent</p>
                                                        <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>₹{(groupAnalytics.totalSpent || 0).toLocaleString()}</h4>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transactions</p>
                                                        <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>{groupAnalytics.transactionCount}</h4>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Top Category</p>
                                                        <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{groupAnalytics.topCategory || 'N/A'}</h4>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Group Status</p>
                                                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--success)' }}>OPTIMAL</h4>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Usage Explanation Header */}
                            <div className="card" style={{ padding: '2.5rem', background: 'var(--primary-gradient)', color: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <Shield size={24} />
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Operational Usage Dynamics</h3>
                                </div>
                                <p style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.9, lineHeight: 1.6, maxWidth: '800px' }}>
                                    System usage is calculated based on aggregate ledger activity. 
                                    <strong> Capital Flow</strong> measures the total volume of managed splits, 
                                    while <strong>Transaction Velocity</strong> tracks real-time ledger updates across all active hubs.
                                </p>
                            </div>

                            {stats ? (
                                <div className="main-dashboard-layout">
                                    <div className="card" style={{ padding: '2.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Database size={20} color="var(--primary)" />
                                            Platform Capacity
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            {[
                                                { label: 'Transaction Ledger Volume', value: Math.min(Math.round(((stats?.totalTransactions || 0) / 1000) * 100), 100) || 12, color: 'var(--primary)' },
                                                { label: 'Active Capital Flow', value: Math.min(Math.round(((stats?.totalAmountSpent || 0) / 100000) * 100), 100) || 8, color: 'var(--accent)' },
                                                { label: 'User Allocation Buffer', value: 35, color: 'var(--success)' }
                                            ].map(item => (
                                                <div key={item.label}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{item.label}</span>
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: item.color }}>{item.value}%</span>
                                                    </div>
                                                    <div style={{ height: '8px', background: 'var(--bg-sidebar)', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${item.value}%`, background: item.color, borderRadius: '4px', boxShadow: `0 0 15px ${item.color}` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="card" style={{ padding: '2.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <HardDrive size={20} color="var(--warning)" />
                                            Node Performance
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Memory Load</p>
                                                <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>142 MB</h4>
                                            </div>
                                            <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>API Latency</p>
                                                <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>42ms</h4>
                                            </div>
                                            <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>System Uptime</p>
                                                <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>99.9%</h4>
                                            </div>
                                            <div style={{ background: 'var(--bg-input)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Network Mesh</p>
                                                <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--success)' }}>STABLE</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                                    <div className="neon-glow" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
                                    <p style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>AGGREGATING PLATFORM METRICS...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirmModal}
            />
        </>
    );
};

export default AdminDashboard;
