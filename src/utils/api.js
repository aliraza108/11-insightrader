export const API_BASE = "https://11-insightradar-api.vercel.app";

export const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json"
};

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
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
