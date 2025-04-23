import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
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

const apiService = {
    // Endpoints pour les régions
    getRegions: () => apiClient.get('/regions'),
    getRegionById: (id) => apiClient.get(`/regions/${id}`),
    getRegionStats: (id, params) => apiClient.get(`/regions/${id}/stats`, { params }),

    // Endpoints pour les départements
    getDepartements: (params) => apiClient.get('/departements', { params }),
    getDepartementById: (id) => apiClient.get(`/departements/${id}`),
    getDepartementStats: (id, params) => apiClient.get(`/departements/${id}/stats`, { params }),

    // Endpoints pour les communes
    getCommunes: (params) => apiClient.get('/communes', { params }),
    searchCommunes: (q) => apiClient.get(`/communes/search`, { params: { q } }),
    getCommuneById: (id) => apiClient.get(`/communes/${id}`),
    getCommuneStats: (id, params) => apiClient.get(`/communes/${id}/stats`, { params }),

    // Endpoints pour les statistiques
    getHomepageStats: () => apiClient.get('/stats/homepage'),
    getPricesByRegion: (params) => apiClient.get('/stats/prices/regions', { params }),
    getPricesByDepartement: (params) => apiClient.get('/stats/prices/departements', { params }),
    getPricesByCommune: (params) => apiClient.get('/stats/prices/communes', { params }),
    getPriceEvolution: (params) => apiClient.get('/stats/prices/evolution', { params }),
    getTransactionVolume: (params) => apiClient.get('/stats/transactions/volume', { params }),
    getTypesBien: () => apiClient.get('/stats/types-bien'),
    compareZones: (params) => apiClient.get('/stats/compare', { params })
};

export default apiService;