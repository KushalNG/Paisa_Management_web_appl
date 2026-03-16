import axios from 'axios';

// API Base URL - will use LAN IP
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/api/user/profile'),
  updateProfile: (data) => api.put('/api/user/profile', data),
};

// Transaction APIs
export const transactionAPI = {
  getAll: (params) => api.get('/api/transactions', { params }),
  create: (data) => api.post('/api/transactions', data),
  delete: (id) => api.delete(`/api/transactions/${id}`),
  export: (params) => api.get('/api/transactions/export', { params, responseType: 'blob' }),
};

// Commitment APIs
export const commitmentAPI = {
  getAll: () => api.get('/api/commitments'),
  create: (data) => api.post('/api/commitments', data),
  update: (id, data) => api.put(`/api/commitments/${id}`, data),
  delete: (id) => api.delete(`/api/commitments/${id}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  getCategoryExpenses: () => api.get('/api/dashboard/category-expenses'),
  getTrends: () => api.get('/api/dashboard/trends'),
  getBudgets: () => api.get('/api/dashboard/budgets'),
};

// Budget APIs
export const budgetAPI = {
  getAll: (params) => api.get('/api/budgets', { params }),
  create: (data) => api.post('/api/budgets', data),
  update: (id, data) => api.put(`/api/budgets/${id}`, data),
  delete: (id) => api.delete(`/api/budgets/${id}`),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get('/api/admin/users'),
  getUserDetail: (id) => api.get(`/api/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  resetPassword: (id, data) => api.put(`/api/admin/users/${id}/reset-password`, data),
};

export default api;
