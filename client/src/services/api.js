import axios from 'axios';
import toast from 'react-hot-toast';

export const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// Request Interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor for Error Handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Network Error';
        toast.error(message);
        return Promise.reject(error);
    }
);

export const fetchProducts = async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
};

export const fetchProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export default api;
