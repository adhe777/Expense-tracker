import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    LogOut,
    ArrowLeft,
    Users,
    TrendingUp,
    TrendingDown,
    LayoutDashboard,
    ShieldCheck,
    Activity,
    Search
} from 'lucide-react';

const AdminDashboard = ({ onBack }) => {
    const { user, logout } = useAuth();
    const [userStats, setUserStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const res = await axios.get('http://localhost:8081/api/admin/users');
                setUserStats(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert('Failed to fetch admin statistics');
            }
        };
        fetchAdminStats();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>
            <Activity className="animate-spin" size={48} />
        </div>
    );

    const filteredUsers = userStats.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const systemTotalIncome = userStats.reduce((acc, curr) => acc + curr.totalIncome, 0);
    const systemTotalExpense = userStats.reduce((acc, curr) => acc + curr.totalExpense, 0);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
            {/* Admin Sidebar */}
            <aside style={{
                width: '280px',
                background: '#1e293b',
                color: 'white',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                    <ShieldCheck size={32} color="#818cf8" />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>ADMIN PORTAL</h2>
                </div>

                <nav style={{ flex: 1 }}>
                    <div style={{
                        padding: '0.75rem 1rem',
                        background: '#334155',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer'
                    }}>
                        <LayoutDashboard size={20} />
                        <span style={{ fontWeight: 600 }}>System Overview</span>
                    </div>
                    <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#94a3b8',
                        cursor: 'pointer'
                    }}>
                        <Users size={20} />
                        <span>Manage Users</span>
                    </div>
                </nav>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
                    <button onClick={onBack} style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#334155',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}>
                        <ArrowLeft size={18} /> Exit to User App
                    </button>
                    <button onClick={logout} style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#ef444422',
                        border: '1px solid #ef4444',
                        borderRadius: '0.5rem',
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                    }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>System Dashboard</h1>
                        <p style={{ color: '#64748b' }}>Monitoring financial health across {userStats.length} user accounts</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', width: '300px' }}>
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', paddingLeft: '0.75rem', width: '100%', fontSize: '0.875rem' }}
                        />
                    </div>
                </header>

                {/* System Stats Block */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="card" style={{ background: 'white', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#e0e7ff', borderRadius: '0.75rem', color: '#4f46e5' }}>
                                <Users size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Total Registered Users</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{userStats.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="card" style={{ background: 'white', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#dcfce7', borderRadius: '0.75rem', color: '#16a34a' }}>
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>System-wide Income</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>₹{systemTotalIncome.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="card" style={{ background: 'white', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#fee2e2', borderRadius: '0.75rem', color: '#dc2626' }}>
                                <TrendingDown size={24} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>System-wide Expenses</p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>₹{systemTotalExpense.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card" style={{ background: 'white', border: 'none', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Global User Directory</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem' }}>S.No</th>
                                    <th style={{ padding: '1rem' }}>User Identification</th>
                                    <th style={{ padding: '1rem' }}>Financial Health</th>
                                    <th style={{ padding: '1rem' }}>Net Balance</th>
                                    <th style={{ padding: '1rem' }}>Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u, index) => (
                                    <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem', color: '#94a3b8' }}>{index + 1}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: '#e2e8f0',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700,
                                                    color: '#475569',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, color: '#1e293b' }}>{u.name}</p>
                                                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>In: ₹{u.totalIncome.toLocaleString()}</p>
                                                    <p style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>Out: ₹{u.totalExpense.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                fontWeight: 700,
                                                color: u.balance >= 0 ? '#16a34a' : '#dc2626',
                                                background: u.balance >= 0 ? '#dcfce7' : '#fee2e2',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '0.375rem',
                                                fontSize: '0.875rem'
                                            }}>
                                                ₹{u.balance.toLocaleString()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                                                <Activity size={14} />
                                                <span>{u.transactionCount} transactions</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
