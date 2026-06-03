import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getShipments, updateShipmentStatus } from '../services/api';
import { Truck, CheckCircle, Package, RefreshCw, ChevronRight } from 'lucide-react';

export default function Shipments() {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        setLoading(true);
        try {
            const res = await getShipments();
            setShipments(res.data);
        } catch (err) {
            console.error("Error loading shipments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await updateShipmentStatus(id, newStatus);
            alert(`Shipment status updated to: ${newStatus}`);
            fetchShipments();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update shipment");
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="h-6 w-6 text-green-600" />;
            case 'shipped': return <Truck className="h-6 w-6 text-blue-600" />;
            default: return <Package className="h-6 w-6 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            <Truck className="h-8 w-8 text-green-600" />
                            Logistics & Shipments
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Real-time status of matches and logistics shipments</p>
                    </div>
                    <button
                        onClick={fetchShipments}
                        className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition"
                    >
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div>
                        <p className="text-gray-500 mt-4 text-sm font-semibold">Loading shipments...</p>
                    </div>
                ) : shipments.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                        <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">No active shipments found</h2>
                        <p className="text-gray-500 text-sm">Once a bid is accepted or optimization is confirmed, a shipment and transporter is auto-assigned.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {shipments.map(s => (
                            <div key={s.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-xl">
                                        {getStatusIcon(s.status)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-extrabold text-lg text-gray-900">{s.crop_name}</h3>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                                s.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                s.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {s.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-semibold mt-1">Shipment #{s.id} • Transporter: {s.transporter_name}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-8 text-sm">
                                    <div>
                                        <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Route</span>
                                        <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                                            {s.farmer_name} <ChevronRight className="h-3 w-3 text-gray-400" /> {s.buyer_name}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Distance</span>
                                        <span className="font-bold text-gray-800 mt-0.5">{s.distance_km} km</span>
                                    </div>

                                    <div>
                                        <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Logistics Cost</span>
                                        <span className="font-extrabold text-green-700 mt-0.5">₹{s.transport_cost}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    {s.status === 'created' && (
                                        <button
                                            onClick={() => handleUpdateStatus(s.id, 'assigned')}
                                            className="w-full md:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition"
                                        >
                                            Assign Driver
                                        </button>
                                    )}
                                    {s.status === 'assigned' && (
                                        <button
                                            onClick={() => handleUpdateStatus(s.id, 'shipped')}
                                            className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition"
                                        >
                                            Start Transit
                                        </button>
                                    )}
                                    {s.status === 'shipped' && (
                                        <button
                                            onClick={() => handleUpdateStatus(s.id, 'delivered')}
                                            className="w-full md:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs transition"
                                        >
                                            Confirm Delivery
                                        </button>
                                    )}
                                    {s.status === 'delivered' && (
                                        <span className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 flex items-center gap-1">
                                            ✓ Completed
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
