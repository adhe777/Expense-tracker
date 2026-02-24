import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    Plus,
    Send,
    TrendingDown,
    TrendingUp,
    MoreVertical,
    ArrowLeft,
    PieChart,
    Wallet,
    Target
} from 'lucide-react';
import { groupService } from '../services/api';

const GroupDashboard = ({ groupId, onBack }) => {
    const { user } = useAuth();
    const [group, setGroup] = useState(null);
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseData, setExpenseData] = useState({
        title: '',
        amount: '',
        category: 'bills',
        splitType: 'equal'
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [groupRes, settleRes] = await Promise.all([
                axios.get(`http://localhost:8081/api/groups/${groupId}`),
                axios.get(`http://localhost:8081/api/groups/settlement/${groupId}`)
            ]);
            setGroup(groupRes.data);
            setSettlements(settleRes.data);
            setLoading(false);
        } catch (err) {
            alert('Failed to load group data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [groupId]);

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8081/api/groups/invite', { groupId, email: inviteEmail });
            alert('Invitation sent!');
            setInviteEmail('');
            setShowInviteModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Invite failed');
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8081/api/groups/expense', {
                ...expenseData,
                groupId,
                date: new Date()
            });
            setShowExpenseModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to add expense');
        }
    };

    if (loading) return <div className="loading">Loading Shared Workspace...</div>;

    return (
        <div className="group-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <button onClick={onBack} className="back-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                <ArrowLeft size={18} /> Back to Personal Dashboard
            </button>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{group.groupName}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{group.groupDescription || 'Shared financial hub'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setShowInviteModal(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Invite Member
                    </button>
                    <button onClick={() => setShowExpenseModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Wallet size={18} /> Add Group Expense
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Main Content */}
                <div>
                    <section className="card" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                            <TrendingUp size={20} color="var(--accent-primary)" />
                            Settlement Summary
                        </h2>
                        {settlements.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>All clear! No current debts.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {settlements.map((s, idx) => (
                                    <div key={idx} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{s.text}</span>
                                        <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>₹{s.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <aside>
                    <section className="card">
                        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={18} /> Members
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {group.members.map(m => (
                                <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                                        {m.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.name}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{group.createdBy._id === m._id ? 'Admin' : 'Member'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>

            {/* Modals (simplified for brevity, can be expanded) */}
            {showInviteModal && (
                <div className="modal-overlay">
                    <div className="card modal-content" style={{ width: '400px' }}>
                        <h3>Invite to Group</h3>
                        <form onSubmit={handleInvite}>
                            <input
                                type="email"
                                placeholder="User Email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="form-input"
                                required
                            />
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Send Invite</button>
                                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showExpenseModal && (
                <div className="modal-overlay">
                    <div className="card modal-content" style={{ width: '500px' }}>
                        <h3>Record Group Expense</h3>
                        <form onSubmit={handleAddExpense}>
                            <div className="form-group">
                                <label>What was it for?</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dinner, Electricity"
                                    className="form-input"
                                    value={expenseData.title}
                                    onChange={(e) => setExpenseData({ ...expenseData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="form-input"
                                    value={expenseData.amount}
                                    onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Split Model</label>
                                <select
                                    className="form-input"
                                    value={expenseData.splitType}
                                    onChange={(e) => setExpenseData({ ...expenseData, splitType: e.target.value })}
                                >
                                    <option value="equal">Split Equally</option>
                                    <option value="percentage">By Percentage (Admin only custom)</option>
                                    <option value="custom">Custom Amounts</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Record & Notify</button>
                                <button type="button" onClick={() => setShowExpenseModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDashboard;
