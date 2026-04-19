import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupService, groupAnalyticsService } from '../services/api';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
    Users, 
    CreditCard, 
    ArrowLeft, 
    Trash2, 
    UserPlus, 
    Sparkles, 
    TrendingUp, 
    ShieldCheck, 
    Zap, 
    BarChart3, 
    Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

const CHART_COLORS = ['#6366F1', '#22D3EE', '#F59E0B', '#10B981', '#EF4444'];


const GroupAdminDashboard = ({ groupId, onBack }) => {
    const { user: authUser, refreshUser } = useAuth();
    const [group, setGroup] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [members, setMembers] = useState([]);
    const [insights, setInsights] = useState([]);
    const [loadingGroup, setLoadingGroup] = useState(true);
    const [loadingAnalytics, setLoadingAnalytics] = useState(true);
    const [loadingAI, setLoadingAI] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', confirmText: 'Confirm', variant: 'danger', onConfirm: () => { }
    });

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const isSystemAdmin = authUser?.role === 'system_admin';

    const fetchAI = useCallback(async () => {
        try {
            setLoadingAI(true);
            const insightsRes = await groupAnalyticsService.getAIInsights(groupId);
            setInsights(insightsRes.insights || []);
        } catch (error) {
            console.error('AI Insights Error:', error);
            setInsights(["Failed to generate AI Insights. The AI service may be unavailable or misconfigured."]);
        } finally {
            setLoadingAI(false);
        }
    }, [groupId]);

    useEffect(() => {
        const fetchBaseData = async () => {
            try {
                setLoadingGroup(true);
                const [groupRes, membersRes] = await Promise.all([
                    groupService.getGroupDetails(groupId),
                    groupService.getGroupMembers(groupId)
                ]);
                setGroup(groupRes);
                setMembers(membersRes);
            } catch (error) {
                toast.error('Failed to load group info');
            } finally {
                setLoadingGroup(false);
            }
        };

        const fetchAnalytics = async () => {
            try {
                setLoadingAnalytics(true);
                const analyticsRes = await groupAnalyticsService.getAnalytics(groupId);
                setAnalytics(analyticsRes);
            } catch (error) {
                console.error('Analytics Error:', error);
            } finally {
                setLoadingAnalytics(false);
            }
        };

        fetchBaseData();
        fetchAnalytics();
        fetchAI();
    }, [groupId, fetchAI]);

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await groupService.addMember({ groupId, email: inviteEmail });
            toast.success('Member invited successfully');
            setInviteEmail('');
            // Refresh member list
            const membersRes = await groupService.getGroupMembers(groupId);
            setMembers(membersRes);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add member');
        }
    };

    const handleRemoveMember = (memberId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Remove Member',
            message: 'Are you sure you want to remove this member from the group?',
            confirmText: 'Remove',
            variant: 'danger',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    await groupService.removeMember(groupId, memberId);
                    toast.success('Member removed');
                    const membersRes = await groupService.getGroupMembers(groupId);
                    setMembers(membersRes);
                } catch (error) {
                    toast.error('Removal failed');
                }
            }
        });
    };

    const handleTransferAdmin = (memberId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Transfer Admin Rights',
            message: 'Are you sure you want to transfer admin ownership to this member? You will lose admin privileges for this group.',
            confirmText: 'Transfer',
            variant: 'warning',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    await groupService.transferAdmin({ groupId, newAdminId: memberId });
                    toast.success('Admin role transferred');
                    if (refreshUser) await refreshUser();
                    onBack();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Transfer failed');
                }
            }
        });
    };

    const Skeleton = ({ height, width = '100%', borderRadius = '1rem' }) => (
        <div style={{ 
            height, 
            width, 
            borderRadius, 
            background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-main) 50%, var(--bg-card) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite linear'
        }} />
    );

    if (loadingGroup) return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="neon-glow" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '1.5rem', fontWeight: 800, color: 'var(--text-secondary)' }}>LOADING GROUP SETUP...</p>
        </div>
    );

    if (!group) return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ marginTop: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>Could not load group details. Please try again.</p>
            <button onClick={onBack} className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.5rem 1.5rem' }}>Go Back</button>
        </div>
    );

    return (
        <>
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <button onClick={onBack} className="hover-lift" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isSystemAdmin ? 'var(--primary)' : 'var(--warning)', marginBottom: '0.2rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {isSystemAdmin ? <Globe size={12} /> : <ShieldCheck size={12} />}
                            <span>{isSystemAdmin ? 'Global Administrative Override' : 'Administration Hub'}</span>
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{group?.groupName}</h1>
                    </div>
                </div>
            </header>

            <div className="page-inner">
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {/* Stats Section */}
                    <div className="responsive-grid-4" style={{ marginBottom: '3rem' }}>
                        <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                <Users size={16} /> Members
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>{members.length}</h2>
                        </div>
                        <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                <CreditCard size={16} /> Total Flow
                            </div>
                             {loadingAnalytics ? <Skeleton height="3.5rem" /> : <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>₹{(analytics?.totalSpent || 0).toLocaleString()}</h2>}
                        </div>
                        <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--warning)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                <Zap size={16} /> Transactions
                            </div>
                            {loadingAnalytics ? <Skeleton height="3.5rem" /> : <h2 style={{ fontSize: '2.5rem', fontWeight: 900 }}>{analytics?.transactionCount || '0'}</h2>}
                        </div>
                        <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--success)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                <TrendingUp size={16} /> Efficiency
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)' }}>HIGH</h2>
                        </div>
                    </div>

                    <div className="group-management-layout">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {/* Main Analytics Grid */}
                            <div className="grid-cols-2" style={{ gap: '2rem' }}>
                                <div className="card" style={{ padding: '2.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <BarChart3 size={20} color="var(--primary)" /> Top Spenders
                                    </h3>
                                    <div style={{ height: '300px' }}>
                                        {loadingAnalytics ? <Skeleton height="100%" /> : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics?.memberContributions || []}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight={800} stroke="var(--text-muted)" />
                                                    <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={800} stroke="var(--text-muted)" />
                                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1rem' }} />
                                                    <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>

                                <div className="card" style={{ padding: '2.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <TrendingUp size={20} color="var(--accent)" /> Category Mix
                                    </h3>
                                    <div style={{ height: '300px' }}>
                                        {loadingAnalytics ? <Skeleton height="100%" /> : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={analytics?.categoryTotals?.map(c => ({ name: c._id, value: c.total })) || []}
                                                        innerRadius={60}
                                                        outerRadius={90}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        stroke="none"
                                                    >
                                                        {(analytics?.categoryTotals || []).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} cornerRadius={6} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1rem' }} />
                                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '0.7rem', fontWeight: 800 }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Member Table */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontWeight: 900 }}>Member Directory</h3>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>{members.length} USERS CONNECTED</span>
                                </div>
                                {/* Desktop Table View */}
                                <div className="desktop-only" style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border)' }}>
                                            <tr>
                                                <th style={{ textAlign: 'left', padding: '1.5rem 2.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User</th>
                                                <th style={{ textAlign: 'left', padding: '1.5rem 2.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact</th>
                                                <th style={{ textAlign: 'left', padding: '1.5rem 2.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</th>
                                                <th style={{ textAlign: 'center', padding: '1.5rem 2.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {members.map(member => (
                                                <tr key={member._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.3s' }}>
                                                    <td style={{ padding: '1.5rem 2.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <div 
                                                                onClick={() => member.avatar && setSelectedAvatar(member.avatar)}
                                                                style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: member.avatar ? 'pointer' : 'default' }}
                                                            >
                                                                {member.avatar ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{member.name.charAt(0).toUpperCase()}</span>}
                                                            </div>
                                                            <span style={{ fontWeight: 800 }}>{member.name} {member._id === authUser._id && '(You)'}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.5rem 2.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{member.email}</td>
                                                    <td style={{ padding: '1.5rem 2.5rem' }}>
                                                        {group.createdBy._id === member._id ? (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                                                <ShieldCheck size={14} /> Group Admin
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Member</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1.5rem 2.5rem', textAlign: 'center' }}>
                                                        {(group.createdBy._id === authUser._id || isSystemAdmin) && group.createdBy._id !== member._id && (
                                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                                                <button onClick={() => handleTransferAdmin(member._id)} style={{ background: 'transparent', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }} title="Transfer Admin Rights">
                                                                    <Globe size={16} />
                                                                </button>
                                                                <button onClick={() => handleRemoveMember(member._id)} style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer' }} title="Remove Member">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="mobile-only mobile-card-list" style={{ padding: '1.5rem' }}>
                                    {members.map(member => (
                                        <div key={member._id} className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                        {member.avatar ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{member.name.charAt(0).toUpperCase()}</span>}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 800, color: 'var(--text-primary)' }}>{member.name}</p>
                                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.email}</p>
                                                    </div>
                                                </div>
                                                {group.createdBy._id === member._id && (
                                                    <ShieldCheck size={16} color="var(--warning)" />
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: group.createdBy._id === member._id ? 'var(--warning)' : 'var(--text-muted)' }}>
                                                    {group.createdBy._id === member._id ? 'Group Admin' : 'Member'}
                                                </span>
                                                {(group.createdBy._id === authUser._id || isSystemAdmin) && group.createdBy._id !== member._id && (
                                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                        <button onClick={() => handleTransferAdmin(member._id)} style={{ background: 'var(--bg-input)', border: '1px solid var(--warning)', color: 'var(--warning)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>Role</button>
                                                        <button onClick={() => handleRemoveMember(member._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>Remove</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Invite Card */}
                            <div className="card" style={{ padding: '2rem' }}>
                                <h4 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 900 }}>
                                    <UserPlus size={18} color="var(--primary)" /> Invite Members
                                </h4>
                                <form onSubmit={handleInvite}>
                                    <div className="modern-input-group" style={{ marginBottom: '1.5rem' }}>
                                        <label>Email Address</label>
                                        <input 
                                            type="email" 
                                            className="form-input"
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            placeholder="colleague@earth.com"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '3.5rem' }}>
                                        SEND INVITATION
                                    </button>
                                </form>
                            </div>

                            {/* AI Insights */}
                            <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(108, 92, 231, 0.05) 100%)', border: '1px solid rgba(108, 92, 231, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 900, color: 'var(--primary)' }}>
                                        <Sparkles size={18} /> AI Nexus Analysis
                                    </h4>
                                    <button 
                                        onClick={fetchAI} 
                                        disabled={loadingAI}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}
                                        className="hover-lift"
                                    >
                                        <Zap size={12} className={loadingAI ? "animate-spin" : ""} />
                                        {loadingAI ? 'Analyzing...' : 'Refresh'}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {loadingAI ? (
                                        <>
                                            <Skeleton height="3.5rem" />
                                            <Skeleton height="3.5rem" />
                                            <Skeleton height="3.5rem" />
                                        </>
                                    ) : insights.length > 0 ? (
                                        insights.map((insight, i) => (
                                            <div key={i} style={{ padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '0.85rem', border: '1px solid var(--border)', display: 'flex', gap: '1rem', transition: 'all 0.3s' }} className="hover-lift">
                                                <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}>
                                                    <Zap size={14} />
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{insight}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>No insights available yet.</p>
                                            <button onClick={fetchAI} className="btn-success" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}>Generate Insights</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {selectedAvatar && (
                <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
                    onClick={() => setSelectedAvatar(null)}
                >
                    <img src={selectedAvatar} alt="Fullscreen" style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '1rem', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} />
                </div>
            )}

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

export default GroupAdminDashboard;
