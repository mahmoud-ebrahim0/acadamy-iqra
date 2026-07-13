export const API_URL = import.meta.env.VITE_API_URL || 'https://acadamy-iqra-production.up.railway.app';

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};
