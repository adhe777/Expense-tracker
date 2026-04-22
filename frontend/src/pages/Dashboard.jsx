import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp,
    FileText,
    IndianRupee,
    List,
    Tag,
    PlusCircle,
    Sun,
    Moon,
    Users
} from 'lucide-react';
import AIForecast from '../components/AIForecast';
import { toast } from 'react-hot-toast';
import SmartPrediction from '../components/SmartPrediction';
import ConfirmModal from '../components/ConfirmModal';
import NotificationBell from '../components/NotificationBell';
import { groupService, budgetService, transactionService } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
    const { user: authUser, refreshUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const isSystemAdmin = authUser?.role === 'system_admin';

    // State
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
        monthlySavings: 0,
        savingsRate: 0
    });
    const [formData, setFormData] = useState({ title: '', amount: '', type: 'expense', category: 'Food', isGroupExpense: false, groupId: '' });
    const [fetching, setFetching] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', confirmText: 'Confirm', variant: 'danger', onConfirm: () => { }
    });
    const [budgets, setBudgets] = useState([]);

    const fetchData = async () => {
        if (isSystemAdmin) {
            setFetching(false);
            return;
        }
        try {
            const [statsRes, budgetsRes] = await Promise.all([
                transactionService.getStats(),
                budgetService.getBudgets(),
                refreshUser()
            ]);
            setStats(statsRes);
            setBudgets(budgetsRes);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (fetching) {
        return (
            <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'pulse 1.5s infinite' }}>
                <div className="card" style={{ height: '80px', width: '300px' }}></div>
                <div className="grid-cols-3">
                    <div className="card" style={{ height: '100px' }}></div>
                    <div className="card" style={{ height: '100px' }}></div>
                    <div className="card" style={{ height: '100px' }}></div>
                </div>
            </div>
        );
    }

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        try {
            setIsSubmitting(true);
            if (formData.isGroupExpense && formData.groupId) {
                await groupService.addGroupExpense({
                    groupId: formData.groupId,
                    title: formData.title,
                    amount: formData.amount,
                    splitType: 'EQUAL' 
                });
                toast.success('Group expense added successfully!');
            } else {
                const response = await transactionService.addTransaction(formData);
                if (response.warning) {
                    toast(response.warning, {
                        icon: '⚠️',
                        style: {
                            borderRadius: '10px',
                            background: '#fffbeb',
                            color: '#92400e',
                            border: '1px solid #fef3c7'
                        },
                        duration: 6000
                    });
                }
                toast.success('Transaction added successfully!');
            }
            fetchData();
            setFormData({ title: '', amount: '', type: 'expense', category: 'Food', isGroupExpense: false, groupId: '' });
        } catch (err) {
            toast.error('Failed to add transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-content">
            <header style={{ position: 'relative', zIndex: 1000, marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <TrendingUp size={14} />
                        <span>Dashboard Overview</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Hi, {authUser?.name || 'User'}</h1>
                </div>
                <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="hover-lift" style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={toggleTheme}>
                        {theme === 'light' ? <Moon size={20} color="var(--primary)" /> : <Sun size={20} color="var(--warning)" />}
                    </div>
                    <NotificationBell onUpdateGroups={() => refreshUser()} />
                </div>
            </header>

            <div className="grid-cols-3 animate-slide-up" style={{ marginBottom: '3.5rem', gap: '2rem' }}>
                <div className="card hover-lift" style={{ borderLeft: '4px solid var(--primary)', background: 'var(--bg-card)', padding: '2rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Total Balance</p>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.04em' }}>₹{(stats?.balance || 0).toLocaleString()}</h2>
                    <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated just now</div>
                </div>
                <div className="card hover-lift" style={{ borderLeft: '4px solid var(--success)', background: 'var(--bg-card)', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        <TrendingUp size={16} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monthly Income</span>
                    </div>
                    <h2 style={{ color: 'var(--success)', fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.04em' }}>₹{(stats?.monthlyIncome || 0).toLocaleString()}</h2>
                    <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>+12% from last month</div>
                </div>
                <div className="card hover-lift" style={{ borderLeft: '4px solid var(--accent)', background: 'var(--bg-card)', padding: '2rem' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Savings Rate</p>
                    <h2 style={{ color: 'var(--accent)', fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.04em' }}>{stats.savingsRate}%</h2>
                    <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 45% (Recommended)</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isSystemAdmin ? '1fr 350px' : '1fr 350px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {!isSystemAdmin && (
                        <div className="card animate-slide-up" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '2rem' }}>Add Transaction</h3>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="modern-input-group">
                                    <label>Description</label>
                                    <div className="icon-input-wrapper">
                                        <FileText className="input-icon" size={18} color="var(--primary)" />
                                        <input
                                            type="text"
                                            placeholder="e.g. Grocery Shopping"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modern-input-group">
                                    <label>Amount (₹)</label>
                                    <div className="icon-input-wrapper">
                                        <IndianRupee className="input-icon" size={18} color="var(--primary)" />
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="modern-input-group">
                                        <label>Type</label>
                                        <div className="icon-input-wrapper">
                                            <List className="input-icon" size={18} color="var(--primary)" />
                                            <select className="form-input" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                                <option value="expense">Expense</option>
                                                <option value="income">Income</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modern-input-group">
                                        <label>Category</label>
                                        <div className="icon-input-wrapper">
                                            <Tag className="input-icon" size={18} color="var(--primary)" />
                                            <select className="form-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                                <option value="Food">Food & Dining</option>
                                                <option value="Transport">Transport</option>
                                                <option value="Shopping">Shopping</option>
                                                <option value="Salary">Salary</option>
                                                <option value="Rent">Rent</option>
                                                <option value="Entertainment">Entertainment</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                {!isSystemAdmin && authUser?.groups?.length > 0 && (
                                    <div style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: formData.isGroupExpense ? '1rem' : 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Users size={18} color="var(--primary)" />
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Is this a Group Expense?</span>
                                            </div>
                                            <div 
                                                onClick={() => setFormData({ ...formData, isGroupExpense: !formData.isGroupExpense })}
                                                style={{ 
                                                    width: '44px', 
                                                    height: '24px', 
                                                    background: formData.isGroupExpense ? 'var(--primary)' : 'rgba(255,255,255,0.1)', 
                                                    borderRadius: '12px', 
                                                    position: 'relative', 
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <div style={{ 
                                                    width: '18px', 
                                                    height: '18px', 
                                                    background: 'white', 
                                                    borderRadius: '50%', 
                                                    position: 'absolute', 
                                                    top: '3px', 
                                                    left: formData.isGroupExpense ? '23px' : '3px',
                                                    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                                }} />
                                            </div>
                                        </div>

                                        {formData.isGroupExpense && (
                                            <div className="animate-fade-in">
                                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Select Target Group</label>
                                                <select 
                                                    className="form-input" 
                                                    value={formData.groupId} 
                                                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                                                    required={formData.isGroupExpense}
                                                    style={{ width: '100%', height: '3rem', fontSize: '0.85rem' }}
                                                >
                                                    <option value="">-- Choose a group --</option>
                                                    {authUser.groups.map(g => (
                                                        <option key={g._id} value={g._id}>{g.groupName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary" style={{ 
                                    marginTop: '1rem', 
                                    width: '100%',
                                    height: '3.5rem', 
                                    opacity: isSubmitting ? 0.7 : 1 
                                }} disabled={isSubmitting}>
                                    <PlusCircle size={20} />
                                    {isSubmitting ? 'Syncing...' : 'Add Transaction'}
                                </button>
                            </form>
                        </div>
                    )}

                    {!isSystemAdmin && (
                        <div className="card animate-slide-up" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Users size={20} color="var(--primary)" />
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>Your Groups</h3>
                                </div>
                                {authUser?.groups?.length > 0 && (
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
                                        {authUser.groups.length} ACTIVE
                                    </div>
                                )}
                            </div>

                            {authUser?.groups?.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    {authUser.groups.map(group => (
                                        <div key={group._id} className="hover-lift" style={{ 
                                            padding: '1.5rem', 
                                            background: 'var(--bg-main)', 
                                            borderRadius: '1.25rem', 
                                            border: '1px solid var(--border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                                                    {group.groupName ? group.groupName.charAt(0).toUpperCase() : 'G'}
                                                </div>
                                                <span style={{ fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.groupName || 'Unnamed Group'}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    onClick={() => navigate(`/group/${group._id}`)}
                                                    className="btn" 
                                                    style={{ flex: 1, height: '2.5rem', fontSize: '0.75rem', fontWeight: 800, background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer' }}
                                                >
                                                    View
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/group-admin/${group._id}`)}
                                                    className="btn" 
                                                    style={{ flex: 1, height: '2.5rem', fontSize: '0.75rem', fontWeight: 800, background: 'rgba(34, 211, 238, 0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', cursor: 'pointer' }}
                                                >
                                                    Stats
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
                                    <Users size={32} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>No groups found. Create or join one to get started!</p>
                                </div>
                            )}
                        </div>
                    )}
                    {isSystemAdmin && (
                        <div className="card animate-slide-up" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-main) 100%)' }}>
                            <TrendingUp size={48} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>Admin Mode Access</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6 }}> You are currently in System Admin mode. Personal expense tracking is disabled for admin accounts. Use the Admin Dashboard to manage system-wide groups and users. </p>
                        </div>
                    )}
                </div>

                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <SmartPrediction />
                    <AIForecast />
                </aside>
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
        </div>
    );
};

export default Dashboard;
