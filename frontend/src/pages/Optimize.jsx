import { useState } from "react";
import { optimizeAll } from "../services/api.js";
import { getForecast } from "../services/api.js";
import ChartForecast from '../components/ChartForecast'
import GoogleMapRoute from '../components/GoogleMapRoute'
import TrainForecastButton from '../components/TrainForecastButton'

export default function Optimize() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const runOptimization = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await optimizeAll();
            setResults(res.data);
            if (res.data.length === 0) setError("No matches found. Add farmers, crops, buyers, and demands first.");
        } catch {
            setError("Optimization failed. Make sure data exists.");
        }
        setLoading(false);
    };

    const [forecastMap, setForecastMap] = useState({});
    const fetchForecast = async (cropName) => {
        if (forecastMap[cropName]) return; // cached
        try {
            const res = await getForecast(cropName);
            setForecastMap((m) => ({ ...m, [cropName]: res.data }));
        } catch (e) {
            setForecastMap((m) => ({ ...m, [cropName]: { error: true } }));
        }
    };

    const urgencyColor = (u) =>
        u === "HIGH" ? "bg-red-100 text-red-700" : u === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-amber-700">Optimization Engine</h2>
                <div className="flex gap-3">
                    <button
                        onClick={runOptimization}
                        disabled={loading}
                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-amber-500/30"
                    >
                        {loading ? "Optimizing..." : "⚡ Run Optimization"}
                    </button>
                    <TrainForecastButton />
                </div>
            </div>

            <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg">
                The engine scores every crop-buyer pair using: <strong>Score = Price Margin - Transport Cost + Demand Priority - Spoilage Penalty</strong>.
                Crops nearing expiry are processed first (waste minimization). Prices adjust dynamically based on supply/demand ratio.
            </p>

            {error && <p className="text-red-600 bg-red-50 p-3 rounded">{error}</p>}

            {results.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">Found {results.length} Optimal Matches</h3>
                    {results.map((r, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-lg">{r.crop_name} <span className="text-gray-400 text-sm">#{r.crop_id}</span></h3>
                                    <p className="text-sm text-gray-500">Farmer: {r.farmer_name} → Buyer: {r.buyer_name}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${urgencyColor(r.spoilage_urgency)}`}>
                                    {r.spoilage_urgency} URGENCY
                                </span>
                            </div>
                            <div className="grid grid-cols-5 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Distance</p>
                                    <p className="font-semibold">{r.distance} km</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Transport Cost</p>
                                    <p className="font-semibold">₹{r.transport_cost}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Suggested Price</p>
                                    <p className="font-semibold text-green-700">₹{r.suggested_price}/kg</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Est. Profit</p>
                                    <p className="font-semibold text-green-700">₹{r.estimated_profit}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Match Score</p>
                                    <p className="font-bold text-lg text-amber-600">{r.score}</p>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400">Commission</p>
                                    <p className="font-semibold">₹{r.commission_per_kg ?? 'N/A'}/kg</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Guaranteed Price</p>
                                    <p className="font-semibold">₹{r.guaranteed_price_per_kg ?? 'N/A'}/kg</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Farmer Receives</p>
                                    <p className="font-semibold">₹{r.farmer_receive_per_kg ?? 'N/A'}/kg • ₹{r.farmer_expected_total ?? 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Platform Fee</p>
                                    <p className="font-semibold">₹{r.platform_fee_total ?? 'N/A'}</p>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-gray-600">
                                <div>Matched Qty: <span className="font-semibold">{r.matched_qty}/{r.demanded_qty} kg ({r.fulfillment_pct}%)</span></div>
                                <div>Waste Saved: <span className="font-semibold text-green-600">{r.waste_saved_pct}%</span></div>
                                <div>Margin: <span className="font-semibold">₹{r.price_margin}</span></div>
                            </div>
                            {r.price_factor !== 1.0 && (
                                <p className="mt-2 text-xs text-blue-600">
                                    Dynamic pricing active: {r.price_factor > 1 ? "High demand" : "Oversupply"} factor {r.price_factor}x
                                </p>
                            )}
                            <div className="mt-3">
                                <button
                                    className="text-sm text-blue-600 hover:underline"
                                    onClick={() => fetchForecast(r.crop_name)}
                                >
                                    View Forecast
                                </button>
                                {forecastMap[r.crop_name] && (
                                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                        {forecastMap[r.crop_name].error ? (
                                            <div>Forecast unavailable</div>
                                        ) : (
                                            <div>
                                                <div className="font-semibold">Forecast (next months)</div>
                                                <div className="mt-2">
                                                    <ChartForecast forecast={forecastMap[r.crop_name]} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {r.farmer_location && r.buyer_location && (
                                <div className="mt-3">
                                    <GoogleMapRoute
                                        from={{ lat: r.farmer_location.x, lng: r.farmer_location.y }}
                                        to={{ lat: r.buyer_location.x, lng: r.buyer_location.y }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
