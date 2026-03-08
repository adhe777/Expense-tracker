import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/api';
import { ArrowLeft, Users, IndianRupee, PlusCircle, UserPlus, List, Trash2, ShieldAlert, Mail, FileText, Tag, Hexagon } from 'lucide-react';

const GroupDashboard = ({ groupId, onBack }) => {
    const { user } = useAuth();
    const [group, setGroup] = useState(null);
    const [splits, setSplits] = useState([]);
    const [settlements, setSettlements] = useState([]);

    // UI States
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [showAddExpense, setShowAddExpense] = useState(false);

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

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await groupService.inviteMember({ groupId, email: inviteEmail });
            setInviteEmail('');
            setShowInvite(false);
            fetchData();
            alert('User invited successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to invite user');
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await groupService.addGroupExpense({
                groupId,
                ...expenseForm
            });
            setShowAddExpense(false);
            setExpenseForm(prev => ({ ...prev, title: '', amount: '', splitType: 'equal' }));
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add group expense');
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

    if (!group) return <div style={{ padding: '2rem', color: 'white' }}>Loading Resource...</div>;

    const isAdmin = group.createdBy._id === user._id;

    return (
        <div style={{ height: '100vh', overflowY: 'auto', padding: '2rem 3rem', background: 'transparent' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={onBack} style={{ display: 'flex', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
                    <ArrowLeft size={24} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', padding: '0.75rem', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}>
                        <Hexagon size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{group.groupName}</h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{group.groupDescription || "Shared Finance Hub"}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

                {/* Main Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Settlements Summary */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><IndianRupee size={20} color="var(--primary)" /> Net Settlements</h3>
                            <button className="btn-modern-submit" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setShowAddExpense(true)}>
                                <PlusCircle size={16} /> Add Group Expense
                            </button>
                        </div>

                        {settlements.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>All settled up! No outstanding balances.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {settlements.map((s, idx) => (
                                    <div key={idx} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>{s.from} <ArrowLeft size={14} style={{ display: 'inline', margin: '0 0.25rem', color: 'var(--text-secondary)' }} /> {s.to}</span>
                                        <span style={{ fontWeight: 700, color: 'var(--warning)' }}>₹{s.amount}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Shared History Ledger */}
                    <section className="card" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><List size={20} color="var(--primary)" /> Shared History</h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>ALL TRANSACTIONS</div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {splits.length === 0 ? (
                                <div className="empty-state">
                                    <FileText size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                                    <p style={{ fontWeight: 600 }}>No group expenses recorded yet.</p>
                                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Click 'Add Group Expense' to post the first bill.</p>
                                </div>
                            ) : (
                                splits.map((split) => (
                                    <div key={split._id} className="ledger-row" style={{ borderLeft: split.payer._id === user._id ? '4px solid var(--success)' : '4px solid var(--warning)' }}>
                                        <div className={`ledger-icon ${split.payer._id === user._id ? 'ledger-income' : 'ledger-expense'}`}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{split.expenseId.title}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 500 }}>
                                                Paid by <span style={{ color: 'var(--text-primary)' }}>{split.payer._id === user._id ? 'You' : split.payer.name}</span> • {new Date(split.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={split.payer._id === user._id ? 'amount-positive' : 'amount-negative'}>
                                            ₹{split.expenseId.amount.toLocaleString()}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                            {split.expenseId.category}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> Directory</h3>
                            {isAdmin && (
                                <button onClick={() => setShowInvite(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                                    <UserPlus size={16} /> Invite
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {group.members.map((member) => (
                                <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{member.name} {member._id === user._id && "(You)"}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{member._id === group.createdBy._id ? 'Admin' : 'Member'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            {showInvite && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Invite Member</h3>
                        <form onSubmit={handleInvite}>
                            <div className="modern-input-group" style={{ marginBottom: '1.5rem' }}>
                                <label>User Email Address</label>
                                <div className="icon-input-wrapper">
                                    <Mail className="input-icon" size={18} />
                                    <input
                                        type="email"
                                        placeholder="friend@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" className="btn-modern-submit" style={{ flex: 1, margin: 0 }}>Send Invite</button>
                                <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Group Expense Modal */}
            {showAddExpense && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '5vh', zIndex: 1000 }}>
                    <div className="card" style={{ width: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Add Group Expense</h3>
                        <form onSubmit={handleAddExpense}>
                            <div className="modern-input-group" style={{ marginBottom: '1rem' }}>
                                <label>Expense Title</label>
                                <div className="icon-input-wrapper">
                                    <FileText className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Dinner at Goa"
                                        value={expenseForm.title}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="modern-input-group">
                                    <label>Amount Paid (₹)</label>
                                    <div className="icon-input-wrapper">
                                        <IndianRupee className="input-icon" size={18} />
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
                                        <Tag className="input-icon" size={18} />
                                        <select
                                            value={expenseForm.category}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                            required
                                        >
                                            <option value="Food">Food</option>
                                            <option value="Transport">Transport</option>
                                            <option value="Stay">Stay</option>
                                            <option value="Activities">Activities</option>
                                            <option value="Misc">Misc</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="modern-input-group" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                <label style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>Split Logic</label>

                                <div className="icon-input-wrapper" style={{ marginBottom: '1rem' }}>
                                    <Users className="input-icon" size={18} />
                                    <select
                                        value={expenseForm.splitType}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, splitType: e.target.value })}
                                    >
                                        <option value="equal">Split Equally</option>
                                        <option value="percentage">Split by Percentage</option>
                                        <option value="custom">Exact Custom Amounts</option>
                                    </select>
                                </div>

                                {expenseForm.splitType !== 'equal' && (
                                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            {expenseForm.splitType === 'percentage' ? "Enter percentage (must total 100)" : "Enter exact amounts (must equal total)"}
                                        </p>
                                        {group.members.map(member => (
                                            <div key={member._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.9rem' }}>{member.name}</span>
                                                <input
                                                    type="number"
                                                    style={{ width: '80px', padding: '0.35rem', borderRadius: '0.25rem', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'white', textAlign: 'right' }}
                                                    value={expenseForm.customSplits.find(cs => cs.user === member._id)?.value || ''}
                                                    onChange={(e) => handleCustomSplitChange(member._id, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" className="btn-modern-submit" style={{ flex: 1 }}>Submit Expense</button>
                                <button type="button" onClick={() => setShowAddExpense(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div >
                </div >
            )}
        </div >
    );
};

export default GroupDashboard;
