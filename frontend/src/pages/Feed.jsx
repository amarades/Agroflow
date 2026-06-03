import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import BidModal from '../components/BidModal';
import { getCrops, API_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Leaf, Search, ShoppingBag, Send, Bot, Star } from 'lucide-react';
import axios from 'axios';

export default function Feed() {
    const { user, isAuthenticated } = useAuth();
    const [crops, setCrops] = useState([]);
    const [stats, setStats] = useState({});
    const [search, setSearch] = useState('');
    
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [showBidModal, setShowBidModal] = useState(false);
    
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! Ask me anything about crop advisory or market prices.' }
    ]);
    const [inputMsg, setInputMsg] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const res = await getCrops();
            setCrops(res.data);
            
            const bidStats = {};
            for (const crop of res.data) {
                try {
                    const statsRes = await axios.get(`${API_URL}/bids/crop/${crop.id}/stats`);
                    bidStats[crop.id] = statsRes.data;
                } catch {
                    bidStats[crop.id] = { total_bids: 0 };
                }
            }
            setStats(bidStats);
        } catch (err) {
            console.error(err);
        }
    };

    const getCropImage = (cropName) => {
        const name = cropName.toLowerCase();
        if (name.includes('apple')) return '/images/apples.jpg';
        if (name.includes('carrot')) return '/images/carrots.jpg';
        if (name.includes('wheat') || name.includes('grain')) return '/images/wheat.jpg';
        return '/images/fresh-produce.jpg';
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMsg.trim()) return;

        const userMsg = { sender: 'user', text: inputMsg };
        setMessages(m => [...m, userMsg]);
        setInputMsg('');

        try {
            const res = await axios.post(`${API_URL}/chat/`, { message: userMsg.text });
            setMessages(m => [...m, { sender: 'bot', text: res.data.reply }]);
        } catch {
            setMessages(m => [...m, { sender: 'bot', text: 'Sorry, I am currently offline. Please try again later.' }]);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filteredCrops = crops.filter(c => 
        c.crop_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <ShoppingBag className="h-6 w-6 text-green-600" />
                                Market Feed
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Live bids and fresh harvests uploaded by farmers nearby</p>
                        </div>
                        
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition text-sm"
                                placeholder="Search fresh crops..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {filteredCrops.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                            <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-medium">No crops match your search or listed on marketplace.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredCrops.map(crop => (
                                <div key={crop.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                                    <div className="h-56 overflow-hidden relative">
                                        <img
                                            src={getCropImage(crop.crop_name)}
                                            alt={crop.crop_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                                            <div>
                                                <h3 className="font-extrabold text-lg">{crop.crop_name}</h3>
                                                <p className="text-xs opacity-90 flex items-center gap-1 mt-0.5">
                                                    <Leaf className="h-3.5 w-3.5" />
                                                    {crop.quantity} kg available
                                                </p>
                                            </div>
                                            {crop.expiry_days <= 3 && (
                                                <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md animate-pulse">
                                                    Expires in {crop.expiry_days} days
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="p-5">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Start Price</span>
                                                <span className="font-extrabold text-xl text-green-700">₹{crop.base_price}/kg</span>
                                            </div>
                                            
                                            <div className="text-right">
                                                {stats[crop.id]?.total_bids > 0 ? (
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold">
                                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                                                        {stats[crop.id].total_bids} active bids
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-semibold bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                                                        No bids yet
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isAuthenticated ? (
                                            userType === 'buyer' ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedCrop(crop);
                                                        setShowBidModal(true);
                                                    }}
                                                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/10"
                                                >
                                                    ⚡ Bid on Crop
                                                </button>
                                            ) : (
                                                <div className="text-center text-xs text-gray-400 font-medium py-3 border border-dashed rounded-xl bg-gray-50">
                                                    Farmers cannot bid on crops
                                                </div>
                                            )
                                        ) : (
                                            <Link to="/login" className="block text-center">
                                                <button className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition">
                                                    Login to Place Bid
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm h-[500px] flex flex-col sticky top-24 overflow-hidden">
                        <div className="p-4 bg-green-800 text-white flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <div>
                                <h3 className="font-bold text-sm">AgroFlow AI Assistant</h3>
                                <p className="text-[10px] text-green-200 font-medium">Smart farming advisory bot</p>
                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`p-3 rounded-2xl max-w-[85%] ${
                                        m.sender === 'user'
                                            ? 'bg-green-600 text-white rounded-tr-none'
                                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                                    }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
                            <input
                                type="text"
                                placeholder="Ask about tomato pricing..."
                                className="flex-1 border border-gray-200 rounded-xl px-3 text-xs outline-none focus:ring-1 focus:ring-green-600"
                                value={inputMsg}
                                onChange={e => setInputMsg(e.target.value)}
                            />
                            <button className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition flex items-center justify-center shadow-md">
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {showBidModal && selectedCrop && (
                <BidModal
                    crop={selectedCrop}
                    buyer={user}
                    onClose={() => setShowBidModal(false)}
                    onSuccess={fetchCrops}
                />
            )}
        </div>
    );
}
