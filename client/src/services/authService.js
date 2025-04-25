import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const authClient = axios.create({
    baseURL: `${API_URL}/auth`,
    headers: {
        'Content-Type': 'application/json',
    },
});

authClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const authService = {
    register: async (userData) => {
        try {
            const response = await authClient.post('/register', userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Une erreur est survenue lors de l\'inscription' };
        }
    },

    login: async (credentials) => {
        try {
            const response = await authClient.post('/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Une erreur est survenue lors de la connexion' };
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await authClient.get('/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Une erreur est survenue lors de la récupération des données utilisateur' };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    // Vérifier si un utilisateur est connecté
    isAuthenticated: () => {
        return localStorage.getItem('token') !== null;
    },
};

export default authService;