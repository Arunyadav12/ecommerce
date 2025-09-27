import axios from 'axios';
import { getAuthToken, clearAuthToken } from './auth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE_URL = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  me: () => api.get('/auth/me'),
};

// Products API
export const productsAPI = {
  getProducts: (params = {}) => api.get('/products', { params }),
  getProduct: (productId) => api.get(`/products/${productId}`),
  getCategories: () => api.get('/categories'),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  getUserOrders: () => api.get('/orders'),
  updateOrderStatus: (orderId, statusData) => api.patch(`/orders/${orderId}/status`, statusData),
};

export default api;