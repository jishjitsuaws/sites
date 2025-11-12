import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // SECURITY FIX (CVE-002): Send HttpOnly cookies with requests
});

// Request interceptor
// SECURITY FIX (CVE-002): Token is in HttpOnly cookie, no need to add to headers
apiClient.interceptors.request.use(
  (config) => {
    // HttpOnly cookie is automatically sent by browser
    // No need to manually add Authorization header
    console.log('[API] Request to:', config.url, '(token in HttpOnly cookie)');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401, avoid instant redirect loop. Try a single silent retry once.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Small delay to allow storage to settle
      await new Promise((r) => setTimeout(r, 150));
      return apiClient(originalRequest);
    }

    // On second 401, then redirect to login
    if (error.response?.status === 401 && originalRequest._retry) {
      if (typeof window !== 'undefined') {
        console.warn('[API] Auth failed twice, redirecting to login');
        // SECURITY FIX (CVE-002): Only clear user info, token is in HttpOnly cookie
        sessionStorage.removeItem('user_info');
        sessionStorage.removeItem('user_profile');
        localStorage.removeItem('user_info');
        localStorage.removeItem('user_profile');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// API service functions
export const authAPI = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data: any) => apiClient.put('/auth/update-profile', data),
  updatePassword: (data: any) => apiClient.put('/auth/update-password', data),
  forgotPassword: (data: any) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (token: string, data: any) => apiClient.put(`/auth/reset-password/${token}`, data),
};

export const sitesAPI = {
  getAll: (params?: any) => apiClient.get('/sites', { params }),
  getOne: (id: string) => apiClient.get(`/sites/${id}`),
  create: (data: any) => apiClient.post('/sites', data),
  update: (id: string, data: any) => apiClient.put(`/sites/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sites/${id}`),
  publish: (id: string) => apiClient.post(`/sites/${id}/publish`),
  unpublish: (id: string) => apiClient.post(`/sites/${id}/unpublish`),
  duplicate: (id: string) => apiClient.post(`/sites/${id}/duplicate`),
};

export const pagesAPI = {
  getAll: (siteId: string, params?: any) => apiClient.get(`/sites/${siteId}/pages`, { params }),
  getOne: (id: string) => apiClient.get(`/pages/${id}`),
  create: (siteId: string, data: any) => apiClient.post(`/sites/${siteId}/pages`, data),
  update: (id: string, data: any) => apiClient.put(`/pages/${id}`, data),
  delete: (id: string) => apiClient.delete(`/pages/${id}`),
  reorder: (siteId: string, data: any) => apiClient.put(`/sites/${siteId}/pages/reorder`, data),
  duplicate: (id: string) => apiClient.post(`/pages/${id}/duplicate`),
  updateContent: (id: string, data: any) => apiClient.patch(`/pages/${id}/content`, data),
};

export const themesAPI = {
  getAll: (params?: any) => apiClient.get('/themes', { params }),
  getOne: (id: string) => apiClient.get(`/themes/${id}`),
  create: (data: any) => apiClient.post('/themes', data),
  update: (id: string, data: any) => apiClient.put(`/themes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/themes/${id}`),
  getByCategory: (category: string) => apiClient.get(`/themes/category/${category}`),
  use: (id: string) => apiClient.post(`/themes/${id}/use`),
  getMyThemes: () => apiClient.get('/themes/my-themes'),
};

export const assetsAPI = {
  getAll: (params?: any) => apiClient.get('/assets', { params }),
  getOne: (id: string) => apiClient.get(`/assets/${id}`),
  upload: (formData: FormData) => apiClient.post('/assets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: any) => apiClient.put(`/assets/${id}`, data),
  delete: (id: string) => apiClient.delete(`/assets/${id}`),
  getStorageInfo: () => apiClient.get('/assets/storage/info'),
  bulkDelete: (data: any) => apiClient.delete('/assets/bulk-delete', { data }),
};
