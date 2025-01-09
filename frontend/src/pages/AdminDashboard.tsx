import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PetitionStats {
  id: string;
  title: string;
  status: 'open' | 'closed';
  signature_count: number;
  signature_threshold: number;
  created_at: string;
  response?: string;
}

interface DashboardStats {
  totalPetitions: number;
  openPetitions: number;
  closedPetitions: number;
  totalSignatures: number;
  petitions: PetitionStats[];
}

const API_URL = 'http://localhost:5002/api'; // Updated API URL

const AdminDashboard: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(0);
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [updateStatus, setUpdateStatus] = useState<'success' | 'error' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const api = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    fetchStats();
  }, []);

  // Clear update message after 5 seconds
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
      // Set initial threshold from the first petition if available
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
      
      // Refresh stats to show updated threshold
      await fetchStats();
    } catch (error) {
      console.error('Update threshold error:', error);
      setUpdateStatus('error');
      setUpdateMessage('Failed to update signature threshold');
    } finally {
      setIsUpdating(false);
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

        {/* Signature Threshold Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Signature Threshold Management</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-xs">
              <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
                Required Signatures
              </label>
              <input
                type="number"
                id="threshold"
                value={threshold}
                onChange={(e) => setThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                min="0"
                placeholder="Enter signature threshold"
              />
              <p className="mt-1 text-sm text-gray-500">
                This threshold will apply to all open petitions
              </p>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleUpdateThreshold}
                disabled={isUpdating}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  isUpdating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isUpdating ? 'Updating...' : 'Update Threshold'}
              </button>
            </div>
          </div>
          {updateMessage && (
            <div
              className={`mt-4 p-3 rounded ${
                updateStatus === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {updateMessage}
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Total Petitions</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats?.totalPetitions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Open Petitions</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.openPetitions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Closed Petitions</h3>
            <p className="text-3xl font-bold text-gray-600">{stats?.closedPetitions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Total Signatures</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalSignatures || 0}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;