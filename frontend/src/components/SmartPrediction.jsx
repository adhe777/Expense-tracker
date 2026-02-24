import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
                const res = await axios.get('http://localhost:8081/api/ai/predict-expense');
                setData(res.data);
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
            <div className="card">
                <h3>Smart Expense Prediction</h3>
                <p style={{ color: 'var(--text-secondary)', padding: '1rem', textAlign: 'center' }}>
                    Need more data to generate trends.
                </p>
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
                label: 'Monthly Expense',
                data: points,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: points.map((_, i) => i === points.length - 1 ? '#ec4899' : '#6366f1'),
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
                    label: (context) => ` ₹${context.raw.toLocaleString()}`
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
        <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Sparkles size={20} color="var(--secondary)" />
                <h3 style={{ margin: 0 }}>Smart Expense Prediction</h3>
            </div>

            <div style={{
                background: 'rgba(236, 72, 153, 0.05)',
                padding: '1.25rem',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(236, 72, 153, 0.1)'
            }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI Forecast Result</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>₹{data.prediction.toLocaleString()}</h2>
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    "Based on your past spending trends, your expected expense for next month is ₹{data.prediction.toLocaleString()}."
                </p>
            </div>

            <div style={{ height: '200px' }}>
                <Line data={chartData} options={options} />
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <BrainCircuit size={12} /> Powered by Manual Linear Regression Analysis
            </p>
        </div>
    );
};

export default SmartPrediction;
