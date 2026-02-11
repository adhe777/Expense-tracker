import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, BrainCircuit } from 'lucide-react';

const AIForecast = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const res = await axios.get('http://localhost:8081/api/ai/predict');
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchPrediction();
    }, []);

    if (loading) return <div className="card">Analyzing spending patterns...</div>;
    if (!data || data.prediction === 0) {
        return (
            <div className="card" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <BrainCircuit size={20} color="#64748b" />
                    <h3 style={{ margin: 0, fontSize: '1rem', color: '#334155' }}>AI Insights</h3>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{data?.insight || 'Add more data to unlock AI-based spending predictions.'}</p>
            </div>
        );
    }

    return (
        <div className="card" style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                <BrainCircuit size={100} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Sparkles size={20} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>AI Smart Forecast</h3>
                <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '1rem',
                    fontSize: '0.7rem'
                }}>
                    Confidence: {data.confidence}
                </span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>Predicted Next Month's Expense</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>₹{data.prediction.toLocaleString()}</h2>
                    <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: data.trend === 'up' ? '#fca5a5' : '#86efac' }}>
                        {data.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {data.trend === 'up' ? 'Trend Up' : 'Trend Down'}
                    </span>
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
                    <strong>AI Insight:</strong> {data.insight}
                </p>
            </div>
        </div>
    );
};

export default AIForecast;
