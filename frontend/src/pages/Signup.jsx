import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sprout, UserPlus, Lock, Mail, Users, MapPin, User } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../services/api';

export default function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'farmer',
        location_x: '',
        location_y: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const postData = {
            ...formData,
            location_x: formData.location_x === '' ? (12.9716 + (Math.random() - 0.5) * 0.1).toFixed(4) : formData.location_x,
            location_y: formData.location_y === '' ? (77.5946 + (Math.random() - 0.5) * 0.1).toFixed(4) : formData.location_y
        };

        try {
            await axios.post(`${API_URL}/auth/register`, postData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-100 to-teal-50 px-4 py-8">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-green-600 rounded-2xl text-white mb-4 shadow-lg shadow-green-500/20">
                        <Sprout className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                    <p className="text-gray-500 mt-2">Join AgroFlow AI marketplace today</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-sm mb-6 animate-pulse">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-100 text-sm mb-6">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                            <User className="h-4 w-4 text-gray-400" /> Full Name / Business Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                            placeholder="e.g. Ramesh Farms"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                            <Mail className="h-4 w-4 text-gray-400" /> Email Address
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                            placeholder="e.g. ramesh@farm.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                            <Lock className="h-4 w-4 text-gray-400" /> Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-gray-400" /> Latitude (X)
                            </label>
                            <input
                                type="number"
                                step="any"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                placeholder="12.9716"
                                value={formData.location_x}
                                onChange={(e) => setFormData({ ...formData, location_x: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-gray-400" /> Longitude (Y)
                            </label>
                            <input
                                type="number"
                                step="any"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                placeholder="77.5946"
                                value={formData.location_y}
                                onChange={(e) => setFormData({ ...formData, location_y: e.target.value })}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400">Leave blank to randomly generate coords near Bangalore (12.97, 77.59).</p>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-gray-400" /> Select Role
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'farmer' })}
                                className={`py-2.5 rounded-xl font-medium border text-center transition ${
                                    formData.role === 'farmer'
                                        ? 'bg-green-600 border-green-600 text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                Farmer
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'buyer' })}
                                className={`py-2.5 rounded-xl font-medium border text-center transition ${
                                    formData.role === 'buyer'
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                Buyer
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Registering...' : (
                            <>
                                <UserPlus className="h-5 w-5" /> Sign Up
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-600 font-bold hover:underline">
                        Sign In here
                    </Link>
                </div>
            </div>
        </div>
    );
}
