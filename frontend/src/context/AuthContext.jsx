import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const res = await API.get('/auth/me');
                setUser(res.data.user);
                setUserType(res.data.role);
            } catch (err) {
                console.error("Error loading user context:", err);
                logout();
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUser();
    }, []);

    const login = (token, userData, role) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        setUserType(role);
        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        delete API.defaults.headers.common['Authorization'];
        setUser(null);
        setUserType(null);
        setLoading(false);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, userType, loading, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
