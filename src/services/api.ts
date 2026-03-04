import axios from 'axios';

// const API_BASE_URL = 'http://192.168.15.187:4000/api'; 
const API_BASE_URL = 'http://192.168.15.165:4000/api';

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

export const volunteerAPI = {
  getAll: (params?: {
    departmentNameId?: string;
    departmentId?: string;
    status?: 'pending' | 'completed';
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'memberName';
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.departmentNameId) queryParams.append('departmentNameId', params.departmentNameId);
    if (params?.departmentId) queryParams.append('departmentId', params.departmentId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const query = queryParams.toString();
    return apiClient.get(`/admin/volunteer-requests${query ? `?${query}` : ''}`);
  },
  getById: (requestId: string) =>
    apiClient.get(`/admin/volunteer-requests/${requestId}`),
  updateStatus: (requestId: string, data: { status: 'completed'; notes?: string }) =>
    apiClient.patch(`/admin/volunteer-requests/${requestId}`, data),
};

export const prayerRequestAPI = {
  getAll: (date?: string) => {
    const params = date ? `?date=${date}` : '';
    return apiClient.get(`/admin/prayer-requests${params}`);
  },
  updateStatus: (requestId: string, status: string) =>
    apiClient.put(`/admin/prayer-requests/${requestId}/status`, { status }),
  exportCSV: (date?: string) => {
    const params = date ? `?date=${date}` : '';
    return apiClient.get(`/admin/prayer-requests/export${params}`, {
      responseType: 'blob', // use blob or text, usually blob for file download
    });
  },
};

export default apiClient;
