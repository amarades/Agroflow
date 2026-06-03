import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Optimize from './pages/Optimize';
import Analytics from './pages/Analytics';
import Feed from './pages/Feed';
import FarmerBids from './pages/FarmerBids';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Shipments from './pages/Shipments';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userType, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(userType)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/optimize" element={<Optimize />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route
            path="/shipments"
            element={
              <ProtectedRoute>
                <Shipments />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/farmer"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/bids"
            element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <FarmerBids />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
