import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <Toaster 
                        position="top-right" 
                        toastOptions={{ 
                            duration: 3000, 
                            style: { 
                                background: 'var(--bg-card)', 
                                color: 'var(--text-primary)', 
                                border: '1px solid var(--border)' 
                            } 
                        }} 
                    />
                    <App />
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>
)
