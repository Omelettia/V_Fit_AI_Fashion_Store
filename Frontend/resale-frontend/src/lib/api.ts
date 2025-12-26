export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let message = "Something went wrong";

    try {
      const data = text ? JSON.parse(text) : {};
      message = data.message || message;
    } catch {}

    throw new Error(message);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
