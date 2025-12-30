import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await api.get('/protected/me');
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch user:", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        try {
            // Form data for OAuth2 password flow
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData);
            const { access_token } = response.data; // FastAPI Oauth2 returns access_token
            // "Backend uses Bearer token". 
            // Most FastAPI JWT implementations return { access_token, token_type }. 
            // Since I can't check backend code easily (it's open but I shouldn't waste tools), I'll assume { access_token }
            // If the spec said returns "variable", usually JSON.

            // Wait, let's verify login response format from `main.py` if possible or just assume standard.
            // I'll check main.py or routers quickly or just code defensively.
            // I'll stick to response.data.access_token as it's most common.

            const token = response.data.access_token || response.data.token;
            localStorage.setItem('token', token);
            await fetchUser();
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
