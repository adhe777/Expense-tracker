import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
            return userData;
        }
        return null;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Additional initialization if needed in the future
    }, []);

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:8081/api/users/login', { email, password });
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await axios.post('http://localhost:8081/api/users/register', { name, email, password });
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        return res.data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    const value = useMemo(() => ({
        user,
        login,
        register,
        logout,
        loading
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
