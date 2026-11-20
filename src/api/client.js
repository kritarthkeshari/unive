const BASE = '/api';
const TOKEN_KEY = 'uv_token';
const USER_KEY = 'uv_user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken();
}

export function setSession({ token, user }) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (auth && token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function signup(payload) {
  const data = await request('/auth/signup', { method: 'POST', body: payload, auth: false });
  setSession(data);
  return data;
}

export async function login(email, password) {
  const data = await request('/auth/login', { method: 'POST', body: { email, password }, auth: false });
  setSession(data);
  return data;
}

export async function me() {
  const data = await request('/auth/me');
  if (data?.user) setSession({ user: data.user });
  return data.user;
}

export function logout() {
  clearSession();
}

export async function getUser(id) {
  const data = await request(`/users/${id}`, { auth: false });
  return data.user;
}

export async function getStartups() {
  const all = [];
  let page = 1;
  for (;;) {
    const data = await request(`/startups?limit=50&page=${page}`);
    all.push(...(data.startups || []));
    if (!data.hasNext) break;
    page += 1;
  }
  return all;
}

export async function getStartup(id) {
  const data = await request(`/startups/${id}`);
  return data.startup;
}

export async function createStartup(payload) {
  const data = await request('/startups', { method: 'POST', body: payload });
  return data.startup;
}

export async function deleteStartup(id) {
  return request(`/startups/${id}`, { method: 'DELETE' });
}

export async function toggleVote(id) {
  return request(`/startups/${id}/vote`, { method: 'POST' });
}

export async function toggleSave(id) {
  return request(`/startups/${id}/save`, { method: 'POST' });
}

export async function addComment(id, text) {
  return request(`/startups/${id}/comments`, { method: 'POST', body: { text } });
}

export async function applyRole(id, role) {
  const data = await request(`/startups/${id}/apply`, { method: 'POST', body: { role } });
  return data.request;
}

export async function getRequests() {
  const data = await request('/requests');
  return data.requests;
}

export async function updateRequest(id, status) {
  const data = await request(`/requests/${id}`, { method: 'PATCH', body: { status } });
  return data.request;
}

export async function getActivity() {
  const data = await request('/activity');
  return data.activity;
}

export const api = {
  signup, login, me, logout, getUser,
  getStartups, getStartup, createStartup, deleteStartup,
  toggleVote, toggleSave, addComment, applyRole,
  getRequests, updateRequest, getActivity,
};

export default api;
