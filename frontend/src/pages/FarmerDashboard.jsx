import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { addCrop, getCrops, optimizeCrop, API_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, TrendingUp, DollarSign, Calendar, Upload, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

export default function FarmerDashboard() {
    const { user } = useAuth();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [stats, setStats] = useState({ revenue: 0, activeListings: 0, soldQty: 0 });

    const [cropForm, setCropForm] = useState({
        crop_name: '', quantity: '', base_price: '', expiry_days: '', image_url: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const cropsData = await getCrops();
            // Filter crops to show only this farmer's crops if desired, 
            // but for now we might want to see market context. 
            // Let's explicitly show "My Crops" content though.
            const allCrops = cropsData.data;
            setCrops(allCrops);

            // Calculate stats
            // Calculate stats or fetch from API
            try {
                const statsRes = await axios.get(`${API_URL}/farmers/analytics`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setStats(statsRes.data);
            } catch (err) {
                console.error("Error fetching analytics", err);
                const myCrops = allCrops.filter(c => c.farmer_id === user?.id);
                setStats({
                    revenue: 0,
                    activeListings: myCrops.length,
                    soldQty: 0
                });
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_URL}/upload/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCropForm({ ...cropForm, image_url: res.data.url });
        } catch (err) {
            alert('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleAddCrop = async (e) => {
        e.preventDefault();
        try {
            await addCrop({
                ...cropForm,
                farmer_id: user.id // Use authenticated user ID
            });
            alert('Crop Added!');
            setCropForm({ crop_name: '', quantity: '', base_price: '', expiry_days: '', image_url: '' });
            fetchData();
        } catch (err) {
            alert('Error adding crop');
        }
    };

    const handleOptimize = async (cropId) => {
        setLoading(true);
        try {
            const res = await optimizeCrop(cropId);
            setOptimizationResult(res.data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setOptimizationResult({ error: "No matching buyer found." });
            } else {
                alert('Optimization failed');
            }
        } finally {
            setLoading(false);
        }
    };

    // Filter to show only my crops for management
    const myCrops = crops.filter(c => c.farmer_id === user?.id);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
                        <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
                    </div>
                    <Link to="/analytics">
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium">
                            <TrendingUp className="h-4 w-4" />
                            View Market Trends
                        </button>
                    </Link>
                </div>

                {/* Analytics Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-700 rounded-full">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">₹{stats.revenue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Listings</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-700 rounded-full">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Quantity Sold</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.soldQty} kg</p>
                        </div>
                    </div>
                </div>

                {/* Monthly Trend Chart */}
                {stats.monthlyTrend && stats.monthlyTrend.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Monthly Income</h2>
                            <div className="text-sm font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full">
                                Last 30 Days: ₹{stats.last30DaysRevenue}
                            </div>
                        </div>
                        <div className="flex items-end gap-4 h-40">
                            {stats.monthlyTrend.map((item, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-green-500 rounded-t-lg transition-all group-hover:bg-green-600 relative"
                                        style={{ height: `${(item.revenue / Math.max(...stats.monthlyTrend.map(m => m.revenue))) * 100}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                                            ₹{item.revenue}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Crop Performance Stats */}
                {stats.cropBreakdown && stats.cropBreakdown.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Crop Performance</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats.cropBreakdown.map((crop, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                                            {crop.name[0]}
                                        </div>
                                        <span className="font-medium text-gray-900">{crop.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-green-700 font-bold">₹{crop.revenue}</p>
                                        <p className="text-xs text-gray-500">{crop.qty} kg sold</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Crop Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Add New Crop
                            </h2>
                            <form onSubmit={handleAddCrop} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                                    <input
                                        placeholder="e.g. Tomato"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        value={cropForm.crop_name}
                                        onChange={e => setCropForm({ ...cropForm, crop_name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                                        <input type="number" className="w-full p-3 border rounded-lg"
                                            value={cropForm.quantity} onChange={e => setCropForm({ ...cropForm, quantity: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹/kg)</label>
                                        <input type="number" className="w-full p-3 border rounded-lg"
                                            value={cropForm.base_price} onChange={e => setCropForm({ ...cropForm, base_price: e.target.value })} required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (Days)</label>
                                    <input type="number" className="w-full p-3 border rounded-lg"
                                        value={cropForm.expiry_days} onChange={e => setCropForm({ ...cropForm, expiry_days: e.target.value })} required />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Image</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                        {uploading ? (
                                            <div className="text-gray-500 flex flex-col items-center">
                                                <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full mb-2"></div>
                                                Uploading...
                                            </div>
                                        ) : cropForm.image_url ? (
                                            <div className="relative">
                                                <img src={cropForm.image_url.startsWith('http') ? cropForm.image_url : `http://localhost:5000${cropForm.image_url}`} alt="Preview" className="h-32 w-full object-cover rounded-md mx-auto" />
                                                <div className="absolute top-1 right-1 bg-white p-1 rounded-full shadow cursor-pointer">
                                                    <div className="text-xs font-bold text-green-600">Change</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-500">
                                                <Upload className="h-8 w-8 mb-2 text-gray-400" />
                                                <span className="text-sm">Click to upload image</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    disabled={uploading}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-sm hover:shadow-md disabled:opacity-50"
                                >
                                    Publish to Market
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* My Crops List */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Your Active Listings
                        </h2>

                        {myCrops.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                                <p className="text-gray-500">You haven't listed any crops yet.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 text-left text-sm font-medium text-gray-500">Crop</th>
                                            <th className="p-4 text-right text-sm font-medium text-gray-500">Qty</th>
                                            <th className="p-4 text-right text-sm font-medium text-gray-500">Price</th>
                                            <th className="p-4 text-right text-sm font-medium text-gray-500">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {myCrops.map(crop => (
                                            <tr key={crop.id} className="hover:bg-gray-50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {crop.image_url ? (
                                                            <img src={crop.image_url.startsWith('http') ? crop.image_url : `http://localhost:5000${crop.image_url}`} alt={crop.crop_name} className="h-10 w-10 rounded-md object-cover" />
                                                        ) : (
                                                            <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                                                <ImageIcon className="h-5 w-5 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-gray-900">{crop.crop_name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right text-gray-600">{crop.quantity} kg</td>
                                                <td className="p-4 text-right text-green-700 font-medium">₹{crop.base_price}</td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleOptimize(crop.id)}
                                                        className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
                                                    >
                                                        ⚡ Optimize
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Optimization UI similar to before ... */}
                {optimizationResult && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Optimization Result</h3>
                                <button onClick={() => setOptimizationResult(null)} className="text-gray-400 hover:text-gray-600">
                                    ✕
                                </button>
                            </div>

                            {optimizationResult.error ? (
                                <div className="text-center py-8">
                                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                                    <p className="text-gray-600 font-medium">{optimizationResult.error}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                        <span className="text-sm text-green-600 font-bold uppercase tracking-wider">Best Match</span>
                                        <div className="text-3xl font-bold text-green-700 mt-1">{optimizationResult.buyer_name}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="text-sm text-gray-500">Suggested Price</div>
                                            <div className="text-xl font-bold text-gray-900">₹{optimizationResult.suggested_price}</div>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="text-sm text-gray-500">Est. Profit</div>
                                            <div className="text-xl font-bold text-green-600">+₹{optimizationResult.estimated_profit}</div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mt-4 space-y-2 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span>Distance:</span>
                                            <span className="font-medium">{optimizationResult.distance} km</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Transport Cost:</span>
                                            <span className="font-medium">₹{optimizationResult.transport_cost}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Match Score:</span>
                                            <span className="font-medium">{optimizationResult.score}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setOptimizationResult(null)}
                                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 mt-4"
                                    >
                                        Confirm Deal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
