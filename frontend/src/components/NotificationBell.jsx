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
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
                <Bell size={20} />
                {notifications.length > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        background: 'var(--danger)',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
                    }}>
                        {notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '320px',
                    background: 'var(--glass)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    padding: '1rem',
                    zIndex: 1000,
                    color: 'var(--text-primary)'
                }}>
                    <h4 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', fontWeight: 600 }}>Notifications</h4>

                    {loading ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>Loading...</p>
                    ) : notifications.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0', color: 'var(--text-secondary)' }}>
                            <Bell size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                            <p style={{ fontSize: '0.85rem' }}>No new notifications</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                            {notifications.map(notification => (
                                <div key={notification._id} style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                    <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                        <strong>{notification.sender.name}</strong> invited you to join <strong style={{ color: 'var(--primary)' }}>{notification.relatedGroup.groupName}</strong>
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleAccept(notification._id)}
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', background: 'var(--success)', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            <Check size={14} /> Accept
                                        </button>
                                        <button
                                            onClick={() => handleReject(notification._id)}
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '0.4rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
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
