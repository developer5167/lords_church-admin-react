import axios from 'axios';

const API_BASE_URL = 'http://10.127.161.23:4000/api';
// const API_BASE_URL = 'http://13.201.163.103:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username: string, password: string) =>
    apiClient.post('/admin/login', { username, password }),
};

export const eventAPI = {
  getAll: () => apiClient.get('/admin/events'),
  getByDate: (date: string) => apiClient.get(`/admin/events/by-date?date=${date}`),
  create: (name: string, event_date: string) =>
    apiClient.post('/admin/event', { name, event_date }),
  delete: (eventId: string) => apiClient.delete(`/admin/event/${eventId}`),
};

export const serviceAPI = {
  create: (event_id: string, service_code: string, service_time: string) =>
    apiClient.post('/admin/service', { event_id, service_code, service_time }),
};

export const attendanceAPI = {
  getByService: (serviceId: string) =>
    apiClient.get(`/admin/attendance/service/${serviceId}`),
  exportCSV: (eventId: string) =>
    apiClient.get(`/admin/attendance/export/${eventId}`, {
      responseType: 'text',
    }),
};

export const paymentAPI = {
  getLink: () => apiClient.get('/admin/church/payment-link'),
  setLink: (paymentLink: string) =>
    apiClient.post('/admin/church/payment-link', { paymentLink }),
};

export const baptismAPI = {
  getAll: (status?: 'pending' | 'completed') => {
    const params = status ? `?status=${status}` : '';
    return apiClient.get(`/admin/baptism-requests${params}`);
  },
  complete: (requestId: string) =>
    apiClient.patch(`/admin/baptism-requests/${requestId}/complete`),
};

export default apiClient;
