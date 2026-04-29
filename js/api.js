const BASE_URL = 'http://localhost:5000/api';

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const u = localStorage.getItem('user');
  if (!u || u === 'undefined') return null;
  return JSON.parse(u);
}

export function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function request(path, method, body) {
  const token = getToken();

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const options = {
    method: method || 'GET',
    headers: headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(BASE_URL + path, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

export const api = {
  register: (body) => request('/auth/register', 'POST', body),
  login: (body) => request('/auth/login', 'POST', body),
  getListings: (params) => request('/listings?' + new URLSearchParams(params || {}), 'GET'),
  getListing: (id) => request('/listings/' + id, 'GET'),
  createListing: (body) => request('/listings', 'POST', body),
  updateListing: (id, body) => request('/listings/' + id, 'PATCH', body),
  deleteListing: (id) => request('/listings/' + id, 'DELETE'),
  getProfile: (id) => request('/users/' + id, 'GET'),
  updateProfile: (body) => request('/users/me', 'PATCH', body),
  getMyListings: () => request('/users/me/listings', 'GET'),
  getMessages: () => request('/messages', 'GET'),
  sendMessage: (body) => request('/messages', 'POST', body),
  expressInterest: (listing_id) => request('/interactions', 'POST', { listing_id: listing_id, type: 'interested' }),
  adminGetStats: () => request('/admin/stats', 'GET'),
  adminGetListings: (filter) => request('/admin/listings' + (filter ? '?filter=' + filter : ''), 'GET'),
  adminApproveListing: (id) => request('/admin/listings/' + id + '/approve', 'PATCH'),
  adminDeleteListing: (id) => request('/admin/listings/' + id, 'DELETE'),
  adminGetUsers: () => request('/admin/users', 'GET'),
  adminUpdateUserRole: (id, role) => request('/admin/users/' + id + '/role', 'PATCH', { role: role })
};