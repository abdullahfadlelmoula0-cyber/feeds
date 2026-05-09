const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function headers(includeAuth = true) {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth && getToken()) h['Authorization'] = `Bearer ${getToken()}`;
  return h;
}

function handleRes(r) {
  if (!r.ok) {
    return r.json().then((d) => Promise.reject({ status: r.status, ...d })).catch(() => Promise.reject({ status: r.status, detail: r.statusText }));
  }
  return r.json();
}

export const api = {
  /** Check if backend is reachable (for connection troubleshooting). */
  health: () => fetch(`${API_BASE}/health`, { method: 'GET' }).then((r) => r.ok ? r.json() : Promise.reject(new Error('Unhealthy'))),
  auth: {
    register: (nationalId, password) =>
      fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: headers(false), body: JSON.stringify({ national_id: nationalId, password }) }).then(handleRes),
    login: (nationalId, password) =>
      fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: headers(false), body: JSON.stringify({ national_id: nationalId, password }) }).then(handleRes),
    me: () => fetch(`${API_BASE}/auth/me`, { headers: headers() }).then(handleRes),
  },
  feed: {
    list: () => fetch(`${API_BASE}/feed/types`, { headers: headers() }).then(handleRes),
  },
  reservations: {
    bankDetails: () => fetch(`${API_BASE}/reservations/bank-details`, { headers: headers() }).then(handleRes),
    list: () => fetch(`${API_BASE}/reservations/`, { headers: headers() }).then(handleRes),
    get: (id) => fetch(`${API_BASE}/reservations/${id}`, { headers: headers() }).then(handleRes),
    create: (feedTypeId, quantity) =>
      fetch(`${API_BASE}/reservations/`, { method: 'POST', headers: headers(), body: JSON.stringify({ feed_type_id: feedTypeId, quantity }) }).then(handleRes),
    uploadReceipt: (reservationId, file) => {
      const fd = new FormData();
      fd.append('file', file);
      // Don't set Content-Type - browser will set it with boundary for multipart/form-data
      return fetch(`${API_BASE}/reservations/${reservationId}/receipt`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd
      }).then(handleRes);
    },
  },
  notifications: {
    list: (unreadOnly = false) => fetch(`${API_BASE}/notifications/?unread_only=${unreadOnly}`, { headers: headers() }).then(handleRes),
    markRead: (id) => fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST', headers: headers() }).then(handleRes),
  },
  admin: {
    reservations: () => fetch(`${API_BASE}/admin/reservations`, { headers: headers() }).then(handleRes),
    receiptUrl: (id) => `${API_BASE}/admin/reservations/${id}/receipt?t=${Date.now()}`,
    receiptBlob: (id) => fetch(`${API_BASE}/admin/reservations/${id}/receipt`, { headers: headers() }).then((r) => { if (!r.ok) throw new Error('Failed'); return r.blob(); }),
    approve: (id) => fetch(`${API_BASE}/admin/reservations/${id}/approve`, { method: 'POST', headers: headers() }).then(handleRes),
    reject: (id) => fetch(`${API_BASE}/admin/reservations/${id}/reject`, { method: 'POST', headers: headers() }).then(handleRes),
    feedTypes: () => fetch(`${API_BASE}/admin/feed-types`, { headers: headers() }).then(handleRes),
    createFeedType: (data) => fetch(`${API_BASE}/admin/feed-types`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleRes),
    updateFeedType: (id, data) => fetch(`${API_BASE}/admin/feed-types/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleRes),
    deleteFeedType: (id) => fetch(`${API_BASE}/admin/feed-types/${id}`, { method: 'DELETE', headers: headers() }).then(handleRes),
    getBankInfo: () => fetch(`${API_BASE}/admin/bank-info`, { headers: headers() }).then(handleRes),
    updateBankInfo: (data) => fetch(`${API_BASE}/admin/bank-info`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleRes),
    users: () => fetch(`${API_BASE}/admin/users`, { headers: headers() }).then(handleRes),
    createUser: (data) => fetch(`${API_BASE}/admin/users`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleRes),
    deleteUser: (id) => fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE', headers: headers() }).then(handleRes),
  },
};
