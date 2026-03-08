import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LogOut,
    Plus,
    Trash2,
    TrendingUp,
    TrendingDown,
    Sparkles,
    BrainCircuit,
    PieChart,
    Home,
    FileText,
    IndianRupee,
    List,
    Tag,
    PlusCircle,
    Users,
    User,
    Sun,
    Moon,
    Hexagon
} from 'lucide-react';
import AIForecast from '../components/AIForecast';
import SmartPrediction from '../components/SmartPrediction';
import ChatAssistant from '../components/ChatAssistant';
import { groupService } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ onBudgets, onGroupView, onProfile }) => {
    const { user: authUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

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
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [formData, setFormData] = useState({ title: '', amount: '', type: 'expense', category: 'Food', isGroupExpense: false, groupId: '' });
    const [fetching, setFetching] = useState(true);


    const fetchData = async () => {
        try {
            const [statsRes, transRes, budgetRes] = await Promise.all([
                axios.get('http://localhost:8081/api/transactions/stats', {
                    headers: { Authorization: `Bearer ${user.token}` }
                }),
                axios.get('http://localhost:8081/api/transactions', {
                    headers: { Authorization: `Bearer ${user.token}` }
                }),
                axios.get('http://localhost:8081/api/budgets', {
                    headers: { Authorization: `Bearer ${user.token}` }
                })
            ]);
            setStats(statsRes.data);
            setTransactions(transRes.data);
            setBudgets(budgetRes.data);
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

    const getBudgetUsage = (category) => {
        const spent = transactions
            .filter(t => t.type === 'expense' && t.category === category)
            .reduce((acc, curr) => acc + curr.amount, 0);
        const budget = budgets.find(b => b.category === category);
        if (!budget) return { spent, limit: 0, percent: 0, isOver: false }; // Return default object
        const percent = (spent / budget.amount) * 100;
        return { spent, limit: budget.amount, percent: Math.min(percent, 100), isOver: percent > 100 };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.isGroupExpense && formData.groupId) {
                await groupService.addGroupExpense({
                    groupId: formData.groupId,
                    title: formData.title,
                    amount: formData.amount,
                    splitType: 'EQUAL' // Default backend splits to EQUAL for quick add
                });
            } else {
                await axios.post('http://localhost:8081/api/transactions', formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            }
            setFormData({ title: '', amount: '', type: 'expense', category: 'Food', isGroupExpense: false, groupId: '' });
            fetchData();
        } catch (err) {
            alert('Failed to add transaction');
        }
    };

    const deleteTransaction = async (id) => {
        try {
            await axios.delete(`http://localhost:8081/api/transactions/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchData();
        } catch (err) {
            alert('Failed to delete transaction');
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const data = await groupService.createGroup({ groupName: newGroupName, groupDescription: newGroupDescription }, user.token);
            // Update local user object to include the new group in the sidebar
            const updatedUser = { ...user, groups: [...(user.groups || []), data] };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setNewGroupName('');
            setNewGroupDescription('');
            setShowCreateGroup(false);
            window.location.reload(); // Quick refresh to sync header and list
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to create group');
        }
    };

    const chartData = {
        labels: ['Income', 'Expense'],
        datasets: [{
            data: [stats.totalIncome, stats.totalExpense],
            backgroundColor: ['#10b981', '#ef4444'],
            borderWidth: 0,
        }]
    };



    return (
        <div className="dashboard-container" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100vh', padding: 0, overflow: 'hidden', background: 'transparent' }}>
            {/* Sidebar */}
            <aside className="sidebar" style={{
                background: 'var(--glass)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid var(--border)',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '4px 0 24px -10px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}>
                        <Hexagon size={28} color="white" />
                    </div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.025em' }}>FINANCE TRACKER</h2>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="nav-item active" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-main)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        <Home size={20} />
                        <span>Insight Dashboard</span>
                    </div>
                    <div className="nav-item" onClick={onBudgets} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        <PieChart size={20} />
                        <span>Smart Budgets</span>
                    </div>
                    <div className="nav-item" onClick={onProfile} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        <User size={20} />
                        <span>Profile Settings</span>
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em', padding: '0 0.75rem' }}>Shared Hubs</p>
                        {user.groups && user.groups.map(group => (
                            <div
                                key={group._id}
                                className="nav-item"
                                onClick={() => onGroupView(group._id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                                <Users size={18} />
                                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{group.groupName}</span>
                            </div>
                        ))}
                        <div
                            className="nav-item"
                            style={{ color: 'var(--primary)', marginTop: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', transition: 'all 0.2s ease' }}
                            onClick={() => setShowCreateGroup(true)}
                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)' }}
                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                            <PlusCircle size={18} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Create New Group</span>
                        </div>
                    </div>
                </nav>

                <div style={{ marginTop: 'auto', padding: '1rem 0.5rem', borderTop: '1px solid var(--border)' }}>
                    <div
                        className="nav-item"
                        onClick={toggleTheme}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '0.5rem' }}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                    <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', width: '100%', padding: '0.75rem' }}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Welcome Back, {user.name}</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Your decentralized financial workspace is ready.</p>
                </header>

                <div className="grid-cols-3" style={{ marginBottom: '3rem' }}>
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'linear-gradient(to bottom right, var(--bg-card), rgba(99, 102, 241, 0.05))' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Balance</p>
                        <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem', letterSpacing: '-0.025em' }}>₹{stats.balance.toLocaleString()}</h2>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--success)', background: 'linear-gradient(to bottom right, var(--bg-card), rgba(16, 185, 129, 0.05))' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Income</p>
                        <h2 style={{ color: 'var(--success)', fontSize: '1.75rem', marginTop: '0.5rem', letterSpacing: '-0.025em' }}>₹{stats.monthlyIncome.toLocaleString()}</h2>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--warning)', background: 'linear-gradient(to bottom right, var(--bg-card), rgba(245, 158, 11, 0.05))' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Savings Rate</p>
                        <h2 style={{ color: 'var(--warning)', fontSize: '1.75rem', marginTop: '0.5rem', letterSpacing: '-0.025em' }}>{stats.savingsRate}%</h2>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card">
                            <h3>Add Personal Expense</h3>
                            <form onSubmit={handleSubmit} style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="modern-input-group">
                                    <label>Expense Title</label>
                                    <div className="icon-input-wrapper">
                                        <FileText className="input-icon" size={18} />
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
                                        <IndianRupee className="input-icon" size={18} />
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="modern-input-group">
                                        <label>Transaction Type</label>
                                        <div className="icon-input-wrapper">
                                            <List className="input-icon" size={18} />
                                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                                <option value="expense">Expense</option>
                                                <option value="income">Income</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modern-input-group">
                                        <label>Category</label>
                                        <div className="icon-input-wrapper">
                                            <Tag className="input-icon" size={18} />
                                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                                <option value="Food">Food</option>
                                                <option value="Transport">Transport</option>
                                                <option value="Shopping">Shopping</option>
                                                <option value="Rent">Rent</option>
                                                <option value="Entertainment">Entertainment</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {formData.type === 'expense' && (
                                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.isGroupExpense}
                                                onChange={(e) => setFormData({ ...formData, isGroupExpense: e.target.checked })}
                                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                            />
                                            Add this expense to a group
                                        </label>
                                        {formData.isGroupExpense && user.groups && user.groups.length > 0 && (
                                            <div style={{ marginTop: '1rem' }} className="modern-input-group">
                                                <label>Select Group</label>
                                                <select
                                                    value={formData.groupId}
                                                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.25rem', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'white' }}
                                                    required
                                                >
                                                    <option value="" disabled>-- Select Hub --</option>
                                                    {user.groups.map(g => (
                                                        <option key={g._id} value={g._id}>{g.groupName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button type="submit" className="btn-modern-submit" style={{ marginTop: '1rem' }}>
                                    <PlusCircle size={20} />
                                    Add Record
                                </button>
                            </form>
                        </div>

                        <section className="card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3>Recent Activity</h3>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>LAST 5 TRANSACTIONS</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {transactions.length === 0 ? (
                                    <div className="empty-state">
                                        <FileText size={48} style={{ color: 'var(--border)', marginBottom: '1rem' }} />
                                        <p style={{ fontWeight: 600 }}>No transactions yet</p>
                                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Add your first expense or income above.</p>
                                    </div>
                                ) : (
                                    transactions.slice(0, 5).map(t => (
                                        <div key={t._id} className="ledger-row">
                                            <div className={`ledger-icon ${t.type === 'income' ? 'ledger-income' : 'ledger-expense'}`}>
                                                {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t.title}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 500 }}>{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className={t.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                                                {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                            </div>
                                            <button
                                                onClick={() => deleteTransaction(t._id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', transition: 'color 0.2s', display: 'flex' }}
                                                onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <SmartPrediction />
                        <AIForecast />
                        <div className="card">
                            <h3 style={{ marginBottom: '1.5rem' }}>Analytics</h3>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Pie data={chartData} />
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <ChatAssistant />

            {showCreateGroup && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Create Shared Finance Hub</h3>
                        <form onSubmit={handleCreateGroup}>
                            <div className="modern-input-group" style={{ marginBottom: '1rem' }}>
                                <label>Group Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dream Housemates"
                                    className="form-input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'white' }}
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
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'white' }}
                                    value={newGroupDescription}
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="submit" className="btn-modern-submit" style={{ flex: 1 }}>Launch Group</button>
                                <button type="button" onClick={() => setShowCreateGroup(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
