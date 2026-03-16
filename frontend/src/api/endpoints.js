import api from './axiosConfig';

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (data) => api.post('/auth/signup', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.patch('/auth/me', data),
};

export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const driversAPI = {
  list: (params) => api.get('/drivers', { params }),
  get: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
};

export const vehiclesAPI = {
  list: (params) => api.get('/vehicles', { params }),
  create: (data) => api.post('/vehicles', data),
  listMy: (params) => api.get('/vehicles/my', { params }),
  createMy: (data) => api.post('/vehicles/my', data),
};

export const violationsAPI = {
  list: () => api.get('/violations'),
};

export const finesAPI = {
  list: (params) => api.get('/fines', { params }),
  get: (id) => api.get(`/fines/${id}`),
  create: (data) => api.post('/fines', data),
  update: (id, data) => api.patch(`/fines/${id}`, data),
  pay: (id, data) => api.post(`/fines/${id}/pay`, data),
};

export const paymentsAPI = {
  list: (params) => api.get('/payments', { params }),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
};

export const usersAPI = {
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
};
