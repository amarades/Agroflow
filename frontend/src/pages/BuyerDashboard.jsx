import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BidModal from '../components/BidModal';
import { getCrops, getBids, getBidStats } from '../services/api'; // Removed addBuyer, getBuyers
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function BuyerDashboard() {
    const { user } = useAuth();
    const [crops, setCrops] = useState([]);
    const [myBids, setMyBids] = useState([]);
    const [bidStats, setBidStats] = useState({});

    const [showBidModal, setShowBidModal] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(null);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const cropsData = await getCrops();
            setCrops(cropsData.data);

            // Load bid stats
            const stats = {};
            for (const crop of cropsData.data) {
                try {
                    const statRes = await getBidStats(crop.id);
                    stats[crop.id] = statRes.data;
                } catch (err) {
                    stats[crop.id] = { total_bids: 0 };
                }
            }
            setBidStats(stats);

            // Load my bids
            if (user) {
                const bidsRes = await getBids({ buyer_id: user.id });
                setMyBids(bidsRes.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handlePlaceBid = (crop) => {
        setSelectedCrop(crop);
        setShowBidModal(true);
    };

    const handleBidSuccess = () => {
        fetchData(); // Refresh bids and stats
    };

    const getCropImage = (cropName) => {
        const name = cropName.toLowerCase();
        if (name.includes('apple')) return '/images/apples.jpg';
        if (name.includes('carrot')) return '/images/carrots.jpg';
        if (name.includes('wheat') || name.includes('grain')) return '/images/wheat.jpg';
        return '/images/fresh-produce.jpg';
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
            accepted: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Accepted ✅' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' }
        };
        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;
        return (
            <span className={`px-3 py-1 ${badge.bg} ${badge.text} text-xs font-semibold rounded-full flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {badge.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Buyer Portal</h1>
                        <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
                    </div>
                </div>

                {/* My Bids Section */}
                {myBids.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Your Active Bids
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myBids.map(bid => {
                                const crop = crops.find(c => c.id === bid.crop_id);
                                return (
                                    <div key={bid.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-semibold text-gray-900">
                                                {crop?.crop_name || `Crop #${bid.crop_id}`}
                                            </p>
                                            {getStatusBadge(bid.status)}
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Your Bid:</span>
                                                <span className="font-semibold text-green-700">₹{bid.bid_price}/kg</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Quantity:</span>
                                                <span className="font-medium">{bid.quantity} kg</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t mt-2">
                                                <span className="text-gray-600 font-medium">Total Value:</span>
                                                <span className="font-bold text-gray-900">₹{(bid.bid_price * bid.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 rounded-xl p-6 mb-8 text-center text-blue-700 border border-blue-100">
                        You haven't placed any bids yet. Browse the market below!
                    </div>
                )}

                {/* Available Crops */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Opportunities</h2>
                    {crops.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <p className="text-gray-500 text-lg">No crops listed in the market right now.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {crops.map(crop => (
                                <div key={crop.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition group">
                                    <div className="h-48 overflow-hidden relative">
                                        <img
                                            src={getCropImage(crop.crop_name)}
                                            alt={crop.crop_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                        <div className="absolute bottom-3 left-3 text-white">
                                            <p className="font-bold text-lg">{crop.crop_name}</p>
                                            <p className="text-sm opacity-90">{crop.quantity} kg available</p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Asking Price</p>
                                                <p className="text-xl font-bold text-green-700">₹{crop.base_price}/kg</p>
                                            </div>
                                            {crop.expiry_days <= 3 && (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase tracking-wide">Urgent</span>
                                            )}
                                        </div>

                                        {bidStats[crop.id]?.total_bids > 0 && (
                                            <div className="mb-4 text-xs font-semibold text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-2">
                                                <TrendingUp className="h-3 w-3" />
                                                {bidStats[crop.id].total_bids} active {bidStats[crop.id].total_bids === 1 ? 'bid' : 'bids'}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handlePlaceBid(crop)}
                                            className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-semibold flex items-center justify-center gap-2"
                                        >
                                            Place Blind Bid
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showBidModal && selectedCrop && (
                <BidModal
                    crop={selectedCrop}
                    buyer={user}
                    onClose={() => setShowBidModal(false)}
                    onSuccess={handleBidSuccess}
                />
            )}
        </div>
    );
}
