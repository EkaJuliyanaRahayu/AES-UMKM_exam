import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // tambahkan /api
=======
  baseURL: `${import.meta.env.VITE_API_URL}`, // tambahkan /api
>>>>>>> f1c4e7b ( update now)
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
