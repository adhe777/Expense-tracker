import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
    DollarSign,
    List,
    Tag,
    PlusCircle
} from 'lucide-react';
import AIForecast from '../components/AIForecast';
import SmartPrediction from '../components/SmartPrediction';
import ChatAssistant from '../components/ChatAssistant';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ onBudgets }) => {
    const { user, logout } = useAuth();
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
    const [formData, setFormData] = useState({ title: '', amount: '', type: 'expense', category: 'Food' });
    const [fetching, setFetching] = useState(true);


    const fetchData = async () => {
        try {
            const [statsRes, transRes, budgetRes] = await Promise.all([
                axios.get('http://localhost:8081/api/transactions/stats'),
                axios.get('http://localhost:8081/api/transactions'),
                axios.get('http://localhost:8081/api/budgets')
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
            await axios.post('http://localhost:8081/api/transactions', formData);
            setFormData({ title: '', amount: '', type: 'expense', category: 'Food' });
            fetchData();
        } catch (err) {
            alert('Failed to add transaction');
        }
    };

    const deleteTransaction = async (id) => {
        try {
            await axios.delete(`http://localhost:8081/api/transactions/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete');
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
        <div className="dashboard-container" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100vh', padding: 0, overflow: 'hidden' }}>
            {/* Sidebar */}
            <aside className="sidebar" style={{
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
                    <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
                        <BrainCircuit size={28} color="white" />
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


                </nav>

                <div style={{ marginTop: 'auto', padding: '1rem 0.5rem', borderTop: '1px solid var(--border)' }}>
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
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Balance</p>
                        <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>₹{stats.balance.toLocaleString()}</h2>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Monthly Income</p>
                        <h2 style={{ color: 'var(--success)', fontSize: '1.5rem', marginTop: '0.5rem' }}>₹{stats.monthlyIncome.toLocaleString()}</h2>
                    </div>
                    <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Savings Rate</p>
                        <h2 style={{ color: 'var(--warning)', fontSize: '1.5rem', marginTop: '0.5rem' }}>{stats.savingsRate}%</h2>
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
                                        <DollarSign className="input-icon" size={18} />
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
                                <button type="submit" className="btn-modern-submit" style={{ marginTop: '1rem' }}>
                                    <PlusCircle size={20} />
                                    Add Record
                                </button>
                            </form>
                        </div>

                        <section className="card">
                            <h3 style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {transactions.slice(0, 5).map(t => (
                                    <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-main)', borderRadius: '0.75rem', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {t.type === 'income' ? <TrendingUp color="var(--success)" size={20} /> : <TrendingDown color="var(--danger)" size={20} />}
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ fontWeight: 700, color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                                                {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                            </span>
                                            <Trash2 size={16} onClick={() => deleteTransaction(t._id)} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} />
                                        </div>
                                    </div>
                                ))}
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


        </div>
    );
};

export default Dashboard;
