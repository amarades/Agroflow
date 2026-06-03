import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getBids, acceptBid, rejectBid } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Check, X, Award } from 'lucide-react';

export default function FarmerBids() {
    const { user } = useAuth();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBids();
        }
    }, [user]);

    const fetchBids = async () => {
        setLoading(true);
        try {
            const res = await getBids({ farmer_id: user.id });
            setBids(res.data);
        } catch (err) {
            console.error("Error fetching farmer bids:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await acceptBid(id);
            alert("Bid accepted and shipment created!");
            fetchBids();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to accept bid");
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectBid(id);
            alert("Bid rejected");
            fetchBids();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to reject bid");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bid Proposals</h1>
                    <p className="text-sm text-gray-500 mt-1">Review and manage buyer bids on your fresh harvest listings</p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div>
                        <p className="text-gray-500 mt-4 font-semibold text-sm">Loading bids...</p>
                    </div>
                ) : bids.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                        <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No bids received yet</h2>
                        <p className="text-gray-500 text-sm">When buyers place blind bids on your listed produce, they will show up here for you to accept or reject.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bids.map(bid => (
                            <div key={bid.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition duration-300 flex flex-col justify-between">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Crop Name</span>
                                            <h3 className="font-extrabold text-xl text-gray-900 mt-0.5">{bid.crop_name}</h3>
                                        </div>
                                        <div>
                                            {bid.status === 'pending' && (
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full uppercase">Pending</span>
                                            )}
                                            {bid.status === 'accepted' && (
                                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase">Accepted ✅</span>
                                            )}
                                            {bid.status === 'rejected' && (
                                                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full uppercase">Rejected</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 border-t pt-4">
                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>Buyer Name:</span>
                                            <span className="font-bold text-gray-800">{bid.buyer_name}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>Bid Price:</span>
                                            <span className="font-extrabold text-green-700">₹{bid.bid_price}/kg</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>Requested Qty:</span>
                                            <span className="font-bold text-gray-800">{bid.quantity} kg</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-800 border-t pt-2 font-bold bg-gray-50 px-2 py-1.5 rounded-lg mt-2">
                                            <span>Total Revenue:</span>
                                            <span className="text-lg text-green-700">₹{(bid.bid_price * bid.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {bid.status === 'pending' && (
                                    <div className="flex border-t border-gray-100">
                                        <button
                                            onClick={() => handleReject(bid.id)}
                                            className="flex-1 py-3.5 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-700 font-bold text-sm transition flex items-center justify-center gap-1.5"
                                        >
                                            <X className="h-4 w-4" /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleAccept(bid.id)}
                                            className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition flex items-center justify-center gap-1.5 shadow-inner"
                                        >
                                            <Check className="h-4 w-4" /> Accept
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
