const RAW_API_BASE = import.meta.env.VITE_API_BASE || "https://11-insightradar-api.vercel.app";
export const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

const buildUrl = (path) => {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

export const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json"
};

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), {
    headers: defaultHeaders,
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    const message = text || `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};