import api from './api';

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const getProfile = () => api.get('/auth/profile');
export const getUsers = () => api.get('/auth/users');
export const createUser = (data) => api.post('/auth/users', data);

// Dashboard
export const getDashboardStats = () => api.get('/reservations/stats');

// Rooms
export const getRooms = (params) => api.get('/reservations/rooms', { params });
export const getAvailableRooms = (checkIn, checkOut) =>
  api.get('/reservations/rooms/available', { params: { check_in: checkIn, check_out: checkOut } });
export const getRoomTypes = () => api.get('/reservations/room-types');

// Customers
export const getCustomers = (search) =>
  api.get('/reservations/customers', { params: { search } });

// Reservations
export const getReservations = (params) => api.get('/reservations', { params });
export const getReservationById = (id) => api.get(`/reservations/${id}`);
export const createReservation = (data) => api.post('/reservations', data);
export const updateReservationStatus = (id, status) =>
  api.patch(`/reservations/${id}/status`, { status });
export const amendReservationPrice = (id, data) =>
  api.patch(`/reservations/${id}/amend-price`, data);
export const recordPayment = (id, data) => api.post(`/reservations/${id}/payments`, data);

