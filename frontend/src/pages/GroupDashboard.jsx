import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/api';
import NotificationBell from '../components/NotificationBell';
import ConfirmModal from '../components/ConfirmModal';
import { ArrowLeft, ArrowRight, Users, IndianRupee, PlusCircle, UserPlus, List, Trash2, ShieldAlert, Mail, FileText, Tag, Hexagon, Send, Crown, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const GroupDashboard = ({ groupId, onBack }) => {
    const { user, isSystemAdmin } = useAuth();
    const [group, setGroup] = useState(null);
    const [splits, setSplits] = useState([]);
    const [settlements, setSettlements] = useState([]);

    // UI States
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        variant: 'danger',
        onConfirm: () => { }
    });

    // Expense Form State
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        amount: '',
        category: 'Food',
        splitType: 'equal',
        customSplits: [] // { user: id, value: amount/percent }
    });

    const fetchData = async () => {
        try {
            const [grp, splts, setts] = await Promise.all([
                groupService.getGroupDetails(groupId),
                groupService.getSplitSummary(groupId),
                groupService.getSettlements(groupId)
            ]);
            setGroup(grp);
            setSplits(splts);
            setSettlements(setts);
        } catch (error) {
            console.error("Failed to fetch group data", error);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [groupId]);

    useEffect(() => {
        // Initialize custom splits if members load
        if (group?.members && expenseForm.customSplits.length === 0) {
            const initialSplits = group.members.map(m => ({ user: m._id, value: 0 }));
            setExpenseForm(prev => ({ ...prev, customSplits: initialSplits }));
        }
    }, [group]);

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const handleLeaveGroup = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Leave Group',
            message: 'Are you sure you want to leave this group? You will lose access to all shared expenses and settlements.',
            confirmText: 'Leave Group',
            variant: 'danger',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    setIsSubmitting(true);
                    await groupService.leaveGroup(groupId);
                    toast.success('Successfully left the group');
                    onBack();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to leave group');
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    const handleRemoveMember = (memberId, memberName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Remove Member',
            message: `Are you sure you want to remove ${memberName} from this group? They will lose access to all shared data.`,
            confirmText: 'Remove',
            variant: 'danger',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    setIsSubmitting(true);
                    await groupService.removeMember(groupId, memberId);
                    toast.success('Member removed');
                    fetchData();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to remove member');
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    const handleSettle = (toUserId, amount, toUserName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Confirm Payment',
            message: `You are about to record a payment of ₹${amount} to ${toUserName}. This action will settle the outstanding balance.`,
            confirmText: `Pay ₹${amount}`,
            variant: 'success',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    setIsSubmitting(true);
                    await groupService.settleDebt({ groupId, toUserId, amount: Number(amount) });
                    toast.success('Payment recorded successfully!');
                    fetchData();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to settle debt');
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        try {
            setIsSubmitting(true);
            await groupService.inviteMember({ groupId, email: inviteEmail });
            setInviteEmail('');
            setShowInvite(false);
            fetchData();
            toast.success('User invited successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to invite user');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        try {
            setIsSubmitting(true);
            await groupService.addGroupExpense({
                groupId,
                ...expenseForm
            });
            setShowAddExpense(false);
            setExpenseForm(prev => ({ ...prev, title: '', amount: '', splitType: 'equal' }));
            fetchData();
            toast.success('Group expense added!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add group expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCustomSplitChange = (userId, value) => {
        setExpenseForm(prev => ({
            ...prev,
            customSplits: prev.customSplits.map(cs =>
                cs.user === userId ? { ...cs, value } : cs
            )
        }));
    };

    const handleTransferAdmin = (newAdminId, newAdminName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Transfer Group Leadership',
            message: `Are you sure you want to make ${newAdminName} the group admin? You will still be a member but will lose administrative privileges.`,
            confirmText: 'Transfer Leadership',
            variant: 'warning',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    setIsSubmitting(true);
                    await groupService.transferAdmin({ groupId, newAdminId });
                    toast.success(`Leadership transferred to ${newAdminName}`);
                    fetchData();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Failed to transfer leadership');
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    if (!group) return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Loading Group...</div>;

    const isGroupAdmin = group.createdBy._id === user._id || group.createdBy === user._id;
    const canManageGroup = isGroupAdmin || isSystemAdmin;

    return (
        <div className="app-layout">
            <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
            </button>

            <Sidebar 
                onShowCreateGroup={() => {}} // Not needed here as it's on main dashboard
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />

            <main className="main-content">
                <header style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button onClick={onBack} className="btn-icon" title="Go Back">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <Users size={14} />
                                <span>Collaborative Hub</span>
                            </div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>{group.groupName}</h1>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <NotificationBell onUpdateGroups={() => fetchData()} />
                        {canManageGroup && (
                            <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
                                <UserPlus size={18} /> 
                                <span>Invite</span>
                            </button>
                        )}
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Summary Card */}
                        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <ShieldAlert size={24} color="var(--primary)" />
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Outstanding Balances</h3>
                                </div>
                                {!isSystemAdmin && (
                                    <button className="btn btn-primary" onClick={() => setShowAddExpense(true)}>
                                        <PlusCircle size={18} /> <span>Add Group Expense</span>
                                    </button>
                                )}
                            </div>

                            {settlements.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.01)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 600 }}>All debts are settled. No pending payments.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {settlements.map((s, idx) => (
                                        <div key={idx} className="hover-lift" style={{ 
                                            padding: '1.25rem 1.5rem', 
                                            background: 'rgba(0, 0, 0, 0.2)', 
                                            borderRadius: '1rem', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning)', boxShadow: '0 0 10px var(--warning)' }}></div>
                                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{s.from} <ArrowRight size={14} style={{ display: 'inline', margin: '0 0.5rem', color: 'var(--accent)' }} /> {s.to}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Amount</p>
                                                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--warning)' }}>₹{s.amount.toLocaleString()}</span>
                                                </div>
                                                {s.fromId === user._id && !isSystemAdmin && (
                                                    <button
                                                        onClick={() => handleSettle(s.toId, s.amount, s.to)}
                                                        disabled={isSubmitting}
                                                        className="btn btn-success"
                                                        style={{ height: '2.5rem', padding: '0 1rem', fontSize: '0.8rem' }}
                                                    >
                                                        <Send size={14} /> Settle
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <section className="card" style={{ padding: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <List size={24} color="var(--primary)" />
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Recent Activity</h3>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Group Expense History</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {splits.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                                        <FileText size={64} style={{ color: 'var(--border)', marginBottom: '1.5rem', opacity: 0.5 }} />
                                        <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-secondary)' }}>No activity yet</p>
                                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>No group expenses have been added yet.</p>
                                    </div>
                                ) : (
                                    splits.map((split) => {
                                        const payerInfo = group.members.find(m => m._id === (split.payer._id || split.payer));
                                        return (
                                            <div key={split._id} className="ledger-row" style={{ 
                                                borderLeft: split.payer._id === user._id ? '4px solid var(--success)' : '4px solid var(--warning)',
                                                background: 'var(--bg-main)',
                                                padding: '1.25rem',
                                                borderRadius: '1rem',
                                                marginBottom: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem'
                                            }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', overflow: 'hidden', background: 'var(--bg-main)', border: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {payerInfo?.avatar ? (
                                                        <img src={payerInfo.avatar} alt={payerInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: 'white', fontWeight: 900, fontSize: '1.1rem' }}>
                                                            {payerInfo?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, marginLeft: '0.5rem' }}>
                                                    <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{split.expenseId.title}</p>
                                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>
                                                        Paid by <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{split.payer._id === user._id ? 'YOU' : split.payer.name.toUpperCase()}</span> • {new Date(split.expenseId.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                                    <div className={split.payer._id === user._id ? 'amount-positive' : 'amount-negative'} style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                                                        ₹{Number(split.expenseId?.amount || 0).toLocaleString()}
                                                    </div>
                                                    <div style={{
                                                        padding: '0.35rem 0.75rem',
                                                        borderRadius: '0.5rem',
                                                        background: 'rgba(108, 92, 231, 0.1)',
                                                        color: 'var(--primary-light)',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 900,
                                                        letterSpacing: '0.05em',
                                                        textTransform: 'uppercase',
                                                        border: '1px solid rgba(108, 92, 231, 0.2)'
                                                    }}>
                                                        {split.expenseId.category}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card animate-fade-in" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Users size={18} color="var(--primary)" />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Group Members</h3>
                                </div>
                                <div style={{ background: 'rgba(108, 92, 231, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>
                                    {group.members.length} ACTIVE
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {group.members.map((member) => (
                                    <div key={member._id} className="hover-lift" style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between', 
                                        padding: '1rem', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        borderRadius: '1rem',
                                        border: '1px solid transparent',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(108, 92, 231, 0.2)'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border)', background: 'var(--bg-main)', position: 'relative' }}>
                                                {member.avatar ? (
                                                    <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-sidebar)', color: 'var(--accent)', fontWeight: 900, fontSize: '1rem' }}>
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                {member._id === group.createdBy._id && (
                                                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: 'var(--warning)', borderRadius: '50%', color: 'white', padding: '2px', border: '2px solid var(--bg-card)' }}>
                                                        <Crown size={8} style={{ fill: 'currentColor' }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                                                    {member.name.toUpperCase()}
                                                </p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.1rem' }}>
                                                    {member._id === group.createdBy._id ? 'Admin' : 'Member'}
                                                    {member._id === user._id && <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>(YOU)</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {canManageGroup && member._id !== group.createdBy._id && (
                                                <>
                                                    <button
                                                        onClick={() => handleTransferAdmin(member._id, member.name)}
                                                        disabled={isSubmitting}
                                                        className="hover-lift"
                                                        style={{ background: 'rgba(253, 203, 110, 0.1)', border: '1px solid rgba(253, 203, 110, 0.2)', color: 'var(--warning)', cursor: isSubmitting ? 'not-allowed' : 'pointer', padding: '0.5rem', borderRadius: '0.75rem', transition: 'all 0.3s ease', opacity: isSubmitting ? 0.4 : 1 }}
                                                        title="Make Group Admin"
                                                    >
                                                        <Crown size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveMember(member._id, member.name)}
                                                        disabled={isSubmitting}
                                                        className="hover-lift"
                                                        style={{ background: 'rgba(214, 48, 49, 0.05)', border: '1px solid rgba(214, 48, 49, 0.1)', color: '#D63031', cursor: isSubmitting ? 'not-allowed' : 'pointer', padding: '0.5rem', borderRadius: '0.75rem', transition: 'all 0.3s ease', opacity: isSubmitting ? 0.4 : 1 }}
                                                        title="Revoke Access"
                                                    >
                                                        <UserMinus size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showInvite && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '450px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <UserPlus size={24} color="var(--primary)" />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Invite Member</h3>
                        </div>
                        <form onSubmit={handleInvite}>
                            <div className="modern-input-group" style={{ marginBottom: '2rem' }}>
                                <label>Email Address</label>
                                <div className="icon-input-wrapper">
                                    <Mail className="input-icon" size={18} color="var(--primary)" />
                                    <input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                                    {isSubmitting ? 'Sending...' : 'Invite'}
                                </button>
                                <button type="button" onClick={() => setShowInvite(false)} className="btn" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Group Expense Modal */}
            {showAddExpense && (
                <div className="modal-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '10vh', zIndex: 1000 }}>
                    <div className="card animate-slide-up" style={{ width: '550px', padding: '2.5rem', maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <PlusCircle size={24} color="var(--primary)" />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>Add Group Expense</h3>
                        </div>
                        <form onSubmit={handleAddExpense}>
                            <div className="modern-input-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Description</label>
                                <div className="icon-input-wrapper">
                                    <FileText className="input-icon" size={18} color="var(--primary)" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Infrastructure Maintenance"
                                        value={expenseForm.title}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div className="modern-input-group">
                                    <label>Amount (₹)</label>
                                    <div className="icon-input-wrapper">
                                        <IndianRupee className="input-icon" size={18} color="var(--primary)" />
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={expenseForm.amount}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modern-input-group">
                                    <label>Category</label>
                                    <div className="icon-input-wrapper">
                                        <Tag className="input-icon" size={18} color="var(--primary)" />
                                        <select
                                            className="form-input"
                                            value={expenseForm.category}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                            required
                                        >
                                            <option value="Food" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Food & Dining</option>
                                            <option value="Transport" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Transport</option>
                                            <option value="Salary" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Income</option>
                                            <option value="Stay" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Accommodation</option>
                                            <option value="Activities" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Activities</option>
                                            <option value="Misc" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="modern-input-group" style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                <label style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                    <ShieldAlert size={14} /> Split Method
                                </label>

                                <div className="icon-input-wrapper" style={{ marginBottom: '1.5rem' }}>
                                    <Users className="input-icon" size={18} color="var(--primary)" />
                                    <select
                                        className="form-input"
                                        value={expenseForm.splitType}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, splitType: e.target.value })}
                                    >
                                        <option value="equal" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Split Equally</option>
                                        <option value="percentage" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>By Percentage</option>
                                        <option value="custom" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>By Exact Amount</option>
                                    </select>
                                </div>

                                {expenseForm.splitType !== 'equal' && (
                                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {group.members.map(member => (
                                            <div key={member._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{member.name.toUpperCase()}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <input
                                                        type="number"
                                                        style={{ width: '100px', padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'white' }}
                                                        value={expenseForm.customSplits.find(cs => cs.user === member._id)?.value || ''}
                                                        onChange={(e) => handleCustomSplitChange(member._id, e.target.value)}
                                                    />
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{expenseForm.splitType === 'percentage' ? '%' : '₹'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1.25rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Add Expense'}
                                </button>
                                <button type="button" onClick={() => setShowAddExpense(false)} className="btn" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
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
        </div>
);
};


export default GroupDashboard;
