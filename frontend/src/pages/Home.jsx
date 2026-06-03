import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Sprout, ArrowRight, CheckCircle, Leaf, Truck, Users } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Home() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [featuredCrops, setFeaturedCrops] = useState([]);

    useEffect(() => {
        // Fetch featured crops
        axios.get(`${API_URL}/crops/`)
            .then(res => {
                // Get the first 4 crops as featured
                setFeaturedCrops(res.data.slice(0, 4));
            })
            .catch(err => console.error('Error fetching crops:', err));
    }, []);

    const getCropImage = (cropName) => {
        const name = cropName.toLowerCase();
        if (name.includes('apple')) return '/images/apples.jpg';
        if (name.includes('carrot')) return '/images/carrots.jpg';
        if (name.includes('wheat') || name.includes('grain')) return '/images/wheat.jpg';
        return '/images/fresh-produce.jpg'; // default
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Sticky Header with blur */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex h-16 items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-green-800">
                            <Sprout className="h-6 w-6" />
                            <span>AgroFlow AI</span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/feed" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Feed</Link>
                            <Link to="/farmer" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Farmer Portal</Link>
                            <Link to="/buyer" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Buyer Portal</Link>
                            <Link to="/optimize" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Optimize</Link>
                            <Link to="/analytics" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">Analytics</Link>
                        </nav>

                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/signup">
                                <button className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                    Get Started
                                </button>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden border-t bg-white">
                        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                            <Link to="/feed" className="text-sm font-medium p-2 rounded-md hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>Feed</Link>
                            <Link to="/farmer" className="text-sm font-medium p-2 rounded-md hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>Farmer Portal</Link>
                            <Link to="/buyer" className="text-sm font-medium p-2 rounded-md hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>Buyer Portal</Link>
                            <Link to="/optimize" className="text-sm font-medium p-2 rounded-md hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>Optimize</Link>
                            <Link to="/analytics" className="text-sm font-medium p-2 rounded-md hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>Analytics</Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section with Background Image */}
            <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url("/images/hero-farmer.jpg")',
                    }}
                >
                    <div className="absolute inset-0 bg-black/50" />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Connecting Farmers and Buyers<br />for a Fair, Sustainable Future
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        AI-powered optimization eliminates middlemen, ensures fair prices, and minimizes wastage through smart matching.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <Link to="/signup">
                            <button className="w-full sm:w-auto text-lg px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition shadow-lg">
                                Get Started as a Farmer
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button className="w-full sm:w-auto text-lg px-8 py-3 bg-white/10 hover:bg-white/20 text-white border-2 border-white font-semibold rounded-lg backdrop-blur transition">
                                Join as a Buyer
                            </button>
                        </Link>
                    </div>
                    <div className="mt-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                        <p className="text-sm text-green-100">
                            Already have an account? <Link to="/login" className="font-bold hover:underline text-white">Sign In here</Link>
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How AgroFlow AI Works</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            We've simplified the agricultural supply chain using intelligent optimization algorithms.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Leaf,
                                title: "1. List Produce & Demand",
                                desc: "Farmers list crops with quantities and pricing. Buyers post their requirements and budget constraints."
                            },
                            {
                                icon: Users,
                                title: "2. AI Optimizes Matches",
                                desc: "Our algorithm scores every pair by price margin, distance, demand urgency, and spoilage risk."
                            },
                            {
                                icon: Truck,
                                title: "3. Direct Transaction",
                                desc: "System recommends optimal matches with transparent pricing, profit estimates, and logistics details."
                            }
                        ].map((step, i) => (
                            <div key={i} className="bg-white text-center p-8 border border-gray-100 rounded-xl shadow-md hover:shadow-xl transition-all">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-700">
                                    <step.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                                <p className="text-gray-600">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">Featured Products</h2>
                            <p className="text-gray-600 text-lg">Fresh from the farm, available now.</p>
                        </div>
                        <Link to="/buyer" className="text-green-700 font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {featuredCrops.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredCrops.map((crop) => (
                                <div key={crop.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={getCropImage(crop.crop_name)}
                                            alt={crop.crop_name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900">{crop.crop_name}</h3>
                                                <p className="text-sm text-gray-500">Farmer ID: {crop.farmer_id}</p>
                                            </div>
                                            {crop.expiry_days <= 3 && (
                                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">Urgent</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                            <Leaf className="h-4 w-4" />
                                            <span>{crop.quantity} kg available</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-bold text-lg text-green-700">₹{crop.base_price.toFixed(2)} / kg</span>
                                            <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                                                🔥 Blind Bidding Active
                                            </span>
                                        </div>
                                        <Link to="/buyer">
                                            <button className="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
                                                Place Bid
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No products available yet. Check back soon!</p>
                            <Link to="/farmer">
                                <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                    List Your Produce
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Grid with Image */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Why Choose AgroFlow AI?</h2>
                            <div className="space-y-6">
                                {[
                                    { title: "Fair Pricing", desc: "Real-time market data ensures farmers get what they deserve with dynamic price adjustments." },
                                    { title: "Quality Assurance", desc: "Verified farmers and transparent matching process with detailed transparency metrics." },
                                    { title: "Reduced Wastage", desc: "Smart inventory management prioritizes crops nearing expiry, reducing post-harvest losses by 30%." },
                                    { title: "Secure Transactions", desc: "Direct connection between buyers and sellers with complete profit and margin transparency." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-bold text-lg mb-1 text-gray-900">{item.title}</h3>
                                            <p className="text-gray-600">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative h-[400px] rounded-lg overflow-hidden shadow-2xl">
                            <img
                                src="/images/fresh-produce.jpg"
                                alt="Fresh produce market"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-green-900 text-white">
                <div className="container mx-auto px-4 py-12 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 font-bold text-xl">
                                <Sprout className="h-6 w-6" />
                                <span>AgroFlow AI</span>
                            </div>
                            <p className="text-green-100 text-sm">
                                Connecting farmers and buyers for a fair, sustainable future.
                                Minimizing waste, maximizing value through AI optimization.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Platform</h3>
                            <ul className="space-y-2 text-sm text-green-100">
                                <li><Link to="/farmer" className="hover:text-white">Farmer Portal</Link></li>
                                <li><Link to="/buyer" className="hover:text-white">Buyer Portal</Link></li>
                                <li><Link to="/optimize" className="hover:text-white">Optimization Engine</Link></li>
                                <li><Link to="/analytics" className="hover:text-white">Analytics</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-sm text-green-100">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                                <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-4">Stay Updated</h3>
                            <p className="text-sm text-green-100 mb-4">
                                Get market trends and platform news.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    className="flex-1 px-3 py-2 rounded bg-green-800 border-green-700 text-white placeholder:text-green-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button className="px-4 py-2 bg-white text-green-700 font-semibold rounded text-sm hover:bg-gray-100">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-green-800 text-center text-sm text-green-300">
                        © {new Date().getFullYear()} AgroFlow AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
