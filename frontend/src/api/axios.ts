import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // TS sudah ngerti tipe dari env.d.ts
});

// otomatis masukin token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
