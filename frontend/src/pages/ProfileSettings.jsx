import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService, groupService } from '../services/api';
import { User, Mail, Lock, Camera, Users, LogOut, ShieldAlert, ArrowLeft, Settings2, Fingerprint, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

const ProfileSettings = ({ onBack }) => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', confirmText: 'Confirm', variant: 'danger', onConfirm: () => { }
    });

    // Forms
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await profileService.getProfile();
            setProfile(data);
            setName(data.name);
            setEmail(data.email);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const updated = await profileService.updateProfile({ name, email });
            toast.success('Profile updated!');
            // Update auth context too
            const localUser = JSON.parse(sessionStorage.getItem('user'));
            const newLocalUser = { ...localUser, name: updated.name, email: updated.email, avatar: updated.avatar };
            sessionStorage.setItem('user', JSON.stringify(newLocalUser));
            fetchProfile();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Sync failed');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await profileService.changePassword({ currentPassword, newPassword });
            toast.success('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64String = reader.result;
            try {
                const updated = await profileService.uploadAvatar({ avatarBase64: base64String });
                toast.success('Profile picture updated!');

                const localUser = JSON.parse(sessionStorage.getItem('user'));
                const newLocalUser = { ...localUser, avatar: updated.avatar };
                sessionStorage.setItem('user', JSON.stringify(newLocalUser));

                fetchProfile();
            } catch (error) {
                toast.error('Uplink error');
            }
        };
    };

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const handleLeaveGroup = (groupId, groupName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Leave Group',
            message: `Are you sure you want to leave "${groupName}"? You will lose access to shared expenses.`,
            confirmText: 'LEAVE GROUP',
            variant: 'danger',
            onConfirm: async () => {
                closeConfirmModal();
                try {
                    setIsSubmitting(true);
                    await groupService.leaveGroup(groupId);
                    toast.success('Left the group.');

                    const localUser = JSON.parse(sessionStorage.getItem('user'));
                    const newLocalUser = { ...localUser, groups: localUser.groups.filter(g => g._id !== groupId) };
                    sessionStorage.setItem('user', JSON.stringify(newLocalUser));

                    fetchProfile();
                } catch (error) {
                    toast.error('Termination failed');
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    if (loading || !profile) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
                <div className="neon-glow" style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container" style={{ padding: '0', background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="animate-fade-in" style={{ 
                padding: '1.5rem 3.5rem', 
                background: 'var(--bg-sidebar)', 
                borderBottom: '1px solid var(--border)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                position: 'sticky', 
                top: 0, 
                zIndex: 9999,
                boxShadow: 'var(--shadow-premium)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <button onClick={onBack} className="hover-lift" style={{ 
                        background: 'var(--bg-input)', 
                        border: '1px solid var(--border)', 
                        color: 'var(--text-primary)', 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '12px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            <Settings2 size={14} />
                            <span>Settings</span>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>
                            My Profile
                        </h1>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem 1.5rem', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Activity size={16} color="var(--success)" className="neon-glow" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '0.05em' }}>SECURE SESSION</span>
                </div>
            </header>

            <main style={{ flex: 1, padding: '3.5rem', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem', maxWidth: '1400px', margin: '0 auto' }}>
                    
                    {/* Left: Identity Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="card animate-slide-up" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                            <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 2rem', borderRadius: '32px', background: 'var(--bg-main)', border: '2px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-premium)', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} className="hover-lift">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4.5rem', fontWeight: 900, color: 'var(--primary)', background: 'rgba(108, 92, 231, 0.1)' }}>
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div
                                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s' }}
                                    onClick={() => fileInputRef.current.click()}
                                    className="hover-opacity"
                                >
                                    <Camera size={16} /> Change Photo
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" style={{ display: 'none' }} />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>{profile.name}</h2>
                            <p style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{profile.email}</p>
                            <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Account Status</p>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>VERIFIED</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Membership</p>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>PREMIUM</span>
                                </div>
                            </div>
                        </div>

                        {/* Network Connections */}
                        <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <Users size={18} color="var(--primary)" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.01em', margin: 0 }}>My Groups</h3>
                            </div>
                            {(profile.groups && profile.groups.length > 0) ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {profile.groups.map(g => (
                                        <div key={g._id} className="hover-lift" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '1rem', transition: 'all 0.3s' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.02em' }}>{g.groupName.toUpperCase()}</span>
                                            {user?.role !== 'system_admin' && (
                                                <button
                                                    onClick={() => handleLeaveGroup(g._id, g.groupName)}
                                                    disabled={isSubmitting}
                                                    style={{ background: 'rgba(214, 48, 49, 0.05)', border: 'none', color: '#D63031', cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '0.5rem', transition: 'all 0.3s' }}
                                                    className="hover-opacity"
                                                >
                                                    <LogOut size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border)', borderRadius: '1rem' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>You haven't joined any groups yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Settings Forms */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        
                        {/* Primary Identity Section */}
                        <div className="card animate-fade-in" style={{ padding: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                                <Fingerprint size={24} color="var(--primary)" />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>Personal Information</h3>
                            </div>
                            <form onSubmit={handleUpdateProfile}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                                    <div className="modern-input-group">
                                        <label>Full Name</label>
                                        <div className="icon-input-wrapper">
                                            <User className="input-icon" size={18} color="var(--primary)" />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="modern-input-group">
                                        <label>Email Address</label>
                                        <div className="icon-input-wrapper">
                                            <Mail className="input-icon" size={18} color="var(--primary)" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn-modern-submit hover-lift neon-glow" style={{ width: 'auto', padding: '0 3rem', height: '3.5rem' }}>SAVE CHANGES</button>
                            </form>
                        </div>

                        {/* Security Protocol Section */}
                        <div className="card animate-fade-in" style={{ padding: '2.5rem', animationDelay: '0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                                <ShieldAlert size={24} color="var(--warning)" />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>Change Password</h3>
                            </div>
                            <form onSubmit={handleChangePassword}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                                    <div className="modern-input-group">
                                        <label>Current Password</label>
                                        <div className="icon-input-wrapper">
                                            <Lock className="input-icon" size={18} color="var(--warning)" />
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="modern-input-group">
                                        <label>New Password</label>
                                        <div className="icon-input-wrapper">
                                            <ShieldAlert className="input-icon" size={18} color="var(--warning)" />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="btn hover-lift neon-glow" style={{ width: 'auto', padding: '0 3rem', height: '3.5rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', color: 'var(--warning)', fontWeight: 800 }}>UPDATE PASSWORD</button>
                            </form>
                        </div>

                    </div>
                </div>
            </main>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirmModal}
            />
        </div>
    );
};

export default ProfileSettings;
