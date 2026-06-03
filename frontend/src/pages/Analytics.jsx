import { useState, useEffect } from "react";
import { getAnalytics } from "../services/api.js";

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAnalytics()
            .then((res) => setData(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-gray-500 py-12 text-center">Loading analytics...</p>;
    if (!data) return <p className="text-red-500 py-12 text-center">Failed to load. Add some data first.</p>;

    const { summary, supply_demand, waste_risk_crops } = data;

    const statCards = [
        { label: "Farmers", value: summary.total_farmers, color: "green" },
        { label: "Buyers", value: summary.total_buyers, color: "blue" },
        { label: "Crops Listed", value: summary.total_crops, color: "emerald" },
        { label: "Active Demands", value: summary.total_demands, color: "purple" },
        { label: "Matches Found", value: summary.total_matches, color: "amber" },
        { label: "Est. Total Profit", value: `₹${summary.total_estimated_profit}`, color: "green" },
        { label: "Matched Qty (kg)", value: summary.total_matched_qty, color: "teal" },
        { label: "Avg Match Score", value: summary.avg_match_score, color: "indigo" },
    ];

    const maxQty = Math.max(...supply_demand.map((s) => Math.max(s.supply, s.demand)), 1);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-indigo-800">Market Analytics Dashboard</h2>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                {statCards.map((s) => (
                    <div key={s.label} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
                        <p className={`text-2xl font-bold text-${s.color}-700 mt-1`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Supply vs Demand Chart (bar chart via CSS) */}
            {supply_demand.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-lg mb-4">Supply vs Demand by Crop</h3>
                    <div className="space-y-4">
                        {supply_demand.map((sd) => (
                            <div key={sd.crop} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium w-24">{sd.crop}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${sd.status === "Surplus" ? "bg-green-100 text-green-700" :
                                            sd.status === "Shortage" ? "bg-red-100 text-red-700" :
                                                "bg-gray-100 text-gray-600"
                                        }`}>{sd.status} ({sd.balance > 0 ? "+" : ""}{sd.balance} kg)</span>
                                    {sd.price_factor !== 1.0 && (
                                        <span className="text-xs text-blue-600">Price: {sd.price_factor}x</span>
                                    )}
                                </div>
                                <div className="flex gap-1 items-center text-xs">
                                    <span className="w-14 text-right text-gray-400">Supply</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${(sd.supply / maxQty) * 100}%` }}></div>
                                    </div>
                                    <span className="w-12 text-gray-600">{sd.supply} kg</span>
                                </div>
                                <div className="flex gap-1 items-center text-xs">
                                    <span className="w-14 text-right text-gray-400">Demand</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(sd.demand / maxQty) * 100}%` }}></div>
                                    </div>
                                    <span className="w-12 text-gray-600">{sd.demand} kg</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Waste Risk */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Waste Risk Monitor</h3>
                    <span className={`text-sm font-bold ${summary.waste_risk_pct > 30 ? "text-red-600" : summary.waste_risk_pct > 10 ? "text-amber-600" : "text-green-600"}`}>
                        {summary.waste_risk_pct}% of supply at risk ({summary.waste_risk_qty} kg)
                    </span>
                </div>
                {waste_risk_crops.length > 0 ? (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="py-2">Crop</th><th>Qty</th><th>Expiry</th><th>Urgency</th>
                            </tr>
                        </thead>
                        <tbody>
                            {waste_risk_crops.map((c) => (
                                <tr key={c.id} className="border-b">
                                    <td className="py-2">{c.crop_name}</td>
                                    <td>{c.quantity} kg</td>
                                    <td>{c.expiry_days}d</td>
                                    <td>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.urgency === "CRITICAL" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                            }`}>{c.urgency}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-green-600 text-sm">✓ No crops at immediate waste risk.</p>
                )}
            </div>

            {/* Pricing Transparency */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-lg mb-3">Dynamic Pricing Transparency</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Prices adjust automatically based on real-time supply and demand ratios.
                    When demand exceeds supply, prices increase by 15% to incentivize production.
                    When supply exceeds demand by 50%+, prices decrease by 10% to encourage sales and reduce waste.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-red-50 p-3 rounded">
                        <p className="font-bold text-red-700">1.15x High Demand</p>
                        <p className="text-gray-600 text-xs mt-1">Demand &gt; Supply. Farmers earn more.</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                        <p className="font-bold text-gray-700">1.0x Balanced</p>
                        <p className="text-gray-600 text-xs mt-1">Supply meets demand. Fair market price.</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                        <p className="font-bold text-blue-700">0.9x Oversupply</p>
                        <p className="text-gray-600 text-xs mt-1">Supply &gt; 1.5x Demand. Prices reduced to minimize waste.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
