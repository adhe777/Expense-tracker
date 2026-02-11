import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, Trash2, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import AIForecast from '../components/AIForecast';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ onAdmin }) => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({ title: '', amount: '', type: 'expense', category: 'Food' });

    const fetchData = async () => {
        try {
            const [statsRes, transRes] = await Promise.all([
                axios.get('http://localhost:8081/api/transactions/stats'),
                axios.get('http://localhost:8081/api/transactions')
            ]);
            setStats(statsRes.data);
            setTransactions(transRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        <div className="dashboard-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h1>Expense Tracker</h1>
                        {user?.isAdmin && (
                            <span style={{
                                background: '#e0e7ff',
                                color: '#4338ca',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '1rem',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                            }}>
                                System Admin
                            </span>
                        )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {user?.isAdmin && (
                        <button onClick={onAdmin} className="btn" style={{ width: 'auto', background: '#e0e7ff', color: '#4338ca' }}>
                            Admin Portal
                        </button>
                    )}
                    <button onClick={logout} className="btn" style={{ width: 'auto', background: '#fee2e2', color: '#ef4444' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Balance</p>
                    <h2 style={{ fontSize: '1.5rem' }}>₹{stats.balance.toLocaleString()}</h2>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Income</p>
                    <h2 style={{ color: 'var(--success)', fontSize: '1.5rem' }}>₹{stats.totalIncome.toLocaleString()}</h2>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Expense</p>
                    <h2 style={{ color: 'var(--danger)', fontSize: '1.5rem' }}>₹{stats.totalExpense.toLocaleString()}</h2>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <AIForecast />
                    <div className="card">
                        <h3>Add Transaction</h3>
                        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                            <div className="input-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Rent, Salary, Dinner..."
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Amount (₹)</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group">
                                    <label>Type</label>
                                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                        <option value="Food">Food</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Shopping">Shopping</option>
                                        <option value="Rent">Rent</option>
                                        <option value="Salary">Salary</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Plus size={18} /> Add Transaction
                            </button>
                        </form>
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3>Spending Analysis</h3>
                    <div style={{ width: '250px', marginTop: '2rem' }}>
                        <Pie data={chartData} />
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3>Recent Transactions</h3>
                <div style={{ marginTop: '1rem' }}>
                    {transactions.map((t) => (
                        <div key={t._id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            borderBottom: '1px solid var(--border)',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {t.type === 'income' ? <TrendingUp color="var(--success)" /> : <TrendingDown color="var(--danger)" />}
                                <div>
                                    <p style={{ fontWeight: 600 }}>{t.title}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <p style={{ fontWeight: 700, color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                                    {t.type === 'income' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                                </p>
                                <Trash2
                                    size={18}
                                    style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}
                                    onClick={() => deleteTransaction(t._id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
