import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div 
            className="hover-lift" 
            style={{ 
                background: 'var(--bg-card)', 
                padding: '0.75rem', 
                borderRadius: '0.75rem', 
                border: '1px solid var(--border)', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
            }} 
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            {theme === 'light' ? (
                <Moon size={20} color="var(--primary)" />
            ) : (
                <Sun size={20} color="var(--warning)" />
            )}
        </div>
    );
};

export default ThemeToggle;
