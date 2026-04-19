import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Save, 
    Trash2, 
    PieChart, 
    IndianRupee, 
    Tag, 
    AlertCircle, 
    CheckCircle2, 
    TrendingUp, 
    Info, 
    Sparkles, 
    Target, 
    BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { budgetService } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

const Budgets = ({ onBack }) => {
    const { user: authUser } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [formData, setFormData] = useState({ category: 'Food', amount: '' });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', confirmText: 'Confirm', variant: 'danger', onConfirm: () => { }
    });

    const categories = ['Food', 'Transport', 'Shopping', 'Rent', 'Salary', 'Entertainment', 'Health', 'Other'];
    const isSystemAdmin = authUser?.role === 'system_admin';

    const fetchData = async () => {
        if (isSystemAdmin) {
            setLoading(false);
            return;
        }
        try {
            const data = await budgetService.getBudgets();
            setBudgets(data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch budgets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            await budgetService.setBudget(formData);
            setFormData({ ...formData, amount: '' });
            fetchData();
            toast.success('Budget updated successfully!');
        } catch (err) {
            toast.error('Failed to set budget');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id, category) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Budget',
            message: `Are you sure you want to delete the budget for ${category}?`,
            confirmText: 'Delete',
            variant: 'danger',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    setIsSubmitting(true);
                    await budgetService.deleteBudget(id);
                    fetchData();
                    toast.success('Budget deleted');
                } catch (err) {
                    toast.error('Failed to delete budget');
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                <div className="neon-glow" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Loading Budgets...</p>
            </div>
        );
    }

    return (
        <>
            <header className="animate-fade-in page-header" style={{ boxShadow: 'var(--shadow-premium)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <button onClick={onBack} className="hover-lift" style={{ 
                        background: 'var(--bg-input)', 
                        border: '1px solid var(--border)', 
                        color: 'var(--text-primary)', 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <Target size={14} />
                            <span>Planning</span>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>
                            My Budgets
                        </h1>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(108, 92, 231, 0.1)', padding: '0.75rem 1.25rem', borderRadius: '1rem', border: '1px solid rgba(108, 92, 231, 0.2)' }}>
                    <Sparkles size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>SMART INSIGHTS ACTIVE</span>
                </div>
            </header>

            <div className="page-inner">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
                    
                    {/* Left Column: Performance */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {!isSystemAdmin ? (
                            <section className="card animate-slide-up" style={{ padding: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <BarChart3 size={24} color="var(--primary)" />
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Budget Summary</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {['On Track', 'Near Limit', 'Critical'].map((st, i) => (
                                            <span key={st} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? 'var(--success)' : i === 1 ? 'var(--warning)' : 'var(--danger)', boxShadow: `0 0 10px ${i === 0 ? 'var(--success)' : i === 1 ? 'var(--warning)' : 'var(--danger)'}` }}></div>
                                                {st}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {budgets.length === 0 ? (
                                        <EmptyState 
                                            icon={Target}
                                            title="No Active Budgets"
                                            message="Configure monthly spending limits to receive real-time alerts and AI-driven saving recommendations tailored to your behavior."
                                        />
                                    ) : (
                                        budgets.map((b) => {
                                            const spent = Number(b.spent) || 0;
                                            const limit = Number(b.limit) || 0;
                                            const remaining = Number(b.remaining) || 0;
                                            const avgSpent = Number(b.avgSpent) || 0;
                                            const percent = limit > 0 ? (spent / limit) * 100 : 0;
                                            const isOver = percent > 100;
                                            const isNear = percent >= 80 && percent <= 100;
                                            const statusColor = isOver ? 'var(--danger)' : isNear ? 'var(--warning)' : 'var(--success)';

                                            return (
                                                <div key={b.category} className="hover-lift" style={{
                                                    background: 'var(--bg-input)',
                                                    padding: '1.5rem',
                                                    borderRadius: '1.25rem',
                                                    border: '1px solid var(--border)',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    {b.isAutoGenerated && (
                                                        <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '0.35rem 0.75rem', borderBottomLeftRadius: '0.75rem', fontWeight: 900, letterSpacing: '0.05em' }}>RECOMMENDED</div>
                                                    )}

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                {isOver ? <AlertCircle size={18} color="var(--danger)" /> : <CheckCircle2 size={18} color="var(--success)" />}
                                                            </div>
                                                            <div>
                                                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{b.category.toUpperCase()}</h4>
                                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 700 }}>MONTHLY AVG: ₹{avgSpent.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: 900, fontSize: '1.5rem', color: statusColor, letterSpacing: '-0.02em' }}>
                                                                ₹{spent.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>/ ₹{limit.toLocaleString()}</span>
                                                            </div>
                                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.2rem' }}>
                                                                {isOver ? 'BUDGET EXCEEDED' : `${Math.round(percent)}% SPENT`}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div style={{ height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                                                        <div style={{
                                                            height: '100%',
                                                            width: `${Math.min(percent, 100)}%`,
                                                            background: statusColor,
                                                            borderRadius: '4px',
                                                            boxShadow: `0 0 15px ${statusColor}`,
                                                            transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
                                                        }}></div>
                                                    </div>

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontSize: '0.85rem', color: remaining >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            {remaining >= 0 ? (
                                                                <>
                                                                    <TrendingUp size={14} /> ₹{remaining.toLocaleString()} Left
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <AlertCircle size={14} /> ₹{Math.abs(remaining).toLocaleString()} Over Budget
                                                                </>
                                                            )}
                                                        </div>
                                                        {b._id && (
                                                            <button
                                                                onClick={() => handleDeleteClick(b._id, b.category)}
                                                                className="hover-lift"
                                                                style={{ background: 'rgba(214, 48, 49, 0.05)', border: '1px solid rgba(214, 48, 49, 0.1)', color: '#D63031', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.5rem', transition: 'all 0.3s' }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </section>
                        ) : (
                            <section className="card animate-slide-up" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-main) 100%)' }}>
                                <Target size={48} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '1rem' }}>Admin Budget Control</h3>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.6, fontSize: '1.1rem' }}>
                                    Budget management is reserved for regular users to track personal financial goals. Administrative accounts have restricted access to these metrics to ensure separation of system management and personal tracking.
                                </p>
                            </section>
                        )}
                    </div>

                    {/* Right Column: Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {!isSystemAdmin && (
                            <section className="card animate-fade-in" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                                    <PieChart size={20} color="var(--primary)" />
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>Add New Budget</h3>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modern-input-group" style={{ marginBottom: '1.5rem' }}>
                                        <label>Category</label>
                                        <div className="icon-input-wrapper">
                                            <Tag className="input-icon" size={18} color="var(--primary)" />
                                            <select
                                                className="form-input"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                required
                                                style={{ paddingLeft: '3rem' }}
                                            >
                                                {categories.map(cat => <option key={cat} value={cat} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>{cat.toUpperCase()}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modern-input-group" style={{ marginBottom: '2rem' }}>
                                        <label>Monthly Limit (₹)</label>
                                        <div className="icon-input-wrapper">
                                            <IndianRupee className="input-icon" size={18} color="var(--primary)" />
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                placeholder="0.00"
                                                required
                                                style={{ paddingLeft: '3rem' }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary hover-lift neon-glow animate-pulse-subtle"
                                        style={{ width: '100%', margin: 0, height: '3.75rem', borderRadius: '1rem', fontWeight: 800, letterSpacing: '0.05em', gap: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        disabled={isSubmitting}
                                    >
                                        <Save size={20} />
                                        {isSubmitting ? 'SECURELY SAVING...' : 'SAVE BUDGET SETTINGS'}
                                    </button>
                                </form>
                            </section>
                        )}

                        <section className="card animate-fade-in" style={{ padding: '1.75rem', background: 'rgba(108, 92, 231, 0.03)', border: '1px dashed rgba(108, 92, 231, 0.2)', animationDelay: '0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <Info size={16} color="var(--primary)" />
                                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>How it works</h4>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 600 }}>
                                Your custom limits help the AI learn your spending habits. Recommendations are updated every month based on your history to help you save more.
                            </p>
                        </section>
                    </div>
                </div>
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
        </>
    );
};

export default Budgets;
