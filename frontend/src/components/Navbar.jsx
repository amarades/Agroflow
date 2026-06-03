import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const { user, userType, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-green-600 p-2 rounded-lg">
                                <span className="text-white font-bold text-xl">🌱</span>
                            </div>
                            <span className="font-bold text-xl text-gray-900 tracking-tight">AgroFlow AI</span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/feed" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Feed</Link>
                        <Link to="/optimize" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Optimize</Link>
                        <Link to="/shipments" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Shipments</Link>

                        {/* Role Based Links */}
                        {isAuthenticated && userType === 'farmer' && (
                            <Link to="/farmer" className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors">Farmer Dashboard</Link>
                        )}
                        {isAuthenticated && userType === 'buyer' && (
                            <Link to="/buyer" className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors">Buyer Portal</Link>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">{user?.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${userType === 'farmer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {userType === 'farmer' ? 'Farmer' : 'Buyer'}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Login</Link>
                                <Link to="/signup" className="text-sm font-medium px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/feed" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Feed</Link>
                        <Link to="/optimize" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Optimize</Link>

                        {isAuthenticated ? (
                            <>
                                {userType === 'farmer' && (
                                    <Link to="/farmer" className="block px-3 py-2 rounded-md text-base font-medium text-green-700 hover:bg-green-50">Farmer Dashboard</Link>
                                )}
                                {userType === 'buyer' && (
                                    <Link to="/buyer" className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50">Buyer Portal</Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Login</Link>
                                <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-green-600 hover:bg-green-50">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
