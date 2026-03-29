import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/api';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, Layout, CreditCard, Trash2, ArrowLeft, BarChart2, Shield, Activity, Globe, Database, HardDrive, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const AdminDashboard = ({ onBack }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
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
                } catch (error) {
                    toast.error('Failed to delete group');
                }
            }
        });
    };

        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
            <div className="neon-glow" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Loading Admin Dashboard...</p>
        </div>

    const CHART_COLORS = ['#6C5CE7', '#00CEC9', '#e84393', '#fdcb6e', '#55efc4'];

    return (
        <div className="dashboard-container" style={{ padding: '0', background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Admin Header */}
            <header className="animate-fade-in" style={{ 
                padding: '1.5rem 3.5rem', 
                background: 'var(--bg-sidebar)', 
                borderBottom: '1px solid var(--border)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                position: 'sticky', 
                top: 0, 
                zIndex: 9999,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <button onClick={onBack} className="hover-lift" style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid var(--border)', 
                        color: 'var(--text-primary)', 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <Shield size={14} />
                            <span>Admin Panel</span>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>
                            System Overview
                        </h1>
                    </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'right', display: 'none', lg: 'block' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.2rem' }}>System Status</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 800, fontSize: '0.85rem' }}>
                            <Activity size={14} /> OPERATIONAL
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ flex: 1, padding: '2.5rem 3.5rem', overflowY: 'auto' }}>
                <div className="max-w-7xl mx-auto">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card hover-lift animate-slide-up" style={{ padding: '2rem', borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Base</p>
                                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0.5rem 0' }}>{stats?.totalUsers}</h3>
                                </div>
                                <div style={{ padding: '0.75rem', background: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary)', borderRadius: '1rem' }}>
                                    <Users size={24} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 700 }}>
                                <Globe size={14} /> Global Distribution Active
                            </div>
                        </div>

                        <div className="card hover-lift animate-slide-up" style={{ padding: '2rem', borderLeft: '4px solid var(--accent)', animationDelay: '0.1s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Groups</p>
                                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0.5rem 0' }}>{stats?.totalGroups}</h3>
                                </div>
                                <div style={{ padding: '0.75rem', background: 'rgba(0, 206, 201, 0.1)', color: 'var(--accent)', borderRadius: '1rem' }}>
                                    <Layout size={24} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700 }}>
                                <Database size={14} /> Decentralized Hubs Synced
                            </div>
                        </div>

                        <div className="card hover-lift animate-slide-up" style={{ padding: '2rem', borderLeft: '4px solid var(--warning)', animationDelay: '0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Group Expenses</p>
                                    <h3 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0.5rem 0' }}>₹{stats?.totalExpenses.toLocaleString()}</h3>
                                </div>
                                <div style={{ padding: '0.75rem', background: 'rgba(253, 203, 110, 0.1)', color: 'var(--warning)', borderRadius: '1rem' }}>
                                    <CreditCard size={24} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontSize: '0.8rem', fontWeight: 700 }}>
                                <Activity size={14} /> Live Transaction Stream
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)' }}>
                        {[
                            { id: 'overview', label: 'STATISTICS', icon: BarChart2 },
                            { id: 'users', label: 'USERS', icon: Users },
                            { id: 'groups', label: 'GROUPS', icon: Layout }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{ 
                                    padding: '1rem 0',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                                    fontWeight: 900,
                                    fontSize: '0.85rem',
                                    letterSpacing: '0.1em',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Sections */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
                            <div className="card" style={{ padding: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Group Spending Trends</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--success)', background: 'rgba(0, 184, 148, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '2rem' }}>
                                        <Activity size={12} /> REAL-TIME
                                    </div>
                                </div>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats?.spendingTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis 
                                                dataKey="_id" 
                                                stroke="var(--text-muted)" 
                                                fontSize={11} 
                                                fontWeight={700}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis 
                                                stroke="var(--text-muted)" 
                                                fontSize={11} 
                                                fontWeight={700}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(v) => `₹${v}`}
                                            />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                                itemStyle={{ color: 'var(--primary)', fontWeight: 800 }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="total" 
                                                stroke="var(--primary)" 
                                                strokeWidth={4} 
                                                dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 0 }} 
                                                activeDot={{ r: 8, stroke: 'var(--bg-card)', strokeWidth: 4 }} 
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '2.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '2rem' }}>Expense Categories</h3>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={stats?.categoryStats} 
                                                dataKey="totalAmount" 
                                                nameKey="_id" 
                                                cx="50%" 
                                                cy="50%" 
                                                innerRadius={80}
                                                outerRadius={120} 
                                                paddingAngle={5}
                                                stroke="none"
                                            >
                                                {stats?.categoryStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '1rem' }}
                                            />
                                            <Legend 
                                                verticalAlign="bottom" 
                                                height={36} 
                                                formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem' }}>{value.toUpperCase()}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="card animate-slide-up" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>All Registered Users</h3>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>{users.length} TOTAL USERS</div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Name</th>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</th>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Role</th>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Joined Date</th>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {users.map(u => (
                                            <tr key={u._id} className="hover-lift" style={{ transition: 'background 0.3s ease' }}>
                                                <td style={{ padding: '1.25rem 2rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.9rem' }}>
                                                            {u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{u.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{u.email}</td>
                                                <td style={{ padding: '1.25rem 2rem' }}>
                                                    <span style={{ 
                                                        padding: '0.35rem 0.75rem', 
                                                        borderRadius: '0.5rem', 
                                                        fontSize: '0.65rem', 
                                                        fontWeight: 900, 
                                                        letterSpacing: '0.05em',
                                                        textTransform: 'uppercase',
                                                        background: u.role === 'system_admin' ? 'rgba(108, 92, 231, 0.1)' : 'rgba(0, 206, 201, 0.1)',
                                                        color: u.role === 'system_admin' ? 'var(--primary)' : 'var(--accent)',
                                                        border: `1px solid ${u.role === 'system_admin' ? 'rgba(108, 92, 231, 0.2)' : 'rgba(0, 206, 201, 0.2)'}`
                                                    }}>
                                                        {u.role === 'system_admin' ? 'Admin' : 'User'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>
                                                    <button 
                                                        onClick={() => handleDeleteUser(u._id)} 
                                                        className="hover-lift"
                                                        style={{ background: 'rgba(214, 48, 49, 0.05)', border: '1px solid rgba(214, 48, 49, 0.1)', color: '#D63031', padding: '0.5rem', borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.3s ease' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'groups' && (
                        <div className="card animate-slide-up" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>All Active Groups</h3>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>{groups.length} ACTIVE GROUPS</div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Group Name</th>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Created By</th>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Members</th>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Expenses</th>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Created On</th>
                                            <th style={{ padding: '1.25rem 2rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {groups.map(g => (
                                            <tr key={g._id} className="hover-lift" style={{ transition: 'background 0.3s ease' }}>
                                                <td style={{ padding: '1.25rem 2rem' }}>
                                                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{g.groupName.toUpperCase()}</span>
                                                </td>
                                                <td style={{ padding: '1.25rem 2rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Shield size={14} color="var(--primary)" />
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{g.createdBy?.email || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>
                                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.35rem 0.75rem', borderRadius: '1rem', display: 'inline-block', fontSize: '0.85rem', fontWeight: 900, border: '1px solid var(--border)' }}>
                                                        {g.memberCount || g.members.length}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.25rem 2rem', color: 'var(--warning)', fontWeight: 800 }}>
                                                    ₹{(g.totalExpenses || 0).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(g.createdAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button 
                                                            onClick={() => navigate(`/group/${g._id}`)}
                                                            className="hover-lift"
                                                            style={{ background: 'rgba(108, 92, 231, 0.1)', border: '1px solid rgba(108, 92, 231, 0.2)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800 }}
                                                        >
                                                            VIEW
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteGroup(g._id)} 
                                                            className="hover-lift"
                                                            style={{ background: 'rgba(214, 48, 49, 0.05)', border: '1px solid rgba(214, 48, 49, 0.1)', color: '#D63031', padding: '0.5rem', borderRadius: '0.75rem', cursor: 'pointer' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* System Footer Bar */}
            <footer style={{ padding: '1.5rem 3.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg-sidebar)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                        <Cpu size={14} /> CPU: 12%
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>
                        <HardDrive size={14} /> MEM: 34%
                    </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>AI FINMATE DASHBOARD — SECURE CONNECTION</p>
            </footer>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirmModal}
            />
        </div>
    );
};

export default AdminDashboard;
