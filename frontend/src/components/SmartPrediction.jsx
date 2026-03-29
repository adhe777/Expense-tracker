import React, { useEffect, useState } from 'react';
import { aiService } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { BrainCircuit, Sparkles } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const SmartPrediction = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrediction = async () => {
            try {
                const res = await aiService.getPredictExpense();
                setData(res);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchPrediction();
    }, []);

    if (loading) return <div className="card" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Analyzing trends...</p>
    </div>;

    if (!data || !data.history || data.history.length === 0) {
        return (
            <div className="card" style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', padding: '2rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.5rem' }}>Spending Forecast</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Complete more transactions to unlock predictive spending charts and AI trend analysis.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const labels = data.history.map(h => h.month);
    const points = data.history.map(h => h.total);

    // Add prediction point with special label
    labels.push("Next Month (AI)");
    points.push(data.prediction);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Spending',
                data: points,
                borderColor: 'var(--primary)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: points.map((_, i) => i === points.length - 1 ? 'var(--accent)' : 'var(--primary)'),
                pointBorderColor: '#fff',
                pointRadius: points.map((_, i) => i === points.length - 1 ? 6 : 4),
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => ` ₹${(context.raw || 0).toLocaleString()}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { display: false },
                ticks: { callback: (value) => `₹${value}` }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    return (
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Sparkles size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>Spending Forecast</h3>
            </div>

            <div style={{
                background: 'rgba(99, 102, 241, 0.05)',
                padding: '1.5rem',
                borderRadius: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid var(--border)'
            }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Next Month Forecast</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>₹{(data?.prediction || 0).toLocaleString()}</h2>
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    "The system projects a transaction volume of ₹{(data?.prediction || 0).toLocaleString()} for the upcoming cycle."
                </p>
            </div>

            <div style={{ height: '220px' }}>
                <Line data={chartData} options={options} />
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <BrainCircuit size={14} /> AI Powered Predictions
            </p>
        </div>
    );
};

export default SmartPrediction;
