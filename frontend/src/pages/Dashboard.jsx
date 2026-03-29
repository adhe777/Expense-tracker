import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
    Moon
} from 'lucide-react';
import AIForecast from '../components/AIForecast';
import { toast } from 'react-hot-toast';
import SmartPrediction from '../components/SmartPrediction';
import ChatAssistant from '../components/ChatAssistant';
import NotificationBell from '../components/NotificationBell';
import ConfirmModal from '../components/ConfirmModal';
import Sidebar from '../components/Sidebar';
import { groupService, budgetService, transactionService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Menu } from 'lucide-react';

const Dashboard = () => {
    const { user: authUser, refreshUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const isSystemAdmin = authUser?.role === 'system_admin';

    // Group Modal State
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', confirmText: 'Confirm', variant: 'danger', onConfirm: () => { }
    });


    const fetchData = async () => {
        if (isSystemAdmin) {
            setFetching(false);
            return;
        }
        try {
            const statsRes = await transactionService.getStats();
            setStats(statsRes);
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
            refreshUser();
        } catch (err) {
            console.error("Create group error:", err);
            toast.error(err.response?.data?.message || 'Failed to create group');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="app-layout">
            <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
            </button>

            <Sidebar 
                onShowCreateGroup={() => setShowCreateGroup(true)} 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />

            {/* Main Content */}
            <main className="main-content">
                <header style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <TrendingUp size={14} />
                            <span>System Status: Optimal</span>
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
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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

                                    {formData.type === 'expense' && (
                                        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isGroupExpense}
                                                    onChange={(e) => setFormData({ ...formData, isGroupExpense: e.target.checked })}
                                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                                />
                                                Add as Group Expense
                                            </label>
                                            {formData.isGroupExpense && authUser?.groups && authUser.groups.length > 0 && (
                                                <div style={{ marginTop: '1.25rem' }} className="modern-input-group">
                                                    <label>Select Group</label>
                                                    <select
                                                        className="form-input"
                                                        value={formData.groupId}
                                                        onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                                                        style={{ width: '100%' }}
                                                        required
                                                    >
                                                        <option value="" disabled>-- Select Group --</option>
                                                        {authUser.groups.map(g => (
                                                            <option key={g._id} value={g._id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>{g.groupName}</option>
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
                        {isSystemAdmin && (
                            <div className="card animate-slide-up" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-main) 100%)' }}>
                                <TrendingUp size={48} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>Administrative Oversight</h3>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6 }}> You are currently in System Admin mode. Personal expense tracking is disabled for administrative accounts to maintain oversight integrity. Use the Admin Console to manage system-wide groups and users. </p>
                            </div>
                        )}
                    </div>

                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <SmartPrediction />
                        <AIForecast />
                    </aside>
                </div>
            </main>

            <ChatAssistant />

            {showCreateGroup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 style={{ marginBottom: '1.5rem' }}>Create Finance Hub</h3>
                        <form onSubmit={handleCreateGroup}>
                            <div className="modern-input-group" style={{ marginBottom: '1rem' }}>
                                <label>Group Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dream Housemates"
                                    className="form-input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="modern-input-group" style={{ marginBottom: '1rem' }}>
                                <label>Description (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Shared expenses for Goa Trip"
                                    className="form-input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                                    value={newGroupDescription}
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{isSubmitting ? 'Creating...' : 'Create Group'}</button>
                                <button type="button" onClick={() => setShowCreateGroup(false)} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>Cancel</button>
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

export default Dashboard;
