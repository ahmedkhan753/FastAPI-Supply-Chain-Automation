import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if 401 Unauthorized
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Optional: Redirect to login
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    return api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/protected/me'),
};

export const orderAPI = {
  createOrder: (orderData) => api.post('/orders/', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
};

export const salesmanAPI = {
  getPendingOrders: () => api.get('/salesman/pending-orders'),
  confirmOrder: (data) => api.post('/salesman/confirm-order', data),
};

export const warehouseAPI = {
  getConfirmedOrders: () => api.get('/warehouse/confirmed-orders'),
  processOrder: (data) => api.post('/warehouse/process-order', data),
};

export const manufacturerAPI = {
  getStockRequests: () => api.get('/manufacturer/stock-requests'),
  shipStock: (orderId) => api.post(`/manufacturer/ship-stock/${orderId}`),
};

export default api;
