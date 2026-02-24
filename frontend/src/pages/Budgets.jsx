import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Save, Trash2, PieChart } from 'lucide-react';

const Budgets = ({ onBack }) => {
    const [budgets, setBudgets] = useState([]);
    const [formData, setFormData] = useState({ category: 'Food', amount: '' });
    const [loading, setLoading] = useState(true);

    const categories = ['Food', 'Transport', 'Shopping', 'Rent', 'Salary', 'Entertainment', 'Health', 'Other'];

    const fetchBudgets = async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/budgets');
            setBudgets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8081/api/budgets', formData);
            setFormData({ ...formData, amount: '' });
            fetchBudgets();
        } catch (err) {
            alert('Failed to set budget');
        }
    };

    const deleteBudget = async (id) => {
        try {
            await axios.delete(`http://localhost:8081/api/budgets/${id}`);
            fetchBudgets();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    if (loading) return <div className="dashboard-container">Loading Budgets...</div>;

    return (
        <div className="dashboard-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button onClick={onBack} className="btn" style={{ width: 'auto', padding: '0.5rem', background: 'transparent' }}>
                            <ArrowLeft size={24} />
                        </button>
                        <h1>Budget Planning</h1>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>Set monthly spending limits per category</p>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h3>Set New Budget</h3>
                    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                        <div className="input-group">
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Monthly Limit (₹)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="e.g. 5000"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Save size={18} /> Save Budget
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3>Current Budgets</h3>
                    <div style={{ marginTop: '1rem' }}>
                        {budgets.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No budgets set yet.</p>
                        ) : (
                            budgets.map((b) => (
                                <div key={b._id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    borderBottom: '1px solid var(--border)',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <p style={{ fontWeight: 600 }}>{b.category}</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 700 }}>₹{b.amount.toLocaleString()} / month</p>
                                    </div>
                                    <Trash2
                                        size={18}
                                        style={{ cursor: 'pointer', color: 'var(--danger)' }}
                                        onClick={() => deleteBudget(b._id)}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Budgets;
