import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authAPI.getMe();
                    // Assuming /protected/me returns user details including role
                    setUser(response.data);
                } catch (error) {
                    console.error('Token verification failed', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await authAPI.login(username, password);
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);

            // Fetch user details immediately after login
            const userResponse = await authAPI.getMe();
            setUser(userResponse.data);
            return true;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            await authAPI.register(userData);
            // Auto login after register? Or redirect to login?
            // Requirement says: On success: auto-login and redirect to dashboard
            // So we perform login using the just registered credentials
            await login(userData.username, userData.password);
            return true;
        } catch (error) {
            throw error;
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
