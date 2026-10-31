const resolveBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5001/api";
    }
    return "https://taborapi.ambbatech.com/api";
  }
  return "https://taborapi.ambbatech.com/api";
};

const API_URL = resolveBaseUrl();

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token") || localStorage.getItem("tabor_token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("tabor_token");
      localStorage.removeItem("user");
      localStorage.removeItem("tabor_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export default api;
