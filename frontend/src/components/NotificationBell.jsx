import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { groupService } from '../services/api';
import toast from 'react-hot-toast';

const NotificationBell = ({ onUpdateGroups }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const data = await groupService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new invites
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAccept = async (notificationId) => {
        try {
            const res = await groupService.acceptInvite(notificationId);
            toast.success('Successfully joined the group!');
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            if (onUpdateGroups && res.group) {
                onUpdateGroups(res.group);
            }
        } catch (error) {
            toast.error('Failed to accept invite');
            console.error(error);
        }
    };

    const handleReject = async (notificationId) => {
        try {
            await groupService.rejectInvite(notificationId);
            toast.success('Invite declined');
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
        } catch (error) {
            toast.error('Failed to decline invite');
            console.error(error);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hover-lift"
                style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    color: 'var(--text-primary)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
            >
                <Bell size={20} />
                {notifications.length > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: 'var(--warning)',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 0 15px var(--warning)',
                        border: '2px solid var(--bg-sidebar)'
                    }}>
                        {notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="animate-fade-in" style={{
                    position: 'absolute',
                    top: '60px',
                    right: 0,
                    width: '350px',
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '1.25rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    padding: '1.5rem',
                    zIndex: 999999,
                    color: 'var(--text-primary)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, letterSpacing: '-0.01em' }}>Group Invites</h4>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{notifications.length} Pending</span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="neon-glow" style={{ width: '24px', height: '24px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                            <Bell size={40} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>All Systems Clear</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
                            {notifications.map(notification => (
                                <div key={notification._id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--border)', transition: 'all 0.3s ease' }} className="hover-lift">
                                    <p style={{ fontSize: '0.85rem', marginBottom: '1rem', lineHeight: '1.5', fontWeight: 600 }}>
                                        <strong style={{ color: 'var(--accent)' }}>{notification.sender.name.toUpperCase()}</strong> invited you to join <strong style={{ color: 'var(--primary)' }}>{notification.relatedGroup.groupName.toUpperCase()}</strong>
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => handleAccept(notification._id)}
                                            className="hover-lift"
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--success)', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 184, 148, 0.2)' }}
                                        >
                                            <Check size={14} /> Accept
                                        </button>
                                        <button
                                            onClick={() => handleReject(notification._id)}
                                            className="hover-lift"
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                                        >
                                            <X size={14} /> Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
