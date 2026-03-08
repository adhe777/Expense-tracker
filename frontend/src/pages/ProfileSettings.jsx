import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService, groupService } from '../services/api';
import { User, Mail, Lock, Camera, Users, LogOut, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = ({ onBack }) => {
    const { user, login } = useAuth(); // We need login to update the local storage context if needed
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            alert('Profile updated successfully!');
            // Update auth context too
            const localUser = JSON.parse(localStorage.getItem('user'));
            const newLocalUser = { ...localUser, name: updated.name, email: updated.email, avatar: updated.avatar };
            localStorage.setItem('user', JSON.stringify(newLocalUser));
            fetchProfile(); // refresh
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await profileService.changePassword({ currentPassword, newPassword });
            alert('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to change password');
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
                alert('Avatar updated!');

                const localUser = JSON.parse(localStorage.getItem('user'));
                const newLocalUser = { ...localUser, avatar: updated.avatar };
                localStorage.setItem('user', JSON.stringify(newLocalUser));

                fetchProfile();
            } catch (error) {
                alert('Avatar upload failed');
            }
        };
    };

    const handleLeaveGroup = async (groupId) => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;
        try {
            await groupService.leaveGroup(groupId);
            alert('You have left the group.');

            // Sync local storage
            const localUser = JSON.parse(localStorage.getItem('user'));
            const newLocalUser = { ...localUser, groups: localUser.groups.filter(g => g._id !== groupId) };
            localStorage.setItem('user', JSON.stringify(newLocalUser));

            fetchProfile();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to leave group');
        }
    };

    if (loading || !profile) {
        return <div style={{ padding: '2rem', color: 'white' }}>Loading Profile...</div>;
    }

    return (
        <div style={{ padding: '2rem 3rem', height: '100vh', overflowY: 'auto', background: 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Profile Settings</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem' }}>

                {/* Left Sidebar: Avatar & Identity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto', borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid var(--border)', overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                            {profile.avatar ? (
                                <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)' }}>
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div
                                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '0.25rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem' }}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <Camera size={14} /> Edit
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" style={{ display: 'none' }} />
                        </div>
                        <h2 style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>{profile.name}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{profile.email}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '0.5rem' }}>Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Joined Groups Widget */}
                    <div className="card">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Users size={18} /> Joined Groups</h3>
                        {(profile.groups && profile.groups.length > 0) ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {profile.groups.map(g => (
                                    <div key={g._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{g.groupName}</span>
                                        <button
                                            onClick={() => handleLeaveGroup(g._id)}
                                            style={{ background: 'none', border: 'none', color: 'var(--error, #ef4444)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                            title="Leave Group"
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No groups joined yet.</p>
                        )}
                    </div>
                </div>

                {/* Right Area: Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Basic Info Form */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={20} /> Personal Information</h3>
                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div className="modern-input-group">
                                    <label>Full Name</label>
                                    <div className="icon-input-wrapper">
                                        <User className="input-icon" size={18} />
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
                                        <Mail className="input-icon" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn-modern-submit" style={{ width: 'auto', padding: '0.75rem 2rem' }}>Save Changes</button>
                        </form>
                    </div>

                    {/* Password Form */}
                    <div className="card">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={20} /> Change Password</h3>
                        <form onSubmit={handleChangePassword}>
                            <div className="modern-input-group" style={{ marginBottom: '1rem' }}>
                                <label>Current Password</label>
                                <div className="icon-input-wrapper">
                                    <Lock className="input-icon" size={18} />
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modern-input-group" style={{ marginBottom: '1.5rem' }}>
                                <label>New Password</label>
                                <div className="icon-input-wrapper">
                                    <ShieldAlert className="input-icon" size={18} />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-modern-submit" style={{ width: 'auto', padding: '0.75rem 2rem', background: 'linear-gradient(to right, #6366f1, #3b82f6)' }}>Update Password</button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
