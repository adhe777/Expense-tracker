import React, { useEffect, useState } from 'react';
import { aiService } from '../services/api';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, BrainCircuit } from 'lucide-react';

const AIForecast = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const res = await aiService.getPredictSpending();
                setData(res);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchPrediction();
    }, []);

    if (loading) return <div className="card" style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
        <BrainCircuit size={24} className="spin-slow" style={{ marginRight: '10px' }} /> Analyzing your spending...
    </div>;
    if (!data || data.prediction === 0) {
        return (
            <div className="card" style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', padding: '2rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <BrainCircuit size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem' }}>AI Smart Tips</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {data?.insight || 'Sync your financial data to unlock AI-based spending projections and saving tips.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card hover-lift" style={{
            background: 'var(--primary-gradient)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.15 }}>
                <Sparkles size={120} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <BrainCircuit size={20} color="white" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>AI Smart Tips</h3>
                <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '2rem',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                }}>
                    High Confidence
                </span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase' }}>Forecasted Spending</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.25rem' }}>
                    <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900 }}>₹{(data.prediction || 0).toLocaleString()}</h2>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {data.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {data.trend === 'up' ? 'UP' : 'DOWN'}
                    </span>
                </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.15)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'white' }}>
                    {data.insight}
                </p>
            </div>
        </div>
    );
};

export default AIForecast;
