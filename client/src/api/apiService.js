import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    getRegions: () => apiClient.get('/regions'),
    getDepartements: (regionId) => apiClient.get(`/departements?regionId=${regionId}`),
    getCommunes: (departementId) => apiClient.get(`/communes?departementId=${departementId}`),

    getPricesByRegion: (params) => apiClient.get('/stats/prices/regions', { params }),
    getPricesByDepartement: (params) => apiClient.get('/stats/prices/departements', { params }),
    getPricesByCommune: (params) => apiClient.get('/stats/prices/communes', { params }),

    getPriceEvolution: (params) => apiClient.get('/stats/prices/evolution', { params }),
    getTransactionVolume: (params) => apiClient.get('/stats/transactions/volume', { params }),

    getMockData: (endpoint) => {
        // Simulation de délai réseau
        return new Promise((resolve) => {
            setTimeout(() => {
                if (endpoint === 'regions') {
                    resolve({
                        data: [
                            { id: 'ile-de-france', name: 'Île-de-France' },
                            { id: 'auvergne-rhone-alpes', name: 'Auvergne-Rhône-Alpes' },
                            // ... autres régions
                        ]
                    });
                } else if (endpoint === 'prices') {
                    resolve({
                        data: [
                            { name: 'Paris', value: 10700 },
                            { name: 'Lyon', value: 4900 },
                            // ... autres villes
                        ]
                    });
                }
            }, 500);
        });
    }
};

export default apiService;