import React from 'react';

export default function ChartForecast({ forecast }) {
    if (!forecast || !forecast.forecast || forecast.forecast.length === 0) {
        return <p className="text-gray-500 text-xs">No forecast data available.</p>;
    }

    const data = forecast.forecast;
    const maxPrice = Math.max(...data.map(d => d.predicted_price), 1);
    const minPrice = Math.min(...data.map(d => d.predicted_price), 0);
    const range = maxPrice - minPrice;

    const width = 360;
    const height = 120;
    const padding = 15;

    const points = data.map((d, index) => {
        const x = padding + (index * (width - 2 * padding)) / (data.length - 1);
        const y = height - padding - ((d.predicted_price - minPrice) * (height - 2 * padding)) / (range || 1);
        return { x, y, price: d.predicted_price, month: d.month };
    });

    const pathData = points.reduce((acc, p, idx) => {
        return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
    }, '');

    const areaData = pathData + `L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-inner">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-gray-500">12-Month Price Forecast</span>
                <span className="text-green-700">Avg: ₹{forecast.avg_base || 'N/A'}/kg</span>
            </div>
            
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="1" />

                <path d={areaData} fill="url(#areaGrad)" />

                <path d={pathData} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                {points.map((p, idx) => (
                    (idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1) && (
                        <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="3" fill="#047857" stroke="#FFFFFF" strokeWidth="1" />
                            <text x={p.x} y={p.y - 6} textAnchor="middle" className="text-[8px] font-bold fill-gray-700">
                                ₹{p.price.toFixed(1)}
                            </text>
                            <text x={p.x} y={height - 2} textAnchor="middle" className="text-[6px] font-medium fill-gray-400">
                                M{p.month}
                            </text>
                        </g>
                    )
                ))}
            </svg>
        </div>
    );
}
