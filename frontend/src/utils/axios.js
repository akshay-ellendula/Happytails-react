import axios from "axios";

// Use same-origin `/api` base so Vite dev server proxy handles routing to backend.
// This avoids cross-site requests and ensures cookies (HttpOnly) work in development.
export const axiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
});
