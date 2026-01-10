import axios from "axios";


const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const api = axios.create({
  baseURL: `${baseUrl}/api`,
});

//test rebuild
console.log("ENV VALUE:", import.meta.env.VITE_API_URL);
console.log("BASE URL:", `${baseUrl}/api`);


// otomatis masukin token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default api;
