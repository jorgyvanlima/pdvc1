import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 (Unauthorized) - Refresh Token logic could go here
        if (error.response?.status === 401 && !originalRequest._retry) {
            // For now, just reject
            // logic to refresh token or logout
        }

        return Promise.reject(error);
    }
);

export default api;
