const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => {
  return localStorage.getItem("finhabitToken");
};

const adminRequest = async (endpoint, options = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in to continue.");
  }

  const response = await fetch(`${API_BASE_URL}/admin${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Administrator request failed.");
  }

  return data;
};

export const getAdminDashboard = () => {
  return adminRequest("/dashboard");
};

export const getAdminUsers = (search = "", page = 1, limit = 10) => {
  const params = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit)
  });

  return adminRequest(`/users?${params.toString()}`);
};

export const getAdminUserDetails = (userId) => {
  return adminRequest(`/users/${encodeURIComponent(userId)}`);
};

export const updateAdminUserStatus = (userId, isActive) => {
  return adminRequest(`/users/${encodeURIComponent(userId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive })
  });
};

export const getAdminActivities = (type = "all", page = 1, limit = 15) => {
  const params = new URLSearchParams({
    type,
    page: String(page),
    limit: String(limit)
  });

  return adminRequest(`/activities?${params.toString()}`);
};