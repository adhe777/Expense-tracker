import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, MessageCircle, X } from 'lucide-react';
import { chatService } from '../services/api';

const ChatAssistant = () => {
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am your AI Financial Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const data = await chatService.sendMessage(userMsg);
            setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting to the brain. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <MessageCircle size={24} />
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '350px',
            height: '500px',
            background: 'white',
            borderRadius: '1.25rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000,
            border: '1px solid var(--border)'
        }}>
            {/* Header */}
            <div style={{
                background: 'var(--primary)',
                padding: '1rem 1.5rem',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Bot size={20} />
                    <h3 style={{ fontSize: '1rem', margin: 0 }}>AI Financial Assistant</h3>
                </div>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                padding: '1.5rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: '#f8fafc'
            }}>
                {messages.map((m, i) => (
                    <div key={i} style={{
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                        <div style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '1rem',
                            fontSize: '0.875rem',
                            lineHeight: 1.5,
                            background: m.role === 'user' ? 'var(--primary)' : 'white',
                            color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                            boxShadow: m.role === 'user' ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
                            border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                            borderBottomRightRadius: m.role === 'user' ? '0.25rem' : '1rem',
                            borderBottomLeftRadius: m.role === 'user' ? '1rem' : '0.25rem'
                        }}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', background: 'white', padding: '0.75rem 1rem', borderRadius: '1rem', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{
                padding: '1rem',
                background: 'white',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '0.5rem'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about spending, income..."
                    style={{
                        flex: 1,
                        padding: '0.625rem 1rem',
                        borderRadius: '2rem',
                        border: '1px solid var(--border)',
                        outline: 'none',
                        fontSize: '0.875rem'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatAssistant;
