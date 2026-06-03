import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../services/api';
import { Brain, CheckCircle, AlertTriangle } from 'lucide-react';

export default function TrainForecastButton() {
    const [training, setTraining] = useState(false);
    const [status, setStatus] = useState(null);

    const handleTrain = async () => {
        setTraining(true);
        setStatus(null);
        try {
            await axios.post(`${API_URL}/optimize/train_forecast`);
            setStatus('success');
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            setStatus('error');
            setTimeout(() => setStatus(null), 3000);
        } finally {
            setTraining(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleTrain}
                disabled={training}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 rounded-lg font-semibold transition shadow-lg hover:shadow-indigo-500/20"
            >
                <Brain className="h-5 w-5" />
                {training ? 'Training Model...' : '🧠 Train Forecast Models'}
            </button>

            {status === 'success' && (
                <div className="absolute right-0 top-14 bg-green-50 text-green-800 border border-green-200 rounded-lg p-3 text-xs flex items-center gap-2 shadow-lg w-56 animate-in slide-in-from-top-2 duration-300 z-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Linear Regression model trained and saved successfully!</span>
                </div>
            )}

            {status === 'error' && (
                <div className="absolute right-0 top-14 bg-red-50 text-red-800 border border-red-200 rounded-lg p-3 text-xs flex items-center gap-2 shadow-lg w-56 animate-in slide-in-from-top-2 duration-300 z-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>Failed to train model. Check backend logs.</span>
                </div>
            )}
        </div>
    );
}
