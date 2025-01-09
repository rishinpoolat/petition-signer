import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import StatsGrid from '../components/dashboard/StatsGrid';
import ThresholdManager from '../components/dashboard/ThresholdManager';
import PetitionsTable from '../components/dashboard/PetitionsTable';
import ResponseModal from '../components/dashboard/ResponseModal';
import type { DashboardStats, PetitionStats } from '../types/dashboard';

const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(0);
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [updateStatus, setUpdateStatus] = useState<'success' | 'error' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPetition, setSelectedPetition] = useState<PetitionStats | null>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (updateMessage) {
      const timer = setTimeout(() => {
        setUpdateMessage('');
        setUpdateStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [updateMessage]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/petition-stats');
      setStats(response.data);
      if (response.data.petitions && response.data.petitions.length > 0) {
        setThreshold(response.data.petitions[0].signature_threshold);
      }
      setError('');
    } catch (error) {
      console.error('Fetch stats error:', error);
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateThreshold = async () => {
    try {
      setIsUpdating(true);
      setError('');
      setUpdateMessage('');
      
      if (threshold < 0) {
        throw new Error('Threshold must be a positive number');
      }

      await api.put('/admin/threshold', { threshold });
      
      setUpdateStatus('success');
      setUpdateMessage('Signature threshold updated successfully');
      
      await fetchStats();
    } catch (error) {
      console.error('Update threshold error:', error);
      setUpdateStatus('error');
      setUpdateMessage('Failed to update threshold');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRespond = (petition: PetitionStats) => {
    setSelectedPetition(petition);
    setResponse(petition.response || '');
  };

  const handleSubmitResponse = async () => {
    if (!selectedPetition || !response.trim()) return;

    try {
      setIsSubmitting(true);
      await api.post(`/admin/petitions/${selectedPetition.id}/respond`, { response });
      setUpdateStatus('success');
      setUpdateMessage('Response submitted successfully');
      setSelectedPetition(null);
      setResponse('');
      await fetchStats();
    } catch (error) {
      console.error('Submit response error:', error);
      setUpdateStatus('error');
      setUpdateMessage('Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {updateMessage && (
          <div
            className={`mb-4 p-3 rounded ${
              updateStatus === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {updateMessage}
          </div>
        )}

        {/* Threshold Manager */}
        {stats && (
          <ThresholdManager
            threshold={threshold}
            isUpdating={isUpdating}
            onThresholdChange={setThreshold}
            onUpdateThreshold={handleUpdateThreshold}
          />
        )}

        {/* Stats Grid */}
        {stats && <StatsGrid stats={stats} />}

        {/* Analytics Charts */}
        {stats && <DashboardCharts stats={stats} />}

        {/* Petitions Table */}
        {stats && (
          <PetitionsTable
            petitions={stats.petitions}
            onRespond={handleRespond}
          />
        )}

        {/* Response Modal */}
        {selectedPetition && (
          <ResponseModal
            petition={selectedPetition}
            response={response}
            isSubmitting={isSubmitting}
            onClose={() => setSelectedPetition(null)}
            onResponseChange={setResponse}
            onSubmit={handleSubmitResponse}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;