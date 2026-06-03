import { useState } from 'react';
import { createBid } from '../services/api';
import { X, ShieldAlert, Check } from 'lucide-react';

export default function BidModal({ crop, buyer, onClose, onSuccess }) {
    const [price, setPrice] = useState(crop.base_price);
    const [quantity, setQuantity] = useState(crop.quantity);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await createBid({
                crop_id: crop.id,
                buyer_id: buyer.id,
                bid_price: parseFloat(price),
                quantity: parseFloat(quantity)
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place bid');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Place Blind Bid</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-green-50 p-4 rounded-xl mb-6 flex items-start gap-3 border border-green-100">
                    <div className="p-2 bg-green-100 text-green-700 rounded-lg font-bold text-lg">
                        🌱
                    </div>
                    <div>
                        <h4 className="font-bold text-green-800 text-base">{crop.crop_name}</h4>
                        <p className="text-sm text-green-600">Asking price: ₹{crop.base_price}/kg • {crop.quantity}kg available</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-xs mb-4 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Your Bid Price (₹/kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            min={crop.base_price}
                            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">Must be equal or higher than the farmer's asking price.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Required Quantity (kg)</label>
                        <input
                            type="number"
                            step="any"
                            min="1"
                            max={crop.quantity}
                            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">Maximum available: {crop.quantity} kg.</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 flex justify-between items-center border border-gray-100">
                        <span>Total Cost Estimate:</span>
                        <span className="text-xl font-bold text-gray-900">₹{(price * quantity).toFixed(2)}</span>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-1.5 shadow-lg shadow-green-500/20"
                        >
                            {loading ? 'Submitting...' : (
                                <>
                                    <Check className="h-4 w-4" /> Place Bid
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
