import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
};

// Batches API
export const batchesAPI = {
  getAll: () => api.get('/batches'),
  getById: (id: string) => api.get(`/batches/${id}`),
  create: (data: any) => api.post('/batches', data),
  update: (id: string, data: any) => api.put(`/batches/${id}`, data),
  delete: (id: string) => api.delete(`/batches/${id}`),
};

// Semesters API
export const semestersAPI = {
  getAll: (batchId?: string) =>
    api.get('/semesters', { params: { batchId } }),
  getById: (id: string) => api.get(`/semesters/${id}`),
  create: (data: any) => api.post('/semesters', data),
  update: (id: string, data: any) => api.put(`/semesters/${id}`, data),
  delete: (id: string) => api.delete(`/semesters/${id}`),
};

// Courses API
export const coursesAPI = {
  getAll: (params?: any) => api.get('/courses', { params }),
  getById: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
};

// Instructors API
export const instructorsAPI = {
  getAll: () => api.get('/instructors'),
  getById: (id: string) => api.get(`/instructors/${id}`),
  getWorkload: (id: string) => api.get(`/instructors/${id}/workload`),
  create: (data: any) => api.post('/instructors', data),
  update: (id: string, data: any) => api.put(`/instructors/${id}`, data),
  delete: (id: string) => api.delete(`/instructors/${id}`),
};

// Schedules API
export const schedulesAPI = {
  generate: (data: any) => api.post('/schedules/generate', data),
  getAll: (params?: any) => api.get('/schedules', { params }),
  getById: (id: string) => api.get(`/schedules/${id}`),
  update: (id: string, data: any) => api.put(`/schedules/${id}`, data),
  publish: (id: string) => api.patch(`/schedules/${id}/publish`),
  getInstructorSchedule: (instructorId: string) =>
    api.get(`/schedules/instructor/${instructorId}`),
};

// Rooms API
export const roomsAPI = {
  getAll: (roomType?: string) => api.get('/rooms', { params: { roomType } }),
  initialize: () => api.post('/rooms/initialize'),
  create: (data: any) => api.post('/rooms', data),
};

export default api;

