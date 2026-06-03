import axios from 'axios';
export const API_URL = 'http://localhost:5000/api';

const API = axios.create({
    baseURL: API_URL,
});

// Add token to headers if it exists in localStorage
const token = localStorage.getItem('token');
if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const getFarmers = () => API.get('/farmers/');
export const addFarmer = (data) => API.post('/farmers/', data);

export const getCrops = () => API.get('/crops/');
export const addCrop = (data) => API.post('/crops/', data);

export const getBuyers = () => API.get('/buyers/');
export const addBuyer = (data) => API.post('/buyers/', data);

export const getDemands = () => API.get('/demands/');
export const addDemand = (data) => API.post('/demands/', data);

export const optimizeCrop = (cropId) => API.post('/optimize/', { crop_id: cropId });
export const optimizeAll = () => API.get('/optimize/all');
export const getAnalytics = () => API.get('/optimize/analytics');
export const getForecast = (cropName) => API.get(`/optimize/forecast/${encodeURIComponent(cropName)}`);

export const getShipments = () => API.get('/shipments/');
export const getShipment = (id) => API.get(`/shipments/${id}`);
export const createShipmentFromOptimize = (cropId) => API.post(`/shipments/create_from_optimize`, { crop_id: cropId });
export const updateShipmentStatus = (id, status) => API.put(`/shipments/${id}/status`, { status });

// Bidding APIs
export const getBids = (params) => API.get('/bids/', { params });
export const createBid = (data) => API.post('/bids/', data);
export const acceptBid = (id) => API.put(`/bids/${id}/accept`);
export const rejectBid = (id) => API.put(`/bids/${id}/reject`);
export const getBidStats = (cropId) => API.get(`/bids/crop/${cropId}/stats`);

export default API;
