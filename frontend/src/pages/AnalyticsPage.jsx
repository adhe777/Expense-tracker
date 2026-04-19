import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { transactionService } from '../services/api';
import NotificationBell from '../components/NotificationBell';
import EmptyState from '../components/EmptyState';
import { 
    TrendingUp, 
    TrendingDown, 
    BarChart3, 
    PieChart,
    FileText, 
    Trash2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Sun,
    Moon
} from 'lucide-react';
import { 
    Chart as ChartJS, 
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement, 
    LineElement,
    Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';

ChartJS.register(
    ArcElement, 
    Tooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    PointElement, 
    LineElement,
    Title
);

const AnalyticsPage = () => {
    const { user: authUser, refreshUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [chartView, setChartView] = useState('monthly'); // 'monthly' | 'yearly'

    const isSystemAdmin = authUser?.role === 'system_admin';

    const fetchData = async () => {
        if (isSystemAdmin) {
            setFetching(false);
            return;
        }
        try {
            const [statsRes, transRes] = await Promise.all([
                transactionService.getStats(),
                transactionService.getTransactions()
            ]);
            setStats(statsRes);
            setTransactions(transRes);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch analytics data');
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteTransaction = async (id) => {
        try {
            await transactionService.deleteTransaction(id);
            toast.success('Transaction deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete transaction');
        }
    };

    if (fetching) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                <div className="neon-glow" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Loading Analytics...</p>
            </div>
        );
    }

    // Process Data for Category Chart
    const categoryData = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

    const pieData = {
        labels: Object.keys(categoryData),
        datasets: [{
            data: Object.values(categoryData),
            backgroundColor: ['#6c5ce7', '#00cec9', '#fab1a0', '#fdcb6e', '#e17055', '#55efc4', '#a29bfe'],
            borderWidth: 0,
        }]
    };

    // Process Data for Trend Chart (Monthly or Yearly)
    let trendData = {};
    if (chartView === 'monthly') {
        trendData = transactions.reduce((acc, t) => {
            const date = new Date(t.date);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!acc[month]) acc[month] = { income: 0, expense: 0 };
            if (t.type === 'income') acc[month].income += t.amount;
            else acc[month].expense += t.amount;
            return acc;
        }, {});
    } else {
        trendData = transactions.reduce((acc, t) => {
            const date = new Date(t.date);
            const year = date.getFullYear().toString();
            if (!acc[year]) acc[year] = { income: 0, expense: 0 };
            if (t.type === 'income') acc[year].income += t.amount;
            else acc[year].expense += t.amount;
            return acc;
        }, {});
    }
 
    const timeLabels = Object.keys(trendData);
    const barData = {
        labels: timeLabels,
        datasets: [
            {
                label: 'Income',
                data: timeLabels.map(l => trendData[l].income),
                backgroundColor: '#10b981',
                borderRadius: 8,
            },
            {
                label: 'Expense',
                data: timeLabels.map(l => trendData[l].expense),
                backgroundColor: '#ef4444',
                borderRadius: 8,
            }
        ]
    };

    return (
        <div className="page-content">
            <header style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="animate-slide-up">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <BarChart3 size={14} />
                        <span>Insights & History</span>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Analytics & Activity</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div className="hover-lift" style={{ background: 'var(--bg-card)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={toggleTheme}>
                        {theme === 'light' ? <Moon size={20} color="var(--primary)" /> : <Sun size={20} color="var(--warning)" />}
                    </div>
                    <NotificationBell onUpdateGroups={() => refreshUser()} />
                </div>
            </header>

            {/* Tabs Navigation */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <button 
                    onClick={() => setActiveTab('overview')}
                    style={{ 
                        background: activeTab === 'overview' ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
                        color: activeTab === 'overview' ? 'var(--accent)' : 'var(--text-secondary)',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >Overview</button>
                <button 
                    onClick={() => setActiveTab('activity')}
                    style={{ 
                        background: activeTab === 'activity' ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
                        color: activeTab === 'activity' ? 'var(--accent)' : 'var(--text-secondary)',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >Activity History</button>
            </div>

            {activeTab === 'overview' ? (
                <div className="animate-slide-up">
                    <div className="grid-cols-3" style={{ marginBottom: '2.5rem', gap: '2rem' }}>
                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Savings Rate</p>
                            <h3 style={{ fontSize: '1.75rem', color: 'var(--accent)' }}>{stats?.savingsRate}%</h3>
                        </div>
                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Monthly Spend</p>
                            <h3 style={{ fontSize: '1.75rem', color: 'var(--danger)' }}>₹{(stats?.monthlyExpense || 0).toLocaleString()}</h3>
                        </div>
                        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Monthly Income</p>
                            <h3 style={{ fontSize: '1.75rem', color: 'var(--success)' }}>+ ₹{(stats?.monthlyIncome || 0).toLocaleString()}</h3>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                        <div className="card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <TrendingUp size={20} color="var(--accent)" />
                                    {chartView === 'monthly' ? 'Monthly' : 'Yearly'} Cash Flow
                                </h3>
                                <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                    <button 
                                        onClick={() => setChartView('monthly')}
                                        style={{ 
                                            padding: '0.4rem 0.8rem', 
                                            fontSize: '0.7rem', 
                                            fontWeight: 800, 
                                            border: 'none', 
                                            borderRadius: '0.35rem',
                                            background: chartView === 'monthly' ? 'var(--primary)' : 'transparent',
                                            color: chartView === 'monthly' ? 'white' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >MONTH</button>
                                    <button 
                                        onClick={() => setChartView('yearly')}
                                        style={{ 
                                            padding: '0.4rem 0.8rem', 
                                            fontSize: '0.7rem', 
                                            fontWeight: 800, 
                                            border: 'none', 
                                            borderRadius: '0.35rem',
                                            background: chartView === 'yearly' ? 'var(--primary)' : 'transparent',
                                            color: chartView === 'yearly' ? 'white' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >YEAR</button>
                                </div>
                            </div>
                            <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </div>
                        <div className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <PieChart size={20} color="var(--accent)" />
                                Spending by Category
                            </h3>
                            <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-slide-up card" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontWeight: 900 }}>Transaction History</h2>
                        <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-main)', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 600 }}>
                            {transactions.length} RECORDS FOUND
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {transactions.length === 0 ? (
                            <EmptyState 
                                icon={FileText}
                                title="No Activity Recorded"
                                message="Your financial ledger is currently empty. Start logging transactions on the dashboard to see detailed history and AI-powered spending analysis."
                            />
                        ) : (
                            transactions.map(t => (
                                <div key={t._id} className="ledger-row" style={{ 
                                    padding: '1.25rem', 
                                    borderBottom: '1px solid var(--border)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1.5rem',
                                    background: t.isGroupExpense ? 'rgba(108, 92, 231, 0.03)' : 'transparent',
                                    borderLeft: t.isGroupExpense ? '4px solid var(--primary)' : 'none'
                                }}>
                                    <div style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        borderRadius: '12px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        background: t.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: t.type === 'income' ? 'var(--success)' : 'var(--danger)'
                                    }}>
                                        {t.type === 'income' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <p style={{ fontWeight: 700, fontSize: '1rem' }}>{t.title}</p>
                                            {t.isGroupExpense && (
                                                <span style={{ 
                                                    fontSize: '0.65rem', 
                                                    padding: '0.2rem 0.6rem', 
                                                    borderRadius: '2rem', 
                                                    background: 'var(--primary)', 
                                                    color: 'white', 
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>{t.groupName || 'Group'}</span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.category}</span>
                                            <span style={{ color: 'var(--border)' }}>•</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                <Calendar size={12} />
                                                {new Date(t.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ 
                                        textAlign: 'right', 
                                        fontSize: '1.25rem', 
                                        fontWeight: 800,
                                        color: t.type === 'income' ? 'var(--success)' : 'var(--text-primary)'
                                    }}>
                                        {t.type === 'income' ? '+' : '-'} ₹{(t.amount || 0).toLocaleString()}
                                    </div>
                                    <button 
                                        onClick={() => deleteTransaction(t._id)}
                                        style={{ background: 'rgba(239, 68, 68, 0.05)', border: 'none', color: 'var(--danger)', padding: '0.6rem', borderRadius: '0.50rem', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
