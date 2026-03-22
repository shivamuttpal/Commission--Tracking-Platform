import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Brand
import BrandDashboard from './pages/brand/BrandDashboard';
import BrandProducts from './pages/brand/BrandProducts';
import BrandApplications from './pages/brand/BrandApplications';

// Creator
import CreatorDashboard from './pages/creator/CreatorDashboard';
import CreatorProducts from './pages/creator/CreatorProducts';
import CreatorLinks from './pages/creator/CreatorLinks';
import CreatorWallet from './pages/creator/CreatorWallet';
import CreatorPayouts from './pages/creator/CreatorPayouts';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPayouts from './pages/admin/AdminPayouts';
import AdminBrands from './pages/admin/AdminBrands';
import AdminCreators from './pages/admin/AdminCreators';

// Public
import ProductPage from './pages/public/ProductPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner"></div></div>;
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Register />} />
      <Route path="/product/:id" element={<ProductPage />} />

      {/* Brand */}
      <Route path="/brand/dashboard" element={<ProtectedRoute roles={['brand']}><BrandDashboard /></ProtectedRoute>} />
      <Route path="/brand/products" element={<ProtectedRoute roles={['brand']}><BrandProducts /></ProtectedRoute>} />
      <Route path="/brand/applications" element={<ProtectedRoute roles={['brand']}><BrandApplications /></ProtectedRoute>} />

      {/* Creator */}
      <Route path="/creator/dashboard" element={<ProtectedRoute roles={['creator']}><CreatorDashboard /></ProtectedRoute>} />
      <Route path="/creator/products" element={<ProtectedRoute roles={['creator']}><CreatorProducts /></ProtectedRoute>} />
      <Route path="/creator/links" element={<ProtectedRoute roles={['creator']}><CreatorLinks /></ProtectedRoute>} />
      <Route path="/creator/wallet" element={<ProtectedRoute roles={['creator']}><CreatorWallet /></ProtectedRoute>} />
      <Route path="/creator/payouts" element={<ProtectedRoute roles={['creator']}><CreatorPayouts /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/payouts" element={<ProtectedRoute roles={['admin']}><AdminPayouts /></ProtectedRoute>} />
      <Route path="/admin/brands" element={<ProtectedRoute roles={['admin']}><AdminBrands /></ProtectedRoute>} />
      <Route path="/admin/creators" element={<ProtectedRoute roles={['admin']}><AdminCreators /></ProtectedRoute>} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
