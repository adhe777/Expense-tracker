import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            return JSON.parse(storedUser);
        }
        return null;
    });
    const [loading, setLoading] = useState(false);

    const logout = React.useCallback(() => {
        setUser(null);
        sessionStorage.removeItem('user');
    }, []);

    // Interceptors are now handled in services/api.js

    const login = async (email, password) => {
        const res = await API.post('/users/login', { email, password });
        setUser(res.data);
        sessionStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await API.post('/users/register', { name, email, password });
        setUser(res.data);
        sessionStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
    };

    const refreshUser = async () => {
        try {
            const res = await API.get('/users/me');
            const updatedUser = { ...res.data, token: user.token };
            setUser(updatedUser);
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        } catch (err) {
            console.error('Failed to refresh user data', err);
            return null;
        }
    };

    const value = useMemo(() => {
        const isSystemAdmin = user?.role === 'system_admin';
        return {
            user,
            isSystemAdmin,
            login,
            register,
            logout,
            refreshUser,
            loading
        };
    }, [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
