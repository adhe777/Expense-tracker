import React, { useState, useEffect } from 'react';
import { groupService, groupAnalyticsService } from '../services/api';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { Users, CreditCard, ArrowLeft, Trash2, UserPlus, Sparkles, TrendingUp, ShieldCheck, Zap, BarChart3, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const GroupAdminDashboard = ({ groupId, onBack }) => {
    const [analytics, setAnalytics] = useState(null);
    const [members, setMembers] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', confirmText: 'Confirm', variant: 'danger', onConfirm: () => { }
    });

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        fetchGroupAdminData();
    }, [groupId]);

    const fetchGroupAdminData = async () => {
        try {
            const [analyticsRes, membersRes, insightsRes] = await Promise.all([
                groupAnalyticsService.getAnalytics(groupId),
                groupService.getGroupMembers(groupId),
                groupAnalyticsService.getAIInsights(groupId)
            ]);
            setAnalytics(analyticsRes);
            setMembers(membersRes);
            setInsights(insightsRes.insights);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch group admin data');
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await groupService.addMember({ groupId, email: inviteEmail });
            toast.success('Member invite protocol initiated!');
            setInviteEmail('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Access denied');
        }
    };

    const handleRemoveMember = (memberId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Sever Connection',
            message: 'Are you sure you want to remove this member from the hub? All current split balances must be settled.',
            confirmText: 'Remove Member',
            variant: 'danger',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    await groupService.removeMember(groupId, memberId);
                    toast.success('Connection severed');
                    fetchGroupAdminData();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Severance failed');
                }
            }
        });
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'white' }}>
            <div className="neon-glow" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Syncing Group Intelligence...</p>
        </div>
    );

    const COLORS = ['#6C5CE7', '#00CEC9', '#FDCB6E', '#E17055', '#A29BFE'];

    return (
        <div className="dashboard-container" style={{ padding: '0', background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <ShieldCheck size={14} />
                            <span>Command Authority</span>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>
                            Network Hub Admin
                        </h1>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0, 206, 201, 0.1)', padding: '0.75rem 1.25rem', borderRadius: '1rem', border: '1px solid rgba(0, 206, 201, 0.2)' }}>
                    <Zap size={16} color="var(--accent)" className="neon-glow" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.05em' }}>QUANTUM LINK ACTIVE</span>
                </div>
            </header>

            <main style={{ flex: 1, padding: '2.5rem 3.5rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                    {/* Top Stats - High Density Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        {[
                            { label: 'Network Outflow', val: `₹${analytics?.totalExpense.toLocaleString()}`, icon: CreditCard, color: 'var(--primary)' },
                            { label: 'Per Node Avg', val: `₹${analytics?.averagePerMember.toFixed(0).toLocaleString()}`, icon: TrendingUp, color: 'var(--success)' },
                            { label: 'Peak Category', val: analytics?.topCategory.toUpperCase(), icon: BarChart3, color: 'var(--accent)' },
                            { label: 'Core Contributor', val: analytics?.topSpender.toUpperCase(), icon: Globe, color: 'var(--warning)' }
                        ].map((stat, i) => (
                            <div key={i} className="card animate-slide-up" style={{ padding: '1.5rem', animationDelay: `${i * 0.1}s` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${stat.color}10`, border: `1px solid ${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                        <stat.icon size={20} />
                                    </div>
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{stat.label}</h3>
                                </div>
                                <p style={{ fontSize: '1.75rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: 'white' }}>{stat.val}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Interaction Area - 8 columns */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* Spending Trend Chart */}
                            <div className="card animate-fade-in" style={{ padding: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}></div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>Temporal Spending Flux</h3>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>METERED OVER 6 MONTHS</div>
                                </div>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analytics?.monthlyTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="_id" stroke="var(--text-muted)" fontSize={11} fontWeight={700} axisLine={false} tickLine={false} tick={{ dy: 10 }} />
                                            <YAxis stroke="var(--text-muted)" fontSize={11} fontWeight={700} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', fontWeight: 700 }} />
                                            <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--bg-card)', strokeWidth: 2 }} activeDot={{ r: 10, strokeWidth: 0, fill: 'var(--accent)' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Distribution Charts */}
                                <div className="card animate-fade-in" style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.01em' }}>Category Weight</h3>
                                    <div style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={analytics?.categoryTotals} dataKey="total" nameKey="_id" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                                    {analytics?.categoryTotals.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="card animate-fade-in" style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.01em' }}>Node Contribution</h3>
                                    <div style={{ height: '250px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics?.memberContributions}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} />
                                                <YAxis stroke="var(--text-muted)" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                                <Bar dataKey="total" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Control Area - 4 columns */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            {/* Recruitment Module */}
                            <div className="card animate-fade-in" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                                    <UserPlus size={20} color="var(--primary)" />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.01em', margin: 0 }}>Add Network Node</h3>
                                </div>
                                <form onSubmit={handleInvite} className="space-y-4">
                                    <div className="modern-input-group">
                                        <div className="icon-input-wrapper">
                                            <input 
                                                type="email" 
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                placeholder="NODE_ID (EMAIL)" 
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-modern-submit hover-lift neon-glow" style={{ width: '100%', margin: 0, height: '3.5rem' }}>TRANSMIT INVITE</button>
                                </form>
                            </div>

                            {/* Collective AI Insights */}
                            <div className="card animate-fade-in" style={{ padding: '2rem', background: 'rgba(108, 92, 231, 0.05)', border: '1px dashed rgba(108, 92, 231, 0.3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <Sparkles size={18} color="var(--primary)" className="neon-glow" />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.01em', margin: 0, color: 'white' }}>Hub Intelligence</h3>
                                </div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {insights.map((insight, idx) => (
                                        <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', borderLeft: '3px solid var(--primary)', fontWeight: 600 }}>
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Node Directory */}
                            <div className="card animate-fade-in" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Users size={18} color="var(--primary)" />
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.01em', margin: 0 }}>Active Nodes</h3>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>{members.length} ONLINE</span>
                                </div>
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                    {members.map(member => (
                                        <div key={member._id} className="hover-lift" style={{ display: 'flex', alignItems: 'center', justifyBetween: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '1rem', transition: 'all 0.3s ease' }}>
                                           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                                <div style={{ width: '40px', height: '40px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 900, fontSize: '0.9rem' }}>
                                                    {member.name[0].toUpperCase()}
                                                </div>
                                                <div style={{ overflow: 'hidden' }}>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name.toUpperCase()}</p>
                                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>{member.email.toLowerCase()}</p>
                                                </div>
                                           </div>
                                            <button onClick={() => handleRemoveMember(member._id)} style={{ padding: '0.5rem', background: 'none', border: 'none', color: 'rgba(214, 48, 49, 0.4)', cursor: 'pointer', transition: 'all 0.3s' }} className="hover-danger">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
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

export default GroupAdminDashboard;
