import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

export interface Petition {
  id: number;
  title: string;
  content: string;
  status: 'open' | 'closed';
  petitioner_id: number;
  created_at: string;
  response?: string;
  signature_threshold: number;
  signature_count?: number;
}

export interface CreatePetitionData {
  title: string;
  content: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
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

const petitionService = {
  getAllPetitions: async () => {
    const response = await api.get('/petitions');
    return response.data;
  },

  getPetition: async (id: number) => {
    const response = await api.get(`/petitions/${id}`);
    return response.data;
  },

  createPetition: async (data: CreatePetitionData) => {
    const response = await api.post('/petitions', data);
    return response.data;
  },

  signPetition: async (petitionId: number) => {
    const response = await api.post(`/petitions/${petitionId}/sign`);
    return response.data;
  },

  hasSignedPetition: async (petitionId: number) => {
    const response = await api.get(`/petitions/${petitionId}/signed`);
    return response.data.signed;
  }
};

export default petitionService;