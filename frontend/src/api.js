import axios from "axios";

const API = axios.create({
  baseURL: "https://harshdubey-endsem.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 120000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      const isAuthPage = path === "/login" || path === "/register";
      if (!isAuthPage) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const registerUser = (data) => API.post("/register", data);
export const loginUser = (data) => API.post("/login", data);

export const getComplaints = (params) => API.get("/complaints", { params });
export const addComplaint = (data) => API.post("/complaints", data);
export const updateComplaint = (id, data) => API.put(`/complaints/${id}`, data);
export const deleteComplaint = (id) => API.delete(`/complaints/${id}`);
export const searchComplaints = (location) =>
  API.get("/complaints/search", { params: { location } });

export const analyzeAllComplaints = () => API.post("/ai/analyze");
export const analyzeSingleComplaint = (id) => API.post(`/ai/analyze/${id}`);

export default API;
