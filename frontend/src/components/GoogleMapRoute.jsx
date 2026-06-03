import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

export default function GoogleMapRoute({ from, to }) {
    if (!from || !to) return null;

    return (
        <div className="bg-slate-900 text-white rounded-xl p-4 mt-2 overflow-hidden relative shadow-lg">
            <div className="absolute top-2 right-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Logistics Route Active
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                <span>Farmer Location ({from.lat.toFixed(3)}, {from.lng.toFixed(3)})</span>
                <ArrowRight className="h-3 w-3 text-slate-500" />
                <span>Buyer Location ({to.lat.toFixed(3)}, {to.lng.toFixed(3)})</span>
            </div>

            <div className="relative h-20 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between px-10 overflow-hidden">
                <div className="absolute left-16 right-16 border-t-2 border-dashed border-slate-700 top-1/2 -translate-y-1/2"></div>
                
                <div className="absolute left-[30%] w-3 h-3 bg-emerald-500 rounded-full top-1/2 -translate-y-1/2 shadow-lg shadow-emerald-500/50 animate-pulse"></div>

                <div className="flex flex-col items-center z-10">
                    <MapPin className="h-6 w-6 text-green-500 fill-green-500/20" />
                    <span className="text-[10px] font-bold text-slate-400 mt-1">Farmer</span>
                </div>

                <div className="flex flex-col items-center z-10">
                    <MapPin className="h-6 w-6 text-blue-500 fill-blue-500/20" />
                    <span className="text-[10px] font-bold text-slate-400 mt-1">Buyer</span>
                </div>
            </div>
        </div>
    );
}
