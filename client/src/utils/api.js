const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Auth
export const loginUser = (email, password) =>
  fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(handleResponse);

export const registerUser = (name, email, password, role) =>
  fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password, role }) }).then(handleResponse);

export const getMe = () =>
  fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then(handleResponse);

// Products
export const getProducts = () =>
  fetch(`${API_BASE}/products`, { headers: getHeaders() }).then(handleResponse);

export const getAllProducts = () =>
  fetch(`${API_BASE}/products/all`, { headers: getHeaders() }).then(handleResponse);

export const getProduct = (id) =>
  fetch(`${API_BASE}/products/${id}`).then(handleResponse);

export const createProduct = (data) =>
  fetch(`${API_BASE}/products`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse);

export const updateProduct = (id, data) =>
  fetch(`${API_BASE}/products/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse);

export const deleteProduct = (id) =>
  fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse);

// Applications
export const applyToProduct = (productId) =>
  fetch(`${API_BASE}/applications`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ productId }) }).then(handleResponse);

export const getApplications = () =>
  fetch(`${API_BASE}/applications`, { headers: getHeaders() }).then(handleResponse);

export const updateApplication = (id, status) =>
  fetch(`${API_BASE}/applications/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ status }) }).then(handleResponse);

// Referrals
export const generateReferralLink = (productId) =>
  fetch(`${API_BASE}/referrals/generate`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ productId }) }).then(handleResponse);

export const getReferralLinks = () =>
  fetch(`${API_BASE}/referrals`, { headers: getHeaders() }).then(handleResponse);

// Tracking
export const trackClick = (productId, creatorId) =>
  fetch(`${API_BASE}/track/click/${productId}?ref=${creatorId}`).then(handleResponse);

export const simulatePurchase = (productId, creatorId) =>
  fetch(`${API_BASE}/track/purchase`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, creatorId }) }).then(handleResponse);

// Wallet
export const getWallet = () =>
  fetch(`${API_BASE}/wallet`, { headers: getHeaders() }).then(handleResponse);

export const getTransactions = () =>
  fetch(`${API_BASE}/wallet/transactions`, { headers: getHeaders() }).then(handleResponse);

// Payouts
export const requestPayout = (amount) =>
  fetch(`${API_BASE}/payouts/request`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ amount }) }).then(handleResponse);

export const getPayouts = () =>
  fetch(`${API_BASE}/payouts`, { headers: getHeaders() }).then(handleResponse);

// Admin
export const getAdminPayouts = () =>
  fetch(`${API_BASE}/admin/payouts`, { headers: getHeaders() }).then(handleResponse);

export const updateAdminPayout = (id, status, adminNote) =>
  fetch(`${API_BASE}/admin/payouts/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ status, adminNote }) }).then(handleResponse);

export const getAdminMetrics = () =>
  fetch(`${API_BASE}/admin/metrics`, { headers: getHeaders() }).then(handleResponse);

export const getAdminBrands = () =>
  fetch(`${API_BASE}/admin/brands`, { headers: getHeaders() }).then(handleResponse);

export const getAdminCreators = () =>
  fetch(`${API_BASE}/admin/creators`, { headers: getHeaders() }).then(handleResponse);

// Brand analytics
export const getBrandAnalytics = () =>
  fetch(`${API_BASE}/brand/analytics`, { headers: getHeaders() }).then(handleResponse);
