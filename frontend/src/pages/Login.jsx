import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogIn, Lock, Mail, Users } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../services/api';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', role: 'farmer' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_URL}/auth/login`, formData);
            login(res.data.token, res.data.user, res.data.role);
            if (res.data.role === 'farmer') {
                navigate('/farmer');
            } else {
                navigate('/buyer');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-100 to-teal-50 px-4">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-green-600 rounded-2xl text-white mb-4 shadow-lg shadow-green-500/20">
                        <Sprout className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">AgroFlow AI</h2>
                    <p className="text-gray-500 mt-2">Sign in to optimize your agriculture supply chain</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-sm mb-6 animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Mail className="h-4 w-4 text-gray-400" /> Email Address
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                            placeholder="e.g. rajesh@farm.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                            <Lock className="h-4 w-4 text-gray-400" /> Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-gray-400" /> Portal Access Role
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'farmer' })}
                                className={`py-3 rounded-xl font-medium border text-center transition ${
                                    formData.role === 'farmer'
                                        ? 'bg-green-600 border-green-600 text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                Farmer Portal
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'buyer' })}
                                className={`py-3 rounded-xl font-medium border text-center transition ${
                                    formData.role === 'buyer'
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                Buyer Portal
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 px-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50`}
                    >
                        {loading ? 'Signing in...' : (
                            <>
                                <LogIn className="h-5 w-5" /> Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-green-600 font-bold hover:underline">
                        Create one here
                    </Link>
                </div>
            </div>
        </div>
    );
}
