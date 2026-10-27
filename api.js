// The ONLY place that talks to the backend. Base URL comes from the environment.
const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'taskflow_token';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Token lives in localStorage: simple, survives refresh, but readable by any script on the page (XSS trade-off).
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable - ignore */
  }
};

async function request(method, path, body) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your internet connection and try again.', 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    if (res.status === 401 && token) window.dispatchEvent(new Event('auth:expired'));
    throw new ApiError(data?.message || 'Something went wrong. Please try again.', res.status);
  }
  return data;
}

export const api = {
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  me: () => request('GET', '/auth/me'),

  listProjects: () => request('GET', '/projects'),
  createProject: (body) => request('POST', '/projects', body),
  deleteProject: (id) => request('DELETE', `/projects/${id}`),

  listTasks: (projectId) => request('GET', `/tasks?limit=200${projectId ? `&projectId=${projectId}` : ''}`),
  createTask: (body) => request('POST', '/tasks', body),
  updateTask: (id, body) => request('PATCH', `/tasks/${id}`, body),
  deleteTask: (id) => request('DELETE', `/tasks/${id}`),

  listMembers: () => request('GET', '/users'),
};
